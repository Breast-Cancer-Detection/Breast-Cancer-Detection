import { useRef, useState, type ChangeEvent, type DragEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import type { UploadFileMeta, UploadState } from '../../types'
import {
  IMAGE_MODALITY_LABEL,
  SHOW_DEMO_CONTROLS,
} from '../../data/constants'
import { SCENARIO_OPTIONS } from '../../data/scenarios'
import { writeAnalysisSession } from '../../data/analysisSession'
import { Button } from '../../components/ui/Button'
import styles from './WorkspacePage.module.css'

export function WorkspacePage() {
  const navigate = useNavigate()
  const inputRef = useRef<HTMLInputElement>(null)
  const [uploadState, setUploadState] = useState<UploadState>('empty')
  const [uploadFile, setUploadFile] = useState<UploadFileMeta | null>(null)
  const [uploadError, setUploadError] = useState('')
  const [scenario, setScenario] = useState('cis')

  const triggerDialog = () => inputRef.current?.click()

  const processFile = (file: File) => {
    setUploadState('validating')
    setUploadError('')
    const name = file.name || 'upload'
    const ext = (name.split('.').pop() || '').toLowerCase()
    const supported = ['jpg', 'jpeg', 'png', 'bmp']

    if (name.toLowerCase().includes('mask')) {
      setUploadState('invalid')
      setUploadError(
        'Segmentation-mask files are not supported as classification inputs. Select the original image instead.',
      )
      return
    }
    if (!supported.includes(ext)) {
      setUploadState('invalid')
      setUploadError('Unsupported file type. Please upload a JPG, JPEG, PNG, or BMP image.')
      return
    }

    const reader = new FileReader()
    reader.onload = (ev) => {
      const result = ev.target?.result
      if (typeof result !== 'string') {
        setUploadState('invalid')
        setUploadError('This file could not be read. It may be empty or corrupted.')
        return
      }
      const img = new Image()
      img.onload = () => {
        if (img.naturalWidth < 32 || img.naturalHeight < 32) {
          setUploadState('invalid')
          setUploadError('Image dimensions are below the 32 × 32 pixel minimum.')
          return
        }
        setUploadFile({
          name,
          ext,
          size: file.size,
          width: img.naturalWidth,
          height: img.naturalHeight,
          previewUrl: result,
        })
        setUploadState('ready')
        setUploadError('')
      }
      img.onerror = () => {
        setUploadState('invalid')
        setUploadError('Image preview unavailable. The file could not be read.')
      }
      img.src = result
    }
    reader.onerror = () => {
      setUploadState('invalid')
      setUploadError('This file could not be read. It may be empty or corrupted.')
    }
    reader.readAsDataURL(file)
  }

  const onDrop = (e: DragEvent) => {
    e.preventDefault()
    const file = e.dataTransfer.files?.[0]
    if (file) processFile(file)
  }

  const onDragOver = (e: DragEvent) => {
    e.preventDefault()
    if (uploadState === 'empty') setUploadState('dragover')
  }

  const onDragLeave = (e: DragEvent) => {
    e.preventDefault()
    if (uploadState === 'dragover') setUploadState('empty')
  }

  const onFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) processFile(file)
  }

  const removeFile = () => {
    setUploadState('empty')
    setUploadFile(null)
    setUploadError('')
    if (inputRef.current) inputRef.current.value = ''
  }

  const startAnalysis = () => {
    writeAnalysisSession({ scenario, uploadFile })
    navigate('/processing')
  }

  const fileSizeStr = uploadFile ? `${(uploadFile.size / 1024).toFixed(0)} KB` : ''

  return (
    <div className={styles.root}>
      <input
        ref={inputRef}
        type="file"
        accept=".jpg,.jpeg,.png,.bmp"
        className={styles.hiddenInput}
        onChange={onFileChange}
      />

      <h1>Analyze a {IMAGE_MODALITY_LABEL}</h1>
      <p className={styles.lede}>
        Upload an image to generate a four-class prediction and Grad-CAM explanation.
      </p>
      <div className={styles.privacy}>
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#765966" strokeWidth="2">
          <rect x="4" y="10" width="16" height="10" rx="2" />
          <path d="M8 10V7a4 4 0 0 1 8 0v3" />
        </svg>
        Use only de-identified research images.
      </div>

      {uploadState === 'empty' && (
        <div
          className={styles.dropzone}
          onClick={triggerDialog}
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          onDrop={onDrop}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') triggerDialog()
          }}
          aria-label="Drag and drop an image here, or activate to browse from your device"
        >
          <svg width="42" height="42" viewBox="0 0 24 24" fill="none" stroke="#8F174C" strokeWidth="1.5">
            <path d="M12 16V4M12 4l-4 4M12 4l4 4" />
            <path d="M4 16v3a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-3" />
          </svg>
          <div className={styles.dropTitle}>Drag and drop an image here</div>
          <div className={styles.dropHint}>or browse from your device</div>
          <div className={styles.dropMeta}>JPG, JPEG, PNG or BMP · Minimum 32 × 32 pixels</div>
        </div>
      )}

      {uploadState === 'dragover' && (
        <div
          className={styles.dropzoneActive}
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          onDrop={onDrop}
        >
          <div className={styles.dropTitleActive}>Release to upload the image</div>
        </div>
      )}

      {uploadState === 'validating' && (
        <div className={styles.validating}>
          <div className={styles.spinner} />
          <div className={styles.dropTitle}>Validating image…</div>
        </div>
      )}

      {uploadState === 'invalid' && (
        <div className={styles.invalid}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#B83A52" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <path d="M12 8v5M12 16h.01" />
          </svg>
          <div>
            <div className={styles.invalidTitle}>Upload could not be completed</div>
            <p>{uploadError}</p>
            <Button variant="danger" onClick={removeFile}>
              Try a different file
            </Button>
          </div>
        </div>
      )}

      {uploadState === 'ready' && uploadFile && (
        <>
          <div className={styles.ready}>
            <img src={uploadFile.previewUrl} alt="Selected image thumbnail" />
            <div className={styles.readyMeta}>
              <div className={styles.fileName}>{uploadFile.name}</div>
              <div>
                {uploadFile.ext.toUpperCase()} · {fileSizeStr} · {uploadFile.width} ×{' '}
                {uploadFile.height} px
              </div>
              <div className={styles.modelInput}>Model input: prepared at 224 × 224 px</div>
            </div>
            <div className={styles.readyActions}>
              <Button variant="outline" onClick={triggerDialog}>
                Replace
              </Button>
              <Button variant="outline" className={styles.removeBtn} onClick={removeFile}>
                Remove
              </Button>
            </div>
          </div>

          {SHOW_DEMO_CONTROLS && (
            <div className={styles.scenario}>
              <label htmlFor="scenario-pick">
                Demo prediction scenario (for testing all outcomes)
              </label>
              <select
                id="scenario-pick"
                value={scenario}
                onChange={(e) => setScenario(e.target.value)}
              >
                {SCENARIO_OPTIONS.map((opt) => (
                  <option key={opt.id} value={opt.id}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          )}

          <Button fullWidth className={styles.analyze} onClick={startAnalysis}>
            Analyze Image
          </Button>
        </>
      )}

      {SHOW_DEMO_CONTROLS && (
        <div className={styles.simulate}>
          <span>Simulate:</span>
          <button
            type="button"
            onClick={() => {
              setUploadState('invalid')
              setUploadFile(null)
              setUploadError('This file could not be read. It may be empty or corrupted.')
            }}
          >
            unreadable file
          </button>
          <button
            type="button"
            onClick={() => {
              setUploadState('invalid')
              setUploadFile(null)
              setUploadError(
                'The analysis service is temporarily unavailable. Please try again shortly.',
              )
            }}
          >
            service unavailable
          </button>
        </div>
      )}
    </div>
  )
}
