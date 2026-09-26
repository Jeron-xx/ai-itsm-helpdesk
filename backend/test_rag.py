from services.rag_service import (
    build_knowledge_base,
    get_rag_context
)


print("Building knowledge base...")

count = build_knowledge_base()

print(f"Loaded {count} knowledge chunks.")


questions = [
    "My VPN is not connecting",
    "My Outlook email is not synchronizing",
    "My printer is making a strange mechanical noise"
]


for question in questions:

    print("\n================================")
    print("QUESTION:", question)

    result = get_rag_context(question)

    print("Confidence:", result["confidence"])
    print("Sources:", result["sources"])
    print("Escalate:", result["escalate"])

    print("\nContext:")
    print(result["context"][:1000])