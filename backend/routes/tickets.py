from fastapi import APIRouter
from pydantic import BaseModel
from datetime import datetime

from database.mongodb import tickets_collection
from services.rag_service import get_rag_context
from services.ai_service import generate_response
from routes.audit_logs import create_audit_log
from routes.servicenow import create_servicenow_incident


router = APIRouter(
    prefix="/api/tickets",
    tags=["Tickets"]
)


class TicketRequest(BaseModel):
    description: str


# ==========================================
# POST - Analyze and create ticket
# ==========================================

@router.post("/analyze")
def analyze_ticket(ticket: TicketRequest):

    # --------------------------------
    # 1. Retrieve relevant knowledge
    # --------------------------------

    rag_result = get_rag_context(
        ticket.description
    )

    confidence = rag_result["confidence"]
    sources = rag_result["sources"]
    escalate = rag_result["escalate"]


    # --------------------------------
    # 2. Generate AI response
    # --------------------------------

    if escalate:

        ai_response = (
            "The available knowledge does not "
            "provide enough information to resolve "
            "this issue. The ticket should be "
            "escalated to IT Support."
        )

    else:

        ai_response = generate_response(
            ticket.description,
            rag_result["context"]
        )


    # --------------------------------
    # 3. Ticket classification
    # --------------------------------

    description = ticket.description.lower()


    # VPN Incident
    if "vpn" in description:

        ticket_type = "Incident"
        category = "Network / VPN"
        impact = "Medium"
        urgency = "High"
        priority = "High"
        assignment_group = "Network Support"


    # Wi-Fi Incident
    elif (
        "wifi" in description
        or "wi-fi" in description
        or "wireless" in description
    ):

        ticket_type = "Incident"
        category = "Network / Wi-Fi"
        impact = "Medium"
        urgency = "Medium"
        priority = "Medium"
        assignment_group = "Network Support"


    # Password Incident
    elif (
        "password" in description
        or "password expired" in description
        or "cannot sign in" in description
        or "can't sign in" in description
    ):

        ticket_type = "Incident"
        category = "Access / Password"
        impact = "Medium"
        urgency = "High"
        priority = "High"
        assignment_group = "IT Support"


    # Outlook / Email Incident
    elif (
        "outlook" in description
        or "email" in description
        or "mail" in description
        or "synchroniz" in description
    ):

        ticket_type = "Incident"
        category = "Software / Email"
        impact = "Medium"
        urgency = "Medium"
        priority = "Medium"
        assignment_group = "IT Support"


    # VS Code Software Request
    elif (
        "vscode" in description
        or "vs code" in description
        or "visual studio code" in description
    ):

        ticket_type = "Service Request"
        category = "Software / Software Provisioning"
        impact = "Low"
        urgency = "Medium"
        priority = "Medium"
        assignment_group = "IT Support / Software Provisioning"


    # Unknown / Other Incident
    else:

        ticket_type = "Incident"
        category = "Other"
        impact = "Medium"
        urgency = "Medium"
        priority = "Medium"
        assignment_group = "IT Support"


    # --------------------------------
    # 4. Escalation
    # --------------------------------

    status = "Escalated" if escalate else "New"


    # --------------------------------
    # 5. Store ticket in MongoDB
    # --------------------------------

    ticket_data = {

        "description": ticket.description,

        "type": ticket_type,

        "category": category,

        "impact": impact,

        "urgency": urgency,

        "priority": priority,

        "assignment_group": assignment_group,

        "status": status,

        "ai_response": ai_response,

        "confidence": confidence,

        "knowledge_sources": sources,

        "escalated": escalate,

        "created_at": datetime.utcnow()
    }


    result = tickets_collection.insert_one(
        ticket_data
    )

    ticket_id = str(result.inserted_id)


    # --------------------------------
    # 6. Create audit log
    # --------------------------------

    create_audit_log(
        action="Ticket Created",
        description=f"Ticket created for: {ticket.description}",
        ticket_id=ticket_id,
        user="Employee"
    )


    # --------------------------------
    # 7. Create Mock ServiceNow record
    # --------------------------------

    servicenow_incident = create_servicenow_incident(
        ticket_id=ticket_id,
        description=ticket.description,
        category=category,
        priority=priority,
        assignment_group=assignment_group,
        status=status
    )


    # --------------------------------
    # 8. Return result
    # --------------------------------

    return {

        "message": "Ticket analyzed and created successfully",

        "ticket_id": ticket_id,

        "servicenow_incident": servicenow_incident,

        "analysis": {

            "type": ticket_type,

            "category": category,

            "impact": impact,

            "urgency": urgency,

            "priority": priority,

            "assignment_group": assignment_group
        },

        "ai_response": ai_response,

        "confidence": confidence,

        "knowledge_sources": sources,

        "escalated": escalate,

        "status": status
    }


# ==========================================
# GET - Retrieve all tickets
# ==========================================

@router.get("")
def get_tickets():

    tickets = list(
        tickets_collection
        .find()
        .sort("created_at", -1)
    )


    for ticket in tickets:

        ticket["_id"] = str(
            ticket["_id"]
        )


    return {
        "tickets": tickets
    }