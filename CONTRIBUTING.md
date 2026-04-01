# Contributing to GemFinder

Thank you for your interest in contributing to GemFinder! We welcome contributions from everyone. This document provides guidelines and instructions for contributing.

## Getting Started

1. **Fork the repository** on GitHub
2. **Clone your fork** locally:
   ```bash
   git clone https://github.com/YOUR_USERNAME/github-search.git
   cd github-search
   ```
3. **Create a new branch** for your feature or bug fix:
   ```bash
   git checkout -b feature/your-feature-name
   ```

## Development Setup

### Prerequisites
- Node.js 18+
- Hugging Face account (free) + inference API token
- GitHub token (optional, for higher rate limits)

### Backend Setup
```bash
# Create .env.local
echo "HF_TOKEN=your_hugging_face_token" > .env.local

# Deploy locally with Vercel
npm install -g vercel
vercel dev
```

### Frontend Setup
```bash
cd frontend
npm install
npm run dev    # Start dev server
npm run build  # Build for production
```

## Making Changes

1. **Follow code style conventions** — Keep consistency with existing code
2. **Test your changes** — Ensure no regressions
3. **Keep commits clean** — Use clear, descriptive commit messages
4. **Write meaningful commit messages** following these guidelines:
   - Start with a verb: feat:, fix:, docs:, style:, refactor:, test:, chore:
   - Example: `feat: add dark mode toggle to UI`

## Submitting Changes

1. **Push to your fork**:
   ```bash
   git push origin feature/your-feature-name
   ```

2. **Create a Pull Request (PR)** on GitHub with:
   - Clear title describing the change
   - Description of what changes were made and why
   - Reference to any related issues (e.g., "Fixes #123")
   - Screenshots if UI changes were made

3. **Wait for review** — Maintainers will review your PR and provide feedback

## Pull Request Guidelines

- Keep PRs focused and reasonably sized
- One feature or bug fix per PR
- Ensure all tests pass
- Update documentation if needed
- Respond to review feedback promptly

## Reporting Bugs

Found a bug? Please create an issue with:
- Clear description of the bug
- Steps to reproduce
- Expected vs actual behavior
- Your environment (OS, Node version, etc.)
- Screenshots if applicable

## Feature Requests

Have an idea for improvement? Create an issue with:
- Clear description of the feature
- Motivation and use cases
- Possible implementation approach (optional)

## Code Review Process

1. Maintainers will review your PR
2. Changes may be requested
3. Once approved, your PR will be merged
4. Your contribution will be recognized

## Questions?

Feel free to:
- Open an issue with your question
- Contact: sadistic.pentester@gmail.com
- Check existing documentation in README.md

## License

By contributing, you agree that your contributions will be licensed under the MIT License (same as the project).

---

**Thank you for contributing to GemFinder!** 🎉
