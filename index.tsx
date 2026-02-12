import React, { useState, useEffect, useRef, useMemo } from "react";
import { createRoot } from "react-dom/client";

// --- PHOTOSHOP DARK THEME CONSTANTS ---
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
  paperSkin: "#343434",
  shadow: "0 2px 4px rgba(0,0,0,0.3)",
  modalShadow: "0 20px 50px rgba(0,0,0,0.6)"
};

// --- STYLES ---
const styles = `
  * { box-sizing: border-box; user-select: none; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; }
  
  body { 
    background-color: ${THEME.bg}; 
    color: ${THEME.text}; 
    font-size: 11px; 
    margin: 0;
    overflow: hidden;
  }

  ::-webkit-scrollbar { width: 12px; }
  ::-webkit-scrollbar-track { background: #2b2b2b; border-left: 1px solid #222; }
  ::-webkit-scrollbar-thumb { background: #484848; border-radius: 6px; border: 3px solid #2b2b2b; }
  ::-webkit-scrollbar-thumb:hover { background: #606060; }

  .hidden { display: none; }
  
  /* Buttons */
  .btn {
    border: 1px solid transparent;
    border-radius: 3px;
    padding: 0 12px;
    height: 28px;
    font-size: 11px;
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    transition: all 0.1s ease;
    outline: none;
    font-weight: 600;
    white-space: nowrap;
  }
  .btn:active { transform: translateY(1px); }
  
  .btn-primary { 
    background-color: ${THEME.highlight}; color: white; border: 1px solid ${THEME.highlight}; 
    box-shadow: 0 1px 2px rgba(0,0,0,0.2);
  }
  .btn-primary:hover { background-color: ${THEME.highlightHover}; }
  
  .btn-secondary { background-color: #4b4b4b; color: #eaeaea; border: 1px solid #222; }
  .btn-secondary:hover { background-color: #555; }
  
  .btn-ghost { background: transparent; color: ${THEME.textMuted}; padding: 4px; height: 24px; width: 24px; border-radius: 50%; }
  .btn-ghost:hover { color: ${THEME.text}; background: rgba(255,255,255,0.1); }

  .btn-toggle {
    background: #2a2a2a; border: 1px solid #444; color: #aaa;
    height: 24px; padding: 0 10px; font-size: 10px; margin-right: 4px;
  }
  .btn-toggle.active {
    background: #3a3a3a; border-color: ${THEME.highlight}; color: ${THEME.highlight};
    box-shadow: inset 0 0 4px rgba(38, 128, 235, 0.2);
  }

  .btn-xs { height: 20px; padding: 0 8px; font-size: 10px; }

  /* Inputs */
  .textfield {
    background-color: ${THEME.inputBg}; border: 1px solid ${THEME.borderLight};
    color: ${THEME.text}; height: 28px; padding: 0 8px; border-radius: 3px;
    width: 100%; outline: none; font-size: 12px; transition: border 0.1s;
  }
  .textfield:focus { border-color: ${THEME.highlight}; background-color: #1a1a1a; }
  .textfield::placeholder { color: #555; font-style: italic; }

  /* Checkerboard Background */
  .checkerboard {
    background-color: #e0e0e0;
    background-image:
      linear-gradient(45deg, #ccc 25%, transparent 25%),
      linear-gradient(-45deg, #ccc 25%, transparent 25%),
      linear-gradient(45deg, transparent 75%, #ccc 75%),
      linear-gradient(-45deg, transparent 75%, #ccc 75%);
    background-size: 20px 20px;
    background-position: 0 0, 0 10px, 10px -10px, -10px 0px;
    box-shadow: inset 0 0 20px rgba(0,0,0,0.1);
  }

  .list-item:hover { background-color: rgba(255,255,255,0.03); }
  .console-line { font-family: 'Menlo', 'Consolas', monospace; font-size: 10px; line-height: 1.4; }
  
  @keyframes fadeIn { from { opacity: 0; transform: scale(0.99); } to { opacity: 1; transform: scale(1); } }
`;

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

// --- LOGIC: MANHWA LAYOUT ALGORITHM ---

// Shared canvas context for measurements (Optimization)
let cachedCtx: CanvasRenderingContext2D | null = null;
const getMeasureContext = () => {
  if (!cachedCtx) {
    const canvas = document.createElement("canvas");
    cachedCtx = canvas.getContext("2d");
  }
  return cachedCtx;
};

// Helper to measure text width
const measureText = (text: string, font: string): number => {
  const context = getMeasureContext();
  if (context) {
    context.font = font;
    return context.measureText(text).width;
  }
  return text.length * 8; // Fallback
};

