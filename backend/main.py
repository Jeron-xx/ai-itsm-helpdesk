from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from database.mongodb import client
from routes.tickets import router as tickets_router
from routes.knowledge import router as knowledge_router
from routes.software_requests import router as software_requests_router
from routes.audit_logs import router as audit_logs_router
from routes.servicenow import router as servicenow_router

app = FastAPI(
    title="AI-Powered ITSM Helpdesk",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def root():
    return {
        "message": "AI-Powered ITSM Helpdesk API is running"
    }

@app.get("/health")
def health():
    try:
        client.admin.command("ping")

        return {
            "status": "healthy",
            "database": "connected"
        }

    except Exception as e:
        return {
            "status": "unhealthy",
            "database": "disconnected",
            "error": str(e)
        }

app.include_router(tickets_router)
app.include_router(knowledge_router)
app.include_router(software_requests_router)
app.include_router(audit_logs_router)
app.include_router(servicenow_router)
