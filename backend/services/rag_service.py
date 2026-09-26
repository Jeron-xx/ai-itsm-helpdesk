from pathlib import Path
import re

import chromadb
from sentence_transformers import SentenceTransformer


# ============================================================
# Paths
# ============================================================

BASE_DIR = Path(__file__).resolve().parents[2]

KNOWLEDGE_DIR = BASE_DIR / "knowledge"
CHROMA_DIR = BASE_DIR / "backend" / "chroma_db"


# ============================================================
# Embedding Model
# ============================================================

embedding_model = SentenceTransformer(
    "all-MiniLM-L6-v2"
)


# ============================================================
# ChromaDB
# ============================================================

chroma_client = chromadb.PersistentClient(
    path=str(CHROMA_DIR)
)

collection = chroma_client.get_or_create_collection(
    name="it_knowledge"
)


# ============================================================
# Load Knowledge Documents
# ============================================================

def load_knowledge_documents():

    documents = []
    ids = []
    sources = []

    for file_path in KNOWLEDGE_DIR.glob("*.md"):

        content = file_path.read_text(
            encoding="utf-8"
        )

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


# ============================================================
# Build Knowledge Base
# ============================================================

def build_knowledge_base():

    documents, ids, sources = load_knowledge_documents()

    if not documents:
        return 0

    embeddings = embedding_model.encode(
        documents
    ).tolist()

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


# ============================================================
# Semantic Search
# ============================================================

def search_knowledge(query: str, top_k: int = 6):

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


# ============================================================
# Text Processing
# ============================================================

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
        "have",
        "am",
        "was",
        "were",
        "do",
        "does",
        "unable"
    }

    return {
        word
        for word in words
        if word not in stop_words
    }


def calculate_overlap(query, document):

    query_words = extract_words(query)

    document_words = extract_words(document)

    if not query_words:
        return 0

    matching_words = query_words.intersection(
        document_words
    )

    return len(matching_words) / len(query_words)


# ============================================================
# Intent Detection
# ============================================================

def detect_knowledge_source(query):

    query_lower = query.lower()

    # --------------------------------------------------------
    # VPN
    # --------------------------------------------------------

    vpn_terms = [
        "vpn",
        "virtual private network",
        "vpn connection",
        "vpn disconnect",
        "vpn disconnected",
        "vpn not working"
    ]

    if any(
        term in query_lower
        for term in vpn_terms
    ):
        return "vpn.md"


    # --------------------------------------------------------
    # Password / Login / Account Access
    # --------------------------------------------------------

    password_terms = [
        "password",
        "password expired",
        "forgot password",
        "reset password",
        "sign in",
        "signing in",
        "signed in",
        "log in",
        "logging in",
        "logged in",
        "login",
        "cannot access my account",
        "can't access my account",
        "cannot access account",
        "can't access account",
        "unable to access my account",
        "unable to access account",
        "company account",
        "corporate account",
        "account access",
        "authentication",
        "authentication problem",
        "authentication issue"
    ]

    if any(
        term in query_lower
        for term in password_terms
    ):
        return "password.md"


    # --------------------------------------------------------
    # Outlook / Email
    # --------------------------------------------------------

    outlook_terms = [
        "outlook",
        "email",
        "emails",
        "e-mail",
        "mail",
        "mailbox",
        "synchroniz",
        "sync",
        "email not working",
        "emails not working"
    ]

    if any(
        term in query_lower
        for term in outlook_terms
    ):
        return "outlook.md"


    # --------------------------------------------------------
    # VS Code / Software Provisioning
    # --------------------------------------------------------

    vscode_terms = [
        "vscode",
        "vs code",
        "visual studio code"
    ]

    if any(
        term in query_lower
        for term in vscode_terms
    ):
        return "vscode.md"


    # --------------------------------------------------------
    # Wi-Fi / Wireless Network
    # --------------------------------------------------------

    wifi_terms = [
        "wifi",
        "wi-fi",
        "wireless",
        "wireless network",
        "wifi connection",
        "wi-fi connection",
        "wifi not working",
        "wi-fi not working",
        "cannot connect to wifi",
        "can't connect to wifi",
        "cannot connect to wi-fi",
        "can't connect to wi-fi"
    ]

    if any(
        term in query_lower
        for term in wifi_terms
    ):
        return "wifi.md"


    # --------------------------------------------------------
    # No known intent
    # --------------------------------------------------------

    return None


