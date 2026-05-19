/// <reference types="vitest" />
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import { spawn } from 'node:child_process'
import path from 'node:path'
import type { IncomingMessage } from 'node:http'
import type { Plugin } from 'vite'

interface EducationChatBody {
  message?: unknown
}

interface EducationChatResult {
  response?: unknown
  error?: unknown
}

async function readJsonBody(req: IncomingMessage): Promise<EducationChatBody> {
  const chunks: Buffer[] = []

  for await (const chunk of req) {
    chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk)
  }

  const rawBody = Buffer.concat(chunks).toString('utf-8').trim()
  if (!rawBody) return {}

  return JSON.parse(rawBody) as EducationChatBody
}

function runEducationChat(prompt: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const timeoutMs = 45_000
    const scriptPath = path.resolve(process.cwd(), 'ai.py')
    const child = spawn('python', [scriptPath, prompt], {
      cwd: process.cwd(),
      stdio: ['ignore', 'pipe', 'pipe'],
    })
    const timeout = setTimeout(() => {
      child.kill()
      reject(new Error('AI request timed out.'))
    }, timeoutMs)

    let stdout = ''
    let stderr = ''

    child.stdout.on('data', (data: Buffer) => {
      stdout += data.toString()
    })

    child.stderr.on('data', (data: Buffer) => {
      stderr += data.toString()
    })

    child.on('error', (error) => {
      clearTimeout(timeout)
      reject(error)
    })

    child.on('close', (code) => {
      clearTimeout(timeout)
      const output = stdout.trim()
      const failMessage = stderr.trim() || output || 'Unknown AI process error.'

      if (code !== 0) {
        reject(new Error(failMessage))
        return
      }

      try {
        const parsed = JSON.parse(output) as EducationChatResult
        if (typeof parsed.error === 'string' && parsed.error.trim().length > 0) {
          reject(new Error(parsed.error))
          return
        }

        if (typeof parsed.response === 'string' && parsed.response.trim().length > 0) {
          resolve(parsed.response.trim())
          return
        }

        reject(new Error('AI response was empty.'))
      } catch {
        reject(new Error(`Invalid AI response: ${output || 'Empty output'}`))
      }
    })
  })
}

function educationChatPlugin(): Plugin {
  return {
    name: 'education-chat-plugin',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const reqUrl = req.url ?? '/'
        const url = new URL(reqUrl, 'http://localhost')

        if (url.pathname !== '/api/education-chat') {
          next()
          return
        }

        if (req.method !== 'POST') {
          res.statusCode = 405
          res.setHeader('Content-Type', 'application/json')
          res.end(JSON.stringify({ error: 'Method not allowed.' }))
          return
        }

        try {
          const body = await readJsonBody(req)
          const message = typeof body.message === 'string' ? body.message.trim() : ''

          if (!message) {
            res.statusCode = 400
            res.setHeader('Content-Type', 'application/json')
            res.end(JSON.stringify({ error: 'Message is required.' }))
            return
          }

          const response = await runEducationChat(message)
          res.statusCode = 200
          res.setHeader('Content-Type', 'application/json')
          res.end(JSON.stringify({ response }))
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Failed to process AI request.'
          res.statusCode = 500
          res.setHeader('Content-Type', 'application/json')
          res.end(JSON.stringify({ error: message }))
        }
      })
    },
  }
}

export default defineConfig({
  plugins: [react(), educationChatPlugin()],
  base: '/Agile-Project-Group5/',
  server: {
    hmr: true, // hot reload
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test-setup.ts'],
  },
})
