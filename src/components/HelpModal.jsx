import { useEffect } from 'react'

export default function HelpModal({ onClose }) {
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  return (
    <div className="modal-overlay" onClick={onClose} role="presentation">
      <div
        className="modal"
        role="dialog"
        aria-modal="true"
        aria-label="About Background Remover"
        onClick={(e) => e.stopPropagation()}
      >
        <button className="modal-close" onClick={onClose} aria-label="Close help">
          ✕
        </button>

        <h2>About</h2>
        <p>
          Remove image backgrounds right in your browser. Nothing is uploaded — all
          processing happens on your device.
        </p>

        <h3>Modes</h3>
        <ul>
          <li>
            <strong>📷 Photo (AI)</strong> — best for photos of people, products or
            objects. Downloads a one-time model (cached afterwards).
          </li>
          <li>
            <strong>🎨 Logo / solid color</strong> — best for logos, icons, text or
            screenshots on a uniform background. Instant, uses no model. Use the
            tolerance slider to fine-tune.
          </li>
        </ul>

        <h3>Credits</h3>
        <p className="modal-credits">
          AI mode powered by{' '}
          <a
            href="https://github.com/imgly/background-removal-js"
            target="_blank"
            rel="noreferrer"
          >
            @imgly/background-removal
          </a>{' '}
          (AGPL-3.0) · runs locally.
        </p>
      </div>
    </div>
  )
}