# ============================================================
# Complete Source Document
# ============================================================

def get_complete_source_document(source_name):

    source_path = KNOWLEDGE_DIR / source_name

    if not source_path.exists():
        return ""

    return source_path.read_text(
        encoding="utf-8"
    ).strip()


# ============================================================
# RAG Context
# ============================================================

def get_rag_context(query: str, top_k: int = 6):

    # --------------------------------------------------------
    # Detect known IT intent
    # --------------------------------------------------------

    detected_source = detect_knowledge_source(
        query
    )


    # --------------------------------------------------------
    # Semantic search
    # --------------------------------------------------------

    results = search_knowledge(
        query,
        top_k
    )

    documents = results["documents"][0]
    metadatas = results["metadatas"][0]
    distances = results["distances"][0]


    # --------------------------------------------------------
    # No semantic results
    # --------------------------------------------------------

    if not documents:

        if detected_source:

            context = get_complete_source_document(
                detected_source
            )

            if context:

                confidence = 0.60

                if detected_source == "vscode.md":
                    confidence = 0.75

                return {
                    "context": context,
                    "sources": [detected_source],
                    "confidence": confidence,
                    "escalate": False
                }

        return {
            "context": "",
            "sources": [],
            "confidence": 0,
            "escalate": True
        }


    # --------------------------------------------------------
    # Calculate semantic relevance
    # --------------------------------------------------------

    relevant_chunks = []

    source_scores = {}

    for document, metadata, distance in zip(
        documents,
        metadatas,
        distances
    ):

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
            +
            lexical_overlap * 0.3
        )

        if document_relevance >= 0.35:

            relevant_chunks.append(
                {
                    "document": document,
                    "metadata": metadata,
                    "score": document_relevance
                }
            )

            source = metadata.get(
                "source",
                ""
            )

            if source:

                if (
                    source not in source_scores
                    or
                    document_relevance
                    > source_scores[source]
                ):

                    source_scores[source] = (
                        document_relevance
                    )


    # --------------------------------------------------------
    # Intent-based source takes priority
    # --------------------------------------------------------

    if detected_source:

        selected_source = detected_source

        context = get_complete_source_document(
            selected_source
        )

        if context:

            confidence = source_scores.get(
                selected_source,
                0.60
            )

            # Minimum confidence for known topics

            if selected_source == "vpn.md":

                confidence = max(
                    confidence,
                    0.60
                )

            elif selected_source == "password.md":

                confidence = max(
                    confidence,
                    0.60
                )

            elif selected_source == "outlook.md":

                confidence = max(
                    confidence,
                    0.60
                )

            elif selected_source == "vscode.md":

                confidence = max(
                    confidence,
                    0.75
                )

            elif selected_source == "wifi.md":

                confidence = max(
                    confidence,
                    0.60
                )

            return {
                "context": context,
                "sources": [selected_source],
                "confidence": round(
                    confidence,
                    2
                ),
                "escalate": False
            }


    # --------------------------------------------------------
    # No known intent
    # --------------------------------------------------------

    if not relevant_chunks:

        return {
            "context": "",
            "sources": [],
            "confidence": 0,
            "escalate": True
        }


    # --------------------------------------------------------
    # Select strongest semantic source
    # --------------------------------------------------------

    strongest_source = max(
        source_scores,
        key=source_scores.get
    )

    confidence = source_scores[
        strongest_source
    ]


    # --------------------------------------------------------
    # Retrieve complete document
    # --------------------------------------------------------

    context = get_complete_source_document(
        strongest_source
    )

    if not context:

        context_parts = [
            item["document"]
            for item in relevant_chunks
        ]

        context = "\n\n".join(
            context_parts
        )


    # --------------------------------------------------------
    # Final escalation decision
    # --------------------------------------------------------

    escalate = confidence < 0.35


    return {
        "context": context,
        "sources": [strongest_source],
        "confidence": round(
            confidence,
            2
        ),
        "escalate": escalate
    }