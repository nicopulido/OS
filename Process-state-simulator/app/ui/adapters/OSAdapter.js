const MODES = {
  HOME: 'HOME',
  CPU: 'CPU',
  MEMORY: 'MEMORY',
};

class OSAdapter {
  constructor() {
    this.mode = MODES.HOME;
  }

  setMode(mode) {
    if (!Object.values(MODES).includes(mode)) {
      throw new Error(`Modo no soportado: ${mode}`);
    }

    this.mode = mode;
  }

  getMode() {
    return this.mode;
  }
}

export { MODES };
export default OSAdapter;
