"use client";

import React from "react";
import { Type, Layers, Sparkles, Copy, Square, ChevronRight, RotateCcw } from "lucide-react";

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

const EffectCard = ({ label, active, onClick, icon: Icon, textStyle, previewLabel }: any) => (
  <div 
    onClick={onClick}
    className={`group relative cursor-pointer p-3 rounded-lg border transition-all duration-200 ${
      active 
        ? 'bg-[#2680EB]/10 border-[#2680EB] shadow-[inset_0_0_12px_rgba(38,128,235,0.1)]' 
        : 'bg-[#2a2a2a] border-[#383838] hover:border-[#555] hover:bg-[#2f2f2f]'
    }`}
  >
    <div className="flex items-center justify-between mb-3">
      <div className="flex items-center gap-2.5">
        <div className={`p-1.5 rounded ${active ? 'bg-[#2680EB] text-white' : 'bg-[#1a1a1a] text-[#777]'}`}>
          <Icon size={12} />
        </div>
        <span className={`text-[10px] font-bold uppercase tracking-tight ${active ? 'text-white' : 'text-[#aaa]'}`}>
          {label}
        </span>
      </div>
      <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-colors ${active ? 'border-[#2680EB] bg-[#2680EB]' : 'border-[#444]'}`}>
        {active && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
      </div>
    </div>
    
    <div className="relative h-16 bg-[#111] rounded-md border border-[#222] flex items-center justify-center overflow-hidden group-hover:border-[#444] transition-colors">
      <div className="absolute inset-0 opacity-5 checkerboard" />
      <span 
        className="relative z-10 text-lg font-black transition-transform group-hover:scale-110 select-none"
        style={{
          color: 'white',
          ...textStyle
        }}
      >
        {previewLabel || "TEXT"}
      </span>
    </div>
  </div>
);

const PropertiesSidebar = ({ fontSize, effects, onFontSizeChange, onToggleEffect, activeLineId }: PropertiesSidebarProps) => {
  if (!activeLineId) return (
    <div className="w-[300px] bg-[#333] border-l border-[#252525] flex flex-col items-center justify-center p-8 text-center">
      <div className="w-12 h-12 rounded-full bg-[#2a2a2a] flex items-center justify-center mb-4 border border-[#444]">
        <Layers size={20} className="text-[#555]" />
      </div>
      <p className="text-[10px] font-bold uppercase text-[#666] tracking-widest">Nenhum Balão Selecionado</p>
      <p className="text-[9px] text-[#555] mt-2">Selecione uma linha na lista à esquerda para editar suas propriedades.</p>
    </div>
  );

  return (
    <div className="w-[300px] bg-[#333] border-l border-[#252525] flex flex-col overflow-hidden">
      {/* HEADER */}
      <div className="p-3 border-b border-[#252525] bg-[#2a2a2a] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 bg-[#2680EB] rounded flex items-center justify-center">
            <Layers size={12} className="text-white" />
          </div>
          <span className="text-[10px] font-black uppercase text-[#eee] tracking-wider">Propriedades</span>
        </div>
        <span className="text-[9px] font-bold text-[#2680EB] bg-[#2680EB]/10 px-2 py-0.5 rounded border border-[#2680EB]/20">
          ID: {activeLineId}
        </span>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar">
        {/* FONT SECTION */}
        <div className="p-5 border-b border-[#252525] space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-[#aaa]">
              <Type size={14} />
              <span className="text-[10px] font-black uppercase tracking-tighter">Tipografia</span>
            </div>
            <div className="flex items-center gap-1">
              <input 
                type="number" 
                value={fontSize}
                onChange={(e) => onFontSizeChange(Math.max(8, Math.min(100, parseInt(e.target.value) || 18)))}
                className="w-12 bg-[#1a1a1a] border border-[#444] text-[#2680EB] text-[11px] font-mono text-center py-0.5 rounded focus:border-[#2680EB] outline-none"
              />
              <span className="text-[9px] font-bold text-[#555]">PX</span>
            </div>
          </div>

          <div className="space-y-3">
            <input 
              type="range" min="10" max="60" 
              value={fontSize}
              onChange={(e) => onFontSizeChange(parseInt(e.target.value))}
              className="w-full h-1 bg-[#1a1a1a] rounded-lg appearance-none cursor-pointer accent-[#2680EB]"
            />
            <div className="flex justify-between gap-1">
              {[14, 18, 24, 32, 48].map(size => (
                <button 
                  key={size}
                  onClick={() => onFontSizeChange(size)}
                  className={`flex-1 py-1 text-[9px] font-bold rounded border transition-colors ${fontSize === size ? 'bg-[#2680EB] border-[#2680EB] text-white' : 'bg-[#2a2a2a] border-[#444] text-[#777] hover:border-[#666]'}`}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* EFFECTS SECTION */}
        <div className="p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-[#aaa]">
              <Sparkles size={14} />
              <span className="text-[10px] font-black uppercase tracking-tighter">Estilos de Camada</span>
            </div>
            <button className="text-[#555] hover:text-[#aaa] transition-colors">
              <RotateCcw size={12} />
            </button>
          </div>

          <div className="grid grid-cols-1 gap-3">
            <EffectCard 
              label="Stroke (Contorno)"
              active={effects.stroke}
              onClick={() => onToggleEffect('stroke')}
              icon={Square}
              previewLabel="STROKE"
              textStyle={{ 
                WebkitTextStroke: effects.stroke ? '1.5px #2680EB' : '0px',
                color: effects.stroke ? 'transparent' : 'white'
              }}
            />

            <EffectCard 
              label="Drop Shadow"
              active={effects.shadow}
              onClick={() => onToggleEffect('shadow')}
              icon={Copy}
              previewLabel="SHADOW"
              textStyle={{ 
                textShadow: effects.shadow ? '4px 4px 0px rgba(38, 128, 235, 0.6)' : 'none' 
              }}
            />

            <EffectCard 
              label="Outer Glow"
              active={effects.glow}
              onClick={() => onToggleEffect('glow')}
              icon={Sparkles}
              previewLabel="GLOW"
              textStyle={{ 
                textShadow: effects.glow ? '0 0 10px #2680EB, 0 0 20px #2680EB' : 'none' 
              }}
            />
          </div>
        </div>
      </div>

      {/* FOOTER INFO */}
      <div className="p-4 bg-[#252525] border-t border-[#1a1a1a]">
        <div className="flex items-start gap-3">
          <div className="mt-0.5 text-[#2680EB]">
            <ChevronRight size={12} />
          </div>
          <p className="text-[9px] text-[#777] leading-relaxed font-medium">
            Estes estilos serão convertidos em <span className="text-[#aaa]">Layer Styles</span> nativos ao sincronizar com o Photoshop.
          </p>
        </div>
      </div>
    </div>
  );
};

export default PropertiesSidebar;