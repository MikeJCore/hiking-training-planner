# Contributing to Hiking Training Planner

Thank you for your interest in contributing to the Hiking Training Planner! We appreciate your time and effort in helping us improve this project.

## 📋 Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Making Changes](#making-changes)
- [Submitting a Pull Request](#submitting-a-pull-request)
- [Reporting Bugs](#reporting-bugs)
- [Feature Requests](#feature-requests)
- [Code Style](#code-style)
- [License](#license)

## Code of Conduct

This project and everyone participating in it is governed by our [Code of Conduct](CODE_OF_CONDUCT.md). By participating, you are expected to uphold this code.

## Getting Started

1. **Fork the Repository**
   Click the "Fork" button in the top-right corner of the repository page.

2. **Clone Your Fork**
   ```bash
   git clone https://github.com/your-username/hiking-training-planner.git
   cd hiking-training-planner
   ```

3. **Set Up the Development Environment**
   ```bash
   # Install dependencies
   npm install
   
   # Create a .env file
   cp .env.example .env
   ```
   
   Update the `.env` file with your local configuration.

4. **Start the Development Servers**
   ```bash
   # Start both frontend and backend in development mode
   npm run dev
   ```

## Development Workflow

1. **Create a New Branch**
   ```bash
   git checkout -b feature/your-feature-name
   # or
   git checkout -b bugfix/description-of-fix
   ```

2. **Make Your Changes**
   Follow the code style and write tests for your changes.

3. **Run Tests**
   ```bash
   npm test
   ```

4. **Lint Your Code**
   ```bash
   npm run lint
   ```

5. **Commit Your Changes**
   ```bash
   git add .
   git commit -m "feat: add new feature"
   ```
   
   Use semantic commit messages (feat, fix, docs, style, refactor, test, chore).

6. **Push to Your Fork**
   ```bash
   git push origin your-branch-name
   ```

## Submitting a Pull Request

1. Go to your fork on GitHub and click "New Pull Request".
2. Select the base branch (usually `main`) and the compare branch (your feature branch).
3. Fill in the PR template with details about your changes.
4. Submit the PR and wait for code review.

## Reporting Bugs

If you find a bug, please create an issue using the [Bug Report](.github/ISSUE_TEMPLATE/bug_report.md) template.

## Feature Requests

For new features, please use the [Feature Request](.github/ISSUE_TEMPLATE/feature_request.md) template.

## Code Style

- Follow the existing code style in the project.
- Use ESLint and Prettier for code formatting.
- Write meaningful commit messages.
- Keep PRs focused and limited to a single feature or bug fix.

## License

By contributing, you agree that your contributions will be licensed under the project's [LICENSE](LICENSE) file.
