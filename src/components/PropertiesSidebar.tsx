"use client";

import React from "react";
import { Type, Layers, Sparkles, Copy, Square, RotateCcw, CaseUpper, ArrowUpDown, Zap, Palette, Italic } from "lucide-react";

interface PropertiesSidebarProps {
  activeLineId: number | null;
  data: any;
  onUpdate: (updates: any) => void;
  onToggleEffect: (eff: any) => void;
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

const PropertiesSidebar = ({ activeLineId, data, onUpdate, onToggleEffect }: PropertiesSidebarProps) => {
  if (!activeLineId || !data) return (
    <div className="w-[300px] bg-[#333] border-l border-[#252525] flex flex-col items-center justify-center p-8 text-center">
      <div className="w-12 h-12 rounded-full bg-[#2a2a2a] flex items-center justify-center mb-4 border border-[#444]">
        <Layers size={20} className="text-[#555]" />
      </div>
      <p className="text-[10px] font-bold uppercase text-[#666] tracking-widest">Nenhum Balão Selecionado</p>
      <p className="text-[9px] text-[#555] mt-2">Selecione uma linha na lista à esquerda para editar suas propriedades.</p>
    </div>
  );

  const fonts = [
    { name: 'Comic Sans', value: '"Comic Sans MS", sans-serif' },
    { name: 'Wild Words', value: '"CC Wild Words", sans-serif' },
    { name: 'Bangers', value: '"Bangers", cursive' },
    { name: 'Arial Black', value: '"Arial Black", sans-serif' }
  ];

  const applyPreset = (type: 'shout' | 'thought' | 'narration') => {
    const presets = {
      shout: { fontSize: 32, verticalScale: 1.3, skew: -10, uppercase: true, effects: { stroke: true, shadow: true, glow: false }, color: "#ff0000" },
      thought: { fontSize: 16, verticalScale: 1.0, skew: 0, uppercase: false, effects: { stroke: false, shadow: false, glow: true }, color: "#000000" },
      narration: { fontSize: 18, verticalScale: 1.1, skew: 0, uppercase: true, effects: { stroke: false, shadow: false, glow: false }, color: "#ffffff" }
    };
    onUpdate(presets[type]);
  };

  return (
    <div className="w-[300px] bg-[#333] border-l border-[#252525] flex flex-col overflow-hidden">
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
        {/* PRESETS SECTION */}
        <div className="p-5 border-b border-[#252525] space-y-3">
          <div className="flex items-center gap-2 text-[#aaa]">
            <Zap size={14} className="text-[#ffbd2e]" />
            <span className="text-[10px] font-black uppercase tracking-tighter">Presets Rápidos</span>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <button onClick={() => applyPreset('shout')} className="bg-[#2a2a2a] border border-[#444] hover:border-[#ff5f56] text-[8px] font-black py-2 rounded uppercase text-[#aaa] hover:text-white transition-all">Grito</button>
            <button onClick={() => applyPreset('thought')} className="bg-[#2a2a2a] border border-[#444] hover:border-[#2680EB] text-[8px] font-black py-2 rounded uppercase text-[#aaa] hover:text-white transition-all">Pensar</button>
            <button onClick={() => applyPreset('narration')} className="bg-[#2a2a2a] border border-[#444] hover:border-[#2DCE89] text-[8px] font-black py-2 rounded uppercase text-[#aaa] hover:text-white transition-all">Narrar</button>
          </div>
        </div>

        {/* CHARACTER SECTION */}
        <div className="p-5 border-b border-[#252525] space-y-4">
          <div className="flex items-center gap-2 text-[#aaa]">
            <Type size={14} />
            <span className="text-[10px] font-black uppercase tracking-tighter">Caractere</span>
          </div>

          <div className="space-y-3">
            <div className="flex gap-2">
              <select 
                value={data.fontFamily}
                onChange={(e) => onUpdate({ fontFamily: e.target.value })}
                className="flex-1 bg-[#1a1a1a] border border-[#444] text-[#eee] text-[11px] p-2 rounded outline-none focus:border-[#2680EB]"
              >
                {fonts.map(f => <option key={f.value} value={f.value}>{f.name}</option>)}
              </select>
              <div className="relative w-10 h-9 bg-[#1a1a1a] border border-[#444] rounded overflow-hidden">
                <input 
                  type="color" value={data.color}
                  onChange={(e) => onUpdate({ color: e.target.value })}
                  className="absolute inset-0 w-full h-full cursor-pointer opacity-0"
                />
                <div className="w-full h-full" style={{ backgroundColor: data.color }} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1.5">
                <span className="text-[8px] font-bold text-[#666] uppercase px-1">Tamanho</span>
                <input 
                  type="number" value={data.fontSize}
                  onChange={(e) => onUpdate({ fontSize: parseInt(e.target.value) || 18 })}
                  className="w-full bg-[#1a1a1a] border border-[#444] text-[#eee] text-[11px] p-1.5 rounded text-center"
                />
              </div>
              <div className="space-y-1.5">
                <span className="text-[8px] font-bold text-[#666] uppercase px-1">Escala V</span>
                <input 
                  type="number" value={Math.round(data.verticalScale * 100)}
                  onChange={(e) => onUpdate({ verticalScale: (parseInt(e.target.value) || 100) / 100 })}
                  className="w-full bg-[#1a1a1a] border border-[#444] text-[#eee] text-[11px] p-1.5 rounded text-center"
                />
              </div>
              <div className="space-y-1.5">
                <span className="text-[8px] font-bold text-[#666] uppercase px-1">Tracking</span>
                <input 
                  type="number" value={data.letterSpacing}
                  onChange={(e) => onUpdate({ letterSpacing: parseInt(e.target.value) || 0 })}
                  className="w-full bg-[#1a1a1a] border border-[#444] text-[#eee] text-[11px] p-1.5 rounded text-center"
                />
              </div>
              <div className="space-y-1.5">
                <span className="text-[8px] font-bold text-[#666] uppercase px-1">Inclinação</span>
                <input 
                  type="number" value={data.skew}
                  onChange={(e) => onUpdate({ skew: parseInt(e.target.value) || 0 })}
                  className="w-full bg-[#1a1a1a] border border-[#444] text-[#eee] text-[11px] p-1.5 rounded text-center"
                />
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button 
                onClick={() => onUpdate({ uppercase: !data.uppercase })}
                className={`flex-1 py-2 flex items-center justify-center gap-2 rounded border transition-colors ${data.uppercase ? 'bg-[#2680EB] border-[#2680EB] text-white' : 'bg-[#2a2a2a] border-[#444] text-[#777] hover:border-[#666]'}`}
              >
                <CaseUpper size={14} />
                <span className="text-[9px] font-bold uppercase">Caixa Alta</span>
              </button>
            </div>
          </div>
        </div>

        {/* SPACING SECTION */}
        <div className="p-5 border-b border-[#252525] space-y-4">
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-1.5 text-[#aaa]">
              <ArrowUpDown size={14} />
              <span className="text-[10px] font-black uppercase tracking-tighter">Entrelinha</span>
            </div>
            <span className="text-[9px] font-mono text-[#2680EB]">{data.lineHeight.toFixed(2)}</span>
          </div>
          <input 
            type="range" min="0.5" max="2" step="0.05"
            value={data.lineHeight}
            onChange={(e) => onUpdate({ lineHeight: parseFloat(e.target.value) })}
            className="w-full h-1 bg-[#1a1a1a] rounded-lg appearance-none cursor-pointer accent-[#2680EB]"
          />
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
              active={data.effects.stroke}
              onClick={() => onToggleEffect('stroke')}
              icon={Square}
              previewLabel="STROKE"
              textStyle={{ 
                WebkitTextStroke: data.effects.stroke ? '1.5px #2680EB' : '0px',
                color: data.effects.stroke ? 'transparent' : 'white'
              }}
            />

            <EffectCard 
              label="Drop Shadow"
              active={data.effects.shadow}
              onClick={() => onToggleEffect('shadow')}
              icon={Copy}
              previewLabel="SHADOW"
              textStyle={{ 
                textShadow: data.effects.shadow ? '4px 4px 0px rgba(38, 128, 235, 0.6)' : 'none' 
              }}
            />

            <EffectCard 
              label="Outer Glow"
              active={data.effects.glow}
              onClick={() => onToggleEffect('glow')}
              icon={Sparkles}
              previewLabel="GLOW"
              textStyle={{ 
                textShadow: data.effects.glow ? '0 0 10px #2680EB, 0 0 20px #2680EB' : 'none' 
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default PropertiesSidebar;