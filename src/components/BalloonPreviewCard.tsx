"use client";

import React, { useMemo } from "react";

interface BalloonPreviewCardProps {
  style: 'circle' | 'square' | 'rounded';
  text: string;
  effects: { stroke: boolean; shadow: boolean; glow: boolean };
  isSelected: boolean;
  onSelect: () => void;
}

// --- LAYOUT LOGIC ---
let cachedCtx: CanvasRenderingContext2D | null = null;
const getMeasureContext = () => {
  if (!cachedCtx) {
    const canvas = document.createElement("canvas");
    cachedCtx = canvas.getContext("2d");
  }
  return cachedCtx;
};

const measureText = (text: string, font: string): number => {
  const context = getMeasureContext();
  if (context) {
    context.font = font;
    return context.measureText(text).width;
  }
  return text.length * 8;
};

function lineMaxWidthAtY(y: number, R: number, padX: number, padY: number): number {
  const ry = R - padY;
  const rx = R - padX;
  const t = 1 - (y * y) / (ry * ry);
  if (t <= 0) return 0;
  return 2 * rx * Math.sqrt(t);
}

function calculateManhwaLayout(text: string, style: string, fontSize: number, lineHeightPx: number) {
  const words = text.trim().split(/\s+/);
  if (!text.trim()) return { lines: [], radius: 100 };

  const font = `700 ${fontSize}px "Comic Sans MS"`;
  const charArea = (fontSize * 0.6) * (fontSize * lineHeightPx);
  const totalArea = text.length * charArea;
  const efficiency = style === 'circle' ? 0.55 : 0.85;
  const reqArea = totalArea / efficiency;
  
  let R = Math.max(100, Math.sqrt(reqArea));
  const isCircle = style === 'circle';
  let bestLayout: { lines: string[] } | null = null;
  let attempts = 0;

  while (attempts < 5) {
    const padX = isCircle ? R * 0.1 : 20; 
    const padY = isCircle ? R * 0.15 : 20; 
    let lines: string[] = [];
    let yStart = 0;
    
    for (let iter = 0; iter < 3; iter++) {
      lines = [];
      let wIndex = 0;
      let currentY = yStart;
      
      while (wIndex < words.length) {
        const lineCenterY = currentY + (lineHeightPx / 2);
        let availableWidth = isCircle ? lineMaxWidthAtY(lineCenterY, R, padX, padY) : (R * 2) - (padX * 2);
        if (isCircle && availableWidth <= fontSize) { lines = []; break; }

        let line = words[wIndex];
        let next = wIndex + 1;
        while (next < words.length) {
          const candidate = line + " " + words[next];
          if (measureText(candidate, font) <= availableWidth) { line = candidate; next++; } else break;
        }
        lines.push(line);
        wIndex = next;
        currentY += lineHeightPx;
      }
      const blockH = lines.length * lineHeightPx;
      if (lines.length === 0 || (blockH > (R * 2 - padY * 2))) { lines = []; break; }
      yStart = -blockH / 2;
    }

    if (lines.length > 0) { bestLayout = { lines }; break; }
    else { R *= 1.15; attempts++; }
  }

  return { lines: bestLayout?.lines || [text], radius: R };
}

const BalloonPreviewCard = ({ style, text, effects, isSelected, onSelect }: BalloonPreviewCardProps) => {
  const isCircle = style === 'circle';
  const borderRadius = isCircle ? '50%' : (style === 'rounded' ? '30px' : '4px');
  const FONT_SIZE = 15;
  const LINE_HEIGHT = FONT_SIZE * 1.25;

  const layout = useMemo(() => calculateManhwaLayout(text, style, FONT_SIZE, LINE_HEIGHT), [text, style]);
  const { lines, radius } = layout;
  const diameter = radius * 2;

  const textStroke = effects.stroke ? '1.5px black' : '0px transparent';
  let textShadows = [];
  if (effects.shadow) textShadows.push('3px 3px 0px rgba(0,0,0,0.3)'); 
  if (effects.glow) textShadows.push('0 0 8px #2680EB');
  const textShadowValue = textShadows.length > 0 ? textShadows.join(', ') : 'none';

  return (
    <div 
      onClick={onSelect}
      className={`mb-4 rounded-md overflow-hidden cursor-pointer transition-all ${isSelected ? 'border-2 border-[#2680EB] opacity-100' : 'border border-[#505050] opacity-70'} bg-[#303030]`}
    >
      <div className={`px-3 py-1.5 flex justify-between items-center text-[10px] font-bold uppercase ${isSelected ? 'bg-[#2680EB] text-white' : 'bg-[#252525] text-[#989898]'}`}>
        <span>{style === 'rounded' ? 'Arredondado' : (style === 'square' ? 'Quadrado' : 'Círculo')}</span>
        {isSelected && <span>● ATIVO</span>}
      </div>

      <div className="checkerboard p-8 flex justify-center items-center min-h-[260px]">
        <div style={{
          width: `${diameter}px`,
          height: `${diameter}px`,
          background: 'white',
          border: '3px solid black',
          borderRadius: borderRadius,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
        }}>
          <div className="flex flex-col items-center justify-center w-full h-full">
            {lines.map((line, idx) => (
              <div key={idx} style={{
                color: 'black',
                fontSize: `${FONT_SIZE}px`, 
                fontWeight: 700, 
                lineHeight: `${LINE_HEIGHT}px`,
                fontFamily: 'Comic Sans MS, "Chalkboard SE", sans-serif', 
                textAlign: 'center',
                whiteSpace: 'nowrap',
                WebkitTextStroke: textStroke,
                textShadow: textShadowValue,
              }}>
                {line}
              </div>
            ))}
            {lines.length === 0 && <span className="text-[#ccc] text-xs">TEXTO</span>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BalloonPreviewCard;