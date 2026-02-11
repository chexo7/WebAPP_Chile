# Ideas artísticas para renovar la interfaz (sin cambiar funcionalidad ni ubicación de paneles)

Este documento propone mejoras visuales que mantienen intacta la lógica de la app, los flujos y la posición de cada panel.

## 1) Dirección visual general

- **Tema: “Finanzas con calma”**: estética editorial + dashboard moderno.
- **Objetivo**: transmitir orden, confianza y claridad, evitando “ruido visual”.
- **Regla de oro**: nada de mover paneles, solo elevar color, tipografía, textura, iconografía y microinteracciones.

## 2) Paletas propuestas

### Paleta A — Andes Minimal
- Fondo base: `#F6F7F9`
- Superficies: `#FFFFFF`
- Primario: `#2D5B8A`
- Secundario: `#5AA1A8`
- Éxito: `#2E9E6F`
- Advertencia: `#D89A3C`
- Error: `#C54A4A`
- Texto principal: `#1F2937`
- Texto secundario: `#6B7280`

### Paleta B — Noche Productiva
- Fondo base: `#0F172A`
- Superficies: `#111827`
- Primario: `#60A5FA`
- Secundario: `#22D3EE`
- Éxito: `#34D399`
- Advertencia: `#FBBF24`
- Error: `#F87171`
- Texto principal: `#E5E7EB`
- Texto secundario: `#94A3B8`

## 3) Tipografía y jerarquía

- **Títulos**: una sans geométrica (p.ej. *Poppins* o *Sora*).
- **Cuerpo y tablas**: *Inter* o *Roboto* para máxima legibilidad.
- **Escala recomendada**:
  - H1: 30px / 700
  - H2: 24px / 600
  - H3: 20px / 600
  - Body: 15–16px / 400
  - Labels: 13px / 500
- **Números financieros**: activar tabular figures para alinear montos visualmente.

## 4) Capas visuales (sin alterar layout)

- Dar a cada panel una **superficie tipo tarjeta** con:
  - borde suave (`1px` translúcido),
  - radio medio (`12-16px`),
  - sombra baja (blur amplio, opacidad leve).
- Aplicar una **grilla de espaciado de 8px** para un ritmo consistente.
- Introducir **separadores sutiles** entre bloques densos de información.

## 5) Microinteracciones elegantes

- Hover en botones: elevar 1–2px y aumentar contraste.
- Inputs enfocados: anillo de color primario + transición corta (`150–200ms`).
- Tabs activas: subrayado animado o fondo pill.
- Feedback de guardado: pulso breve + texto “Guardado” en verde suave.

## 6) Sistema de color por intención financiera

- **Ingresos**: verde controlado.
- **Gastos fijos**: ámbar/ocre.
- **Gastos variables**: coral suave.
- **Flujo neto negativo**: rojo sobrio, nunca agresivo.
- **Flujo neto positivo**: verde con alto contraste.

Esto mejora lectura semántica sin mover ni esconder elementos.

## 7) Gráficos con estilo editorial

- Mantener Chart.js, pero con:
  - líneas más limpias,
  - rellenos con gradientes muy sutiles,
  - tipografía consistente con el resto de la app,
  - cuadrícula tenue,
  - leyendas compactas y ordenadas.
- Usar un **solo color dominante por gráfico** + acentos puntuales.

## 8) “Mood” por pestaña (misma estructura)

- **Gastos/Ingresos**: sensación de control operativo.
- **Presupuestos**: look comparativo, con barras de progreso premium.
- **Flujo de Caja**: tono analítico con más respiración visual.
- **Ajustes/Backups**: estética técnica, limpia y confiable.

Todo esto se logra con estilos contextuales por sección, sin tocar su ubicación.

## 9) Estilo de botones e inputs

- Botón primario sólido, secundario “ghost”, y terciario tipo texto.
- Altura uniforme para controles (40–44px).
- Iconos lineales consistentes (1.5px–2px stroke).
- Placeholder más tenue, labels siempre visibles.

## 10) Toques artísticos diferenciales

- **Degradado atmosférico muy suave** en encabezado o fondo principal.
- **Textura ligera** (grain casi imperceptible) para evitar planitud.
- **Acento local**: guiños cromáticos inspirados en paisaje chileno (andino/costero), en baja saturación.

## 11) Accesibilidad (clave para que lo artístico funcione)

- Contraste mínimo WCAG AA en textos.
- Estados `hover/focus/disabled` claramente distinguibles.
- Tamaño de fuente mínimo recomendado: 14px.
- No depender solo del color para comunicar estado.

## 12) Plan de implementación visual sugerido

1. Definir tokens (`--color-*`, `--space-*`, `--radius-*`, `--shadow-*`).
2. Aplicar tipografía + escala.
3. Reestilizar tarjetas/paneles existentes.
4. Reestilizar botones, inputs y tabs.
5. Ajustar gráficos y estados de feedback.
6. Refinar contraste y accesibilidad.

---

Si quieres, en un siguiente paso puedo convertir una de estas direcciones (Andes Minimal o Noche Productiva) en un **mini “style guide” CSS** listo para pegar sobre tu `style.css`, manteniendo exactamente la funcionalidad y el layout actual.
