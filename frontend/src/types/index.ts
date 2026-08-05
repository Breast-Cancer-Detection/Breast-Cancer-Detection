export type Screen =
  | 'landing'
  | 'signin'
  | 'workspace'
  | 'processing'
  | 'results'
  | 'model'

export type UploadState =
  | 'empty'
  | 'dragover'
  | 'validating'
  | 'invalid'
  | 'ready'

export type ViewMode = 'original' | 'overlay' | 'side'

export type ClassKey =
  | 'Benign'
  | 'Carcinoma_InSitu'
  | 'Carcinoma_Invasive'
  | 'Normal'

export interface UploadFileMeta {
  name: string
  ext: string
  size: number
  width: number
  height: number
  previewUrl: string
}

export interface PredictionResponse {
  received: boolean
  model_loaded: boolean
  predicted_class: ClassKey
  confidence: number
  probabilities: Record<ClassKey, number>
  individual_predictions?: Record<
    string,
    {
      predicted_class: ClassKey
      confidence: number
      probabilities: Record<ClassKey, number>
    }
  >
  gradcams?: Record<
    string,
    {
      display_name: string
      predicted_class: ClassKey
      confidence: number
      explained_class: ClassKey
      overlay: string
    }
  >
  image: {
    filename: string
    content_type: string | null
    width: number
    height: number
    bytes: number
  }
  message: string
}
