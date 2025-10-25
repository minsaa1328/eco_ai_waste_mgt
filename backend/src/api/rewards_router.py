# backend/src/api/rewards_router.py
from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
from datetime import datetime
from bson import ObjectId

from ..db import rewards_collection, redemptions_collection, users_collection, client


# Temporary auth function
async def verify_clerk_token():
    """Temporary mock auth for testing"""
    return {
        "id": "dev_user_123",
        "email": "test@example.com",
        "first_name": "Test",
        "last_name": "User"
    }


router = APIRouter(prefix="/api/rewards", tags=["rewards"])


# -------------------- MODELS --------------------
class RedemptionRequest(BaseModel):
    reward_id: str
    shipping_address: Optional[Dict[str, Any]] = None


class CreateRewardRequest(BaseModel):
    name: str
    description: str
    points_required: int
    category: str
    image: str
    stock: int = -1  # -1 for unlimited


class ShippingAddress(BaseModel):
    full_name: str
    address: str
    city: str
    postal_code: Optional[str] = None
    country: Optional[str] = None


# -------------------- REWARD MANAGEMENT --------------------
@router.get("/")
async def get_available_rewards():
    """Get all available rewards"""
    try:
        rewards = list(rewards_collection.find({"active": True}))

        # Convert ObjectId to string for JSON serialization
        for reward in rewards:
            reward["_id"] = str(reward["_id"])

        return {"rewards": rewards}

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching rewards: {str(e)}")


@router.get("/categories")
async def get_reward_categories():
    """Get available reward categories"""
    try:
        categories = rewards_collection.distinct("category", {"active": True})
        return {"categories": categories}

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching categories: {str(e)}")


@router.get("/category/{category_name}")
async def get_rewards_by_category(category_name: str):
    """Get rewards by specific category"""
    try:
        rewards = list(rewards_collection.find({
            "category": category_name,
            "active": True
        }))

        for reward in rewards:
            reward["_id"] = str(reward["_id"])

        return {"rewards": rewards}

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching category rewards: {str(e)}")


