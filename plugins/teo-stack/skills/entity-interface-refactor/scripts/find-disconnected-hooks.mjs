#!/usr/bin/env node
import fs from 'node:fs'
import { createRequire } from 'node:module'
import path from 'node:path'

const require = createRequire(import.meta.url)
const ts = await import(require.resolve('typescript', { paths: [process.cwd()] }))
  .then((module) => module.default ?? module)

const args = process.argv.slice(2)
const roots = args.filter((arg) => !arg.startsWith('--'))
const json = args.includes('--json')
const all = args.includes('--all')
const limitArg = args.find((arg) => arg.startsWith('--limit='))
const limit = limitArg ? Number(limitArg.split('=')[1]) : 80

const scanRoots = roots.length > 0 ? roots : ['apps/frontend/web-ui/src/ui']
const rootDir = process.cwd()

function collectFiles(target) {
  const absolute = path.resolve(rootDir, target)
  if (!fs.existsSync(absolute)) return []
  const stat = fs.statSync(absolute)
  if (stat.isFile()) return /\.(ts|tsx)$/.test(target) ? [absolute] : []
  const files = []
  for (const entry of fs.readdirSync(absolute, { withFileTypes: true })) {
    if (entry.name === 'node_modules' || entry.name === 'dist' || entry.name === '.next') continue
    const child = path.join(absolute, entry.name)
    if (entry.isDirectory()) files.push(...collectFiles(child))
    else if (/\.(ts|tsx)$/.test(entry.name)) files.push(child)
  }
  return files
}

function lineOf(sourceFile, node) {
  return sourceFile.getLineAndCharacterOfPosition(node.getStart(sourceFile)).line + 1
}

function collectBindingNames(name, names = []) {
  if (!name) return names
  if (ts.isIdentifier(name)) names.push(name.text)
  else if (ts.isObjectBindingPattern(name) || ts.isArrayBindingPattern(name)) {
    for (const element of name.elements) {
      if (ts.isBindingElement(element)) collectBindingNames(element.name, names)
    }
  }
  return names
}

function collectDeclaredNames(node, names = new Set()) {
  function visit(current) {
    if (ts.isVariableDeclaration(current)) {
      for (const name of collectBindingNames(current.name)) names.add(name)
      return
    }
    if (ts.isFunctionDeclaration(current)) {
      if (current.name) names.add(current.name.text)
      for (const param of current.parameters) {
        for (const name of collectBindingNames(param.name)) names.add(name)
      }
      return
    }
    if (ts.isParameter(current)) {
      for (const name of collectBindingNames(current.name)) names.add(name)
      return
    }
    ts.forEachChild(current, visit)
  }
  visit(node)
  return names
}

function isDeclarationIdentifier(node) {
  const parent = node.parent
  if (!parent) return false
  if ((ts.isVariableDeclaration(parent) || ts.isBindingElement(parent) || ts.isParameter(parent)) && parent.name === node) {
    return true
  }
  if ((ts.isFunctionDeclaration(parent) || ts.isFunctionExpression(parent) || ts.isClassDeclaration(parent) || ts.isTypeAliasDeclaration(parent) || ts.isInterfaceDeclaration(parent)) && parent.name === node) {
    return true
  }
  if (ts.isPropertyAccessExpression(parent) && parent.name === node) return true
  if (ts.isPropertyAssignment(parent) && parent.name === node) return true
  if (ts.isMethodDeclaration(parent) && parent.name === node) return true
  if (ts.isPropertySignature(parent) && parent.name === node) return true
  return false
}

function collectReads(node, sourceFile) {
  const reads = new Set()
  const boundStack = [new Set()]

  function isBound(name) {
    return boundStack.some((bound) => bound.has(name))
  }

  function withBound(names, visitBody) {
    boundStack.unshift(new Set(names))
    visitBody()
    boundStack.shift()
  }

  function visit(current) {
    if (ts.isTypeNode(current) || ts.isInterfaceDeclaration(current) || ts.isTypeAliasDeclaration(current)) {
      return
    }
    if (ts.isFunctionExpression(current) || ts.isArrowFunction(current) || ts.isFunctionDeclaration(current)) {
      const names = []
      if (ts.isFunctionDeclaration(current) && current.name) names.push(current.name.text)
      for (const param of current.parameters) names.push(...collectBindingNames(param.name))
      withBound(names, () => {
        if (current.body) visit(current.body)
      })
      return
    }
    if (ts.isVariableDeclaration(current)) {
      const names = collectBindingNames(current.name)
      if (current.initializer) visit(current.initializer)
      for (const name of names) boundStack[0].add(name)
      return
    }
    if (ts.isIdentifier(current)) {
      const name = current.text
      if (!isDeclarationIdentifier(current) && !isBound(name)) reads.add(name)
      return
    }
    ts.forEachChild(current, visit)
  }

  visit(node)
  reads.delete('undefined')
  return [...reads].sort()
}

