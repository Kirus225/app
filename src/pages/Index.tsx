"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import { Settings, Play, RotateCcw, X, Info, CheckCircle2, AlertCircle } from "lucide-react";

// --- THEME CONSTANTS ---
const THEME = {
  bg: "#323232",
  panelBg: "#3E3E3E",
  border: "#292929",
  borderLight: "#505050",
  text: "#F5F5F5",
  textMuted: "#989898",
  highlight: "#2680EB",
  highlightHover: "#1266C7",
  accent: "#2DCE89",
  inputBg: "#232323",
};

// --- TYPES ---
interface Effects {
  stroke: boolean;
  shadow: boolean;
  glow: boolean;
}

interface LineData {
  id: number;
  text: string;
  style: 'circle' | 'square' | 'rounded';
  effects: Effects;
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

function calculateManhwaLayout(
  text: string, 
  style: 'circle' | 'square' | 'rounded', 
  fontSize: number, 
  lineHeightPx: number
) {
  const words = text.trim().split(/\s+/);
  if (!text.trim()) return { lines: [], blockHeight: 0, radius: 100 };

  const font = `700 ${fontSize}px "Comic Sans MS"`;
  const charArea = (fontSize * 0.6) * (fontSize * lineHeightPx);
  const totalArea = text.length * charArea;
  const efficiency = style === 'circle' ? 0.55 : 0.85;
  const reqArea = totalArea / efficiency;
  
  let R = Math.max(100, Math.sqrt(reqArea));
  const isCircle = style === 'circle';
  let bestLayout: { lines: string[], height: number } | null = null;
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

        if (isCircle && availableWidth <= fontSize) {
           lines = [];
           break; 
        }

        let line = words[wIndex];
        let next = wIndex + 1;
        while (next < words.length) {
          const candidate = line + " " + words[next];
          if (measureText(candidate, font) <= availableWidth) {
            line = candidate;
            next++;
          } else break;
        }
        lines.push(line);
        wIndex = next;
        currentY += lineHeightPx;
      }

      const blockH = lines.length * lineHeightPx;
      if (lines.length === 0 || (blockH > (R * 2 - padY * 2))) {
        lines = [];
        break;
      }
      yStart = -blockH / 2;
    }

    if (lines.length > 0) {
      bestLayout = { lines, height: lines.length * lineHeightPx };
      break;
    } else {
      R *= 1.15;
      attempts++;
    }
  }

  return { lines: bestLayout?.lines || [text], blockHeight: bestLayout?.height || lineHeightPx, radius: R };
}