# -------------------- REWARD REDEMPTION --------------------
@router.post("/redeem")
async def redeem_reward(request: RedemptionRequest, user=Depends(verify_clerk_token)):
    """Redeem a reward using user points"""
    try:
        # Get user data
        user_data = users_collection.find_one({"clerk_id": user["id"]})
        if not user_data:
            raise HTTPException(status_code=404, detail="User not found")

        user_points = user_data.get("points", 0)

        # Get reward data
        reward = rewards_collection.find_one({"_id": ObjectId(request.reward_id)})
        if not reward:
            raise HTTPException(status_code=404, detail="Reward not found")

        if not reward.get("active", False):
            raise HTTPException(status_code=400, detail="Reward is no longer available")

        points_required = reward.get("points_required", 0)
        reward_stock = reward.get("stock", 0)

        # Check if user has enough points
        if user_points < points_required:
            raise HTTPException(
                status_code=400,
                detail=f"Insufficient points. You have {user_points}, but need {points_required}"
            )

        # Check if reward is in stock (if stock is limited)
        if reward_stock == 0:
            raise HTTPException(status_code=400, detail="Reward is out of stock")

        # Create redemption record
        redemption_data = {
            "user_clerk_id": user["id"],
            "reward_id": request.reward_id,
            "reward_name": reward["name"],
            "points_used": points_required,
            "shipping_address": request.shipping_address,
            "status": "pending",  # pending, shipped, delivered
            "redemption_date": datetime.utcnow(),
            "tracking_number": None
        }

        # Start transaction
        with client.start_session() as session:
            with session.start_transaction():
                # Deduct points from user
                users_collection.update_one(
                    {"clerk_id": user["id"]},
                    {"$inc": {"points": -points_required}},
                    session=session
                )

                # Decrease reward stock if limited
                if reward_stock > 0:
                    rewards_collection.update_one(
                        {"_id": ObjectId(request.reward_id)},
                        {"$inc": {"stock": -1}},
                        session=session
                    )

                # Create redemption record
                result = redemptions_collection.insert_one(redemption_data, session=session)
                redemption_id = str(result.inserted_id)

        # Add to user history
        users_collection.update_one(
            {"clerk_id": user["id"]},
            {"$push": {
                "history": {
                    "type": "reward_redemption",
                    "redemption_id": redemption_id,
                    "reward_name": reward["name"],
                    "points_used": points_required,
                    "date": datetime.utcnow()
                }
            }}
        )

        return {
            "success": True,
            "message": f"Successfully redeemed {reward['name']}!",
            "redemption_id": redemption_id,
            "points_remaining": user_points - points_required,
            "reward_details": {
                "name": reward["name"],
                "description": reward["description"],
                "category": reward["category"]
            }
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error redeeming reward: {str(e)}")


# -------------------- REDEMPTION HISTORY --------------------
@router.get("/my-redemptions")
async def get_user_redemptions(user=Depends(verify_clerk_token)):
    """Get user's redemption history"""
    try:
        redemptions = list(redemptions_collection.find(
            {"user_clerk_id": user["id"]}
        ).sort("redemption_date", -1))

        for redemption in redemptions:
            redemption["_id"] = str(redemption["_id"])
            redemption["redemption_id"] = str(redemption["_id"])

        return {"redemptions": redemptions}

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching redemptions: {str(e)}")


@router.get("/redemption/{redemption_id}")
async def get_redemption_details(redemption_id: str, user=Depends(verify_clerk_token)):
    """Get details of a specific redemption"""
    try:
        redemption = redemptions_collection.find_one({
            "_id": ObjectId(redemption_id),
            "user_clerk_id": user["id"]
        })

        if not redemption:
            raise HTTPException(status_code=404, detail="Redemption not found")

        redemption["_id"] = str(redemption["_id"])
        return {"redemption": redemption}

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching redemption details: {str(e)}")


# -------------------- REWARD MANAGEMENT (Admin) --------------------
@router.post("/admin/create")
async def create_reward(request: CreateRewardRequest):
    """Create a new reward (Admin only)"""
    try:
        reward_data = {
            "name": request.name,
            "description": request.description,
            "points_required": request.points_required,
            "category": request.category,
            "image": request.image,
            "stock": request.stock,
            "active": True,
            "created_at": datetime.utcnow()
        }

        result = rewards_collection.insert_one(reward_data)

        return {
            "success": True,
            "message": "Reward created successfully",
            "reward_id": str(result.inserted_id)
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error creating reward: {str(e)}")


@router.put("/admin/{reward_id}/toggle")
async def toggle_reward_status(reward_id: str):
    """Toggle reward active status (Admin only)"""
    try:
        reward = rewards_collection.find_one({"_id": ObjectId(reward_id)})
        if not reward:
            raise HTTPException(status_code=404, detail="Reward not found")

        new_status = not reward.get("active", False)

        rewards_collection.update_one(
            {"_id": ObjectId(reward_id)},
            {"$set": {"active": new_status}}
        )

        return {
            "success": True,
            "message": f"Reward {'activated' if new_status else 'deactivated'}",
            "active": new_status
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error toggling reward: {str(e)}")


# -------------------- USER REWARDS INFO --------------------
@router.get("/my-points")
async def get_user_points(user=Depends(verify_clerk_token)):
    """Get user's current points and redemption eligibility"""
    try:
        user_data = users_collection.find_one({"clerk_id": user["id"]})
        if not user_data:
            raise HTTPException(status_code=404, detail="User not found")

        points = user_data.get("points", 0)

        # Get affordable rewards
        affordable_rewards = list(rewards_collection.find({
            "points_required": {"$lte": points},
            "active": True,
            "$or": [
                {"stock": {"$gt": 0}},
                {"stock": -1}
            ]
        }))

        for reward in affordable_rewards:
            reward["_id"] = str(reward["_id"])

        return {
            "points": points,
            "affordable_rewards": affordable_rewards,
            "affordable_count": len(affordable_rewards)
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching user points: {str(e)}")