# Optimizaciones de Velocidad de Inicio - Pi Coding Agent

## Resultados

| Escenario | Antes | Después | Mejora |
|-----------|-------|---------|--------|
| Dev (tsx) `resourceLoader.reload` | 15,500ms | 3,200ms | **-79%** |
| Dev (tsx) total startup | 15,800ms | 3,500ms | **-78%** |
| Binario compilado (estimado) | ~2,600ms | ~2,100ms | **-19%** |

## Cambios

### 1. JITI moduleCache + filesystem cache (Alto Impacto)

**Archivo:** `packages/coding-agent/src/core/extensions/loader.ts`

Habilitar caché en memoria y persistente para el compilador JITI.
Reutilizar una única instancia JITI compartida entre todas las extensiones.

```typescript
// Antes: nueva instancia sin caché por cada extensión
async function loadExtensionModule(extensionPath: string) {
    const jiti = createJiti(import.meta.url, {
        moduleCache: false,
        ...
    });
    const module = await jiti.import(extensionPath, { default: true });
}

// Después: instancia compartida con caché de memoria + disco
let sharedJiti;
function getSharedJiti() {
    if (!sharedJiti) {
        sharedJiti = createJiti(import.meta.url, {
            moduleCache: true,
            cache: path.join(getAgentDir(), ".jiti-cache"),
            ...
        });
    }
    return sharedJiti;
}
async function loadExtensionModule(extensionPath: string) {
    const jiti = getSharedJiti();
    const module = await jiti.import(extensionPath, { default: true });
}
```

**Impacto:** ~12s de reducción en dev (tsx). El filesystem cache beneficia al binario compilado.

### 2. Lazy loading de cli-highlight (Alto Impacto)

**Archivos:**
- `packages/coding-agent/src/modes/interactive/theme/highlight.ts` (nuevo)
- `packages/coding-agent/src/modes/interactive/theme/theme.ts` (modificado)

cli-highlight + highlight.js cargan 380+ gramáticas de lenguaje al inicio (~400ms por copia).
Ahora se cargan on-demand la primera vez que se necesita syntax highlighting.

```typescript
// highlight.ts - lazy wrapper
let _highlight, _supportsLanguage;
let _loaded = false;

function ensureLoaded() {
    if (_loaded) return;
    _loaded = true;
    const mod = require("cli-highlight");
    _highlight = mod.highlight;
    _supportsLanguage = mod.supportsLanguage;
}

export function highlight(code, options) {
    ensureLoaded();
    return _highlight ? _highlight(code, options) : code;
}
```

**Impacto:** ~400ms de reducción por copia de cli-highlight evitada al startup.

### 3. Subpath export `./extensions` (Medio Impacto)

**Archivos:**
- `packages/coding-agent/src/extensions.ts` (nuevo)
- `packages/coding-agent/package.json` (modificado)

El barrel export de `@mariozechner/pi-coding-agent` arrastra todo el paquete,
incluyendo theme → cli-highlight → highlight.js (380 gramáticas).
Consumidores que solo necesitan tipos/utilidades de extensiones (ej. pi-safeguard)
pueden usar el subpath ligero:

```typescript
// Antes: arrastra cli-highlight, theme, jiti, etc.
import { isToolCallEventType } from "@mariozechner/pi-coding-agent";

// Después: solo tipos y funciones puras (~2 módulos CJS vs cientos)
import { isToolCallEventType } from "@mariozechner/pi-coding-agent/extensions";
```

**Impacto:** Elimina ~660ms de carga duplicada para consumidores como pi-safeguard.

### 4. Caché para Tool Paths (Bajo Impacto)

**Archivo:** `packages/coding-agent/src/utils/tools-manager.ts`

Caché en memoria para rutas de herramientas fd/rg. Evita llamadas repetidas
a `spawnSync` y `existsSync`.

**Impacto:** ~100ms de reducción en verificaciones de herramientas.

### 5. Carga en Background de fd/rg (Bajo Impacto)

**Archivo:** `packages/coding-agent/src/modes/interactive/interactive-mode.ts`

No bloquear la inicialización de la UI esperando que fd y rg se descarguen/detecten.

**Impacto:** ~100ms de reducción en `interactiveMode.init()`.

## Optimizaciones descartadas

| Optimización | Resultado | Razón |
|-------------|-----------|-------|
| Carga paralela de extensiones (Promise.all) | **Empeoró** a 13.3s | JITI tiene contención interna con compilación paralela |
| Async I/O para skills | Solo 39ms posible | skills ya cargan rápido (~39ms), no justifica la complejidad |

## Profiling

### CJS - Top paquetes por tiempo de carga

| Tiempo | Paquete | Notas |
|--------|---------|-------|
| 660ms | cli-highlight + highlight.js | 380 gramáticas, 2 copias (pi + pi-safeguard) |
| 93ms | jiti | Compilador TS para extensiones |
| 77ms | undici | HTTP client |
| 62ms | yaml | Parser YAML (2 copias) |
| 58ms | ajv | JSON Schema validator (2 copias) |
| 47ms | @sinclair/typebox | Type system |
| 41ms | diff | Text diffing |

### Duplicación por pi-safeguard

pi-safeguard importa `isToolCallEventType` desde el barrel export, lo que arrastra
toda la cadena de dependencias. Con el nuevo subpath `./extensions` se elimina esta
duplicación (~400ms de cli-highlight + dependencias compartidas).

## Archivos Modificados

1. `packages/coding-agent/src/core/extensions/loader.ts` - JITI compartido + cache
2. `packages/coding-agent/src/utils/tools-manager.ts` - tool path cache
3. `packages/coding-agent/src/modes/interactive/interactive-mode.ts` - background tool loading
4. `packages/coding-agent/src/modes/interactive/theme/highlight.ts` - lazy cli-highlight (nuevo)
5. `packages/coding-agent/src/modes/interactive/theme/theme.ts` - usa lazy highlight
6. `packages/coding-agent/src/extensions.ts` - subpath export ligero (nuevo)
7. `packages/coding-agent/package.json` - exports `./extensions`

## Trabajo Pendiente

- [ ] pi-safeguard: migrar a `@mariozechner/pi-coding-agent/extensions` (issue/PR en mgabor3141/yapp)
- [ ] Otros consumidores del barrel export: evaluar migración al subpath
