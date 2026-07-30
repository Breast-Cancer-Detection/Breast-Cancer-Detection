import type { UploadFileMeta } from '../types'

const STORAGE_KEY = 'analysis'

export type AnalysisSession = {
  scenario: string
  uploadFile: UploadFileMeta | null
}

export function readAnalysisSession(): AnalysisSession {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY)
    if (!raw) return { scenario: 'cis', uploadFile: null }
    const parsed = JSON.parse(raw) as Partial<AnalysisSession>
    return {
      scenario: parsed.scenario || 'cis',
      uploadFile: parsed.uploadFile ?? null,
    }
  } catch {
    return { scenario: 'cis', uploadFile: null }
  }
}

export function writeAnalysisSession(session: AnalysisSession) {
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(session))
}

export function updateAnalysisScenario(scenario: string) {
  const current = readAnalysisSession()
  writeAnalysisSession({ ...current, scenario })
}

export function clearAnalysisSession() {
  sessionStorage.removeItem(STORAGE_KEY)
}
