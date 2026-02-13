"use client";

import React from "react";
import { Type, Layers, Sparkles, Shadow as ShadowIcon, Square } from "lucide-react";

interface Effects {
  stroke: boolean;
  shadow: boolean;
  glow: boolean;
}

interface PropertiesSidebarProps {
  fontSize: number;
  effects: Effects;
  onFontSizeChange: (val: number) => void;
  onToggleEffect: (eff: keyof Effects) => void;
  activeLineId: number | null;
}

const EffectPreview = ({ label, active, onClick, icon: Icon, previewStyle }: any) => (
  <div 
    onClick={onClick}
    className={`group cursor-pointer p-3 rounded-lg border transition-all ${active ? 'bg-[#2680EB]/10 border-[#2680EB]' : 'bg-[#2a2a2a] border-[#333] hover:border-[#444]'}`}
  >
    <div className="flex items-center justify-between mb-2">
      <div className="flex items-center gap-2">
        <Icon size={14} className={active ? 'text-[#2680EB]' : 'text-[#777]'} />
        <span className={`text-[10px] font-bold uppercase tracking-wider ${active ? 'text-white' : 'text-[#999]'}`}>{label}</span>
      </div>
      <div className={`w-2 h-2 rounded-full ${active ? 'bg-[#2680EB] shadow-[0_0_8px_#2680EB]' : 'bg-[#444]'}`} />
    </div>
    
    {/* Mini Preview Box */}
    <div className="h-12 bg-[#1a1a1a] rounded border border-[#222] flex items-center justify-center overflow-hidden">
      <div 
        className="w-6 h-6 bg-white border-2 border-black flex items-center justify-center text-[10px] font-black text-black"
        style={previewStyle}
      >
        A
      </div>
    </div>
  </div>
);

const PropertiesSidebar = ({ fontSize, effects, onFontSizeChange, onToggleEffect, activeLineId }: PropertiesSidebarProps) => {
  if (!activeLineId) return (
    <div className="w-[280px] bg-[#333] border-l border-[#252525] flex items-center justify-center text-[#666] text-[10px] uppercase font-bold">
      Selecione uma linha
    </div>
  );

  return (
    <div className="w-[280px] bg-[#333] border-l border-[#252525] flex flex-col overflow-y-auto">
      <div className="p-3 border-b border-[#252525] bg-[#2a2a2a] text-[10px] font-black uppercase text-[#989898] flex items-center gap-2">
        <Layers size={14} /> Propriedades
      </div>

      {/* FONT SIZE SECTION */}
      <div className="p-4 border-b border-[#252525]">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2 text-[#999]">
            <Type size={14} />
            <span className="text-[10px] font-bold uppercase">Tamanho da Fonte</span>
          </div>
          <span className="text-[11px] font-mono text-[#2680EB] bg-[#1a1a1a] px-2 py-0.5 rounded border border-[#444]">{fontSize}px</span>
        </div>
        <input 
          type="range" min="10" max="50" 
          value={fontSize}
          onChange={(e) => onFontSizeChange(parseInt(e.target.value))}
          className="w-full h-1.5 bg-[#1a1a1a] rounded-lg appearance-none cursor-pointer accent-[#2680EB]"
        />
      </div>

      {/* EFFECTS SECTION */}
      <div className="p-4 space-y-3">
        <div className="flex items-center gap-2 text-[#999] mb-1">
          <Sparkles size={14} />
          <span className="text-[10px] font-bold uppercase">Efeitos de Camada</span>
        </div>

        <EffectPreview 
          label="Stroke (Contorno)"
          active={effects.stroke}
          onClick={() => onToggleEffect('stroke')}
          icon={Square}
          previewStyle={{ WebkitTextStroke: effects.stroke ? '1.5px black' : '0px' }}
        />

        <EffectPreview 
          label="Drop Shadow"
          active={effects.shadow}
          onClick={() => onToggleEffect('shadow')}
          icon={ShadowIcon}
          previewStyle={{ boxShadow: effects.shadow ? '3px 3px 0px rgba(0,0,0,0.3)' : 'none' }}
        />

        <EffectPreview 
          label="Outer Glow"
          active={effects.glow}
          onClick={() => onToggleEffect('glow')}
          icon={Sparkles}
          previewStyle={{ textShadow: effects.glow ? '0 0 5px #2680EB' : 'none' }}
        />
      </div>

      <div className="mt-auto p-4 bg-[#2a2a2a] border-t border-[#252525]">
        <p className="text-[9px] text-[#666] leading-tight">
          DICA: Os efeitos são aplicados individualmente por balão no Photoshop.
        </p>
      </div>
    </div>
  );
};

export default PropertiesSidebar;