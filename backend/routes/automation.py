from fastapi import APIRouter
from pydantic import BaseModel
from datetime import datetime
from bson import ObjectId

from database.mongodb import (
    automation_actions_collection,
    tickets_collection,
    servicenow_collection
)

from routes.audit_logs import create_audit_log


router = APIRouter(
    prefix="/api/automation",
    tags=["Automation"]
)


class PasswordResetRequest(BaseModel):
    ticket_id: str


@router.post("/password-reset")
def password_reset(request: PasswordResetRequest):

    # Validate ticket ID
    if not ObjectId.is_valid(request.ticket_id):
        return {
            "success": False,
            "message": "Invalid ticket ID"
        }

    # Find ticket
    ticket = tickets_collection.find_one({
        "_id": ObjectId(request.ticket_id)
    })

    if not ticket:
        return {
            "success": False,
            "message": "Ticket not found"
        }

    # Safety check
    if ticket.get("category") != "Access / Password":
        return {
            "success": False,
            "message": "This ticket is not eligible for password reset automation"
        }

    # --------------------------------------------------
    # 1. EXECUTE MOCK PASSWORD RESET
    # --------------------------------------------------

    action = {
        "ticket_id": request.ticket_id,
        "action": "Password Reset",
        "status": "Executed",
        "result": "Password reset completed successfully",
        "executed_by": "AI Automation",
        "created_at": datetime.utcnow()
    }

    result = automation_actions_collection.insert_one(action)

    action_id = str(result.inserted_id)

    # --------------------------------------------------
    # 2. VALIDATE AUTOMATION
    # --------------------------------------------------

    validation_status = "Validated"

    automation_actions_collection.update_one(
        {"_id": result.inserted_id},
        {
            "$set": {
                "validation_status": validation_status,
                "validated_at": datetime.utcnow()
            }
        }
    )

    # --------------------------------------------------
    # 3. UPDATE MONGODB TICKET
    # --------------------------------------------------

    tickets_collection.update_one(
        {"_id": ObjectId(request.ticket_id)},
        {
            "$set": {
                "status": "Resolved",
                "automation_status": "Completed",
                "automation_action": "Password Reset",
                "automation_action_id": action_id,
                "updated_at": datetime.utcnow()
            }
        }
    )

    # --------------------------------------------------
    # 4. UPDATE MOCK SERVICENOW INCIDENT
    # --------------------------------------------------

    servicenow_update = servicenow_collection.update_one(
        {"ticket_id": request.ticket_id},
        {
            "$set": {
                "status": "Resolved",
                "resolution": "Password reset completed successfully",
                "resolved_by": "AI Automation",
                "resolved_at": datetime.utcnow(),
                "updated_at": datetime.utcnow()
            }
        }
    )

    if servicenow_update.matched_count == 0:
        servicenow_status = "ServiceNow record not found"
    else:
        servicenow_status = "Resolved"

    # --------------------------------------------------
    # 5. CREATE AUDIT LOG
    # --------------------------------------------------

    create_audit_log(
        action="Password Reset Automation",
        description=(
            f"Password reset automation executed and validated "
            f"for ticket {request.ticket_id}. "
            f"ServiceNow status updated to {servicenow_status}."
        ),
        ticket_id=request.ticket_id,
        user="AI Automation"
    )

    # --------------------------------------------------
    # 6. RETURN RESULT
    # --------------------------------------------------

    return {
        "success": True,
        "message": "Password reset automation completed successfully",
        "ticket_id": request.ticket_id,
        "action": "Password Reset",
        "status": "Completed",
        "validation": validation_status,
        "service": "Mock Password Reset API",
        "action_id": action_id,
        "servicenow_status": servicenow_status
    }