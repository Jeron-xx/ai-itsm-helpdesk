from fastapi import APIRouter
from datetime import datetime
from database.mongodb import servicenow_collection

router = APIRouter(
    prefix="/api/servicenow",
    tags=["Mock ServiceNow"]
)


@router.get("")
def get_servicenow_records():
    records = list(
        servicenow_collection
        .find()
        .sort("created_at", -1)
    )

    for record in records:
        record["_id"] = str(record["_id"])

    return {
        "records": records
    }


def create_servicenow_incident(
    ticket_id: str,
    description: str,
    category: str,
    priority: str,
    assignment_group: str,
    status: str
):
    # Generate a simple mock ServiceNow incident number
    existing_count = servicenow_collection.count_documents({})

    incident_number = f"INC{100001 + existing_count}"

    record = {
        "incident_number": incident_number,
        "ticket_id": ticket_id,
        "description": description,
        "category": category,
        "priority": priority,
        "assignment_group": assignment_group,
        "status": status,
        "created_at": datetime.utcnow()
    }

    servicenow_collection.insert_one(record)

    return incident_number