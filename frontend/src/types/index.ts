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