// Calculates available width at vertical position Y (relative to center)
// R = Radius, padX/Y = padding
function lineMaxWidthAtY(y: number, R: number, padX: number, padY: number): number {
  const ry = R - padY; // Effective radius Y
  const rx = R - padX; // Effective radius X
  
  // Ellipse equation: (y^2 / ry^2) + (x^2 / rx^2) = 1
  // x = rx * sqrt(1 - y^2/ry^2)
  // Width = 2 * x
  
  // Safe calculation to avoid negative roots
  const t = 1 - (y * y) / (ry * ry);
  if (t <= 0) return 0;
  
  const width = 2 * rx * Math.sqrt(t);
  
  // Don't let width be extremely small (avoids single letter tips unless strictly necessary)
  // Manhwa logic: usually text stops before the very tip.
  
  return width;
}

interface LayoutResult {
  lines: string[];
  blockHeight: number;
  radius: number;
}

function calculateManhwaLayout(
  text: string, 
  style: 'circle' | 'square' | 'rounded', 
  fontSize: number, 
  lineHeightPx: number
): LayoutResult {
  const words = text.trim().split(/\s+/);
  if (!text.trim()) return { lines: [], blockHeight: 0, radius: 100 };

  const font = `700 ${fontSize}px "Comic Sans MS"`;
  
  // Initial Size Estimation based on Area
  // Area ~ length * charSize^2.
  const charArea = (fontSize * 0.6) * (fontSize * lineHeightPx); // approx char box
  const totalArea = text.length * charArea;
  
  // Efficiency: Circle ~60%, Square ~85%
  const efficiency = style === 'circle' ? 0.55 : 0.85;
  const reqArea = totalArea / efficiency;
  
  // Initial Radius/Size guess
  let R = Math.max(100, Math.sqrt(reqArea)); // Base radius (half-size)
  
  // For Square/Rounded, "Radius" acts as half-width/height
  const isCircle = style === 'circle';
  
  // Iterative Layout Solver
  // We might increase R if text doesn't fit or looks bad
  let bestLayout: { lines: string[], height: number } | null = null;
  let attempts = 0;

  while (attempts < 5) { // Safety break
    // Padding logic
    const padX = isCircle ? R * 0.1 : 20; 
    const padY = isCircle ? R * 0.15 : 20; 

    // Simulation Loop (Centering)
    let lines: string[] = [];
    let yStart = 0; // Relative to center
    
    // 3 passes to stabilize vertical centering
    // Pass 1: Assume starts at 0, measure height
    // Pass 2: Adjust start based on height, measure again
    // Pass 3: Refine
    for (let iter = 0; iter < 3; iter++) {
      lines = [];
      let wIndex = 0;
      let currentY = yStart; // Center-relative Y for the current line
      
      // Temporary words copy to process
      // We can't consume the main 'words' array because we loop 3 times
      // Actually we can just index through 'words'
      
      while (wIndex < words.length) {
        // Line Y position: Center of the line
        // If iter 0 (yStart=0), we grow down.
        // On next iters, yStart is negative (top of block).
        const lineCenterY = currentY + (lineHeightPx / 2);
        
        let availableWidth = 0;
        
        if (isCircle) {
           availableWidth = lineMaxWidthAtY(lineCenterY, R, padX, padY);
        } else {
           // Square/Rounded: Constant width
           availableWidth = (R * 2) - (padX * 2);
        }

        // Check if Y is out of bounds (text overflowed vertical space)
        if (isCircle && availableWidth <= fontSize) {
           // Effectively out of space. Break inner loop to trigger R increase
           lines = []; // Fail signal
           break; 
        }

        let line = words[wIndex];
        // If single word is wider than max width, force break (or let it bleed slightly)
        // Here we just accept it might be tight.
        
        let next = wIndex + 1;
        
        // Greedy line fitting
        while (next < words.length) {
          const candidate = line + " " + words[next];
          const width = measureText(candidate, font);
          
          if (width <= availableWidth) {
            line = candidate;
            next++;
          } else {
            break;
          }
        }
        
        lines.push(line);
        wIndex = next;
        currentY += lineHeightPx;
      }

      // Calculate total height of the text block
      const blockH = lines.length * lineHeightPx;
      
      // If we failed to fit (lines empty) or block is taller than container
      if (lines.length === 0 || (blockH > (R * 2 - padY * 2))) {
        lines = []; // Signal retry with larger R
        break;
      }
      
      // Re-center for next iteration
      // Top of the block should be at -Height/2
      yStart = -blockH / 2;
    }

    // Did it fit?
    if (lines.length > 0) {
      bestLayout = { lines, height: lines.length * lineHeightPx };
      break; // Success
    } else {
      // Failed to fit, increase size and retry
      R *= 1.15; // Grow by 15%
      attempts++;
    }
  }

  // Fallback if loop breaks (shouldn't happen often with growth)
  if (!bestLayout) {
     return { lines: [text], blockHeight: lineHeightPx, radius: R };
  }

  return { lines: bestLayout.lines, blockHeight: bestLayout.height, radius: R };
}


