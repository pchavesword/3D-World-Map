import { DEFAULT_VIEW, US_VIEW, type GlobeController } from './GlobeController'
import './globe.css'

export default function GlobeControls({ controller }: { controller: GlobeController }) {
  return (
    <div className="globe-controls" data-keep-card role="group" aria-label="Globe controls">
      <div className="globe-controls__zoom">
        <button type="button" aria-label="Zoom in" onClick={() => controller.zoomBy(1.35)}>
          <svg viewBox="0 0 12 12" aria-hidden="true">
            <path d="M6 1v10M1 6h10" />
          </svg>
        </button>
        <button type="button" aria-label="Zoom out" onClick={() => controller.zoomBy(1 / 1.35)}>
          <svg viewBox="0 0 12 12" aria-hidden="true">
            <path d="M1 6h10" />
          </svg>
        </button>
      </div>
      <button type="button" className="label globe-controls__text" onClick={() => controller.flyTo(US_VIEW)}>
        Focus on US
      </button>
      <button type="button" className="label globe-controls__text" onClick={() => controller.flyTo(DEFAULT_VIEW)}>
        Reset view
      </button>
    </div>
  )
}
