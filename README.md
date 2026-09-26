# AI ITSM Helpdesk

An AI-powered IT Service Management (ITSM) Helpdesk prototype that combines a React frontend, FastAPI backend, MongoDB Atlas, Retrieval-Augmented Generation (RAG), an open-source Hugging Face LLM, mock ServiceNow integration, and audit logging.

## 1. Project Overview

The AI ITSM Helpdesk allows employees to describe IT issues in natural language. The system analyzes the request, searches an enterprise knowledge base using RAG, generates a grounded AI response, classifies the ticket, assigns priority and an appropriate support group, creates a ticket in MongoDB, creates a mock ServiceNow incident, and records the action in the audit log.

For unsupported questions, the system avoids generating an unsupported troubleshooting answer and escalates the ticket to IT Support.

The project is implemented as a prototype focused on demonstrating the complete end-to-end workflow.

---

## 2. Key Features

### Employee Self-Service
- Submit IT issues using natural language.
- Receive AI-assisted analysis and troubleshooting guidance.
- View ticket ID, category, priority, confidence, status, and knowledge sources.
- Unsupported issues are automatically escalated.

### AI Ticket Analysis
- Incident/service-request classification.
- Category detection.
- Impact and urgency assignment.
- Priority assignment.
- Assignment group selection.
- Retrieval confidence calculation.

### RAG Knowledge Base
- Searches internal Markdown knowledge documents.
- Uses Sentence Transformers for semantic embeddings.
- Uses ChromaDB as the vector database.
- Combines semantic similarity and lexical overlap.
- Provides source attribution.
- Prevents unsupported questions from using unrelated knowledge sources.

### AI Response Generation
- Uses an open-source Hugging Face Qwen instruction model.
- Responses are grounded in retrieved knowledge.
- The model is instructed not to invent troubleshooting steps.
- Relevant escalation instructions from the knowledge base are included when applicable.

### Software Provisioning
Software requests follow this workflow:

`Pending Approval → Approved → Provisioning → Completed`

### Audit Logging
Important system actions are stored in MongoDB, including:
- Ticket creation
- Software request creation
- Software request approval
- Software provisioning
- Software request completion

### Mock ServiceNow Integration
Each analyzed ticket is synchronized with a mock ServiceNow incident and receives an incident number such as:

`INC100001`

The ServiceNow page displays:
- Incident number
- Ticket ID
- Description
- Category
- Priority
- Assignment group
- Status

---

## 3. Technology Stack

### Frontend
- React.js
- Vite
- JavaScript
- CSS
- React Markdown

### Backend
- Python
- FastAPI
- Pydantic
- Uvicorn

### AI / RAG
- Hugging Face Transformers
- Qwen/Qwen2.5-1.5B-Instruct
- Sentence Transformers
- all-MiniLM-L6-v2
- ChromaDB

### Database
- MongoDB Atlas
- PyMongo

### Integration
- Mock ServiceNow API/workflow

---

## 4. System Architecture

```text
                    ┌──────────────────────────┐
                    │     React Frontend       │
                    │                          │
                    │ Employee Self-Service    │
                    │ ITSM Dashboard           │
                    │ Knowledge Base           │
                    │ Software Requests        │
                    │ Audit Logs               │
                    │ ServiceNow               │
                    └────────────┬─────────────┘
                                 │
                                 │ HTTP / REST
                                 ▼
                    ┌──────────────────────────┐
                    │      FastAPI Backend      │
                    │                          │
                    │ Ticket Analysis           │
                    │ RAG Service               │
                    │ AI Service                │
                    │ Software Requests         │
                    │ Audit Logging             │
                    │ ServiceNow Integration   │
                    └───────┬──────────┬───────┘
                            │          │
              ┌─────────────┘          └──────────────┐
              ▼                                       ▼
   ┌────────────────────┐                 ┌────────────────────┐
   │    ChromaDB        │                 │    MongoDB Atlas   │
   │                    │                 │                    │
   │ Knowledge vectors  │                 │ Tickets            │
   │ Embeddings         │                 │ Software requests  │
   │ Document metadata  │                 │ Audit logs          │
   └────────────────────┘                 │ ServiceNow records │
                                          └────────────────────┘
```

---

## 5. Ticket Processing Flow

