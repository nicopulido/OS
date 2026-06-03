/**
 * index.js - Punto de entrada del proyecto
 * 
 * Ejecuta la demostración de la capa de Aplicación
 */

import { exampleAPIUsage } from './application/ExampleApplicationUsage.js';

(async () => {
  try {
    await exampleAPIUsage();
  } catch (error) {
    console.error('Error en ejecución:', error);
    process.exit(1);
  }
})();
