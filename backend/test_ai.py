from services.rag_service import (
    build_knowledge_base,
    get_rag_context
)

from services.ai_service import generate_response


print("Building knowledge base...")

count = build_knowledge_base()

print(f"Loaded {count} knowledge chunks.")


question = "My VPN is not connecting"


# Retrieve knowledge
rag_result = get_rag_context(question)


print("\nRAG Information")
print("----------------")
print("Confidence:", rag_result["confidence"])
print("Sources:", rag_result["sources"])
print("Escalate:", rag_result["escalate"])


# Stop if the knowledge base does not contain enough information
if rag_result["escalate"]:

    print("\nAI Response:")
    print(
        "I could not find enough information in the "
        "knowledge base to resolve this issue. "
        "The ticket should be escalated to IT Support."
    )

else:

    print("\nContext sent to Qwen:")
    print("======================")
    print(rag_result["context"])
    print("======================")
    # Generate answer using retrieved knowledge
    response = generate_response(
        question,
        rag_result["context"]
    )

    print("\nAI Response:")
    print(response)