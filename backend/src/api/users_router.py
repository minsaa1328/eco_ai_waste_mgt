# backend/src/api/users_router.py
from fastapi import APIRouter, Depends, HTTPException
from ..db import users_collection
from ..utils.auth import verify_clerk_token
from bson import ObjectId

router = APIRouter(prefix="/api/users", tags=["users"])

@router.get("/me")
async def get_user_profile(user=Depends(verify_clerk_token)):
    """Get logged-in user's profile"""
    existing = users_collection.find_one({"clerk_id": user["id"]})
    if not existing:
        users_collection.insert_one({
            "clerk_id": user["id"],
            "email": user["email"],
            "name": f"{user['first_name']} {user['last_name']}",
            "points": 0,
            "history": []
        })
        existing = users_collection.find_one({"clerk_id": user["id"]})
    existing["_id"] = str(existing["_id"])
    return existing


@router.post("/points/add")
async def add_points(points: int, user=Depends(verify_clerk_token)):
    """Add points to user's account"""
    result = users_collection.update_one(
        {"clerk_id": user["id"]},
        {"$inc": {"points": points}}
    )
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="User not found")
    return {"message": "Points added successfully", "points_added": points}


@router.post("/history")
async def save_activity(activity: dict, user=Depends(verify_clerk_token)):
    """Save user activity (classification, quiz, etc.)"""
    users_collection.update_one(
        {"clerk_id": user["id"]},
        {"$push": {"history": activity}}
    )
    return {"message": "Activity saved"}
