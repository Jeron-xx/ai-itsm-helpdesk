from services.ai_service import generate_response


question = "My Outlook email is not synchronizing."

context = """
# Outlook Email Troubleshooting

## Problem
The user's Outlook email is not synchronizing.

## Troubleshooting Steps
1. Check that the internet connection is working.
2. Check whether Outlook is in Offline Mode.
3. Restart Outlook.
4. Check whether the mailbox has sufficient storage.
5. Try accessing email through Outlook Web Access.
6. If the issue persists, contact IT Support.

## Escalation
If the troubleshooting steps do not resolve the problem,
escalate the issue to IT Support.
"""


response = generate_response(
    question,
    context
)

print("\n========== AI RESPONSE ==========\n")
print(response)