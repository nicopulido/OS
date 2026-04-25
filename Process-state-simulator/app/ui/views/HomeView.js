function HomeView({ navigate }) {
  const container = document.createElement('section');
  container.className = 'view view-home';

  container.innerHTML = `
    <header class="hero">
      <h1>Simulador de Sistema Operativo</h1>
      <p>Selecciona el modo de simulacion que quieres explorar.</p>
    </header>
    <div class="mode-grid">
      <button type="button" data-mode="CPU" class="mode-button">Simulacion CPU</button>
      <button type="button" data-mode="MEMORY" class="mode-button">Simulacion Memoria</button>
    </div>
  `;

  const cpuButton = container.querySelector('[data-mode="CPU"]');
  const memoryButton = container.querySelector('[data-mode="MEMORY"]');

  cpuButton.addEventListener('click', () => navigate('CPU'));
  memoryButton.addEventListener('click', () => navigate('MEMORY'));

  return container;
}

export default HomeView;
