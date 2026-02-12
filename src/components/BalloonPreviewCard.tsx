"use client";

import React, { useMemo } from "react";

interface BalloonPreviewCardProps {
  style: 'circle' | 'square' | 'rounded';
  text: string;
  fontSize: number;
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
  return text.length * 8;
};

/**
 * Calcula a largura máxima disponível em uma coordenada Y dentro de um círculo/elipse.
 */
function getAvailableWidthAtY(y: number, R: number, style: string, padX: number): number {
  if (style === 'square') return (R * 2) - (padX * 2);
  
  // Para círculo/arredondado, usamos a fórmula da corda: w = 2 * sqrt(R^2 - y^2)
  // y varia de -R a R
  const absY = Math.abs(y);
  if (absY >= R) return 0;
  
  const width = 2 * Math.sqrt(R * R - absY * absY);
  return Math.max(0, width - (padX * 2));
}

function calculateManhwaLayout(text: string, style: string, fontSize: number) {
  const words = text.trim().split(/\s+/);
  if (!text.trim()) return { lines: [], radius: 80 };

  const lineHeight = fontSize * 1.2;
  const font = `700 ${fontSize}px "Comic Sans MS", sans-serif`;
  
  // Estimativa inicial do raio baseada na área do texto
  const charWidth = fontSize * 0.6;
  const totalArea = text.length * charWidth * lineHeight;
  const efficiency = style === 'circle' ? 0.5 : 0.8;
  let R = Math.max(60, Math.sqrt(totalArea / (Math.PI * efficiency)));
  
  let bestLayout: string[] = [];
  let attempts = 0;

  while (attempts < 10) {
    const padX = style === 'circle' ? R * 0.15 : 15;
    const padY = style === 'circle' ? R * 0.2 : 15;
    
    // Tentamos encaixar as linhas centralizadas verticalmente
    let lines: string[] = [];
    let currentWordIdx = 0;
    
    // Estimamos quantas linhas cabem
    const maxLines = Math.floor(((R * 2) - (padY * 2)) / lineHeight);
    const startY = -(maxLines * lineHeight) / 2;

    for (let i = 0; i < maxLines; i++) {
      if (currentWordIdx >= words.length) break;
      
      const lineY = startY + (i * lineHeight) + (lineHeight / 2);
      const maxWidth = getAvailableWidthAtY(lineY, R, style, padX);
      
      if (maxWidth < fontSize * 2) {
        // Se a linha for muito estreita (topo/base do círculo), pulamos ou tentamos outra
        continue;
      }

      let line = words[currentWordIdx];
      let nextIdx = currentWordIdx + 1;
      
      while (nextIdx < words.length) {
        const testLine = line + " " + words[nextIdx];
        if (measureText(testLine, font) <= maxWidth) {
          line = testLine;
          nextIdx++;
        } else {
          break;
        }
      }
      
      lines.push(line);
      currentWordIdx = nextIdx;
    }

    if (currentWordIdx >= words.length) {
      bestLayout = lines;
      break;
    } else {
      R += 10; // Aumenta o balão se não couber
      attempts++;
    }
  }

  return { lines: bestLayout, radius: R };
}

const BalloonPreviewCard = ({ style, text, fontSize, effects, isSelected, onSelect }: BalloonPreviewCardProps) => {
  const layout = useMemo(() => calculateManhwaLayout(text, style, fontSize), [text, style, fontSize]);
  const { lines, radius } = layout;
  
  const diameter = radius * 2;
  const borderRadius = style === 'circle' ? '50%' : (style === 'rounded' ? '40px' : '4px');
  
  const textStroke = effects.stroke ? '1.5px black' : '0px transparent';
  let textShadows = [];
  if (effects.shadow) textShadows.push('3px 3px 0px rgba(0,0,0,0.2)'); 
  if (effects.glow) textShadows.push('0 0 8px rgba(38, 128, 235, 0.6)');
  const textShadowValue = textShadows.length > 0 ? textShadows.join(', ') : 'none';

  return (
    <div 
      onClick={onSelect}
      className={`mb-6 rounded-lg overflow-hidden cursor-pointer transition-all duration-300 ${isSelected ? 'ring-2 ring-[#2680EB] scale-[1.02] shadow-xl' : 'opacity-60 hover:opacity-100 border border-[#444]'} bg-[#2a2a2a]`}
    >
      <div className={`px-3 py-2 flex justify-between items-center text-[10px] font-black tracking-tighter uppercase ${isSelected ? 'bg-[#2680EB] text-white' : 'bg-[#1a1a1a] text-[#666]'}`}>
        <span>{style === 'rounded' ? 'Arredondado' : (style === 'square' ? 'Quadrado' : 'Círculo')}</span>
        {isSelected && <span className="flex items-center gap-1"><div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" /> SELECIONADO</span>}
      </div>

      <div className="checkerboard p-10 flex justify-center items-center min-h-[300px]">
        <div 
          className="transition-all duration-500 ease-out"
          style={{
            width: `${diameter}px`,
            height: `${diameter}px`,
            background: 'white',
            border: '3px solid black',
            borderRadius: borderRadius,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
            position: 'relative',
          }}
        >
          <div className="flex flex-col items-center justify-center w-full px-2">
            {lines.map((line, idx) => (
              <div key={idx} style={{
                color: 'black',
                fontSize: `${fontSize}px`, 
                fontWeight: 800, 
                lineHeight: '1.1',
                fontFamily: '"Comic Sans MS", "Chalkboard SE", cursive, sans-serif', 
                textAlign: 'center',
                whiteSpace: 'nowrap',
                WebkitTextStroke: textStroke,
                textShadow: textShadowValue,
                transform: 'scaleY(1.05)', // Leve compressão vertical comum em manhwas
              }}>
                {line}
              </div>
            ))}
            {lines.length === 0 && <span className="text-[#ddd] font-black text-2xl opacity-20 italic">TEXTO</span>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BalloonPreviewCard;