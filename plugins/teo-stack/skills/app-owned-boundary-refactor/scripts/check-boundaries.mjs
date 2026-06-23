#!/usr/bin/env node

import fs from 'node:fs'
import path from 'node:path'

const root = process.argv[2] ? path.resolve(process.argv[2]) : process.cwd()
const exts = new Set(['.ts', '.tsx', '.js', '.jsx'])
const layerRank = { shared: 0, entities: 1, features: 2, widgets: 3, app: 4 }

const walk = (dir, out = []) => {
  if (!fs.existsSync(dir)) return out
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    if (ent.name === 'node_modules' || ent.name === 'dist') continue
    const file = path.join(dir, ent.name)
    if (ent.isDirectory()) walk(file, out)
    else if (exts.has(path.extname(ent.name))) out.push(file)
  }
  return out
}

const rel = (file) => path.relative(root, file).split(path.sep).join('/')

const resolveRelative = (fromFile, spec) => {
  const base = path.resolve(path.dirname(fromFile), spec)
  const candidates = [
    base,
    ...[...exts].map((ext) => base + ext),
    ...['index.ts', 'index.tsx', 'index.js', 'index.jsx'].map((name) => path.join(base, name)),
  ]
  return candidates.find((candidate) => fs.existsSync(candidate)) ?? base
}

const srcLayer = (target) => {
  if (!target.startsWith('src/')) return null
  const layer = target.split('/')[1]
  return Object.hasOwn(layerRank, layer) ? layer : null
}

const staticImportRe = /(?:import|export)\s+(?:type\s+)?(?:[\s\S]*?\sfrom\s*)?['"]([^'"]+)['"]|import\s*\(\s*['"]([^'"]+)['"]\s*\)/g
const sourceLikeSpecRe = /^(@\/|src\/|\.\.\/.*src|.*\/src\/)/

const packageToSrc = []
for (const file of walk(path.join(root, 'packages'))) {
  const text = fs.readFileSync(file, 'utf8')
  let match
  while ((match = staticImportRe.exec(text))) {
    const spec = match[1] || match[2]
    if (sourceLikeSpecRe.test(spec)) packageToSrc.push(`${rel(file)} -> ${spec}`)
  }
}

const featureCross = []
const layerUpward = []
for (const file of walk(path.join(root, 'src'))) {
  const source = rel(file)
  const fromLayer = srcLayer(source)
  const fromFeature = source.startsWith('src/features/') ? source.split('/')[2] : null
  const text = fs.readFileSync(file, 'utf8')
  let match
  while ((match = staticImportRe.exec(text))) {
    const spec = match[1] || match[2]
    if (!spec.startsWith('.') && !spec.startsWith('@/') && !spec.startsWith('src/')) continue

    const target = spec.startsWith('.')
      ? rel(resolveRelative(file, spec))
      : spec.startsWith('@/')
        ? `src/${spec.slice(2)}`
        : spec
    const targetLayer = srcLayer(target)
    if (!targetLayer || !fromLayer) continue

    if (fromFeature && target.startsWith('src/features/')) {
      const targetFeature = target.split('/')[2]
      if (targetFeature !== fromFeature) featureCross.push(`${source} -> ${target}`)
    }

    if (layerRank[targetLayer] > layerRank[fromLayer]) {
      layerUpward.push(`${source} -> ${target}`)
    }
  }
}

const groups = [
  ['Package src imports', packageToSrc],
  ['Feature cross imports', featureCross],
  ['Layer upward imports', layerUpward],
]

for (const [label, rows] of groups) {
  console.log(`${label}: ${rows.length}`)
  for (const row of rows) console.log(`  ${row}`)
}

if (groups.some(([, rows]) => rows.length > 0)) process.exit(1)
