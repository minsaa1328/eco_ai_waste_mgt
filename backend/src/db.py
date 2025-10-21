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

print("✅ MongoDB connected successfully.")
