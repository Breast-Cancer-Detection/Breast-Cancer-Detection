import type { ClassKey } from '../types'
import { DISPLAY_LABELS } from './constants'

export interface Scenario {
  id: string
  label: string
  rawClass: ClassKey
  confidence: number
  probs: Record<ClassKey, number>
  gradcamFailed?: boolean
}

export const SCENARIOS: Record<string, Scenario> = {
  benign: {
    id: 'benign',
    label: 'Benign — Low priority (91.2%)',
    rawClass: 'Benign',
    confidence: 0.912,
    probs: {
      Benign: 0.912,
      Carcinoma_InSitu: 0.031,
      Carcinoma_Invasive: 0.019,
      Normal: 0.038,
    },
  },
  cis: {
    id: 'cis',
    label: 'Carcinoma In Situ — Urgent review (82.4%)',
    rawClass: 'Carcinoma_InSitu',
    confidence: 0.824,
    probs: {
      Benign: 0.071,
      Carcinoma_InSitu: 0.824,
      Carcinoma_Invasive: 0.063,
      Normal: 0.042,
    },
  },
  invasive: {
    id: 'invasive',
    label: 'Invasive Carcinoma — Medium priority (68.1%)',
    rawClass: 'Carcinoma_Invasive',
    confidence: 0.681,
    probs: {
      Benign: 0.109,
      Carcinoma_InSitu: 0.132,
      Carcinoma_Invasive: 0.681,
      Normal: 0.078,
    },
  },
  normal: {
    id: 'normal',
    label: 'Normal — Low priority (91.7%)',
    rawClass: 'Normal',
    confidence: 0.917,
    probs: {
      Benign: 0.038,
      Carcinoma_InSitu: 0.028,
      Carcinoma_Invasive: 0.017,
      Normal: 0.917,
    },
  },
  lowconf: {
    id: 'lowconf',
    label: 'Low confidence — Uncertain (50.4%)',
    rawClass: 'Carcinoma_Invasive',
    confidence: 0.504,
    probs: {
      Benign: 0.188,
      Carcinoma_InSitu: 0.174,
      Carcinoma_Invasive: 0.504,
      Normal: 0.134,
    },
  },
  gradcamfail: {
    id: 'gradcamfail',
    label: 'Grad-CAM generation failed (demo)',
    rawClass: 'Benign',
    confidence: 0.887,
    probs: {
      Benign: 0.887,
      Carcinoma_InSitu: 0.041,
      Carcinoma_Invasive: 0.023,
      Normal: 0.049,
    },
    gradcamFailed: true,
  },
}

export const SCENARIO_OPTIONS = [
  SCENARIOS.cis,
  SCENARIOS.invasive,
  SCENARIOS.benign,
  SCENARIOS.normal,
  SCENARIOS.lowconf,
  SCENARIOS.gradcamfail,
]

export const PROCESSING_STAGES = [
  'Validating image',
  'Converting image to RGB',
  'Resizing image to 224 × 224',
  'Normalizing image',
  'Running four-model ensemble prediction',
  'Generating Grad-CAM explanation',
  'Preparing results',
]

export const DISPLAY_STAGE_LABELS = [
  'Validating image',
  'Preparing image',
  'Running AI analysis',
  'Generating explanation',
]

export function displayClass(raw: ClassKey) {
  return DISPLAY_LABELS[raw]
}

export function reviewPriority(rawClass: ClassKey, confidence: number) {
  if (confidence < 0.6) return 'Uncertain — expert review recommended'
  const carcinoma =
    rawClass === 'Carcinoma_InSitu' || rawClass === 'Carcinoma_Invasive'
  if (carcinoma && confidence >= 0.8) return 'Urgent review'
  if (carcinoma && confidence >= 0.6) return 'Medium priority review'
  return 'Low priority'
}

export function priorityTone(priority: string) {
  if (priority.startsWith('Uncertain')) return 'caution' as const
  if (priority === 'Urgent review') return 'error' as const
  if (priority === 'Medium priority review') return 'caution' as const
  return 'success' as const
}

export const PER_CLASS_METRICS = [
  { label: 'Benign', precision: '100.00%', recall: '100.00%', f1: '100.00%', support: 926 },
  {
    label: 'Carcinoma In Situ',
    precision: '100.00%',
    recall: '100.00%',
    f1: '100.00%',
    support: 41,
  },
  {
    label: 'Invasive Carcinoma',
    precision: '100.00%',
    recall: '100.00%',
    f1: '100.00%',
    support: 81,
  },
  { label: 'Normal', precision: '100.00%', recall: '100.00%', f1: '100.00%', support: 80 },
]

export const SOURCE_METRICS = [
  {
    label: 'Original Kaggle histology',
    accuracy: '100.00%',
    support: 202,
    note: 'InSitu 41, Invasive 81, Normal 80. No Benign images landed in this test split.',
  },
  {
    label: 'Added breast-benign set',
    accuracy: '100.00%',
    support: 926,
    note: 'All 926 test Benign images came from this source.',
  },
]

export const OVERALL_METRICS = [
  { value: '100.00%', label: 'Accuracy' },
  { value: '100.00%', label: 'Macro precision' },
  { value: '100.00%', label: 'Macro recall' },
  { value: '100.00%', label: 'Macro F1' },
  { value: '100.00%', label: 'Weighted precision' },
  { value: '100.00%', label: 'Weighted recall' },
  { value: '100.00%', label: 'Weighted F1' },
  { value: '1.000', label: 'Macro AUC' },
  { value: '1,128', label: 'Test samples' },
]
