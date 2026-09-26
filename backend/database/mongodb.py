import os
from pymongo import MongoClient
from dotenv import load_dotenv

load_dotenv()

MONGODB_URI = os.getenv("MONGODB_URI")
DATABASE_NAME = os.getenv("DATABASE_NAME", "itsm_db")

client = MongoClient(MONGODB_URI)

db = client[DATABASE_NAME]

tickets_collection = db["tickets"]
users_collection = db["users"]
knowledge_collection = db["knowledge"]
chat_history_collection = db["chat_history"]
automation_actions_collection = db["automation_actions"]
software_requests_collection = db["software_requests"]
audit_logs_collection = db["audit_logs"]
servicenow_collection = db["servicenow_records"]