// --- COMPONENTS ---
const BalloonPreviewCard = ({ style, text, effects, isSelected, onSelect }: any) => {
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

const Index = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [lines, setLines] = useState<Record<number, LineData>>(() => {
    const initialState: Record<number, LineData> = {};
    for (let i = 1; i <= 10; i++) {
      initialState[i] = { id: i, text: "", style: "circle", effects: { stroke: false, shadow: false, glow: false } };
    }
    return initialState;
  });

  const [activeLineId, setActiveLineId] = useState<number | null>(null);
  const [logs, setLogs] = useState([{ type: 'info', time: new Date().toLocaleTimeString(), msg: "Plugin pronto." }]);
  const logEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => { logEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [logs]);

  const addLog = (msg: string, type = 'info') => {
    setLogs(prev => [...prev, { type, time: new Date().toLocaleTimeString(), msg }]);
  };

  const handleInputChange = (id: number, val: string) => {
    setLines(prev => ({ ...prev, [id]: { ...prev[id], text: val } }));
  };

  const toggleEffect = (effect: keyof Effects) => {
    if (!activeLineId) return;
    setLines(prev => ({
      ...prev,
      [activeLineId]: {
        ...prev[activeLineId],
        effects: { ...prev[activeLineId].effects, [effect]: !prev[activeLineId].effects[effect] }
      }
    }));
  };

  const handleApply = () => {
    const activeLines = Object.values(lines).filter(l => l.text.trim().length > 0);
    if(activeLines.length === 0) { addLog("ERRO: Nenhum texto para aplicar.", 'error'); return; }
    addLog(`Gerando ${activeLines.length} balões...`, 'info');
    setTimeout(() => { addLog("Concluído: Camadas geradas.", 'success'); }, 800);
  };

  return (
    <div className="h-screen flex flex-col items-center justify-center bg-[#323232] text-[#F5F5F5]">
      <button 
        className="bg-[#2680EB] hover:bg-[#1266C7] text-white font-bold py-2 px-6 rounded shadow-lg transition-all"
        onClick={() => setIsOpen(true)}
      >
        Abrir Manhwa Tipo
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black/75 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="w-[950px] h-[700px] bg-[#3E3E3E] rounded-lg shadow-2xl border border-[#292929] flex flex-col animate-in fade-in zoom-in duration-200">
            
            {/* HEADER */}
            <div className="h-12 border-b border-[#292929] flex items-center justify-between px-4 bg-[#2e2e2e] rounded-t-lg">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-[#2DCE89] shadow-[0_0_6px_#2DCE89]"></div>
                <div className="w-px h-4 bg-[#555]"></div>
                <span className="font-bold text-xs tracking-wider uppercase">Manhwa Tipo</span>
                <span className="text-[10px] text-[#666]">v1.5</span>
              </div>
              <button className="text-[#989898] hover:text-white transition-colors" onClick={() => setIsOpen(false)}>
                <X size={18} />
              </button>
            </div>

            {/* BODY */}
            <div className="flex-1 flex overflow-hidden">
              {/* LEFT: LIST */}
              <div className="w-[400px] flex flex-col border-r border-[#292929] bg-[#333]">
                <div className="p-3 border-b border-[#292929] bg-[#2a2a2a] text-[10px] font-bold uppercase text-[#989898] flex justify-between">
                  <span>Lista de Diálogos</span>
                  <span>{Object.values(lines).filter(l => l.text).length}/10</span>
                </div>
                <div className="flex-1 overflow-y-auto p-2 space-y-1">
                  {Object.values(lines).map(line => (
                    <div 
                      key={line.id} 
                      onClick={() => setActiveLineId(line.id)}
                      className={`flex items-center gap-2 p-2 rounded cursor-pointer transition-colors ${activeLineId === line.id ? 'bg-[#2680EB]/15 border border-[#2680EB]' : 'border border-transparent hover:bg-white/5'}`}
                    >
                      <span className={`w-5 text-center font-bold text-[11px] ${activeLineId === line.id ? 'text-[#2680EB]' : 'text-[#666]'}`}>{line.id}</span>
                      <input 
                        className="flex-1 bg-[#232323] border border-[#505050] text-[#F5F5F5] h-7 px-2 rounded text-xs outline-none focus:border-[#2680EB]"
                        placeholder="Digite..."
                        value={line.text}
                        onChange={(e) => handleInputChange(line.id, e.target.value)}
                        onFocus={() => setActiveLineId(line.id)}
                      />
                      {line.text && <div className="w-1.5 h-1.5 rounded-full bg-[#2DCE89]" />}
                    </div>
                  ))}
                </div>
              </div>

              {/* RIGHT: PREVIEW */}
              <div className="flex-1 flex flex-col bg-[#252525]">
                <div className="h-[50px] px-4 border-b border-[#292929] bg-[#2a2a2a] flex justify-between items-center">
                  <span className="text-[11px] font-bold text-[#2680EB] uppercase">
                    {activeLineId ? `Propriedades: Linha ${activeLineId}` : 'Selecione uma linha'}
                  </span>
                  {activeLineId && (
                    <div className="flex gap-1">
                      {['stroke', 'shadow', 'glow'].map((eff) => (
                        <button 
                          key={eff}
                          onClick={() => toggleEffect(eff as keyof Effects)}
                          className={`px-2 h-6 text-[10px] rounded border transition-all ${lines[activeLineId].effects[eff as keyof Effects] ? 'bg-[#3a3a3a] border-[#2680EB] text-[#2680EB]' : 'bg-[#2a2a2a] border-[#444] text-[#aaa]'}`}
                        >
                          {eff.charAt(0).toUpperCase() + eff.slice(1)}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex-1 overflow-y-auto p-5">
                  {!activeLineId ? (
                    <div className="h-full flex flex-col items-center justify-center text-[#555] gap-2">
                      <Settings size={40} className="opacity-20" />
                      <span>Selecione uma linha para editar</span>
                    </div>
                  ) : (
                    <div className="animate-in fade-in duration-200">
                      {(['circle', 'square', 'rounded'] as const).map(style => (
                        <BalloonPreviewCard 
                          key={style}
                          style={style}
                          text={lines[activeLineId].text}
                          effects={lines[activeLineId].effects}
                          isSelected={lines[activeLineId].style === style}
                          onSelect={() => setLines(prev => ({ ...prev, [activeLineId]: { ...prev[activeLineId], style } }))}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* FOOTER */}
            <div className="h-[120px] bg-[#202020] border-t border-[#292929] flex flex-col rounded-b-lg">
              <div className="flex-1 p-2 overflow-y-auto bg-[#1a1a1a] font-mono text-[10px]">
                {logs.map((log, idx) => (
                  <div key={idx} className={`mb-1 flex gap-2 ${log.type === 'error' ? 'text-[#ff6b6b]' : (log.type === 'success' ? 'text-[#69db7c]' : 'text-[#ced4da]')}`}>
                    <span className="text-[#555]">[{log.time}]</span>
                    <span>{log.msg}</span>
                  </div>
                ))}
                <div ref={logEndRef} />
              </div>
              <div className="h-11 flex items-center justify-between px-4 bg-[#2e2e2e] rounded-b-lg">
                <button 
                  className="text-[10px] text-[#aaa] hover:text-white flex items-center gap-1"
                  onClick={() => {
                    setLines(prev => {
                      const reset = { ...prev };
                      Object.keys(reset).forEach(k => reset[Number(k)].text = "");
                      return reset;
                    });
                    addLog("Reset completo.");
                  }}
                >
                  <RotateCcw size={12} /> Resetar Tudo
                </button>
                <button 
                  className="bg-[#2680EB] hover:bg-[#1266C7] text-white text-xs font-bold px-6 h-7 rounded flex items-center gap-2"
                  onClick={handleApply}
                >
                  <Play size={12} /> Aplicar no Photoshop
                </button>
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};

export default Index;