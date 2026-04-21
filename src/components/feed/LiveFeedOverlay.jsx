import React from 'react'
import { getActionColor, getActionLabel } from '../../services/MockRoboflowService'

const VIDEO_WIDTH = 1920
const VIDEO_HEIGHT = 1080

export function LiveFeedOverlay({ predictions = [] }) {
  return (
    <div className="relative w-full overflow-hidden rounded-3xl border border-slate-700 bg-slate-900 shadow-2xl" style={{ aspectRatio: '16/9' }}>
      {/* Fallback pattern/placeholder image if no actual video is provided */}
      <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:16px_16px] opacity-20"></div>
      
      {/* Central icon just for aesthetics */}
      <div className="absolute inset-0 flex items-center justify-center opacity-10">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-32 w-32 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
        </svg>
      </div>

      {/* Render Bounding Boxes */}
      {predictions.map((p) => {
        // Assuming coordinates are center-based (Common for Roboflow/YOLO)
        const leftPct = ((p.x - p.width / 2) / VIDEO_WIDTH) * 100
        const topPct = ((p.y - p.height / 2) / VIDEO_HEIGHT) * 100
        const widthPct = (p.width / VIDEO_WIDTH) * 100
        const heightPct = (p.height / VIDEO_HEIGHT) * 100

        const color = getActionColor(p.class)
        const label = getActionLabel(p.class)

        // Only show confidence if high, or you can format it
        const confStr = Math.round(p.confidence * 100) + '%'

        return (
          <div
            key={p.detection_id}
            className="bbox flex items-start justify-start"
            style={{
              left: `${leftPct}%`,
              top: `${topPct}%`,
              width: `${widthPct}%`,
              height: `${heightPct}%`,
              color: color,
            }}
          >
            <div className="bbox-label" style={{ backgroundColor: color }}>
              {label} {confStr}
            </div>
          </div>
        )
      })}

      {/* Mode Overlay Tag */}
      <div className="pointer-events-none absolute bottom-4 left-4 rounded-lg bg-black/60 px-3 py-1 font-mono text-xs text-white backdrop-blur-sm">
        FRAME | 1920x1080 • Model: Engagemnet-v1
      </div>
    </div>
  )
}
