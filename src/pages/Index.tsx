"use client";

import React, { useState } from "react";
import { Settings, Play, RotateCcw, X } from "lucide-react";
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
  style: 'circle' | 'square' | 'rounded';
  effects: Effects;
}

const Index = () => {
  const [lines, setLines] = useState<Record<number, LineData>>(() => {
    const initialState: Record<number, LineData> = {};
    for (let i = 1; i <= 10; i++) {
      initialState[i] = { id: i, text: "", style: "circle", effects: { stroke: false, shadow: false, glow: false } };
    }
    return initialState;
  });

  const [activeLineId, setActiveLineId] = useState<number | null>(1);
  const [logs, setLogs] = useState([{ type: 'info', time: new Date().toLocaleTimeString(), msg: "Plugin pronto." }]);

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
    <div className="h-screen w-screen bg-[#323232] flex items-center justify-center p-4">
      <div className="w-full max-w-[1000px] h-full max-h-[750px] bg-[#3E3E3E] rounded-lg shadow-2xl border border-[#292929] flex flex-col overflow-hidden">
        
        {/* HEADER */}
        <div className="h-12 border-b border-[#292929] flex items-center justify-between px-4 bg-[#2e2e2e]">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-[#2DCE89] shadow-[0_0_6px_#2DCE89]"></div>
            <div className="w-px h-4 bg-[#555]"></div>
            <span className="font-bold text-xs tracking-wider uppercase text-[#F5F5F5]">Manhwa Tipo</span>
            <span className="text-[10px] text-[#666]">v1.5</span>
          </div>
          <div className="flex items-center gap-4">
            <Settings size={16} className="text-[#989898] cursor-pointer hover:text-white" />
            <X size={18} className="text-[#989898] cursor-pointer hover:text-white" />
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
              {activeLineId && (
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
        <div className="h-[140px] bg-[#202020] border-t border-[#292929] flex flex-col">
          <LogConsole logs={logs} />
          <div className="h-12 flex items-center justify-between px-4 bg-[#2e2e2e]">
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
              className="bg-[#2680EB] hover:bg-[#1266C7] text-white text-xs font-bold px-8 h-8 rounded flex items-center gap-2 shadow-lg transition-all active:scale-95"
              onClick={handleApply}
            >
              <Play size={12} fill="currentColor" /> Aplicar no Photoshop
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Index;