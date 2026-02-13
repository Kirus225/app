"use client";

import React, { useMemo } from "react";

interface BalloonPreviewCardProps {
  style: 'circle' | 'square' | 'rounded';
  text: string;
  fontSize: number;
  fontFamily: string;
  alignment: 'left' | 'center' | 'right';
  uppercase: boolean;
  verticalScale: number;
  lineHeight: number;
  effects: { stroke: boolean; shadow: boolean; glow: boolean };
  isSelected: boolean;
  onSelect: () => void;
}

// --- GEOMETRY HELPERS ---
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
  return text.length * (parseInt(font) * 0.5);
};

function getWidthAtY(y: number, R_eff: number): number {
  const absY = Math.abs(y);
  if (absY >= R_eff) return 0;
  return Math.sqrt(R_eff * R_eff - absY * absY) * 2;
}

function calculateManhwaLayout(text: string, style: string, fontSize: number, fontFamily: string, lineHeight: number, R: number) {
  if (!text.trim()) return { lines: [] };

  const words = text.trim().split(/\s+/);
  const effectiveLineHeight = fontSize * lineHeight; 
  const font = `900 ${fontSize}px ${fontFamily}`;
  
  const padding = style === 'square' ? 15 : R * 0.15;
  const R_eff = R - padding;
  const isCurved = style === 'circle' || style === 'rounded';

  const performWrap = (startY: number) => {
    let lines: string[] = [];
    let currentWordIdx = 0;
    
    for (let i = 0; i < 20; i++) {
      if (currentWordIdx >= words.length) break;

      const yLineCenter = startY + (i + 0.5) * effectiveLineHeight;
      
      if (isCurved && Math.abs(yLineCenter) >= R_eff) {
        if (yLineCenter < 0) continue; 
        else break;
      }

      const maxWidth = isCurved ? getWidthAtY(yLineCenter, R_eff) : (R * 2) - (padding * 2);
      
      if (isCurved && maxWidth < fontSize * 0.8) {
        if (yLineCenter < 0) continue;
        else break;
      }

      let line = "";
      while (currentWordIdx < words.length) {
        const word = words[currentWordIdx];
        const testLine = line ? line + " " + word : word;
        if (measureText(testLine, font) <= maxWidth) {
          line = testLine;
          currentWordIdx++;
        } else break;
      }
      
      if (line) lines.push(line);
      else if (isCurved && lines.length > 0) break; 
    }
    return { lines, wordCount: currentWordIdx };
  };

  let bestResult = { lines: [] as string[], wordCount: 0 };
  
  for (let offset = -R_eff; offset < 0; offset += 5) {
    const result = performWrap(offset);
    if (result.wordCount > bestResult.wordCount) {
      bestResult = result;
    }
    if (result.wordCount === words.length) {
      const blockHeight = result.lines.length * effectiveLineHeight;
      return performWrap(-blockHeight / 2);
    }
  }

  return { lines: bestResult.lines };
}

const BalloonPreviewCard = ({ 
  style, text, fontSize, fontFamily, alignment, uppercase, verticalScale, lineHeight, effects, isSelected, onSelect 
}: BalloonPreviewCardProps) => {
  const FIXED_RADIUS = 115; 
  const processedText = uppercase ? text.toUpperCase() : text;
  
  const layout = useMemo(() => 
    calculateManhwaLayout(processedText, style, fontSize, fontFamily, lineHeight, FIXED_RADIUS), 
    [processedText, style, fontSize, fontFamily, lineHeight]
  );
  
  const { lines } = layout;
  const diameter = FIXED_RADIUS * 2;
  const borderRadius = style === 'circle' ? '50%' : (style === 'rounded' ? '35%' : '4px');
  
  const textStroke = effects.stroke ? `${fontSize * 0.1}px black` : '0px transparent';
  let textShadows = [];
  if (effects.shadow) textShadows.push('3px 3px 0px rgba(0,0,0,0.2)'); 
  if (effects.glow) textShadows.push(`0 0 ${fontSize * 0.5}px rgba(38, 128, 235, 0.8)`);
  const textShadowValue = textShadows.length > 0 ? textShadows.join(', ') : 'none';

  return (
    <div 
      onClick={onSelect}
      className={`mb-6 rounded-lg overflow-hidden cursor-pointer transition-all duration-300 ${isSelected ? 'ring-2 ring-[#2680EB] scale-[1.02] shadow-2xl' : 'opacity-50 hover:opacity-100 border border-[#444]'} bg-[#2a2a2a]`}
    >
      <div className={`px-3 py-2 flex justify-between items-center text-[10px] font-black uppercase ${isSelected ? 'bg-[#2680EB] text-white' : 'bg-[#1a1a1a] text-[#666]'}`}>
        <span>{style === 'rounded' ? 'Arredondado' : (style === 'square' ? 'Quadrado' : 'Círculo')}</span>
        {isSelected && <span className="flex items-center gap-1">ATIVO</span>}
      </div>

      <div className="checkerboard p-8 flex justify-center items-center min-h-[300px]">
        <div 
          className="transition-all duration-300 ease-out flex items-center justify-center overflow-hidden"
          style={{
            width: `${diameter}px`,
            height: `${diameter}px`,
            background: 'white',
            border: `${Math.max(2, fontSize * 0.15)}px solid black`,
            borderRadius: borderRadius,
            boxShadow: '0 10px 40px rgba(0,0,0,0.4)',
            position: 'relative',
          }}
        >
          <div className={`flex flex-col w-full h-full justify-center ${alignment === 'left' ? 'items-start px-4' : alignment === 'right' ? 'items-end px-4' : 'items-center'}`}>
            {lines.map((line, idx) => (
              <div key={idx} style={{
                color: 'black',
                fontSize: `${fontSize}px`, 
                fontWeight: 900, 
                lineHeight: '1',
                fontFamily: fontFamily, 
                whiteSpace: 'nowrap',
                textAlign: alignment,
                WebkitTextStroke: textStroke,
                textShadow: textShadowValue,
                transform: `scaleY(${verticalScale})`,
                transformOrigin: 'center',
                marginBottom: `${(lineHeight - 1) * fontSize}px`
              }}>
                {line}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BalloonPreviewCard;