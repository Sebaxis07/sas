# Tarreo INACAP 2026: Sistema de Puntajes

Aplicación web minimalista en **React + Vite + TypeScript** para administrar, calcular y proyectar en vivo los puntajes del **Tarreo INACAP 2026** (Semana de la Carrera, Sede Antofagasta, 20 y 21 de noviembre).

## Características principales

### 1. Torneos de Tarreo (Puntos a Personas: Premio General)
Sistemas separados de la Copa de Alianzas (no suman puntos a Terror, Shooter ni Action):
- **Valorant**: equipos de 4 (máx. 4 equipos / 16 jugadores) o 5v5 (máx. 3 equipos / 15 jugadores), siempre con escala completa.
- **Rocket League**: duplas 2v2 (máx. 6 duplas / 12 jugadores).
- **Fortnite**: 1v1 Zero Build, isla `9672-8216-8367` (máx. 8 jugadores).
- **Super Smash Bros. Brawl**: 1v1 en Wii (máx. 8 jugadores), con reparto automático del 3.º y 4.º lugar compartido.
- **Reglas automáticas**: escala normal (`10 / 7 / 5 / 3`), escala reducida con 4 a 7 jugadores (`5 / 4 / 3 / 2`, excepto Valorant), bono `+1` por jugar, penalización `-1` por W.O., bloqueo de puestos duplicados, armado automático de grupos con cierre de cupo y registro de resolución del premio del campeón.
- **Actividades personalizadas**: creación libre por posiciones o puntaje directo.

### 2. Torneos de Alianza (Copa de Alianzas)
Puntaje acumulado para **Terror**, **Shooter** y **Action** hacia la **meta oficial de 32.000 puntos**:
- **Puntaje de partida del jueves 19 de noviembre**: precargado con el detalle oficial (Terror `15.331`, Action `13.931`, Shooter `5.100`) y protegido con contraseña para edición completa.
- **Actividades del Tarreo**:
  - **Cazatesoros** (`1.500 / 900 / 450`): calculadora de la Semana 3 con escala por rareza y victoria instantánea (Jackpot) para *Pirate Shop Access* y *Solid Gold Miku*, además de la regla de `950` puntos si nadie encuentra tesoros.
  - **Just Dance** (`1.500 / 900 / 450`): calculadora de 5 rondas (4 normales `3/2/1` y final doble `6/4/2`).
  - **Mímica gamer** (`1.000 / 600 / 300`): calculadora de 5 turnos con alerta de tarjeta extra en empate de 1.º lugar.
- **Empates y ajustes**: reparto automático en empates, soporte de descalificación (`0 pts`), ajustes manuales con motivo escrito y creación de actividades personalizadas de alianza.

### 3. Modo Proyección, Reglas y Respaldo
- **Modo Proyección**: pantalla limpia en vivo (16:9) con vista combinada, solo Torneos de Alianza o solo Torneos de Tarreo (salir con `Esc`).
- **Explicación de actividades**: ficha desplegable minimalista con las reglas oficiales de cada torneo.
- **Persistencia local**: guardado automático en `localStorage` junto a exportación e importación de respaldos **JSON** y tablas **CSV**.
- **Guía de estilo**: documentada en `STYLE_GUIDE.md`.

## Inicio rápido en Windows

Haz doble clic en `iniciar_tarreo.bat` para instalar dependencias e iniciar el servidor abriendo el navegador automáticamente.

O desde la terminal:

```powershell
npm.cmd install
npm.cmd run dev
```

La aplicación quedará disponible en `http://localhost:5173/`.

## Scripts disponibles

- `npm.cmd run dev`: inicia el servidor de desarrollo local.
- `npm.cmd run test`: ejecuta las pruebas unitarias del motor de puntajes (Vitest).
- `npm.cmd run build`: verifica tipos TypeScript y genera el build de producción en `dist/`.
