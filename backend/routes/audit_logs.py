from fastapi import APIRouter
from datetime import datetime

from database.mongodb import audit_logs_collection


router = APIRouter(
    prefix="/api/audit-logs",
    tags=["Audit Logs"]
)


@router.get("")
def get_audit_logs():

    logs = list(
        audit_logs_collection
        .find()
        .sort("created_at", -1)
    )

    for log in logs:
        log["_id"] = str(log["_id"])

    return {
        "audit_logs": logs
    }


def create_audit_log(
    action: str,
    description: str,
    ticket_id: str = None,
    user: str = "System"
):

    audit_logs_collection.insert_one({

        "action": action,

        "description": description,

        "ticket_id": ticket_id,

        "user": user,

        "created_at": datetime.utcnow()

    })