// --- COMPONENTS ---

const BadgeHeader = () => (
  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: THEME.accent, boxShadow: `0 0 6px ${THEME.accent}` }}></div>
    <div style={{ width: '1px', height: '16px', background: '#555' }}></div>
    <span style={{ fontWeight: 700, fontSize: '12px', letterSpacing: '0.5px', textTransform: 'uppercase', color: '#fff' }}>Manhwa Tipo</span>
    <span style={{ fontSize: '10px', color: '#666', marginTop: '1px' }}>v1.5</span>
  </div>
);

interface BalloonPreviewCardProps {
  style: 'circle' | 'square' | 'rounded';
  text: string;
  effects: Effects;
  isSelected: boolean;
  onSelect: () => void;
}

const BalloonPreviewCard: React.FC<BalloonPreviewCardProps> = ({ style, text, effects, isSelected, onSelect }) => {
  // Visual Config
  const isCircle = style === 'circle';
  const borderRadius = isCircle ? '50%' : (style === 'rounded' ? '30px' : '4px');
  const FONT_SIZE = 15;
  const LINE_HEIGHT = FONT_SIZE * 1.25;

  // Calculate Layout (Memoized for performance)
  const layout = useMemo(() => {
    return calculateManhwaLayout(text, style, FONT_SIZE, LINE_HEIGHT);
  }, [text, style]);

  const { lines, radius, blockHeight } = layout;
  const diameter = radius * 2;

  // Visual Effects
  const textStroke = effects.stroke ? '1.5px black' : '0px transparent';
  let textShadows = [];
  if (effects.shadow) textShadows.push('3px 3px 0px rgba(0,0,0,0.3)'); 
  if (effects.glow) textShadows.push('0 0 8px #2680EB');
  const textShadowValue = textShadows.length > 0 ? textShadows.join(', ') : 'none';

  return (
    <div 
      onClick={onSelect}
      style={{
        marginBottom: '16px',
        border: isSelected ? `2px solid ${THEME.highlight}` : `1px solid ${THEME.borderLight}`,
        borderRadius: '6px',
        background: '#303030',
        overflow: 'hidden',
        cursor: 'pointer',
        transition: 'all 0.1s',
        opacity: isSelected ? 1 : 0.7
      }}
    >
      <div style={{ 
        padding: '6px 10px', background: isSelected ? THEME.highlight : '#252525', 
        color: isSelected ? '#fff' : '#aaa', fontSize: '10px', fontWeight: 'bold', textTransform: 'uppercase',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center'
      }}>
        <span>{style === 'rounded' ? 'Arredondado' : (style === 'square' ? 'Quadrado' : 'Círculo')}</span>
        {isSelected && <span style={{fontSize: '9px'}}>● ATIVO</span>}
      </div>

      <div className="checkerboard" style={{ padding: '30px', display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '260px' }}>
        
        {/* BALLOON CONTAINER */}
        <div style={{
          width: `${diameter}px`,
          height: `${diameter}px`,
          background: 'white',
          border: '3px solid black',
          borderRadius: borderRadius,
          boxShadow: '0 5px 15px rgba(0,0,0,0.15)',
          transition: 'width 0.2s ease, height 0.2s ease',
          position: 'relative',
          
          // Flexbox is ONLY used here to center the entire text block,
          // but the text block itself is pre-calculated.
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          
          {/* RENDERED TEXT LINES */}
          <div style={{
             display: 'flex',
             flexDirection: 'column',
             alignItems: 'center',
             justifyContent: 'center',
             width: '100%',
             height: '100%',
             // Offset logic if needed, but flex center handles the block well
          }}>
            {lines.map((line, idx) => (
              <div key={idx} style={{
                color: 'black',
                fontSize: `${FONT_SIZE}px`, 
                fontWeight: 700, 
                lineHeight: `${LINE_HEIGHT}px`,
                fontFamily: 'Comic Sans MS, "Chalkboard SE", sans-serif', 
                textAlign: 'center',
                whiteSpace: 'nowrap', // Lines are already broken
                WebkitTextStroke: textStroke,
                textShadow: textShadowValue,
                zIndex: 2,
              }}>
                {line}
              </div>
            ))}
            
            {lines.length === 0 && (
               <span style={{ color: '#ccc', fontSize: '12px' }}>TEXTO</span>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};

const App = () => {
  const [isOpen, setIsOpen] = useState(false);
  
  // Initialize lines
  const [lines, setLines] = useState<Record<number, LineData>>(() => {
    const initialState: Record<number, LineData> = {};
    for (let i = 1; i <= 10; i++) {
      initialState[i] = { 
        id: i, 
        text: "", 
        style: "circle",
        effects: { stroke: false, shadow: false, glow: false }
      };
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

  const handleSelectLine = (id: number) => setActiveLineId(id);

  const handleSetStyle = (style: 'circle' | 'square' | 'rounded') => {
    if (!activeLineId) return;
    setLines(prev => ({ ...prev, [activeLineId]: { ...prev[activeLineId], style } }));
  };

  const toggleEffect = (effect: keyof Effects) => {
    if (!activeLineId) return;
    setLines(prev => {
      const current = prev[activeLineId].effects;
      return {
        ...prev,
        [activeLineId]: {
          ...prev[activeLineId],
          effects: { ...current, [effect]: !current[effect] }
        }
      };
    });
  };

  const handleApply = () => {
    const activeLines = (Object.values(lines) as LineData[]).filter(l => l.text.trim().length > 0);
    if(activeLines.length === 0) { addLog("ERRO: Nenhum texto para aplicar.", 'error'); return; }
    addLog(`Gerando ${activeLines.length} balões...`, 'info');
    setTimeout(() => { addLog("Concluído: Camadas geradas.", 'success'); }, 800);
  };

  const handleClear = () => {
    const resetState: Record<number, LineData> = {};
    for (let i = 1; i <= 10; i++) {
      resetState[i] = { id: i, text: "", style: "circle", effects: { stroke: false, shadow: false, glow: false } };
    }
    setLines(resetState);
    setActiveLineId(null);
    setLogs([{ type: 'info', time: new Date().toLocaleTimeString(), msg: "Reset completo." }]);
  };

  return (
    <>
      <style>{styles}</style>
      
      {/* PANEL VIEW */}
      <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: THEME.bg }}>
        <button className="btn btn-primary" style={{ height: '36px', padding: '0 20px', fontSize: '13px' }} onClick={() => setIsOpen(true)}>
          Abrir Manhwa Tipo
        </button>
      </div>

      {/* MODAL */}
      {isOpen && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.75)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(3px)'
        }}>
          <div style={{
            width: '950px', height: '700px', background: THEME.panelBg, borderRadius: '8px',
            boxShadow: THEME.modalShadow, border: `1px solid ${THEME.border}`, display: 'flex', flexDirection: 'column',
            animation: 'fadeIn 0.25s cubic-bezier(0.2, 0.8, 0.2, 1)'
          }}>

            {/* HEADER */}
            <div style={{
              height: '48px', borderBottom: `1px solid ${THEME.border}`, display: 'flex', alignItems: 'center',
              justifyContent: 'space-between', padding: '0 16px', background: '#2e2e2e',
              borderTopLeftRadius: '8px', borderTopRightRadius: '8px'
            }}>
              <BadgeHeader />
              <button className="btn btn-ghost" onClick={() => setIsOpen(false)}>✕</button>
            </div>

            {/* BODY */}
            <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
              
              {/* LEFT: LIST */}
              <div style={{ flex: '0 0 400px', display: 'flex', flexDirection: 'column', borderRight: `1px solid ${THEME.border}`, background: '#333' }}>
                <div style={{ 
                  padding: '12px 16px', borderBottom: `1px solid ${THEME.border}`, background: '#2a2a2a',
                  color: THEME.textMuted, fontSize: '10px', fontWeight: 'bold', textTransform: 'uppercase',
                  display: 'flex', justifyContent: 'space-between'
                }}>
                  <span>Lista de Diálogos</span>
                  <span>{(Object.values(lines) as LineData[]).filter(l => l.text).length}/10</span>
                </div>
                <div style={{ flex: 1, overflowY: 'auto', padding: '10px' }}>
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(id => {
                    const isActive = activeLineId === id;
                    const hasText = lines[id].text.length > 0;
                    return (
                      <div key={id} className="list-item" onClick={() => handleSelectLine(id)}
                        style={{ 
                          display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 10px', marginBottom: '4px', borderRadius: '4px',
                          border: isActive ? `1px solid ${THEME.highlight}` : '1px solid transparent',
                          background: isActive ? 'rgba(38, 128, 235, 0.15)' : (hasText ? '#3a3a3a' : 'transparent'),
                          cursor: 'pointer'
                        }}
                      >
                        <div style={{ width: '20px', textAlign: 'center', fontWeight: 'bold', color: isActive ? THEME.highlight : '#666', fontSize: '11px' }}>{id}</div>
                        <input className="textfield" placeholder="Digite..." value={lines[id].text}
                          onChange={(e) => handleInputChange(id, e.target.value)} onFocus={() => handleSelectLine(id)}
                          style={{ background: isActive ? '#1a1a1a' : (hasText ? '#282828' : 'transparent'), borderColor: isActive ? THEME.highlight : (hasText ? '#555' : 'transparent') }}
                        />
                        {hasText && <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: THEME.accent }} />}
                        <div style={{ width: '20px', display: 'flex', justifyContent: 'center' }}>{isActive && <span style={{color: THEME.highlight}}>›</span>}</div>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* RIGHT: PREVIEW & TOOLS */}
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: '#252525' }}>
                 
                 {/* Toolbar for Active Line */}
                 <div style={{ 
                    padding: '10px 16px', borderBottom: `1px solid ${THEME.border}`, background: '#2a2a2a',
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center', height: '50px'
                 }}>
                    <span style={{ fontSize: '11px', fontWeight: 'bold', color: THEME.highlight, textTransform: 'uppercase' }}>
                      {activeLineId ? `Propriedades: Linha ${activeLineId}` : 'Selecione uma linha'}
                    </span>
                    
                    {activeLineId && (
                      <div style={{ display: 'flex' }}>
                         <button 
                           title="Traçado preto no texto"
                           className={`btn btn-toggle ${lines[activeLineId].effects.stroke ? 'active' : ''}`} 
                           onClick={() => toggleEffect('stroke')}
                         >
                           Traçado
                         </button>
                         <button 
                           title="Sombra projetada"
                           className={`btn btn-toggle ${lines[activeLineId].effects.shadow ? 'active' : ''}`} 
                           onClick={() => toggleEffect('shadow')}
                         >
                           Sombra
                         </button>
                         <button 
                           title="Brilho azul"
                           className={`btn btn-toggle ${lines[activeLineId].effects.glow ? 'active' : ''}`} 
                           onClick={() => toggleEffect('glow')}
                         >
                           Glow
                         </button>
                      </div>
                    )}
                 </div>

                 {/* Preview Area */}
                 <div style={{ flex: 1, overflowY: 'auto', padding: '20px' }}>
                    {!activeLineId ? (
                      <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#555', gap: '10px' }}>
                        <div style={{ fontSize: '40px', opacity: 0.2 }}>✎</div>
                        <div>Selecione uma linha para editar estilo e efeitos</div>
                      </div>
                    ) : (
                      <div style={{ animation: 'fadeIn 0.2s' }}>
                        {(['circle', 'square', 'rounded'] as const).map(style => (
                          <BalloonPreviewCard 
                            key={style}
                            style={style}
                            text={lines[activeLineId].text}
                            effects={lines[activeLineId].effects}
                            isSelected={lines[activeLineId].style === style}
                            onSelect={() => handleSetStyle(style)}
                          />
                        ))}
                      </div>
                    )}
                 </div>
              </div>
            </div>

            {/* FOOTER */}
            <div style={{ height: '120px', background: '#202020', borderTop: `1px solid ${THEME.border}`, display: 'flex', flexDirection: 'column', borderBottomLeftRadius: '8px', borderBottomRightRadius: '8px' }}>
              <div style={{ flex: 1, padding: '8px 12px', overflowY: 'auto', borderBottom: `1px solid ${THEME.border}`, background: '#1a1a1a' }}>
                {logs.map((log, idx) => (
                  <div key={idx} className="console-line" style={{ marginBottom: '3px', color: log.type === 'error' ? '#ff6b6b' : (log.type === 'success' ? '#69db7c' : '#ced4da') }}>
                    <span style={{ color: '#555', marginRight: '8px' }}>[{log.time}]</span>{log.msg}
                  </div>
                ))}
                <div ref={logEndRef} />
              </div>
              <div style={{ height: '44px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 16px', background: '#2e2e2e' }}>
                 <button className="btn btn-secondary btn-xs" onClick={handleClear}>Resetar Tudo</button>
                 <div style={{ display: 'flex', gap: '10px' }}>
                    <button className="btn btn-primary" onClick={handleApply} style={{ padding: '0 24px' }}>Aplicar no Photoshop</button>
                 </div>
              </div>
            </div>

          </div>
        </div>
      )}
    </>
  );
};

const container = document.getElementById("app");
if (container) {
  const root = createRoot(container);
  root.render(<App />);
}