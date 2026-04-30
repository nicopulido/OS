# MemSim Ultra - Memory Manager Simulator

A visual memory management simulator demonstrating different memory allocation algorithms (First-Fit, Best-Fit, Worst-Fit) with real-time visualization and process lifecycle management.

## Características

- Memoria total de 16 MiB con direcciones de `0x000000` a `0xFFFFFF`.
- S.O. ubicado en la base de la memoria, configurable desde la interfaz.
- Particiones dinámicas con compactación manual y automática.
- Algoritmos de asignación: First-Fit, Best-Fit y Worst-Fit.
- Procesos con PID, nombre y segmentos: Text, Data, BSS, Heap y Stack.
- Precarga de 5 procesos técnicos para empezar la simulación.
- UI visual con mapa de memoria vertical, tabla de particiones y Gantt de ocupación.

## Requisitos

- Node.js 18 o superior

## Instalación

```bash
npm install
```

## Ejecución

```bash
## Features

- **Multiple Allocation Algorithms**: First-Fit, Best-Fit, Worst-Fit
- **Process Management**: Create, allocate, and release processes with configurable segments
- **Memory Visualization**: Real-time memory layout display with color-coded regions
- **Automatic Compaction**: Optional automatic memory compaction
- **Time Navigation**: View memory snapshots at different simulation timestamps
- **Gantt-style Timeline**: Track process events across simulation ticks
- **Memory Statistics**: Real-time display of memory usage, fragmentation, and available space

## Getting Started

### Prerequisites

- Python 3.x (for running the local HTTP server)
- A modern web browser (Chrome, Firefox, Safari, Edge)

### Installation & Running

1. Navigate to the project directory:
```bash
cd memory-manager-simulator
```

2. Start the Python HTTP server:
```bash
python3 -m http.server 8080
```

3. Open your browser and visit:
```
http://localhost:8080
```

4. Navigate to the `frontend/` directory in the browser URL:
```
http://localhost:8080/frontend/
```

## Usage

### Configuration Panel
- **Tamaño del S.O. (OS Size)**: Set operating system memory size (1-15 MiB)
- **Algoritmo (Algorithm)**: Select allocation strategy
- **Compactación automática (Auto Compaction)**: Enable/disable automatic memory compaction

### Process Management
Create new processes with:
- **Nombre (Name)**: Process name/identifier
- **PID**: Process ID (auto-assigned if not specified)
- **Arribo (Arrival Tick)**: When the process arrives in the system
- **Vida útil (Lifetime Ticks)**: How many ticks the process lives
- **Segmentos (Segments)**: Memory size for text, data, bss, heap, and stack

### Simulation Control
- **Cargar Iniciales**: Load 5 default processes
- **Paso**: Execute one simulation step
- **Compactar**: Manually trigger memory compaction
- **Reiniciar**: Reset the simulator

### Memory Timeline Navigation
- **← Anterior / Siguiente →**: Navigate through time snapshots
- **Selector de ticks**: Jump to specific timestamp
- **🔄**: Refresh memory snapshots

## Project Structure

```
frontend/
├── index.html                          # Main HTML interface
├── css/
│   └── styles.css                      # Styling
├── js/
│   ├── app.js                          # Main application logic
│   └── simulator/
│       ├── core/
│       │   ├── memoryUnits.js          # Constants and utilities
│       │   └── MemorySimulator.js      # Main simulator class
│       ├── models/
│       │   ├── MemoryPartition.js      # Memory partition model
│       │   └── MemoryProcess.js        # Process model
│       └── algorithms/
│           ├── firstFit.js             # First-fit strategy
│           ├── bestFit.js              # Best-fit strategy
│           └── worstFit.js             # Worst-fit strategy
```

## Architecture

The simulator runs entirely in the browser using vanilla JavaScript (ES6 modules). All memory management logic, process scheduling, and allocation algorithms are computed client-side, with no backend server required.

### Key Components

- **MemorySimulator**: Core simulation engine managing state and process lifecycle
- **MemoryPartition**: Represents a contiguous memory block
- **MemoryProcess**: Process model with segment information
- **Allocation Algorithms**: Independent strategy functions for hole selection

## Algorithms

### First-Fit
Allocates the process in the **first available hole** that fits the required size.

### Best-Fit
Allocates the process in the **smallest hole** that still fits the required size, minimizing fragmentation.

### Worst-Fit
Allocates the process in the **largest available hole**, potentially leaving larger fragments.

## Technical Details

- **Memory Units**: All sizes are in bytes internally; display in MiB/KiB
- **Segmentation**: Processes have 5 segments (text, data, bss, heap, stack)
- **Process States**: waiting → resident → finished
- **Auto-compaction**: Can be triggered manually or automatically after each step
- **Snapshots**: Memory state is captured at each simulation tick for timeline navigation

## License

Educational project for operating systems study.