function statementNodes(statement, index, sourceFile) {
  const line = lineOf(sourceFile, statement)
  if (ts.isVariableStatement(statement)) {
    return statement.declarationList.declarations.map((declaration, declarationIndex) => {
      const names = collectBindingNames(declaration.name)
      return {
        id: `var:${index}:${declarationIndex}`,
        kind: 'var',
        line,
        names,
        label: names.join(', ') || `var@${line}`,
        readNode: declaration.initializer ?? declaration,
        text: declaration.getText(sourceFile),
      }
    })
  }
  if (ts.isFunctionDeclaration(statement) && statement.name) {
    return [{
      id: `fn:${index}`,
      kind: 'function',
      line,
      names: [statement.name.text],
      label: statement.name.text,
      readNode: statement.body ?? statement,
      text: statement.getText(sourceFile).split('\n')[0],
    }]
  }
  if (ts.isExpressionStatement(statement)) {
    return [{
      id: `expr:${index}`,
      kind: 'effect',
      line,
      names: [],
      label: statement.expression.getText(sourceFile).slice(0, 100),
      readNode: statement.expression,
      text: statement.expression.getText(sourceFile),
    }]
  }
  if (ts.isReturnStatement(statement)) {
    return [{
      id: `return:${index}`,
      kind: 'return',
      line,
      names: [],
      label: 'return',
      readNode: statement.expression ?? statement,
      text: statement.getText(sourceFile),
    }]
  }
  return []
}

function hookNameFromNode(node) {
  if (ts.isFunctionDeclaration(node) && node.name) return node.name.text
  if (ts.isVariableStatement(node)) {
    const declaration = node.declarationList.declarations[0]
    if (declaration && ts.isIdentifier(declaration.name)) return declaration.name.text
  }
  return null
}

function hookBodyFromNode(node) {
  if (ts.isFunctionDeclaration(node)) return node.body ?? null
  if (ts.isVariableStatement(node)) {
    const declaration = node.declarationList.declarations[0]
    const initializer = declaration?.initializer
    if (initializer && (ts.isArrowFunction(initializer) || ts.isFunctionExpression(initializer))) {
      return ts.isBlock(initializer.body) ? initializer.body : null
    }
  }
  return null
}

function hookParameterNamesFromNode(node) {
  if (ts.isFunctionDeclaration(node)) {
    return new Set(node.parameters.flatMap((param) => collectBindingNames(param.name)))
  }
  if (ts.isVariableStatement(node)) {
    const declaration = node.declarationList.declarations[0]
    const initializer = declaration?.initializer
    if (initializer && (ts.isArrowFunction(initializer) || ts.isFunctionExpression(initializer))) {
      return new Set(initializer.parameters.flatMap((param) => collectBindingNames(param.name)))
    }
  }
  return new Set()
}

function isHookName(name) {
  return /^use[A-Z0-9]/.test(name)
}

function classifyComponent(component) {
  const text = component.nodes.map((node) => node.text).join('\n')
  const hasEffectCall = /\buse(Effect|LayoutEffect|InsertionEffect)\b/.test(text)
  const hasRegistration = /\b(register|Registration|CommandStore|CommandRegistration|use[A-Za-z0-9]*Actions|use[A-Za-z0-9]*Command)/.test(text)
  const hasToast = /\btoast\b|useToast/.test(text)
  if (component.reachesReturn) return 'return'
  if (hasEffectCall || hasRegistration || hasToast || component.nodes.some((node) => node.kind === 'effect')) return 'side-effect'
  return 'detached'
}

