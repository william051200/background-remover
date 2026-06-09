import { useCallback, useEffect, useState } from 'react'
import { removeBackground } from '@imgly/background-removal'
import Dropzone from './components/Dropzone'
import ResultView from './components/ResultView'
import HelpModal from './components/HelpModal'
import { removeColorBackground } from './lib/colorKey'
import './App.css'

const MODES = {
  ai: {
    label: '📷 Photo (AI)',
    hint: 'Best for photos of people, products or objects.',
  },
  color: {
    label: '🎨 Logo / solid color',
    hint: 'Best for logos, icons, text or screenshots on a uniform background.',
  },
}

export default function App() {
  const [file, setFile] = useState(null)
  const [originalUrl, setOriginalUrl] = useState('')
  const [resultUrl, setResultUrl] = useState('')
  const [status, setStatus] = useState('idle') // idle | processing | done | error
  const [progress, setProgress] = useState(0)
  const [progressLabel, setProgressLabel] = useState('')
  const [error, setError] = useState('')
  const [mode, setMode] = useState('ai')
  const [tolerance, setTolerance] = useState(40)
  const [showHelp, setShowHelp] = useState(false)

  // Revoke object URLs when they change or on unmount to avoid memory leaks.
  useEffect(() => () => originalUrl && URL.revokeObjectURL(originalUrl), [originalUrl])
  useEffect(() => () => resultUrl && URL.revokeObjectURL(resultUrl), [resultUrl])

  const handleSelect = useCallback((selected) => {
    setFile(selected)
    setOriginalUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev)
      return URL.createObjectURL(selected)
    })
    setResultUrl('')
    setStatus('idle')
    setError('')
    setProgress(0)
  }, [])

  const setResult = useCallback((blob) => {
    const url = URL.createObjectURL(blob)
    setResultUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev)
      return url
    })
  }, [])

  const runAi = useCallback(async () => {
    setProgressLabel('Preparing…')
    const blob = await removeBackground(file, {
      progress: (key, current, total) => {
        const pct = total ? Math.round((current / total) * 100) : 0
        setProgress(pct)
        setProgressLabel(
          key.startsWith('fetch') ? `Downloading model… ${pct}%` : `Processing… ${pct}%`,
        )
      },
    })
    setResult(blob)
  }, [file, setResult])

  const runColor = useCallback(
    async (tol) => {
      setProgressLabel('Removing solid background…')
      setProgress(50)
      const blob = await removeColorBackground(file, { tolerance: tol })
      setProgress(100)
      setResult(blob)
    },
    [file, setResult],
  )

  const handleRemove = useCallback(async () => {
    if (!file) return
    setStatus('processing')
    setError('')
    setProgress(0)
    try {
      if (mode === 'ai') await runAi()
      else await runColor(tolerance)
      setStatus('done')
    } catch (err) {
      console.error(err)
      setError(err?.message || 'Something went wrong while removing the background.')
      setStatus('error')
    }
  }, [file, mode, tolerance, runAi, runColor])

  // Live re-process when the tolerance slider changes in color mode.
  const handleToleranceChange = useCallback(
    async (value) => {
      setTolerance(value)
      if (mode !== 'color' || !file || status !== 'done') return
      try {
        await runColor(value)
      } catch (err) {
        console.error(err)
      }
    },
    [mode, file, status, runColor],
  )

  const handleDownload = useCallback(() => {
    if (!resultUrl) return
    const a = document.createElement('a')
    a.href = resultUrl
    const base = (file?.name || 'image').replace(/\.[^.]+$/, '')
    a.download = `${base}-no-bg.png`
    document.body.appendChild(a)
    a.click()
    a.remove()
  }, [resultUrl, file])

  const handleReset = useCallback(() => {
    setFile(null)
    setOriginalUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev)
      return ''
    })
    setResultUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev)
      return ''
    })
    setStatus('idle')
    setError('')
    setProgress(0)
  }, [])

  const changeMode = useCallback((next) => {
    setMode(next)
    setResultUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev)
      return ''
    })
    setStatus('idle')
    setError('')
    setProgress(0)
  }, [])

  const processing = status === 'processing'

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-text">
          <h1>Background Remover</h1>
          <p className="tagline">Remove image backgrounds in your browser. Private &amp; free.</p>
        </div>
        <button
          className="help-btn"
          onClick={() => setShowHelp(true)}
          aria-label="Help and about"
          title="Help &amp; about"
        >
          ?
        </button>
      </header>

      <main className="app-main">
        <div className="mode-switch" role="tablist" aria-label="Removal mode">
          {Object.entries(MODES).map(([key, m]) => (
            <button
              key={key}
              role="tab"
              aria-selected={mode === key}
              className={`mode-btn${mode === key ? ' mode-btn--active' : ''}`}
              onClick={() => changeMode(key)}
              disabled={processing}
            >
              {m.label}
            </button>
          ))}
        </div>
        <p className="mode-hint">{MODES[mode].hint}</p>

        {!file ? (
          <Dropzone onSelect={handleSelect} disabled={processing} />
        ) : (
          <>
            <ResultView
              originalUrl={originalUrl}
              resultUrl={resultUrl}
              onDownload={handleDownload}
              onReset={handleReset}
            />

            {mode === 'color' && (
              <div className="tolerance">
                <label htmlFor="tol">
                  Tolerance <strong>{tolerance}</strong>
                </label>
                <input
                  id="tol"
                  type="range"
                  min="0"
                  max="150"
                  value={tolerance}
                  disabled={processing}
                  onChange={(e) => handleToleranceChange(Number(e.target.value))}
                />
                <span className="tolerance-help">Higher removes more of the background color.</span>
              </div>
            )}

            <div className="run-bar">
              <button
                className="btn btn--primary"
                onClick={handleRemove}
                disabled={processing}
              >
                {processing
                  ? 'Working…'
                  : status === 'done'
                    ? '↻ Run again'
                    : '✨ Remove background'}
              </button>
            </div>

            {processing && (
              <div className="progress" aria-live="polite">
                <div className="progress-track">
                  <div className="progress-fill" style={{ width: `${progress}%` }} />
                </div>
                <span className="progress-label">{progressLabel}</span>
              </div>
            )}

            {error && <p className="error-text" role="alert">{error}</p>}
          </>
        )}

        {!file && (
          <p className="hint">
            {mode === 'ai'
              ? 'First AI run downloads a one-time model (cached afterwards). '
              : 'Solid-color removal is instant and uses no model. '}
            Nothing is uploaded — all processing happens on your device.
          </p>
        )}
      </main>

      {showHelp && <HelpModal onClose={() => setShowHelp(false)} />}
    </div>
  )
}
