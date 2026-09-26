from fastapi import APIRouter
from pathlib import Path

router = APIRouter(
    prefix="/api/knowledge",
    tags=["Knowledge Base"]
)

BASE_DIR = Path(__file__).resolve().parents[2]
KNOWLEDGE_DIR = BASE_DIR / "knowledge"


@router.get("")
def get_knowledge():

    documents = []

    for file_path in KNOWLEDGE_DIR.glob("*.md"):

        content = file_path.read_text(
            encoding="utf-8"
        )

        documents.append({
            "id": file_path.stem,
            "title": file_path.stem.replace(
                "_", " "
            ).title(),
            "source": file_path.name,
            "content": content
        })

    return {
        "documents": documents
    }