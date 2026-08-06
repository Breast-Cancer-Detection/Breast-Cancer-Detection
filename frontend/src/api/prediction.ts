import type { PredictionResponse } from '../types'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000'

export async function requestPrediction(image: File): Promise<PredictionResponse> {
  const formData = new FormData()
  formData.append('image', image)

  const response = await fetch(`${API_BASE_URL}/api/predict`, {
    method: 'POST',
    body: formData,
  })

  if (!response.ok) {
    const errorBody = await response.json().catch(() => null)
    const detail = errorBody?.detail || 'The analysis service could not process this image.'
    throw new Error(detail)
  }

  return response.json()
}
