import { spawn } from 'node:child_process'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'

const cwd = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const children = []
const npmCmd = process.platform === 'win32' ? 'npm.cmd' : 'npm'

function run(command, args) {
  const child = spawn(command, args, { cwd, stdio: 'inherit', env: { ...process.env, API_PORT: process.env.API_PORT || '8787' } })
  children.push(child)
  child.on('exit', (code) => {
    if (code && !shuttingDown) process.exit(code)
  })
}

let shuttingDown = false
function shutdown() {
  shuttingDown = true
  children.forEach((child) => child.kill('SIGTERM'))
  setTimeout(() => process.exit(0), 250)
}

process.on('SIGINT', shutdown)
process.on('SIGTERM', shutdown)

run('node', ['server/index.mjs'])
run(npmCmd, ['exec', 'vite', '--', '--host', '127.0.0.1'])
