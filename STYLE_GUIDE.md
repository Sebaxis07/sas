# Guía de Estilo Minimalista — Tarreo INACAP 2026

Esta guía traduce la identidad visual del afiche oficial **Tarreo INACAP 2026 (Semana de la Carrera — Sede Antofagasta)** a un sistema de diseño **minimalista, sobrio y de alto contraste**, pensado para uso prolongado durante toda la noche (22:00 a 08:00) y proyección en pantalla grande.

---

## 1. Filosofía Visual

1. **Minimalismo funcional**: Superficies oscuras limpias, separadores de `1px`, sin sombras difusas exageradas ni brillos neón que saturen la vista.
2. **Color con propósito**: Los colores vibrantes del afiche (Carmesí, Cyan, Verde) se reservan exclusivamente para comunicar jerarquía, acciones primarias, estado activo y las tres alianzas.
3. **Números protagonistas**: Todo puntaje usa cifras tabulares (`tabular-nums`) para alineación perfecta en tablas y proyecciones.
4. **Espaciado respirable**: Ritmo espacial basado en múltiplos de `4px` (`8`, `12`, `16`, `20`, `24`, `32`).

---

## 2. Paleta de Colores

### Superficies y Neutros (derivados del fondo nocturno del afiche)
| Token CSS | Hex / Valor | Uso |
| :--- | :--- | :--- |
| `--bg-canvas` | `#080C18` | Fondo principal de la aplicación |
| `--bg-surface` | `#10172A` | Tarjetas, paneles y tablas |
| `--bg-elevated` | `#172038` | Inputs, filas en hover, cabeceras |
| `--bg-subtle` | `rgba(255, 255, 255, 0.04)` | Fondos suaves de badges y pills |
| `--border-subtle` | `rgba(255, 255, 255, 0.08)` | Bordes estructurales de 1px |
| `--border-strong` | `rgba(255, 255, 255, 0.16)` | Bordes en hover y controles activos |

### Texto
| Token CSS | Hex | Uso |
| :--- | :--- | :--- |
| `--text-primary` | `#F8FAFC` | Títulos, nombres, puntajes principales |
| `--text-secondary` | `#94A3B8` | Etiquetas, horarios, subtítulos |
| `--text-muted` | `#64748B` | Placeholders, metadatos secundarios |

### Acentos de Marca (extraídos del afiche)
| Token CSS | Hex | Uso |
| :--- | :--- | :--- |
| `--accent-crimson` | `#E61E4D` | Acción principal (CTA), pestaña activa, foco INACAP |
| `--accent-cyan` | `#00D4E8` | Acento secundario, estados activos, indicadores técnicos |
| `--accent-violet` | `#8B5CF6` | Etiquetas de actividades personalizadas |

### Colores de Alianzas (Copa de Alianzas)
| Alianza | Token CSS | Hex | Referencia en el Afiche |
| :--- | :--- | :--- | :--- |
| **Terror** | `--alliance-terror` | `#E61E4D` | Personaje central rojo (Scream) |
| **Shooter** | `--alliance-shooter` | `#00C2E0` | Personaje izquierdo azul/cyan |
| **Action** | `--alliance-action` | `#39D934` | Personaje derecho verde neón |

### Estados Semánticos
- **Podio 1.º**: `#F59E0B` (Dorado limpio)
- **Podio 2.º**: `#CBD5E1` (Plata)
- **Podio 3.º**: `#D97706` (Bronce)
- **Éxito / Positivo**: `#22C55E`
- **Advertencia / Empate**: `#F59E0B`
- **Peligro / W.O. / Descalificado**: `#EF4444`

---

## 3. Tipografía

- **Display / Encabezados**: `'Space Grotesk', system-ui, sans-serif` — geométrica, firme y moderna; evoca la identidad del afiche sin perder legibilidad.
- **Interfaz / Datos**: `'Inter', system-ui, sans-serif` — limpia y neutral para tablas, formularios y reglas.
- **Reglas**:
  - `H1`: `1.75rem` (28px), peso `700`, tracking `-0.02em`.
  - `H2`: `1.125rem` (18px), peso `600`, tracking `-0.01em`.
  - `Body`: `0.875rem` (14px), line-height `1.5`.
  - `Micro / Labels`: `0.75rem` (12px), uppercase opcional con tracking `0.06em`.
  - Todos los números de puntaje llevan `font-variant-numeric: tabular-nums`.

---

## 4. Componentes Base

- **Botones**:
  - *Primario*: Fondo `--accent-crimson`, texto blanco, sin bordes gruesos, radio `8px`.
  - *Secundario*: Fondo `--bg-elevated`, borde `--border-subtle`, texto `--text-primary`.
  - *Ghost*: Transparente con hover `--bg-subtle`.
- **Tarjetas**: Fondo `--bg-surface`, borde `1px solid var(--border-subtle)`, radio `12px`, padding `20px–24px`.
- **Tablas**: Encabezados discretos (`12px` uppercase `--text-secondary`), divisores `1px`, sin bordes verticales.
- **Modo Proyección (16:9)**:
  - Oculta controles administrativos.
  - Aumenta la escala tipográfica para lectura a distancia (`2rem–4.5rem` en puntajes).
  - Barras horizontales limpias con el color de cada alianza y contraste máximo.
