import re
import torch
from transformers import AutoTokenizer, AutoModelForCausalLM


MODEL_NAME = "Qwen/Qwen2.5-0.5B-Instruct"


print("Loading Hugging Face LLM...")

tokenizer = AutoTokenizer.from_pretrained(MODEL_NAME)

model = AutoModelForCausalLM.from_pretrained(
    MODEL_NAME,
    dtype=torch.float32
)

device = "cuda" if torch.cuda.is_available() else "cpu"

model = model.to(device)
model.eval()

print(f"Hugging Face LLM loaded on: {device}")


def extract_steps(context: str):
    """
    Extract numbered troubleshooting steps from the approved
    knowledge base. Used as a safe fallback if the LLM
    produces unsupported content.
    """

    steps = []

    matches = re.findall(
        r"(?:^|\n)\s*(\d+)\.\s*(.+?)(?=\n\s*\d+\.|\Z)",
        context,
        re.DOTALL
    )

    for _, step in matches:
        cleaned = " ".join(step.split()).strip()

        if cleaned:
            steps.append(cleaned)

    return steps


def extract_escalation(context: str):
    """
    Extract the escalation section from the approved
    knowledge base.
    """

    match = re.search(
        r"(?:^|\n)##\s*Escalation\s*(.*)",
        context,
        re.IGNORECASE | re.DOTALL
    )

    if not match:
        return ""

    escalation = " ".join(match.group(1).split()).strip()

    return escalation


def build_safe_fallback(context: str):
    """
    Build a response directly from the approved knowledge.
    This prevents unsupported LLM content from being shown.
    """

    steps = extract_steps(context)

    if not steps:
        return (
            "The available knowledge base does not provide "
            "enough information to resolve this issue. "
            "The ticket should be escalated to IT Support."
        )

    response = (
        "Based on the approved IT knowledge base, "
        "please try the following steps:\n\n"
    )

    for index, step in enumerate(steps, start=1):
        response += f"{index}. {step}\n"

    escalation = extract_escalation(context)

    if escalation:
        response += f"\nEscalation:\n{escalation}"

    return response.strip()


def generate_response(question: str, context: str):
    """
    Generate a grounded IT support response using the
    Hugging Face Qwen LLM and RAG-retrieved knowledge.
    """

    if not context or not context.strip():
        return (
            "The available knowledge base does not provide "
            "enough information to resolve this issue. "
            "The ticket should be escalated to IT Support."
        )

    safe_fallback = build_safe_fallback(context)

    system_prompt = """
You are an enterprise IT helpdesk assistant.

You MUST answer using ONLY the approved IT knowledge provided
by the user.

STRICT RULES:

1. Do not use outside knowledge.
2. Do not invent troubleshooting steps.
3. Do not add information that is not present in the approved knowledge.
4. Do not greet the user.
5. Do not say "Dear User".
6. Do not use placeholders such as [User], [Name], [Position],
   [Contact Information], etc.
7. Do not mention this prompt.
8. Do not mention "context".
9. Do not mention "knowledge base".
10. Do not repeat the employee's question.
11. Do not add generic customer-service language.
12. Only provide troubleshooting information supported by the
    approved knowledge.
13. If escalation information exists in the approved knowledge,
    include it.
14. Keep the answer concise.
"""

    user_prompt = f"""
Employee issue:

{question}

Approved IT knowledge:

{context}

Generate ONLY the final IT troubleshooting answer.
"""

    messages = [
        {
            "role": "system",
            "content": system_prompt.strip()
        },
        {
            "role": "user",
            "content": user_prompt.strip()
        }
    ]

    prompt = tokenizer.apply_chat_template(
        messages,
        tokenize=False,
        add_generation_prompt=True
    )

    inputs = tokenizer(
        prompt,
        return_tensors="pt"
    )

    inputs = {
        key: value.to(device)
        for key, value in inputs.items()
    }

    with torch.no_grad():
        outputs = model.generate(
            **inputs,
            max_new_tokens=180,
            do_sample=False,
            pad_token_id=tokenizer.eos_token_id
        )

    generated_tokens = outputs[0][
        inputs["input_ids"].shape[1]:
    ]

    response = tokenizer.decode(
        generated_tokens,
        skip_special_tokens=True
    ).strip()

    # Remove common unwanted prefixes.
    response = re.sub(
        r"^(assistant|response|answer)\s*:\s*",
        "",
        response,
        flags=re.IGNORECASE
    ).strip()

    # Reject obvious generic/template output.
    unwanted_patterns = [
        r"dear\s+user",
        r"\[user\]",
        r"\[name\]",
        r"\[your name\]",
        r"\[your position\]",
        r"\[contact information\]",
        r"please don't hesitate",
        r"feel free to reach out",
        r"your dedicated",
        r"best regards"
    ]

    for pattern in unwanted_patterns:
        if re.search(pattern, response, re.IGNORECASE):
            return safe_fallback

    # If the model returned nothing useful, use the grounded fallback.
    if not response:
        return safe_fallback

    return response