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
  return text.length * (parseInt(font) * 0.5);
};

/**
 * Calcula a largura disponível em um ponto Y de um círculo de raio R.
 */
function getWidthAtY(y: number, R: number, pad: number): number {
  const absY = Math.abs(y);
  if (absY >= R) return 0;
  // Teorema de Pitágoras: x^2 + y^2 = R^2 => x = sqrt(R^2 - y^2)
  const halfWidth = Math.sqrt(R * R - absY * absY);
  return Math.max(0, (halfWidth * 2) - pad);
}

function calculateManhwaLayout(text: string, style: string, fontSize: number, fixedRadius: number) {
  if (!text.trim()) return { lines: [] };

  const words = text.trim().split(/\s+/);
  const lineHeight = fontSize * 1.05;
  const font = `900 ${fontSize}px "Comic Sans MS", sans-serif`;
  
  const R = fixedRadius;
  const isCircle = style === 'circle' || style === 'rounded';
  const padding = isCircle ? R * 0.25 : 20;
  
  let lines: string[] = [];
  let currentWordIdx = 0;
  
  // Calculamos o número de linhas que cabem no diâmetro
  const maxLines = Math.floor(((R * 2) - padding) / lineHeight);
  // Centralizamos o bloco de texto verticalmente
  // Primeiro, simulamos para saber quantas linhas teremos
  let tempLines: string[] = [];
  let tempIdx = 0;
  
  // Loop de simulação para contagem de linhas
  for (let i = 0; i < maxLines; i++) {
    if (tempIdx >= words.length) break;
    const lineY = (-(maxLines * lineHeight) / 2) + (i * lineHeight) + (lineHeight / 2);
    const maxWidth = isCircle ? getWidthAtY(lineY, R, padding) : (R * 2) - padding;
    
    let line = "";
    while (tempIdx < words.length) {
      const word = words[tempIdx];
      const testLine = line ? line + " " + word : word;
      if (measureText(testLine, font) <= maxWidth) {
        line = testLine;
        tempIdx++;
      } else break;
    }
    if (line) tempLines.push(line);
  }

  // Agora fazemos o layout real centralizado com base no número de linhas real
  const actualLineCount = tempLines.length;
  const startY = -(actualLineCount * lineHeight) / 2;
  
  lines = [];
  currentWordIdx = 0;
  for (let i = 0; i < actualLineCount; i++) {
    const lineY = startY + (i * lineHeight) + (lineHeight / 2);
    const maxWidth = isCircle ? getWidthAtY(lineY, R, padding) : (R * 2) - padding;
    
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
  }

  return { lines };
}

const BalloonPreviewCard = ({ style, text, fontSize, effects, isSelected, onSelect }: BalloonPreviewCardProps) => {
  const FIXED_RADIUS = 110; // Tamanho fixo do balão no preview (220px de diâmetro)
  const layout = useMemo(() => calculateManhwaLayout(text, style, fontSize, FIXED_RADIUS), [text, style, fontSize]);
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

      <div className="checkerboard p-12 flex justify-center items-center min-h-[320px]">
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
          <div className="flex flex-col items-center justify-center w-full text-center px-2">
            {lines.map((line, idx) => (
              <div key={idx} style={{
                color: 'black',
                fontSize: `${fontSize}px`, 
                fontWeight: 900, 
                lineHeight: '0.9',
                fontFamily: '"Comic Sans MS", "Chalkboard SE", cursive, sans-serif', 
                whiteSpace: 'nowrap',
                WebkitTextStroke: textStroke,
                textShadow: textShadowValue,
                transform: 'scaleY(1.15)', // Estilo Manhwa clássico (texto levemente esticado)
              }}>
                {line}
              </div>
            ))}
            {lines.length === 0 && text && (
              <span className="text-red-500 text-[10px] font-bold">TEXTO NÃO CABE</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BalloonPreviewCard;