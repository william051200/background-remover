import { useCallback, useRef, useState } from 'react'

const ACCEPTED = ['image/png', 'image/jpeg', 'image/webp', 'image/bmp']
const MAX_BYTES = 25 * 1024 * 1024 // 25 MB

export default function Dropzone({ onSelect, disabled }) {
  const inputRef = useRef(null)
  const [dragOver, setDragOver] = useState(false)
  const [error, setError] = useState('')

  const validate = useCallback((file) => {
    if (!file) return false
    if (!ACCEPTED.includes(file.type)) {
      setError('Unsupported file type. Use PNG, JPEG, WebP or BMP.')
      return false
    }
    if (file.size > MAX_BYTES) {
      setError('File is too large (max 25 MB).')
      return false
    }
    setError('')
    return true
  }, [])

  const handleFiles = useCallback(
    (files) => {
      const file = files && files[0]
      if (validate(file)) onSelect(file)
    },
    [onSelect, validate],
  )

  const onDrop = useCallback(
    (e) => {
      e.preventDefault()
      setDragOver(false)
      if (disabled) return
      handleFiles(e.dataTransfer.files)
    },
    [disabled, handleFiles],
  )

  return (
    <div className="dropzone-wrap">
      <div
        className={`dropzone${dragOver ? ' dropzone--over' : ''}${disabled ? ' dropzone--disabled' : ''}`}
        onDragOver={(e) => {
          e.preventDefault()
          if (!disabled) setDragOver(true)
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={onDrop}
        onClick={() => !disabled && inputRef.current?.click()}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if ((e.key === 'Enter' || e.key === ' ') && !disabled) inputRef.current?.click()
        }}
      >
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPTED.join(',')}
          hidden
          onChange={(e) => handleFiles(e.target.files)}
        />
        <div className="dropzone-icon" aria-hidden>🖼️</div>
        <p className="dropzone-title">Drop an image here</p>
        <p className="dropzone-sub">or click to browse · PNG, JPEG, WebP, BMP · up to 25 MB</p>
      </div>
      {error && <p className="error-text" role="alert">{error}</p>}
    </div>
  )
}
