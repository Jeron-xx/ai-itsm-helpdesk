# Password Expired Troubleshooting

## Problem

The user's account password has expired and they cannot sign in.

## Category

Access / Password

## Issue Type

Incident

## Symptoms

- User cannot log in.
- The system reports that the password has expired.
- User is unable to access company applications.
- Authentication fails because the password is expired.

## Troubleshooting Steps

1. Confirm that the user is experiencing a password-expired error.
2. Verify the user's identity before performing any password reset.
3. If identity validation is successful, initiate the approved password reset process.
4. Ask the user to create a new password according to the organization's password policy.
5. Confirm that the password reset was completed successfully.
6. Ask the user to sign in again.
7. If the reset fails, escalate the issue to the IT Support team.

## Resolution

If the user's identity is successfully validated, perform the approved password-reset procedure. Do not reset a password without identity validation.

## Automation Safety

Password reset automation must require successful identity validation before the reset action is performed.

The system should record the password-reset action in the audit log.

## Assignment Group

IT Support

## Escalation

If identity validation fails or the automated reset cannot be completed, do not perform the reset. Escalate the incident to IT Support.