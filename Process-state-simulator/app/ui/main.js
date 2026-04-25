import OSAdapter, { MODES } from './adapters/OSAdapter.js';
import HomeView from './views/HomeView.js';
import CPUSimView from './views/CPUSimView.js';
import MemorySimView from './views/MemorySimView.js';

const adapter = new OSAdapter();
const appRoot = document.getElementById('app');

if (!appRoot) {
  throw new Error('No se encontro el contenedor principal #app.');
}

function render(view) {
  appRoot.replaceChildren(view);
}

function navigate(mode) {
  if (mode === MODES.CPU || mode === MODES.MEMORY) {
    adapter.setMode(mode);
  }

  if (mode === MODES.CPU) {
    render(CPUSimView({ adapter, navigate }));
    return;
  }

  if (mode === MODES.MEMORY) {
    render(MemorySimView({ adapter, navigate }));
    return;
  }

  render(HomeView({ navigate }));
}

navigate(MODES.HOME);
