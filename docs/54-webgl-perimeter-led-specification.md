# WebGL Perimeter LED Specification

## 1. Status
Production.

## 2. Purpose
Provides a premium, physically grounded lighting presence around the authentication card that directly connects to the narrative metaphor of the hanging lamp ignition. When the lamp is pulled, continuous perimeter light ribbons illuminate and orbit the login card, reinforcing trustworthiness, clarity, and precision.

## 3. Production Renderer
`/login` defaults to the WebGL perimeter LED renderer with the `reference-v2-glm-no-outline-neon-tube-ultra` glow profile directly on page load without requiring URL query parameters. Runtime query parameters (`?perimeterLedRenderer=...` and `?perimeterLedGlow=...`) remain available as diagnostic overrides for debugging and regression testing.

## 4. Visual Contract
- **LED Count**: 4 continuous traveling light ribbons.
- **Color Temperature**: 2 Warm Amber (`vec3(1.0, 0.78, 0.25)`) and 2 Teal (`vec3(0.22, 0.92, 0.82)`) alternating in sequence.
- **Spacing**: 90° (25% perimeter offset between consecutive LED centers).
- **Perimeter Geometry**: Continuous rounded rectangle following the card contour.
- **Outline Handling**: Decorative static SVG outline is hidden in this mode (`visibility: hidden`), allowing the WebGL light tube to serve as the sole perimeter boundary.
- **Corner Radius**: 30px sweeping rounded corner radius (`cardSurface` concentric at 28px).
- **Glow Profile**: `reference-v2-glm-no-outline-neon-tube-ultra` — solid chunky neon tube (~5.0px core diameter, ~8.4px total footprint) with a 100% full-thickness solid blunt front head cap, gradual tapered fade tail, and an incandescent center core (`hotEdge0: 0.8`, `hotEdge: 2.0`, `hot: 0.85`).

## 5. Geometry & Math
- **Contour Definition**: The perimeter follows a rounded rectangle parameterized by width ($w$), height ($h$), and corner radius ($r = 30\text{px}$).
- **Arc-Length Parameterization**: Total perimeter length $L = 2(w - 2r) + 2(h - 2r) + 2\pi r$.
- **Distance Field (SDF)**: For each fragment, Euclidean distance to the nearest point on the continuous rounded-rectangle centerline is calculated in pixels (`borderDistance`).
- **Cyclic Distance**: Distance along the path ($s$) is evaluated relative to each LED ribbon's animated center position using cyclic modular arithmetic:
  $$\Delta s = \text{mod}(s - s_i + L/2, L) - L/2$$
- **Asymmetric Envelope**:
  - Leading Edge (Head): 100% full-thickness solid blunt cap right up to the front edge with 1.5px subpixel anti-aliasing (`bodyHeadSolid = 1.0 - smoothstep(headSpan - 1.5, headSpan + 0.5, delta)`).
  - Trailing Edge (Tail): Gradual tapered roll-off over the tail span (`bodyTailSolid = 1.0 - smoothstep(tailSpan * 0.30, tailSpan, max(0.0, -delta))`).

## 6. Motion
- **Orbit Duration**: Constant 8,000ms (`DURATION_MS = 8_000`) per complete 360° clockwise cycle.
- **Animation Loop**: Driven by `requestAnimationFrame`.
- **Elapsed Delta Clamping**: Frame delta is clamped to a maximum of 100ms per frame to prevent phase jumping when tabs are backgrounded or during main-thread hitches.
- **Device Pixel Ratio & Resizing**: Tracked via `ResizeObserver` and clamped to a maximum DPR of 2 (`MAX_DPR = 2`) for clean subpixel rendering on high-DPI displays without GPU memory waste.

## 7. Rendering Architecture
- **Single Canvas**: One dedicated `<canvas>` positioned beneath the interactive card surface (`z-index: 3`).
- **Single Draw Call**: One `gl.drawArrays(gl.TRIANGLES, 0, 6)` execution per animation frame rendering a full-screen quad.
- **Single Fragment Pass**: All 4 LED ribbons, core plateau, halo, and color blending are computed in a single fragment shader pass.
- **No Textures / Framebuffers**: Relies purely on procedural analytical SDF calculation in the fragment shader without texture sampling or intermediate framebuffers.

## 8. Browser & Mobile Acceptance
Manual acceptance testing conducted on target devices:
- **Chrome on Android**: PASS — Verified visual stability, precise corner tracking, and fluid animation during hands-on device testing.
- **Hola Browser**: PASS — Verified layer compositing and absence of edge clipping or artifacting.
*(Note: These results represent direct observations on the tested physical devices and browsers, not a universal guarantee across all possible hardware and browser combinations.)*

## 9. Fallback & Accessibility
- **Graceful Degradation (`StaticPerimeterFallback`)**: If WebGL context creation fails (`canvas.getContext("webgl") === null`), shader compilation fails, or `WebGLContextLost` occurs, the component automatically falls back to an accessible static 4-ribbon SVG layout.
- **Reduced Motion**: If the user has configured `prefers-reduced-motion: reduce` in their operating system or browser, WebGL animation is automatically bypassed in favor of the static fallback to respect accessibility preferences.

## 10. Design Constraints & Engineering Rationale
- **4 LEDs with 90° Spacing**: Avoids visually noisy segmented slices while providing continuous balanced visual rhythm across all four edges of the card.
- **No CSS Filter / Drop-Shadow on WebGL Layer**: Complex CSS filters on canvas elements can cause tile clipping or compositor dropouts on mobile GPU drivers; all glow and blur effects are calculated procedurally in the shader.
- **Separation of Geometry and Radiance**: Path distance geometry (SDF) remains constant while optical radiance parameters (`coreEdge0`, `bodyEdge0`, `haloEdge1`, `haloPeak`, `hotEdge`) are parameterized via uniforms.

## 11. Historical Experiments
A comprehensive series of isolated experiments was conducted during development prior to selecting the production baseline:
- `svg` / `svg-concrete` / `svg-simple-glow`: Initial SVG stroke-dash implementations.
- `soft` / `premium` / `neon` / `illuminated`: Early radial and halo variations on WebGL.
- `reference` / `reference-v2` / `reference-v2-thick`: Introduction of continuous longitudinal envelopes.
- `reference-v2-glm` / `reference-v2-glm-bold`: Volumetric radial profile redesign.
- `reference-v2-glm-no-outline`: Removal of decorative static SVG border outline.
- `reference-v2-glm-no-outline-refined` / `refined-v2`: Rounded leading head explorations.
- `reference-v2-glm-no-outline-neon-tube` / `perfect` / `neon-tube-solid`: Physical cylindrical neon tube profiles with solid blunt caps.
- `reference-v2-glm-no-outline-neon-tube-bold-curve`: Introduction of 30px corner radius with enhanced tube thickness.
- `reference-v2-glm-no-outline-neon-tube-ultra`: Final ~5.0px solid chunky neon tube with 30px radius selected as production default.
*(All non-default modes remain preserved as historical query-parameter experiments for regression verification and debugging.)*
