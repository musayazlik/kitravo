# Security policy

Version 1.x is the supported release line.

Do not report vulnerabilities with credentials or personal account data in a public issue. Use GitHub's private vulnerability reporting for this repository when available. Include the affected version, reproducible steps, expected behavior, and impact, with secrets removed.

The hosted demo is read-only and must not expose real users, custom private roles, or audit data. UI visibility is not an authorization boundary: every API, server action, and data query must enforce permissions independently.
