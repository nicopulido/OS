# Simulador de Gestión de Memoria — OS Memory Sim

Simulador interactivo de gestión de memoria de sistema operativo, construido como Single Page Application en HTML/CSS/JavaScript puro (sin frameworks ni librerías externas).

---

## Instalación y ejecución

```bash
# Opción 1: con npx serve
npx -y serve .

# Opción 2: con Python
python3 -m http.server 8080

# Luego abre http://localhost:3000 (serve) o http://localhost:8080 (Python)
```

> **Nota:** Se requiere un servidor HTTP porque el proyecto usa ES Modules (`type="module"`).

---

## Estructura de archivos

| Archivo                    | Descripción                                                     |
| -------------------------- | --------------------------------------------------------------- |
| `index.html`               | Estructura HTML principal (5 secciones)                         |
| `style.css`                | Estética oscura tipo terminal/IDE                               |
| `main.js`                  | Renderizado DOM y manejo de eventos                             |
| `memoryManager.js`         | Motor de simulación (estado puro, sin DOM)                      |
| `allocationStrategies.js`  | Algoritmos First Fit, Best Fit, Worst Fit                       |
| `processes.js`             | Plantillas y fábrica de procesos                                |
| `README.md`                | Este archivo                                                    |

---

## Configuración de memoria

- **Total:** 16 MiB (2²⁴ bytes), direcciones `0x000000` a `0xFFFFFF`
- **SO:** 1 MiB por defecto, configurable entre 1–6 MiB

---

## Modos de partición

### 1. Fijas
Bloques uniformes de **1 MiB** cada uno. Con SO = 1 MiB, quedan 15 particiones de 1 MiB. Un proceso solo puede cargarse si su tamaño total ≤ 1 MiB — procesos más grandes como Browser (3 MiB) fallarán siempre.

### 2. Variables predefinidas
Secuencia fija de tamaños: **4, 4, 2, 2, 2, 2, 1, 1, 1, 1 MiB**. Se crean en orden saltando las que no caben en el espacio restante. Permite alojar procesos grandes en particiones de 4 MiB.

### 3. Dinámicas
El espacio libre es un solo bloque grande. Al cargar un proceso, se crea un bloque del **tamaño exacto** del proceso (sin fragmentación interna). Al liberar, el bloque vuelve a ser libre y se **fusiona con bloques libres adyacentes** (merge).

---

## Algoritmos de asignación

### First Fit
Recorre las particiones de menor a mayor dirección y elige la **primera** que sea suficientemente grande. Rápido pero concentra fragmentación al inicio.

### Best Fit
Busca la partición libre **más pequeña** que aún pueda contener al proceso. Minimiza el desperdicio pero puede generar muchos fragmentos pequeños.

### Worst Fit
Elige la partición libre **más grande** disponible. Deja el mayor bloque residual, esperando que siga siendo útil. Puede desperdiciar bloques grandes.

---

## Compactación (solo dinámicas)

Cuando está activada y un proceso no cabe:
1. Todos los procesos cargados se deslizan hacia el inicio de la memoria (justo después del SO).
2. Todo el espacio libre se consolida en **un bloque contiguo** al final.
3. Se reintenta la asignación.

---

## Ciclo de vida de procesos

Cada proceso tiene:
- **Segmentos:** `text`, `data`, `bss`, `heap`, `stack` → tamaño total = suma
- **Burst:** pasos que permanece en memoria
- **Interval:** pasos que espera antes de reintentar entrada

### Flujo:
1. Proceso inicia en estado **esperando** con intervalo = 0
2. Cuando el intervalo llega a 0 → intenta entrar a memoria
3. Si entra → permanece durante `burst` pasos → sale automáticamente
4. Al salir → reinicia su intervalo y vuelve a esperar
5. Si no cabe → incrementa contador de fallos y reinicia intervalo

### Procesos precargados

| Nombre       | Texto   | Total   | Burst | Intervalo |
| ------------ | ------- | ------- | ----- | --------- |
| Shell        | 128 KB  | 256 KB  | 3     | 1         |
| Browser      | 2 MB    | 3 MB    | 5     | 3         |
| TextEdit     | 256 KB  | 512 KB  | 2     | 2         |
| DB           | 512 KB  | 1 MB    | 4     | 2         |
| VideoPlayer  | 768 KB  | 2 MB    | 3     | 3         |

---

## Ejemplo de ejecución paso a paso

### Configuración: Fijas · First Fit · SO = 1 MiB

```
Paso 1:
  ✅ Shell (256 KB) → Partición 1 (1 MiB) — cargado
  ✅ TextEdit (512 KB) → Partición 2 (1 MiB) — cargado
  ✅ DB (1 MB) → Partición 3 (1 MiB) — cargado
  ❌ Browser (3 MB) — no cabe en 1 MiB → fallo
  ❌ VideoPlayer (2 MB) — no cabe en 1 MiB → fallo

Paso 2:
  Shell burst 2/3, TextEdit burst 2/2, DB burst 2/4
  Browser y VideoPlayer decrementan intervalo

Paso 3:
  TextEdit completa burst → sale
  Shell burst 3/3 → sale
  DB burst 3/4

Paso 4:
  Shell (intervalo=1) intenta entrar → ✅ cargado
  TextEdit (intervalo=2) decrementa
  DB burst 4/4 → sale
  Browser intenta → ❌ fallo (no cabe)
  VideoPlayer intenta → ❌ fallo (no cabe)

...la simulación continúa cíclicamente.
```

### Configuración: Dinámicas · Best Fit · SO = 1 MiB · Compactación ON

```
Paso 1:
  ✅ Shell (256 KB) → bloque exacto
  ✅ Browser (3 MB) → bloque exacto
  ✅ TextEdit (512 KB) → bloque exacto
  ✅ DB (1 MB) → bloque exacto
  ✅ VideoPlayer (2 MB) → bloque exacto
  Memoria usada: 1 + 0.25 + 3 + 0.5 + 1 + 2 = 7.75 MiB
  Libre: 8.25 MiB en un bloque contiguo

Paso 3:
  Shell y VideoPlayer salen → bloques libres no contiguos
  Fragmentación externa detectada

Paso 4:
  Shell reingresa → Best Fit elige el bloque de 256 KB exacto
  Si VideoPlayer no cabe → compactación fusiona bloques → reingresa
```

---

## Interfaz

1. **Panel de control** (izquierda): configuración, botones paso/auto/reset, log con colores
2. **Mapa de memoria**: barra vertical proporcional, tooltips con hex+decimal
3. **Tarjetas de procesos**: estado, progreso, fallos
4. **Timeline**: grid últimos 20 pasos × procesos
5. **Tabla de particiones**: direcciones, tamaños, estados

---

## Tecnologías

- HTML5, CSS3, JavaScript ES Modules
- Sin frameworks ni librerías externas
- Diseño responsive
- Estética oscura tipo IDE con fuente monoespaciada