```text
Employee submits issue
        │
        ▼
FastAPI /api/tickets/analyze
        │
        ▼
RAG knowledge retrieval
        │
        ├── Relevant knowledge found
        │          │
        │          ▼
        │      AI response
        │
        └── No relevant knowledge
                   │
                   ▼
              Escalation
        │
        ▼
Ticket classification
        │
        ▼
Priority + Assignment Group
        │
        ▼
MongoDB ticket
        │
        ├──────────────► Audit Log
        │
        └──────────────► Mock ServiceNow Incident
        │
        ▼
Result returned to React
```

---

## 6. RAG Pipeline

The RAG system uses the following process:

```text
Knowledge Markdown files
        │
        ▼
Document section splitting
        │
        ▼
Sentence Transformer embeddings
        │
        ▼
ChromaDB vector storage
        │
        ▼
User question
        │
        ▼
Semantic similarity search
        │
        ▼
Lexical relevance calculation
        │
        ▼
Relevant knowledge filtering
        │
        ▼
Context sent to AI model
        │
        ▼
Grounded response
```

The current knowledge base contains:

- `vpn.md`
- `password.md`
- `outlook.md`
- `vscode.md`

---

## 7. Knowledge Base Scenarios

### VPN

Category:
`Network / VPN`

Assignment group:
`Network Support`

The knowledge base provides troubleshooting steps such as checking connectivity, restarting the VPN client, verifying credentials, reconnecting, and escalating persistent issues.

### Password

Category:
`Access / Password`

Assignment group:
`IT Support`

The knowledge base covers password-expiration handling, identity validation, approved reset procedures, and escalation.

### Outlook

Category:
`Software / Email`

Assignment group:
`IT Support`

The knowledge base covers Outlook connectivity and synchronization troubleshooting.

### VS Code

Category:
`Software / Software Provisioning`

Assignment group:
`IT Support / Software Provisioning`

The knowledge base describes the software request, approval, provisioning, and completion workflow.

---

## 8. Unsupported Question Handling

The system includes a relevance filter before creating the final RAG context.

For example:

```text
User:
"My printer is not working"

Result:
Confidence: 0
Knowledge Sources: []
Escalated: true
Status: Escalated
Assignment Group: IT Support
```

This prevents unrelated knowledge documents from being presented as sources for unsupported questions.

---

## 9. Demonstration Scenarios

The prototype was tested with the following scenarios:

| Scenario | Type | Category | Result |
|---|---|---|---|
| My VPN is not connecting | Incident | Network / VPN | New |
| My password has expired and I cannot sign in | Incident | Access / Password | New |
| My Outlook email is not synchronizing | Incident | Software / Email | New |
| I need VS Code installed on my company computer | Service Request | Software / Software Provisioning | New |
| My printer is not working | Incident | Other | Escalated |

---

## 10. Software Provisioning Workflow

The software request workflow is:

```text
Create Request
      │
      ▼
Pending Approval
      │
      ▼
Approve
      │
      ▼
Approved
      │
      ▼
Provision
      │
      ▼
Provisioning
      │
      ▼
Complete
      │
      ▼
Completed
```

The workflow is stored in MongoDB and its actions are recorded in the audit log.

---

## 11. MongoDB Collections

The project uses MongoDB Atlas for persistent application data.

Primary collections include:

- `tickets`
- `software_requests`
- `audit_logs`
- `servicenow_records`

The backend database layer also defines collections for the broader ITSM design, including:

- `users`
- `knowledge`
- `chat_history`
- `automation_actions`

---

## 12. Project Structure

```text
ai-itsm-helpdesk/
│
├── .gitignore
│
├── backend/
│   ├── .venv/
│   ├── .env
│   ├── main.py
│   ├── requirements.txt
│   │
│   ├── database/
│   │   └── mongodb.py
│   │
│   ├── routes/
│   │   ├── tickets.py
│   │   ├── knowledge.py
│   │   ├── software_requests.py
│   │   ├── audit_logs.py
│   │   └── servicenow.py
│   │
│   ├── services/
│   │   ├── rag_service.py
│   │   └── ai_service.py
│   │
│   ├── test_rag.py
│   └── test_ai.py
│
├── frontend/
│   └── src/
│       ├── App.jsx
│       ├── App.css
│       ├── ITSMDashboard.jsx
│       ├── AIAnalysis.jsx
│       ├── KnowledgeBase.jsx
│       ├── SoftwareRequests.jsx
│       └── AuditLogs.jsx
│
├── knowledge/
│   ├── vpn.md
│   ├── password.md
│   ├── outlook.md
│   └── vscode.md
│
└── README.md
```

