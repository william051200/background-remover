export default function ResultView({ originalUrl, resultUrl, onDownload, onReset }) {
  return (
    <div className="result">
      <div className="compare">
        <figure className="panel">
          <figcaption>Original</figcaption>
          <div className="img-frame">
            <img src={originalUrl} alt="Original" />
          </div>
        </figure>

        <figure className="panel">
          <figcaption>Background removed</figcaption>
          <div className="img-frame img-frame--checker">
            {resultUrl ? (
              <img src={resultUrl} alt="Background removed" />
            ) : (
              <div className="placeholder">Result will appear here</div>
            )}
          </div>
        </figure>
      </div>

      <div className="actions">
        {resultUrl && (
          <button className="btn btn--primary" onClick={onDownload}>
            ⬇ Download PNG
          </button>
        )}
        <button className="btn btn--ghost" onClick={onReset}>
          ↺ New image
        </button>
      </div>
    </div>
  )
}
