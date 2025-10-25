# backend/src/db.py
from pymongo import MongoClient
import os
from dotenv import load_dotenv

# Load environment variables from .env
load_dotenv()

# Get MongoDB URI (default to localhost)
MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017")

# Connect to MongoDB
client = MongoClient(MONGO_URI)

# Select the database name
db = client["EcoWasteMgmt"]

# Define your collections
users_collection = db["users"]
sessions_collection = db["sessions"]
rewards_collection = db["rewards"]
redemptions_collection = db["redemptions"]

print("✅ MongoDB connected successfully.")

# Initialize sample rewards if collection is empty
def initialize_sample_rewards():
    if rewards_collection.count_documents({}) == 0:
        sample_rewards = [
            {
                "name": "Eco Warrior Keytag",
                "description": "Beautiful eco-friendly keytag made from recycled materials",
                "points_required": 50,
                "category": "keytag",
                "image": "https://images.unsplash.com/photo-1589939705384-5185137a7f0f?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80",
                "stock": 100,
                "active": True
            },
            {
                "name": "Recycle Hero Keytag",
                "description": "Durable keytag showcasing your recycling achievements",
                "points_required": 100,
                "category": "keytag",
                "image": "https://images.unsplash.com/photo-1558640476-437a2e9b7a7f?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80",
                "stock": 50,
                "active": True
            },
            {
                "name": "Planet Saver Keytag",
                "description": "Limited edition keytag for top eco contributors",
                "points_required": 200,
                "category": "keytag",
                "image": "https://images.unsplash.com/photo-1569163139394-de44cb54c3c1?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80",
                "stock": 25,
                "active": True
            },
            {
                "name": "Premium Eco Course",
                "description": "Access to exclusive environmental education course",
                "points_required": 150,
                "category": "digital",
                "image": "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80",
                "stock": -1,  # Unlimited
                "active": True
            },
            {
                "name": "Eco-friendly Tote Bag",
                "description": "Sustainable cotton tote bag for shopping",
                "points_required": 300,
                "category": "merchandise",
                "image": "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80",
                "stock": 30,
                "active": True
            }
        ]
        rewards_collection.insert_many(sample_rewards)
        print("Sample rewards initialized")

# Call this function to initialize rewards
initialize_sample_rewards()