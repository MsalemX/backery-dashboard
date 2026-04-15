const API_BASE_URL = process.env.NEXT_PUBLIC_LARAVEL_API_URL || 'http://localhost:8000/api'

const parseResponse = async (response: Response) => {
  const payload = await response.text().then((text) => {
    try {
      return text ? JSON.parse(text) : null
    } catch {
      return null
    }
  })

  if (!response.ok) {
    const error = new Error(
      payload?.message || payload?.error || `${response.status} ${response.statusText}`
    ) as Error & { response?: any }
    error.response = {
      status: response.status,
      data: payload,
    }
    throw error
  }

  return payload
}

export const api = {
  async get(endpoint: string) {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    })

    return parseResponse(response)
  },

  async post(endpoint: string, data: any) {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(data),
    })

    return parseResponse(response)
  },

  async put(endpoint: string, data: any) {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(data),
    })

    return parseResponse(response)
  },

  async delete(endpoint: string) {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    })

    return parseResponse(response)
  },
}
