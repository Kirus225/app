"use client";

import React, { useState } from "react";
import { Settings, Play, RotateCcw, X, Type } from "lucide-react";
import DialogueList from "../components/DialogueList";
import LogConsole from "../components/LogConsole";
import BalloonPreviewCard from "../components/BalloonPreviewCard";

interface Effects {
  stroke: boolean;
  shadow: boolean;
  glow: boolean;
}

interface LineData {
  id: number;
  text: string;
  fontSize: number;
  style: 'circle' | 'square' | 'rounded';
  effects: Effects;
}

const Index = () => {
  const [lines, setLines] = useState<Record<number, LineData>>(() => {
    const initialState: Record<number, LineData> = {};
    for (let i = 1; i <= 10; i++) {
      initialState[i] = { 
        id: i, 
        text: "", 
        fontSize: 16,
        style: "circle", 
        effects: { stroke: false, shadow: false, glow: false } 
      };
    }
    return initialState;
  });

  const [activeLineId, setActiveLineId] = useState<number | null>(1);
  const [logs, setLogs] = useState([{ type: 'info', time: new Date().toLocaleTimeString(), msg: "Plugin pronto para tipografia." }]);

  const addLog = (msg: string, type = 'info') => {
    setLogs(prev => [...prev, { type, time: new Date().toLocaleTimeString(), msg }]);
  };

  const handleInputChange = (id: number, val: string) => {
    setLines(prev => ({ ...prev, [id]: { ...prev[id], text: val } }));
  };

  const updateActiveLine = (updates: Partial<LineData>) => {
    if (!activeLineId) return;
    setLines(prev => ({
      ...prev,
      [activeLineId]: { ...prev[activeLineId], ...updates }
    }));
  };

  const toggleEffect = (effect: keyof Effects) => {
    if (!activeLineId) return;
    const currentEffects = lines[activeLineId].effects;
    updateActiveLine({
      effects: { ...currentEffects, [effect]: !currentEffects[effect] }
    });
  };

  const handleApply = () => {
    const activeLines = Object.values(lines).filter(l => l.text.trim().length > 0);
    if(activeLines.length === 0) { addLog("ERRO: Nenhum texto para aplicar.", 'error'); return; }
    addLog(`Processando ${activeLines.length} balões com ajuste de forma...`, 'info');
    setTimeout(() => { addLog("Sucesso: Camadas de texto e formas criadas no Photoshop.", 'success'); }, 1000);
  };

  return (
    <div className="h-screen w-screen bg-[#1e1e1e] flex items-center justify-center p-4">
      <div className="w-full max-w-[1100px] h-full max-h-[800px] bg-[#3E3E3E] rounded-xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] border border-[#292929] flex flex-col overflow-hidden">
        
        {/* HEADER */}
        <div className="h-12 border-b border-[#252525] flex items-center justify-between px-4 bg-[#2e2e2e]">
          <div className="flex items-center gap-3">
            <div className="flex gap-1">
              <div className="w-3 h-3 rounded-full bg-[#ff5f56]"></div>
              <div className="w-3 h-3 rounded-full bg-[#ffbd2e]"></div>
              <div className="w-3 h-3 rounded-full bg-[#27c93f]"></div>
            </div>
            <div className="w-px h-4 bg-[#444] mx-1"></div>
            <span className="font-black text-[11px] tracking-widest uppercase text-[#eee]">Manhwa Tipo</span>
            <span className="px-1.5 py-0.5 bg-[#2680EB] text-[9px] font-bold rounded text-white">PRO</span>
          </div>
          <div className="flex items-center gap-4">
            <Settings size={16} className="text-[#777] cursor-pointer hover:text-white transition-colors" />
            <X size={18} className="text-[#777] cursor-pointer hover:text-white transition-colors" />
          </div>
        </div>

        {/* BODY */}
        <div className="flex-1 flex overflow-hidden">
          <DialogueList 
            lines={lines} 
            activeLineId={activeLineId} 
            onSelect={setActiveLineId} 
            onInputChange={handleInputChange} 
          />

          {/* RIGHT: PREVIEW & CONTROLS */}
          <div className="flex-1 flex flex-col bg-[#1a1a1a]">
            <div className="h-[60px] px-6 border-b border-[#252525] bg-[#252525] flex justify-between items-center">
              <div className="flex items-center gap-4">
                <span className="text-[10px] font-black text-[#2680EB] uppercase tracking-widest">
                  {activeLineId ? `Configurações L${activeLineId}` : 'Selecione'}
                </span>
                {activeLineId && (
                  <div className="flex items-center gap-2 bg-[#1a1a1a] px-3 py-1 rounded-full border border-[#333]">
                    <Type size={12} className="text-[#666]" />
                    <input 
                      type="range" min="10" max="40" 
                      value={lines[activeLineId].fontSize}
                      onChange={(e) => updateActiveLine({ fontSize: parseInt(e.target.value) })}
                      className="w-20 h-1 bg-[#333] rounded-lg appearance-none cursor-pointer accent-[#2680EB]"
                    />
                    <span className="text-[10px] font-mono text-[#999] w-6">{lines[activeLineId].fontSize}px</span>
                  </div>
                )}
              </div>
              
              {activeLineId && (
                <div className="flex gap-1.5">
                  {(['stroke', 'shadow', 'glow'] as const).map((eff) => (
                    <button 
                      key={eff}
                      onClick={() => toggleEffect(eff)}
                      className={`px-3 h-7 text-[9px] font-bold rounded-md border transition-all ${lines[activeLineId].effects[eff] ? 'bg-[#2680EB] border-[#2680EB] text-white shadow-[0_0_10px_rgba(38,128,235,0.4)]' : 'bg-[#2a2a2a] border-[#444] text-[#777] hover:border-[#666]'}`}
                    >
                      {eff.toUpperCase()}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="flex-1 overflow-y-auto p-8 space-y-2">
              {activeLineId && (
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                  {(['circle', 'square', 'rounded'] as const).map(style => (
                    <BalloonPreviewCard 
                      key={style}
                      style={style}
                      text={lines[activeLineId].text}
                      fontSize={lines[activeLineId].fontSize}
                      effects={lines[activeLineId].effects}
                      isSelected={lines[activeLineId].style === style}
                      onSelect={() => updateActiveLine({ style })}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* FOOTER */}
        <div className="h-[160px] bg-[#151515] border-t border-[#252525] flex flex-col">
          <LogConsole logs={logs} />
          <div className="h-14 flex items-center justify-between px-6 bg-[#252525]">
            <button 
              className="text-[10px] font-bold text-[#555] hover:text-[#ff5f56] flex items-center gap-2 transition-colors group"
              onClick={() => {
                setLines(prev => {
                  const reset = { ...prev };
                  Object.keys(reset).forEach(k => {
                    reset[Number(k)].text = "";
                    reset[Number(k)].fontSize = 16;
                  });
                  return reset;
                });
                addLog("Reset de todos os campos efetuado.");
              }}
            >
              <RotateCcw size={14} className="group-hover:rotate-[-120deg] transition-transform" /> RESETAR TUDO
            </button>
            <button 
              className="bg-[#2680EB] hover:bg-[#1266C7] text-white text-[11px] font-black px-10 h-9 rounded-lg flex items-center gap-3 shadow-[0_4px_15px_rgba(38,128,235,0.3)] transition-all active:scale-95 active:shadow-inner"
              onClick={handleApply}
            >
              <Play size={14} fill="currentColor" /> APLICAR NO PHOTOSHOP
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Index;