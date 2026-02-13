"use client";

import React, { useState } from "react";
import { Settings, Play, RotateCcw, X, Layout } from "lucide-react";
import DialogueList from "../components/DialogueList";
import LogConsole from "../components/LogConsole";
import BalloonPreviewCard from "../components/BalloonPreviewCard";
import PropertiesSidebar from "../components/PropertiesSidebar";

interface Effects {
  stroke: boolean;
  shadow: boolean;
  glow: boolean;
}

interface LineData {
  id: number;
  text: string;
  fontSize: number;
  fontFamily: string;
  alignment: 'left' | 'center' | 'right';
  uppercase: boolean;
  verticalScale: number;
  lineHeight: number;
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
        fontSize: 18,
        fontFamily: '"Comic Sans MS", sans-serif',
        alignment: 'center',
        uppercase: true,
        verticalScale: 1.15,
        lineHeight: 0.92,
        style: "circle", 
        effects: { stroke: false, shadow: false, glow: false } 
      };
    }
    return initialState;
  });

  const [activeLineId, setActiveLineId] = useState<number | null>(1);
  const [logs, setLogs] = useState([{ type: 'info', time: new Date().toLocaleTimeString(), msg: "Interface Photoshop carregada." }]);

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
    addLog(`Exportando ${activeLines.length} camadas para o Photoshop...`, 'info');
    setTimeout(() => { addLog("Sucesso: Tipografia sincronizada com o documento ativo.", 'success'); }, 1000);
  };

  return (
    <div className="h-screen w-screen bg-[#1e1e1e] flex items-center justify-center overflow-hidden">
      <div className="w-full h-full bg-[#3E3E3E] flex flex-col overflow-hidden">
        
        {/* TOP BAR */}
        <div className="h-10 border-b border-[#252525] flex items-center justify-between px-4 bg-[#2e2e2e] shrink-0">
          <div className="flex items-center gap-4">
            <div className="flex gap-1.5">
              <div className="w-3 h-3 rounded-full bg-[#ff5f56]"></div>
              <div className="w-3 h-3 rounded-full bg-[#ffbd2e]"></div>
              <div className="w-3 h-3 rounded-full bg-[#27c93f]"></div>
            </div>
            <div className="w-px h-4 bg-[#444]"></div>
            <div className="flex items-center gap-2">
              <Layout size={14} className="text-[#2680EB]" />
              <span className="font-black text-[10px] tracking-widest uppercase text-[#eee]">Manhwa Tipo <span className="text-[#666] ml-1">v2.0</span></span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1 px-2 py-0.5 bg-[#1a1a1a] rounded border border-[#444]">
              <div className="w-1.5 h-1.5 rounded-full bg-[#2DCE89] animate-pulse" />
              <span className="text-[8px] font-bold text-[#999] uppercase">PS Link Active</span>
            </div>
            <Settings size={14} className="text-[#777] cursor-pointer hover:text-white transition-colors" />
            <X size={16} className="text-[#777] cursor-pointer hover:text-white transition-colors" />
          </div>
        </div>

        {/* MAIN WORKSPACE */}
        <div className="flex-1 flex overflow-hidden">
          <DialogueList 
            lines={lines} 
            activeLineId={activeLineId} 
            onSelect={setActiveLineId} 
            onInputChange={handleInputChange} 
          />

          <div className="flex-1 flex flex-col bg-[#1a1a1a] relative">
            <div className="absolute top-4 left-4 z-10">
              <span className="bg-[#2a2a2a]/80 backdrop-blur px-3 py-1 rounded text-[9px] font-bold text-[#666] border border-[#444] uppercase tracking-tighter">
                Visualização em Tempo Real
              </span>
            </div>
            
            <div className="flex-1 overflow-y-auto p-12 space-y-6 custom-scrollbar">
              {activeLineId && (
                <div className="max-w-[500px] mx-auto animate-in fade-in zoom-in-95 duration-300">
                  {(['circle', 'square', 'rounded'] as const).map(style => (
                    <BalloonPreviewCard 
                      key={style}
                      style={style}
                      text={lines[activeLineId].text}
                      fontSize={lines[activeLineId].fontSize}
                      fontFamily={lines[activeLineId].fontFamily}
                      alignment={lines[activeLineId].alignment}
                      uppercase={lines[activeLineId].uppercase}
                      verticalScale={lines[activeLineId].verticalScale}
                      lineHeight={lines[activeLineId].lineHeight}
                      effects={lines[activeLineId].effects}
                      isSelected={lines[activeLineId].style === style}
                      onSelect={() => updateActiveLine({ style })}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>

          <PropertiesSidebar 
            activeLineId={activeLineId}
            data={activeLineId ? lines[activeLineId] : null}
            onUpdate={updateActiveLine}
            onToggleEffect={toggleEffect}
          />
        </div>

        {/* FOOTER */}
        <div className="h-[140px] bg-[#151515] border-t border-[#252525] flex flex-col shrink-0">
          <LogConsole logs={logs} />
          <div className="h-12 flex items-center justify-between px-6 bg-[#252525]">
            <button 
              className="text-[9px] font-black text-[#555] hover:text-[#ff5f56] flex items-center gap-2 transition-colors group"
              onClick={() => {
                setLines(prev => {
                  const reset = { ...prev };
                  Object.keys(reset).forEach(k => {
                    reset[Number(k)].text = "";
                  });
                  return reset;
                });
                addLog("Campos de texto limpos.");
              }}
            >
              <RotateCcw size={12} className="group-hover:rotate-[-120deg] transition-transform" /> LIMPAR TEXTOS
            </button>
            
            <div className="flex items-center gap-4">
              <div className="text-[9px] text-[#555] font-bold uppercase">
                {Object.values(lines).filter(l => l.text).length} Balões Prontos
              </div>
              <button 
                className="bg-[#2680EB] hover:bg-[#1266C7] text-white text-[10px] font-black px-8 h-8 rounded flex items-center gap-2 shadow-[0_4px_12px_rgba(38,128,235,0.2)] transition-all active:scale-95"
                onClick={handleApply}
              >
                <Play size={12} fill="currentColor" /> SINCRONIZAR COM PS
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Index;