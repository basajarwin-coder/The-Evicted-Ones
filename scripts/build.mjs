import { spawn } from 'node:child_process'
import path from 'node:path'

const inFigma = Boolean(process.env.FIGMA_EID || process.env.FIGMA)
const command = inFigma ? 'payload' : 'next'
const bin = path.join('node_modules', '.bin', process.platform === 'win32' ? `${command}.cmd` : command)
const child = spawn(bin, ['build'], {
  stdio: 'inherit',
  shell: process.platform === 'win32',
  env: { ...process.env, NODE_OPTIONS: '--no-deprecation' },
})

child.on('exit', (code) => process.exit(code ?? 1))
