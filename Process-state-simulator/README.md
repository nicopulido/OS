# Process State Simulator

## Table of Contents

- [About](#about)
- [Getting Started](#getting_started)
- [Deployment](#deployment)
- [Usage](#usage)
- [Contributing](#contributing)

## About <a name = "about"></a>

This project is a JavaScript-based Operating Systems simulator with a web UI focused on process lifecycle behavior. Its goal is to visualize key OS concepts in an interactive way, including process creation, state transitions (`new`, `ready`, `running`, `waiting`, `terminated`), context switching, and PCB (Process Control Block) management.

The simulator is designed as a learning tool for OS coursework. Instead of reading state diagrams statically, users can create processes, trigger scheduling decisions, simulate CPU/I/O events, and observe how process metadata changes over time through an on-screen PCB view and execution timeline.

The implementation is intentionally simple and uses only vanilla `HTML`, `CSS`, and `JavaScript` (no backend, no Node.js, and no frameworks).

## Getting Started <a name = "getting_started"></a>

These instructions help you run the simulator locally for development and testing.

### Prerequisites

There is no heavy setup required for a basic run.

- A modern browser (`Chrome`, `Firefox`, or `Edge`)
- `git` (to clone the repository)

Check installed versions:

```bash
git --version
```

### Installing

1. Clone the repository.

```bash
git clone https://github.com/<your-user>/OS.git
cd OS/Process-state-simulator
```

2. Open the simulator entry file in your browser.

```text
Open index.html
```

3. Start interacting with the UI to simulate process creation, transitions, and context switches.

## Deployment <a name = "deployment"></a>

This simulator can be deployed as a static web app.

Common options:

- GitHub Pages
- Netlify
- Vercel (static output)

Basic deployment flow:

1. Push code to your repository.
2. Connect the repo to your hosting platform.
3. Set the publish directory to the simulator root.
4. Deploy and verify that process-state transitions and UI events work correctly.

## Usage <a name = "usage"></a>

Typical simulation flow:

1. Create one or more processes from the UI.
2. Inspect each process PCB fields (for example: PID, state, program counter, registers snapshot, priority, burst time).
3. Move processes through scheduler actions (`admit`, `dispatch`, `preempt`, `block`, `unblock`, `terminate`).
4. Trigger context switches and observe how CPU ownership and PCB data change.
5. Review the event log/timeline to understand the execution order.

Recommended scenarios to test:

- Single-process lifecycle from `new` to `terminated`
- Multiple processes competing for CPU time
- I/O wait causing `running -> waiting -> ready` transitions
- Preemptive scheduling with repeated context switches

Learning outcomes:

- Understand why context switching has overhead
- See how schedulers affect fairness and responsiveness
- Practice reading and updating PCB information correctly
- Connect theory (state diagram) with practical behavior

