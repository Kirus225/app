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
  return text.length * (parseInt(font) * 0.55);
};

/**
 * Calcula a largura disponível em um ponto Y relativo ao centro (0 = centro).
 * R_eff é o raio interno (com padding).
 */
function getWidthAtY(y: number, R_eff: number): number {
  const absY = Math.abs(y);
  if (absY >= R_eff) return 0;
  return Math.sqrt(R_eff * R_eff - absY * absY) * 2;
}

function calculateManhwaLayout(text: string, style: string, fontSize: number, R: number) {
  if (!text.trim()) return { lines: [] };

  const words = text.trim().split(/\s+/);
  const scaleFactor = 1.15; // O scaleY aplicado no CSS
  const effectiveLineHeight = fontSize * 0.95 * scaleFactor; 
  const font = `900 ${fontSize}px "Comic Sans MS", sans-serif`;
  
  // Padding interno para evitar que o texto encoste na borda ou fique estreito demais nos polos
  const padding = style === 'square' ? 20 : R * 0.22;
  const R_eff = R - padding;

  const isCurved = style === 'circle' || style === 'rounded';

  // Função interna para realizar a quebra de linha dado um ponto de início vertical (startY)
  const performWrap = (startY: number) => {
    let lines: string[] = [];
    let currentWordIdx = 0;
    
    // Tentamos preencher até 15 linhas (segurança)
    for (let i = 0; i < 15; i++) {
      if (currentWordIdx >= words.length) break;

      // y é o centro geométrico da linha atual relativo ao centro do balão
      const yLineCenter = startY + (i + 0.5) * effectiveLineHeight;
      
      // Se o centro da linha já passou do limite inferior do raio efetivo, paramos
      if (Math.abs(yLineCenter) >= R_eff && isCurved) break;

      const maxWidth = isCurved ? getWidthAtY(yLineCenter, R_eff) : (R * 2) - (padding * 2);
      
      // Se a largura for muito pequena (polos), ignoramos essa linha
      if (isCurved && maxWidth < fontSize * 1.2) {
        // Se ainda estamos no topo, tentamos a próxima linha descendo o startY
        if (yLineCenter < 0) continue; 
        else break; // Se estamos na base, acabou o espaço
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
      else if (isCurved) break; // Não coube nem uma palavra, interrompe
    }
    return { lines, wordCount: currentWordIdx };
  };

  // --- PROCESSO ITERATIVO ---
  // 1. Estimativa inicial: assumimos que o bloco começa centralizado
  // Chute inicial baseado no número total de palavras
  let currentLines: string[] = [];
  let bestLines: string[] = [];
  let startY = -(words.length * effectiveLineHeight) / 4; 

  // Iteramos para ajustar o startY com base na altura real do bloco gerado
  for (let iteration = 0; iteration < 3; iteration++) {
    const result = performWrap(startY);
    currentLines = result.lines;
    
    if (currentLines.length > 0) {
      const blockHeight = currentLines.length * effectiveLineHeight;
      // Recalcula startY para que o bloco fique perfeitamente centralizado
      startY = -blockHeight / 2;
      bestLines = currentLines;
    }
    
    // Se todas as palavras couberam, podemos parar
    if (result.wordCount === words.length) break;
  }

  return { lines: bestLines };
}

const BalloonPreviewCard = ({ style, text, fontSize, effects, isSelected, onSelect }: BalloonPreviewCardProps) => {
  const FIXED_RADIUS = 110; 
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
          {/* Container de texto centralizado horizontal e verticalmente */}
          <div className="flex flex-col items-center justify-center w-full h-full px-1">
            {lines.map((line, idx) => (
              <div key={idx} style={{
                color: 'black',
                fontSize: `${fontSize}px`, 
                fontWeight: 900, 
                lineHeight: '0.95', // Ajustado para compensar o scaleY
                fontFamily: '"Comic Sans MS", "Chalkboard SE", cursive, sans-serif', 
                whiteSpace: 'nowrap',
                textAlign: 'center',
                WebkitTextStroke: textStroke,
                textShadow: textShadowValue,
                transform: 'scaleY(1.15)', // Estilo Manhwa
                transformOrigin: 'center',
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