---

## 13. Running the Backend

From the project directory:

```bash
cd ~/ai-itsm-helpdesk/backend
```

Activate the virtual environment:

```bash
source .venv/bin/activate
```

Start FastAPI:

```bash
uvicorn main:app --reload
```

The API will be available at:

```text
http://127.0.0.1:8000
```

Swagger API documentation:

```text
http://127.0.0.1:8000/docs
```

---

## 14. Running the Frontend

Open another terminal:

```bash
cd ~/ai-itsm-helpdesk/frontend
```

Install dependencies if required:

```bash
npm install
```

Start the Vite development server:

```bash
npm run dev
```

The frontend will normally be available at:

```text
http://localhost:5173
```

---

## 15. Environment Variables

The backend uses a `.env` file for sensitive configuration.

Example:

```env
MONGODB_URI=<your-mongodb-atlas-connection-string>
DATABASE_NAME=itsm_db
```

Do not commit `.env` or database credentials to GitHub.

The project `.gitignore` excludes:

```text
backend/.venv/
backend/.env
__pycache__/
*.pyc
```

---

## 16. API Endpoints

### Tickets

```text
POST /api/tickets/analyze
GET  /api/tickets
```

### Knowledge Base

```text
GET /api/knowledge
```

### Software Requests

```text
POST /api/software-requests
GET  /api/software-requests
PUT  /api/software-requests/{request_id}/approve
PUT  /api/software-requests/{request_id}/provision
PUT  /api/software-requests/{request_id}/complete
```

### Audit Logs

```text
GET /api/audit-logs
```

### ServiceNow

The project includes a mock ServiceNow workflow for incident creation and displaying synchronized incident records.

---

## 17. Example Ticket Response

A successful analyzed ticket contains information similar to:

```json
{
  "message": "Ticket analyzed and created successfully",
  "ticket_id": "example-ticket-id",
  "servicenow_incident": "INC100001",
  "analysis": {
    "type": "Incident",
    "category": "Network / VPN",
    "impact": "Medium",
    "urgency": "High",
    "priority": "High",
    "assignment_group": "Network Support"
  },
  "confidence": 0.6,
  "knowledge_sources": [
    "vpn.md"
  ],
  "escalated": false,
  "status": "New"
}
```

---

## 18. Prototype Limitations

This implementation is designed as a technical assessment prototype rather than a production ITSM platform.

Current classification uses a combination of keyword-based ticket classification and RAG relevance scoring.

ServiceNow integration is implemented as a mock workflow for demonstration.

The RAG confidence value is a retrieval relevance score and should not be interpreted as a calibrated probability.

Authentication, enterprise identity management, production ServiceNow credentials, real software installation agents, and production-grade security controls are outside the prototype scope.

---

## 19. Demo Flow

A recommended demonstration sequence is:

### Step 1 — Employee Self-Service

Submit:

```text
My VPN is not connecting
```

Show:
- AI analysis
- Category
- Priority
- Confidence
- Knowledge source
- ServiceNow incident

### Step 2 — Password

Submit:

```text
My password has expired and I cannot sign in
```

Show the password knowledge response.

### Step 3 — Outlook

Submit:

```text
My Outlook email is not synchronizing
```

Show the Outlook knowledge response.

### Step 4 — Software Request

Submit:

```text
I need VS Code installed on my company computer
```

Show the software provisioning workflow:

```text
Pending Approval
→ Approved
→ Provisioning
→ Completed
```

### Step 5 — Unsupported Question

Submit:

```text
My printer is not working
```

Show:

```text
No relevant knowledge
→ Escalated
→ IT Support
```

### Step 6 — Dashboard

Show the five tickets and dashboard statistics.

### Step 7 — Audit Logs

Show the recorded ticket and software actions.

### Step 8 — ServiceNow

Show the generated mock incident records.

---

## 20. Project Goal

The goal of this prototype is to demonstrate how AI, RAG, ITSM workflows, knowledge management, automated ticket analysis, software provisioning, audit logging, and ServiceNow-style incident management can be combined into a single employee self-service platform.