function analyzeHook(file, sourceFile, hookNode, name, body) {
  const nodes = []
  const hookParameterNames = hookParameterNamesFromNode(hookNode)
  body.statements.forEach((statement, index) => {
    nodes.push(...statementNodes(statement, index, sourceFile))
  })
  if (nodes.length < 2) return null

  const localNameToNode = new Map()
  for (const node of nodes) {
    for (const name of node.names) localNameToNode.set(name, node.id)
  }

  const byId = new Map(nodes.map((node) => [node.id, node]))
  const adjacency = new Map(nodes.map((node) => [node.id, new Set()]))
  const hookParameterReaders = new Map()

  for (const node of nodes) {
    const reads = collectReads(node.readNode, sourceFile)
    node.localDeps = reads.filter((read) => localNameToNode.has(read))
    node.inputDeps = reads.filter((read) => hookParameterNames.has(read))
    for (const dep of node.localDeps) {
      const depId = localNameToNode.get(dep)
      if (!depId || depId === node.id) continue
      adjacency.get(node.id).add(depId)
      adjacency.get(depId).add(node.id)
    }
    for (const dep of node.inputDeps) {
      const readers = hookParameterReaders.get(dep) ?? []
      readers.push(node.id)
      hookParameterReaders.set(dep, readers)
    }
  }

  for (const readers of hookParameterReaders.values()) {
    for (let index = 1; index < readers.length; index += 1) {
      const previous = readers[index - 1]
      const current = readers[index]
      adjacency.get(previous).add(current)
      adjacency.get(current).add(previous)
    }
  }

  const visited = new Set()
  const components = []
  for (const node of nodes) {
    if (visited.has(node.id)) continue
    const stack = [node.id]
    const ids = []
    visited.add(node.id)
    while (stack.length > 0) {
      const current = stack.pop()
      ids.push(current)
      for (const next of adjacency.get(current) ?? []) {
        if (visited.has(next)) continue
        visited.add(next)
        stack.push(next)
      }
    }
    const componentNodes = ids.map((id) => byId.get(id)).sort((a, b) => a.line - b.line)
    const component = {
      reachesReturn: componentNodes.some((item) => item.kind === 'return'),
      nodes: componentNodes,
    }
    component.kind = classifyComponent(component)
    components.push(component)
  }

  components.sort((a, b) => {
    if (a.reachesReturn !== b.reachesReturn) return a.reachesReturn ? -1 : 1
    return a.nodes[0].line - b.nodes[0].line
  })

  const meaningfulComponents = components.filter((component) => {
    if (component.reachesReturn) return true
    if (component.nodes.length > 1) return true
    const only = component.nodes[0]
    return only.kind === 'effect'
  })

  const hasReturn = components.some((component) => component.reachesReturn)
  const detachedCount = components.filter((component) => !component.reachesReturn).length
  const severity = hasReturn && detachedCount > 0
    ? components.some((component) => component.kind === 'side-effect') ? 'split' : 'review'
    : meaningfulComponents.length > 1 ? 'review' : 'ignore'

  return {
    file,
    hook: name,
    line: lineOf(sourceFile, hookNode),
    severity,
    componentCount: components.length,
    components: components.map((component) => ({
      kind: component.kind,
      reachesReturn: component.reachesReturn,
      nodes: component.nodes.map((node) => ({
        kind: node.kind,
        line: node.line,
        label: node.label,
        names: node.names,
        localDeps: node.localDeps,
        inputDeps: node.inputDeps,
      })),
    })),
  }
}

function analyzeFile(absoluteFile) {
  const text = fs.readFileSync(absoluteFile, 'utf8')
  const relativeFile = path.relative(rootDir, absoluteFile)
  const sourceFile = ts.createSourceFile(relativeFile, text, ts.ScriptTarget.Latest, true, absoluteFile.endsWith('.tsx') ? ts.ScriptKind.TSX : ts.ScriptKind.TS)
  const hooks = []

  for (const statement of sourceFile.statements) {
    const name = hookNameFromNode(statement)
    if (!name || !isHookName(name)) continue
    const body = hookBodyFromNode(statement)
    if (!body) continue
    const result = analyzeHook(relativeFile, sourceFile, statement, name, body)
    if (result) hooks.push(result)
  }

  return hooks
}

const files = [...new Set(scanRoots.flatMap(collectFiles))].sort()
const results = files.flatMap(analyzeFile)
const candidates = results
  .filter((result) => all || result.severity !== 'ignore')
  .sort((a, b) => {
    const severityOrder = { split: 0, review: 1, ignore: 2 }
    return severityOrder[a.severity] - severityOrder[b.severity]
      || b.componentCount - a.componentCount
      || a.file.localeCompare(b.file)
      || a.line - b.line
  })

if (json) {
  console.log(JSON.stringify(candidates.slice(0, limit), null, 2))
} else {
  for (const result of candidates.slice(0, limit)) {
    console.log(`${result.severity.toUpperCase()}\t${result.file}:${result.line}\t${result.hook}\tcomponents=${result.componentCount}`)
    for (const [index, component] of result.components.entries()) {
      const nodeLabels = component.nodes
        .map((node) => `${node.line}:${node.label}`)
        .join(' | ')
      console.log(`  C${index + 1} ${component.kind}${component.reachesReturn ? ' return' : ''}: ${nodeLabels}`)
    }
  }
  console.error(`hooks scanned: ${results.length}, candidates: ${candidates.length}`)
}
