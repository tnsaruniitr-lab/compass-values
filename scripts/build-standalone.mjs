// Build a single self-contained HTML file (CSS + all ESM modules inlined) so the
// app can be opened directly from disk (file://) with no server and no build step.
// Browsers block cross-file ES-module imports over file://, hence the inline bundle.
//
// Each module is wrapped in its own IIFE scope and exposes a namespace object, so
// module-local identifiers (e.g. two different `clamp` helpers) never collide.
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const read = (p) => readFileSync(join(ROOT, p), 'utf8')

const IMPORT_RE = /import\s*\{([\s\S]*?)\}\s*from\s*['"]([^'"]+)['"];?/g
const EXPORT_NAME_RE = /^[ \t]*export\s+(?:const|let|var|function|class)\s+([A-Za-z0-9_$]+)/gm

/** Map an import specifier to the bundle namespace variable that provides it. */
function nsFor(spec) {
  if (spec.endsWith('/values.js')) return '__mod_values'
  if (spec.endsWith('/portraitItems.js')) return '__mod_portraitItems'
  if (spec.endsWith('/maxdiffBlocks.js')) return '__mod_maxdiffBlocks'
  if (spec.endsWith('/scoring.js')) return '__mod_scoring'
  if (spec.endsWith('/careerArchetypes.js')) return '__mod_careerArchetypes'
  if (spec.endsWith('/relationshipCompass.js')) return '__mod_relationshipCompass'
  if (spec.endsWith('/identity.js')) return '__mod_identity'
  if (spec.endsWith('/index.js')) return '__engine' // the engine aggregator
  if (spec.endsWith('/circumplex.js')) return '__mod_circumplex'
  if (spec.endsWith('/archetypeArt.js')) return '__mod_archetypeArt'
  throw new Error('unknown import specifier: ' + spec)
}

/** Turn `{ a, b as c }` binding text into `a, b: c` for a destructuring assignment. */
function bindings(text) {
  return text.split(',').map((s) => s.trim()).filter(Boolean)
    .map((b) => { const m = b.split(/\s+as\s+/); return m[1] ? `${m[1]}: ${m[0]}` : m[0] })
    .join(', ')
}

/** @param {string} path @param {string} ns wrapper var, or null for a side-effect IIFE. */
function wrap(path, ns) {
  let src = read(path)
  const exportNames = [...src.matchAll(EXPORT_NAME_RE)].map((m) => m[1])

  // Collect imports → destructuring lines, then remove the import statements.
  const destructures = []
  src = src.replace(IMPORT_RE, (_, names, spec) => {
    destructures.push(`const { ${bindings(names)} } = ${nsFor(spec)};`)
    return ''
  })
  // Drop the `export` keyword (declarations stay as plain const/function).
  src = src.replace(/^([ \t]*)export\s+(const|let|var|function|class)\b/gm, '$1$2')

  const head = destructures.length ? destructures.join('\n') + '\n' : ''
  const tail = ns ? `\nreturn { ${exportNames.join(', ')} };\n` : ''
  const body = `(() => {\n${head}${src}${tail}})()`
  return ns ? `const ${ns} = ${body};` : `${body};`
}

const bundle = [
  '/* engine */',
  wrap('engine/values.js', '__mod_values'),
  wrap('engine/portraitItems.js', '__mod_portraitItems'),
  wrap('engine/maxdiffBlocks.js', '__mod_maxdiffBlocks'),
  wrap('engine/scoring.js', '__mod_scoring'),
  wrap('engine/careerArchetypes.js', '__mod_careerArchetypes'),
  wrap('engine/relationshipCompass.js', '__mod_relationshipCompass'),
  wrap('engine/identity.js', '__mod_identity'),
  'const __engine = Object.assign({}, __mod_values, __mod_portraitItems, __mod_maxdiffBlocks, __mod_scoring, __mod_careerArchetypes, __mod_relationshipCompass, __mod_identity);',
  '/* view */',
  wrap('web/circumplex.js', '__mod_circumplex'),
  wrap('web/archetypeArt.js', '__mod_archetypeArt'),
  wrap('web/app.js', null),
].join('\n\n')

let html = read('web/index.html')

const css = read('web/styles.css')
html = html.replace(/<link rel="stylesheet" href="\.\/styles\.css" \/>/, `<style>\n${css}\n  </style>`)

// Drop external resource links that can't resolve from file:// (manifest/icons).
html = html.replace(/\s*<link rel="manifest"[^>]*>/, '')
html = html.replace(/\s*<link rel="icon"[^>]*>/, '')
html = html.replace(/\s*<link rel="apple-touch-icon"[^>]*>/, '')

// Load the intended display + body fonts (graceful system fallback when offline).
const fontLinks = `  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,400;0,9..144,500;0,9..144,600;1,9..144,400;1,9..144,500&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />`
html = html.replace(/<\/head>/, `${fontLinks}\n</head>`)

html = html.replace(/<script type="module" src="\.\/app\.js"><\/script>/, `<script type="module">\n${bundle}\n  </script>`)

mkdirSync(join(ROOT, 'dist'), { recursive: true })
writeFileSync(join(ROOT, 'dist', 'compass.html'), html)
console.log(`dist/compass.html written (${(html.length / 1024).toFixed(0)} KB)`)
