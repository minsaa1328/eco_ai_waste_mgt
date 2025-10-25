# backend/src/api/leaderboard_router.py
from fastapi import APIRouter, HTTPException
from typing import List
from ..db import users_collection

router = APIRouter(prefix="/api/leaderboard", tags=["leaderboard"])


@router.get("/")
async def get_leaderboard():
    """
    Get top users for leaderboard
    """
    try:
        # Get top 10 users sorted by points (descending)
        top_users = list(users_collection.find().sort("points", -1).limit(10))

        leaderboard_data = []
        for index, user in enumerate(top_users, 1):
            leaderboard_data.append({
                "rank": index,
                "username": user.get("name", "Anonymous"),
                "points": user.get("points", 0),
                "avatar": user.get("avatar"),
                "clerk_id": user.get("clerk_id")
            })

        total_users = users_collection.count_documents({})

        return {
            "leaderboard": leaderboard_data,
            "total_users": total_users
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching leaderboard: {str(e)}")


@router.get("/user/{clerk_id}")
async def get_user_rank(clerk_id: str):
    """Get specific user's rank and points"""
    try:
        user = users_collection.find_one({"clerk_id": clerk_id})

        # If user doesn't exist, create them with default data
        if not user:
            return {
                "username": "User Not Found",
                "points": 0,
                "rank": 0,
                "avatar": None
            }

        # Calculate user's rank
        user_points = user.get("points", 0)
        users_with_more_points = users_collection.count_documents({
            "points": {"$gt": user_points}
        })
        user_rank = users_with_more_points + 1

        return {
            "username": user.get("name"),
            "points": user.get("points", 0),
            "rank": user_rank,
            "avatar": user.get("avatar")
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching user rank: {str(e)}")


@router.get("/badges/{clerk_id}")
async def get_user_badges(clerk_id: str):
    """Get user's earned badges based on their points"""
    try:
        user = users_collection.find_one({"clerk_id": clerk_id})

        # If user doesn't exist, create them with 0 points
        if not user:
            return {"badges": []}


        points = user.get("points", 0)
        badges = []

        # Define badge criteria based on points
        if points >= 100:
            badges.append({
                "id": "eco-hero",
                "name": "Eco Hero",
                "description": "Maintained a 7-day streak of eco-friendly activities",
                "icon": "TrophyIcon",
                "color": "bg-gradient-to-br from-yellow-300 to-yellow-500"
            })

        if points >= 50:
            badges.append({
                "id": "recycler-pro",
                "name": "Recycler Pro",
                "description": "Classified over 50 waste items correctly",
                "icon": "RecycleIcon",
                "color": "bg-gradient-to-br from-blue-300 to-blue-500"
            })

        if points >= 25:
            badges.append({
                "id": "plastic-buster",
                "name": "Plastic Buster",
                "description": "Completed weekly plastic reduction challenges",
                "icon": "LeafIcon",
                "color": "bg-gradient-to-br from-green-300 to-green-500"
            })

        # Add more badges based on your criteria
        if points >= 200:
            badges.append({
                "id": "eco-master",
                "name": "Eco Master",
                "description": "Reached 200+ eco points",
                "icon": "AwardIcon",
                "color": "bg-gradient-to-br from-purple-300 to-purple-500"
            })

        if points >= 500:
            badges.append({
                "id": "eco-legend",
                "name": "Eco Legend",
                "description": "Reached 500+ eco points",
                "icon": "StarIcon",
                "color": "bg-gradient-to-br from-red-300 to-red-500"
            })

        return {"badges": badges}

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching badges: {str(e)}")