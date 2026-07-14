type JsonRpcResponse<T = unknown> = {
  result?: T
  error?: { code: number; message: string }
}

type ToolResult = {
  content?: Array<{ type: string; text?: string }>
  isError?: boolean
}

const endpoint = 'https://api.twinkleai.tw/mcp/'

const parseResponse = <T>(body: string): JsonRpcResponse<T> => {
  const dataLines = body
    .split(/\r?\n/)
    .filter((line) => line.startsWith('data:'))
    .map((line) => line.slice(5).trim())

  return JSON.parse(dataLines.at(-1) || body) as JsonRpcResponse<T>
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

export const createTwinkleClient = async (apiKey: string) => {
  let requestId = 0

  const post = async <T>(method: string, params: Record<string, unknown>, sessionId?: string) => {
    let response!: Response
    let body = ''

    // Twinkle Hub 全域限流 90 次/分鐘；429 時依 retry_after_sec 等待後重試
    for (let attempt = 0; attempt < 5; attempt++) {
      response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          Accept: 'application/json, text/event-stream',
          'Content-Type': 'application/json',
          ...(sessionId ? { 'mcp-session-id': sessionId } : {})
        },
        body: JSON.stringify({ jsonrpc: '2.0', id: ++requestId, method, params })
      })

      body = await response.text()
      if (response.status !== 429) break

      let retryAfterSec = Number(response.headers.get('retry-after')) || 30
      try {
        retryAfterSec = Number(JSON.parse(body).retry_after_sec) || retryAfterSec
      } catch {}
      await sleep((retryAfterSec + 1) * 1000)
    }

    if (!response.ok) {
      throw new Error(`Twinkle Hub ${response.status}: ${body.slice(0, 240)}`)
    }

    const payload = parseResponse<T>(body)
    if (payload.error) throw new Error(payload.error.message)
    return { result: payload.result, sessionId: response.headers.get('mcp-session-id') || sessionId }
  }

  const initialized = await post('initialize', {
    protocolVersion: '2025-03-26',
    capabilities: {},
    clientInfo: { name: 'taiwan-park-finder', version: '0.1.0' }
  })
  const sessionId = initialized.sessionId
  if (!sessionId) throw new Error('Twinkle Hub did not return an MCP session id')

  return {
    async callTool<T>(name: string, args: Record<string, unknown>): Promise<T> {
      const response = await post<ToolResult>('tools/call', { name, arguments: args }, sessionId)
      const text = response.result?.content?.find((item) => item.type === 'text')?.text
      if (!text) throw new Error(`Twinkle Hub tool ${name} returned no text content`)
      if (response.result?.isError) throw new Error(text)
      try {
        return JSON.parse(text) as T
      } catch {
        throw new Error(`Twinkle Hub tool ${name} returned invalid JSON: ${text.slice(0, 160)}`)
      }
    }
  }
}
