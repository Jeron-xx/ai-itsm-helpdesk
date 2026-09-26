from pathlib import Path
import re

import chromadb
from sentence_transformers import SentenceTransformer


# ==========================================
# Project paths
# ==========================================

BASE_DIR = Path(__file__).resolve().parents[2]

KNOWLEDGE_DIR = BASE_DIR / "knowledge"

CHROMA_DIR = BASE_DIR / "backend" / "chroma_db"


# ==========================================
# Embedding model
# ==========================================

embedding_model = SentenceTransformer(
    "all-MiniLM-L6-v2"
)


# ==========================================
# ChromaDB
# ==========================================

chroma_client = chromadb.PersistentClient(
    path=str(CHROMA_DIR)
)


collection = chroma_client.get_or_create_collection(
    name="it_knowledge"
)


# ==========================================
# Load knowledge documents
# ==========================================

def load_knowledge_documents():

    documents = []
    ids = []
    sources = []

    for file_path in KNOWLEDGE_DIR.glob("*.md"):

        content = file_path.read_text(
            encoding="utf-8"
        )

        # Split document into sections
        sections = content.split("\n## ")

        for index, section in enumerate(sections):

            if not section.strip():
                continue

            chunk = section.strip()

            documents.append(chunk)

            ids.append(
                f"{file_path.stem}_{index}"
            )

            sources.append(
                file_path.name
            )

    return documents, ids, sources


# ==========================================
# Build knowledge base
# ==========================================

def build_knowledge_base():

    documents, ids, sources = (
        load_knowledge_documents()
    )

    if not documents:
        return 0

    embeddings = embedding_model.encode(
        documents
    ).tolist()

    # Remove old collection contents
    # so outdated chunks are not retained.

    existing_ids = collection.get()["ids"]

    if existing_ids:

        collection.delete(
            ids=existing_ids
        )

    collection.upsert(
        ids=ids,
        documents=documents,
        embeddings=embeddings,
        metadatas=[
            {
                "source": source
            }
            for source in sources
        ]
    )

    return len(documents)


# ==========================================
# Search knowledge
# ==========================================

def search_knowledge(
    query: str,
    top_k: int = 6
):

    query_embedding = embedding_model.encode(
        [query]
    ).tolist()

    results = collection.query(
        query_embeddings=query_embedding,
        n_results=top_k,
        include=[
            "documents",
            "metadatas",
            "distances"
        ]
    )

    return results


# ==========================================
# Simple word extraction
# ==========================================

def extract_words(text):

    words = re.findall(
        r"[a-zA-Z0-9]+",
        text.lower()
    )

    stop_words = {
        "the",
        "a",
        "an",
        "is",
        "are",
        "my",
        "i",
        "me",
        "to",
        "on",
        "in",
        "of",
        "and",
        "or",
        "for",
        "can",
        "you",
        "please",
        "want",
        "need",
        "not",
        "with",
        "it",
        "this",
        "that",
        "be",
        "has",
        "have"
    }

    return {
        word
        for word in words
        if word not in stop_words
    }


# ==========================================
# Calculate lexical overlap
# ==========================================

def calculate_overlap(
    query: str,
    document: str
):

    query_words = extract_words(query)

    document_words = extract_words(document)

    if not query_words:
        return 0

    matching_words = (
        query_words.intersection(
            document_words
        )
    )

    return len(matching_words) / len(
        query_words
    )


# ==========================================
# Get RAG context
# ==========================================

def get_rag_context(
    query: str,
    top_k: int = 6
):

    results = search_knowledge(
        query,
        top_k
    )

    documents = results["documents"][0]
    metadatas = results["metadatas"][0]
    distances = results["distances"][0]

    if not documents:

        return {
            "context": "",
            "sources": [],
            "confidence": 0,
            "escalate": True
        }


    # ======================================
    # Calculate relevance for each document
    # ======================================

    relevant_documents = []
    relevant_metadatas = []
    relevance_scores = []

    for document, metadata, distance in zip(
        documents,
        metadatas,
        distances
    ):

        # Convert Chroma distance into a
        # simple semantic similarity score.

        semantic_similarity = max(
            0,
            min(
                1,
                1 - distance
            )
        )

        lexical_overlap = calculate_overlap(
            query,
            document
        )

        document_relevance = (
            semantic_similarity * 0.7
            + lexical_overlap * 0.3
        )

        # Only keep documents that have
        # enough relevance to the query.

        if document_relevance >= 0.35:

            relevant_documents.append(
                document
            )

            relevant_metadatas.append(
                metadata
            )

            relevance_scores.append(
                document_relevance
            )


    # ======================================
    # No relevant knowledge found
    # ======================================

    if not relevant_documents:

        return {
            "context": "",
            "sources": [],
            "confidence": 0,
            "escalate": True
        }


    # ======================================
    # Best relevance score
    # ======================================

    confidence = max(
        relevance_scores
    )


    # ======================================
    # Known software-request boost
    # ======================================

    query_lower = query.lower()

    vscode_terms = [
        "vscode",
        "vs code",
        "visual studio code"
    ]

    if any(
        term in query_lower
        for term in vscode_terms
    ):

        if any(
            metadata
            and metadata.get("source")
            == "vscode.md"
            for metadata in relevant_metadatas
        ):

            confidence = max(
                confidence,
                0.75
            )


    # ======================================
    # Known VPN boost
    # ======================================

    if "vpn" in query_lower:

        if any(
            metadata
            and metadata.get("source")
            == "vpn.md"
            for metadata in relevant_metadatas
        ):

            confidence = max(
                confidence,
                0.60
            )


    # ======================================
    # Known password boost
    # ======================================

    password_terms = [
        "password",
        "sign in",
        "login",
        "log in"
    ]

    if any(
        term in query_lower
        for term in password_terms
    ):

        if any(
            metadata
            and metadata.get("source")
            == "password.md"
            for metadata in relevant_metadatas
        ):

            confidence = max(
                confidence,
                0.60
            )


    # ======================================
    # Known Outlook boost
    # ======================================

    outlook_terms = [
        "outlook",
        "email",
        "mail",
        "synchroniz"
    ]

    if any(
        term in query_lower
        for term in outlook_terms
    ):

        if any(
            metadata
            and metadata.get("source")
            == "outlook.md"
            for metadata in relevant_metadatas
        ):

            confidence = max(
                confidence,
                0.60
            )


    # ======================================
    # Sources
    # ======================================

    sources = list(
        dict.fromkeys(
            metadata["source"]
            for metadata in relevant_metadatas
            if metadata
            and "source" in metadata
        )
    )


    # ======================================
    # Build context
    # ======================================

    context_parts = []

    for document in relevant_documents:

        if document:

            context_parts.append(
                document
            )

    context = "\n\n".join(
        context_parts
    )


    # ======================================
    # Escalation
    # ======================================

    escalate = confidence < 0.35


    return {

        "context": context,

        "sources": sources,

        "confidence": round(
            confidence,
            2
        ),

        "escalate": escalate

    }