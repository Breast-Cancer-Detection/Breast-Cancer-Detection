export const IMAGE_MODALITY_LABEL = 'breast medical image'

export const SHOW_DEMO_CONTROLS = import.meta.env.VITE_SHOW_DEMO_CONTROLS === 'true'

export const HEATMAP_OPACITY_DEFAULT = 45

export const DISPLAY_LABELS = {
  Benign: 'Benign',
  Carcinoma_InSitu: 'Carcinoma In Situ',
  Carcinoma_Invasive: 'Invasive Carcinoma',
  Normal: 'Normal',
} as const

export const CLASS_ORDER = [
  'Benign',
  'Carcinoma_InSitu',
  'Carcinoma_Invasive',
  'Normal',
] as const
