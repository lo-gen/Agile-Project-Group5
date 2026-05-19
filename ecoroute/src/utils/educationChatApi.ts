interface EducationChatResponse {
  response?: unknown
  error?: unknown
}

export async function askEducationChat(message: string): Promise<string> {
  const response = await fetch('/api/education-chat', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ message }),
  })

  const body = (await response.json()) as EducationChatResponse

  if (!response.ok) {
    const errorMessage =
      typeof body.error === 'string' && body.error.trim()
        ? body.error.trim()
        : 'Failed to get AI response.'
    throw new Error(errorMessage)
  }

  if (typeof body.response !== 'string' || body.response.trim().length === 0) {
    throw new Error('AI returned an empty response.')
  }

  return body.response.trim()
}
