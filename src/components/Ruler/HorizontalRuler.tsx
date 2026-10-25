import React from 'react';
import type { MarginPreset } from '../../types/document';

interface HorizontalRulerProps {
  margin: MarginPreset;
  zoom: number;
}

export const HorizontalRuler: React.FC<HorizontalRulerProps> = ({ margin, zoom }) => {
  // Page width is 816px (8.5 inches at 96 DPI)
  // Let's determine margin pixel values at 100% zoom:
  // Normal (1.0 inch) = 96px
  // Narrow (0.5 inch) = 48px
  // Moderate (0.75 inch) = 72px
  // Wide (1.25 inch) = 120px
  let marginPx = 96;
  if (margin === 'narrow') marginPx = 48;
  if (margin === 'moderate') marginPx = 72;
  if (margin === 'wide') marginPx = 120;

  const totalWidth = 816;
  const printableWidth = totalWidth - marginPx * 2;

  // 8.5 inches: tick marks every 0.5 inch (48px)
  const ticks = [];
  for (let i = 0; i <= 8.5; i += 0.5) {
    const px = i * 96;
    const isMajor = i % 1 === 0;
    ticks.push({
      inch: i,
      px,
      isMajor,
    });
  }

  return (
    <div className="word-ruler-container" style={{ transform: `scale(${zoom / 100})`, transformOrigin: 'top center' }}>
      <div className="word-ruler" style={{ width: `${totalWidth}px` }}>
        {/* Left Margin Shading */}
        <div className="ruler-margin-zone left" style={{ width: `${marginPx}px` }} />

        {/* Printable Area with Tick Marks */}
        <div className="ruler-printable-zone" style={{ width: `${printableWidth}px` }}>
          {ticks.map((t) => (
            <div
              key={t.inch}
              className={`ruler-tick ${t.isMajor ? 'major' : 'minor'}`}
              style={{ left: `${t.px}px` }}
            >
              {t.isMajor && t.inch > 0 && t.inch < 8.5 && (
                <span className="ruler-number">{t.inch}</span>
              )}
            </div>
          ))}

          {/* Left Indent Marker */}
          <div className="ruler-marker left-marker" style={{ left: '0px' }} title="Left Margin Marker">
            <div className="marker-top" />
            <div className="marker-bottom" />
          </div>

          {/* Right Indent Marker */}
          <div className="ruler-marker right-marker" style={{ right: '0px' }} title="Right Margin Marker">
            <div className="marker-triangle" />
          </div>
        </div>

        {/* Right Margin Shading */}
        <div className="ruler-margin-zone right" style={{ width: `${marginPx}px` }} />
      </div>
    </div>
  );
};
