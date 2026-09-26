from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from datetime import datetime
from bson import ObjectId

from database.mongodb import software_requests_collection
from routes.audit_logs import create_audit_log

router = APIRouter(
    prefix="/api/software-requests",
    tags=["Software Requests"]
)


class SoftwareRequest(BaseModel):
    software: str
    description: str
    requested_by: str = "Employee"


# Create software request
@router.post("")
def create_software_request(request: SoftwareRequest):

    request_data = {
        "software": request.software,
        "description": request.description,
        "requested_by": request.requested_by,
        "status": "Pending Approval",
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow()
    }

    result = software_requests_collection.insert_one(request_data)

    request_id = str(result.inserted_id)

    # Create audit log
    create_audit_log(
        action="Software Request Created",
        description=f"Software request created for: {request.software}",
        user=request.requested_by
    )

    return {
        "message": "Software request created successfully",
        "request_id": request_id,
        "software": request.software,
        "status": "Pending Approval"
    }


# Get all software requests
@router.get("")
def get_software_requests():

    requests = list(
        software_requests_collection
        .find()
        .sort("created_at", -1)
    )

    for request in requests:
        request["_id"] = str(request["_id"])

    return {
        "software_requests": requests
    }


# Approve software request
@router.put("/{request_id}/approve")
def approve_software_request(request_id: str):

    if not ObjectId.is_valid(request_id):
        raise HTTPException(
            status_code=400,
            detail="Invalid request ID"
        )

    result = software_requests_collection.update_one(
        {
            "_id": ObjectId(request_id),
            "status": "Pending Approval"
        },
        {
            "$set": {
                "status": "Approved",
                "updated_at": datetime.utcnow()
            }
        }
    )

    if result.matched_count == 0:
        raise HTTPException(
            status_code=404,
            detail="Pending software request not found"
        )

    # Create audit log
    create_audit_log(
        action="Software Request Approved",
        description=f"Software request {request_id} approved",
        user="IT Admin"
    )

    return {
        "message": "Software request approved",
        "request_id": request_id,
        "status": "Approved"
    }


# Start software provisioning
@router.put("/{request_id}/provision")
def provision_software(request_id: str):

    if not ObjectId.is_valid(request_id):
        raise HTTPException(
            status_code=400,
            detail="Invalid request ID"
        )

    result = software_requests_collection.update_one(
        {
            "_id": ObjectId(request_id),
            "status": "Approved"
        },
        {
            "$set": {
                "status": "Provisioning",
                "updated_at": datetime.utcnow()
            }
        }
    )

    if result.matched_count == 0:
        raise HTTPException(
            status_code=404,
            detail="Approved software request not found"
        )

    # Create audit log
    create_audit_log(
        action="Software Provisioning Started",
        description=f"Software provisioning started for request {request_id}",
        user="IT Support"
    )

    return {
        "message": "Software provisioning started",
        "request_id": request_id,
        "status": "Provisioning"
    }


# Complete software request
@router.put("/{request_id}/complete")
def complete_software_request(request_id: str):

    if not ObjectId.is_valid(request_id):
        raise HTTPException(
            status_code=400,
            detail="Invalid request ID"
        )

    result = software_requests_collection.update_one(
        {
            "_id": ObjectId(request_id),
            "status": "Provisioning"
        },
        {
            "$set": {
                "status": "Completed",
                "updated_at": datetime.utcnow()
            }
        }
    )

    if result.matched_count == 0:
        raise HTTPException(
            status_code=404,
            detail="Software request currently being provisioned not found"
        )

    # Create audit log
    create_audit_log(
        action="Software Request Completed",
        description=f"Software request {request_id} completed",
        user="IT Support"
    )

    return {
        "message": "Software request completed",
        "request_id": request_id,
        "status": "Completed"
    }