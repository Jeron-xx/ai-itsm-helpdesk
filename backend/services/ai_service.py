import re


def generate_response(question: str, context: str):
    """
    Generate a strictly knowledge-grounded ITSM response.

    The response is constructed from information retrieved
    from the RAG knowledge base. No external LLM generation
    is used for troubleshooting instructions.
    """

    if not context or not context.strip():
        return (
            "The available knowledge does not provide enough "
            "information to resolve this issue. The ticket should "
            "be escalated to IT Support."
        )

    # -----------------------------------------
    # Extract numbered troubleshooting steps
    # -----------------------------------------

    steps = []

    matches = re.findall(
        r"(?:^|\n)\s*(\d+)\.\s*(.+?)(?=\n\s*\d+\.|\Z)",
        context,
        re.DOTALL
    )

    for _, step in matches:

        cleaned_step = " ".join(
            step.split()
        ).strip()

        if cleaned_step:
            steps.append(cleaned_step)

    # -----------------------------------------
    # Remove possible non-troubleshooting
    # numbered content
    # -----------------------------------------

    if steps:

        response = (
            "Based on the IT knowledge base, "
            "please try the following steps:\n\n"
        )

        for index, step in enumerate(steps, start=1):

            response += (
                f"{index}. {step}\n"
            )

    else:

        response = (
            "The available knowledge provides information "
            "related to this issue, but no specific "
            "troubleshooting steps were found."
        )

    # -----------------------------------------
    # Extract escalation instruction
    # -----------------------------------------

    escalation_match = re.search(
        r"(?:##\s*)?Escalation\s*(.*)",
        context,
        re.IGNORECASE | re.DOTALL
    )

    if escalation_match:

        escalation_text = " ".join(
            escalation_match.group(1).split()
        ).strip()

        if escalation_text:

            response += (
                "\n\n**Escalation:**\n"
                f"{escalation_text}"
            )

    return response.strip()