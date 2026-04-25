function MemorySimView({ navigate }) {
  const container = document.createElement('section');
  container.className = 'view';

  container.innerHTML = `
    <header class="hero">
      <h1>Simulacion de Memoria</h1>
    </header>
    <article class="panel">
      <p>Simulacion de memoria en construccion</p>
      <button type="button" class="back-button">Volver</button>
    </article>
  `;

  const backButton = container.querySelector('.back-button');
  backButton.addEventListener('click', () => navigate('HOME'));

  return container;
}

export default MemorySimView;
