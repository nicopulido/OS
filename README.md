# OS

## Table of Contents

- [About](#about)
- [Getting Started](#getting_started)
- [Deployment](#deployment)
- [Usage](#usage)
- [Contributing](#contributing)

## About <a name = "about"></a>

This repository contains resources and tools for managing various tasks and assignments related to the Operating Systems (OS) subject. It serves as a centralized hub for course materials, project implementations, and practical exercises designed to help understand core OS concepts including process management, memory management, file systems, and concurrency.

## Getting Started <a name = "getting_started"></a>

These instructions help you clone and run this repository locally for coursework, experiments, and testing.

### Prerequisites

This repository does not enforce a single global prerequisite list.

Each task or assignment may define its own tools and dependencies. Always check the task folder or task statement first.

Common tools that are frequently required in OS coursework:

- `git`
- `gcc` or `clang`
- `make`
- Linux environment (native Linux, WSL, or VM)

### Installing

There is no single installation flow for the whole repository.

Use this baseline setup, then follow task-specific instructions.

1. Clone the repository.

```bash
git clone https://github.com/<your-user>/OS.git
cd OS
```

2. Read the selected task instructions before installing anything.

```bash
ls -la
```

3. Install only what that task needs.

Examples (use only if required by the task):

```bash
sudo apt update
sudo apt install -y build-essential make python3
```

4. Build or run using commands from that task.

```bash
# Example only
make
# or
gcc -Wall -Wextra -O2 source.c -o program
./program
```

## Deployment <a name = "deployment"></a>

This repository is intended primarily for local development and learning, not production deployment.

If you need to run work on another machine (lab server or VM):

1. Install the same prerequisites listed above.
2. Clone the repository on the target machine.
3. Build and run using the same commands used locally.
4. Keep environment parity (compiler version, OS, and dependencies) to avoid inconsistent results.

For reproducible grading or demos, document:

- OS version
- Compiler and tool versions
- Exact build and run commands used

## Usage <a name = "usage"></a>

Use this repository as the main workspace for Operating Systems assignments and experiments.

Typical workflow:

1. Pull the latest changes.

```bash
git pull
```

2. Work on a specific exercise/module.

```bash
# edit source files
```

3. Build and test your changes.

```bash
make
# run tests if available
# make test
```

4. Commit your progress.

```bash
git add .
git commit -m "Complete scheduler exercise"
```

5. Push to your remote branch.

```bash
git push
```

Suggested usage by topic:

- Process management: implement process creation/scheduling examples and validate output.
- Memory management: test allocation/replacement algorithms with controlled inputs.
- File systems: practice file operations, metadata handling, and consistency checks.
- Concurrency: implement threads/synchronization and test race-condition scenarios.

## Contributing <a name = "contributing"></a>

Contributions are welcome. Use this workflow to keep changes organized and easy to review.

### 1. Update the main branch

```bash
git checkout main
git pull
```

This switches to `main` and updates your local branch with the latest remote changes.

### 2. Create a feature branch

```bash
git checkout -b feature/nueva-feature
```

This creates and checks out a new branch from the current `main` state.

### 3. Register your changes with commits

Use the Conventional Commits style to keep history clear and easy to scan:

- `feat`: a new feature (example: `feat: add round-robin scheduler controls`)
- `fix`: a bug fix (example: `fix: correct waiting to ready transition`)
- `docs`: documentation-only changes (example: `docs: update usage examples`)
- `refactor`: code changes that improve structure without changing behavior
- `test`: add or update tests
- `chore`: maintenance tasks (configs, tooling, dependencies)

A practical default is: `type: short description`.

```bash
git add .
git commit -m "feat: nueva feature"
```

`git add .` moves modified files to staging, and `git commit` records a snapshot with author, date, and message.

### 4. Push your branch to remote

```bash
git push origin feature/nueva-feature
```

This publishes your branch to the remote repository.

Do this when you finish your development branch work and want to share it for review.

### 5. Sync your branch with recent `main` changes

```bash
git checkout main
git pull
git checkout feature/nueva-feature
git merge main
```

This brings the latest `main` updates into your feature branch and helps detect conflicts early.

### 6. Merge the feature into `main`

```bash
git checkout main
git merge feature/nueva-feature
git push origin main
```

If there are no conflicts, Git integrates your feature commits into `main`. Then push `main` to publish the final merge.

### Workflow summary

1. Update project
2. Create working branch
3. Develop and commit
4. Push branch
5. Sync with `main`
6. Final merge into `main`
