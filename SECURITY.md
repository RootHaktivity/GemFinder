# Security Policy

## Reporting a Vulnerability

**Do not open a public issue to report a security vulnerability.** Instead, please email your security concerns to:

**sadistic.pentester@gmail.com**

Please include:
- Description of the vulnerability
- Steps to reproduce (if applicable)
- Potential impact
- Suggested fix (if any)

We will acknowledge your report within 48 hours and investigate promptly.

## Security Measures

### Backend Security
- Environment variables for sensitive tokens (HF_TOKEN, GITHUB_TOKEN)
- No sensitive data stored in client-side code
- API rate limiting to prevent abuse
- Input validation on all endpoints

### Frontend Security
- No sensitive credentials exposed in the browser
- All API calls go through secure backend proxy
- Content Security Policy enabled
- Regular dependency updates

## Dependencies

We actively monitor dependencies for security vulnerabilities using:
- npm audit
- Dependabot alerts
- GitHub security scanning

## Best Practices for Users

1. **API Token Security**
   - Keep your HF_TOKEN and GITHUB_TOKEN private
   - Use environment variables, never commit tokens
   - Rotate tokens regularly if exposed

2. **Deployment**
   - Set environment variables securely in your deployment platform
   - Don't commit .env files to version control
   - Use `.env.local` locally (already in .gitignore)

## Supported Versions

| Version | Status | Security Updates |
|---------|--------|------------------|
| Latest  | Active | Ongoing          |

## Security Updates Timeline

- Critical vulnerabilities: Patch within 24-48 hours
- High severity: Patch within 1 week
- Medium severity: Patch in next release
- Low severity: Fixed as part of regular updates

## Responsible Disclosure

We appreciate your help in keeping GemFinder secure. If a vulnerability is responsibly disclosed to us, we will:
1. Investigate and confirm the issue
2. Develop and test a fix
3. Release a security update
4. Credit the reporter (unless anonymity is requested)

## Questions?

For security-related questions, contact: sadistic.pentester@gmail.com
