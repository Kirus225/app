"use client";

import React from "react";
import { MessageSquare, Trash2 } from "lucide-react";

interface LineData {
  id: number;
  text: string;
}

interface DialogueListProps {
  lines: Record<number, LineData>;
  activeLineId: number | null;
  onSelect: (id: number) => void;
  onInputChange: (id: number, val: string) => void;
}

const DialogueList = ({ lines, activeLineId, onSelect, onInputChange }: DialogueListProps) => {
  return (
    <div className="w-[320px] flex flex-col border-r border-[#252525] bg-[#2e2e2e]">
      <div className="p-3 border-b border-[#252525] bg-[#2a2a2a] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MessageSquare size={14} className="text-[#777]" />
          <span className="text-[10px] font-black uppercase text-[#989898] tracking-widest">Script / Diálogos</span>
        </div>
        <div className="px-2 py-0.5 rounded bg-[#1a1a1a] border border-[#444] text-[9px] font-mono text-[#2680EB]">
          {Object.values(lines).filter(l => l.text.trim()).length}/10
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-2 custom-scrollbar">
        {Object.values(lines).map(line => (
          <div 
            key={line.id} 
            onClick={() => onSelect(line.id)}
            className={`group relative flex flex-col gap-1.5 p-2.5 rounded-lg border transition-all duration-200 cursor-pointer ${
              activeLineId === line.id 
                ? 'bg-[#2680EB]/10 border-[#2680EB] shadow-[0_4px_12px_rgba(0,0,0,0.1)]' 
                : 'bg-[#252525] border-[#383838] hover:border-[#555]'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className={`text-[9px] font-black w-4 h-4 flex items-center justify-center rounded ${activeLineId === line.id ? 'bg-[#2680EB] text-white' : 'bg-[#1a1a1a] text-[#555]'}`}>
                  {line.id}
                </span>
                <span className={`text-[8px] font-bold uppercase tracking-tighter ${activeLineId === line.id ? 'text-[#2680EB]' : 'text-[#666]'}`}>
                  Camada de Texto
                </span>
              </div>
              {line.text && (
                <button 
                  onClick={(e) => { e.stopPropagation(); onInputChange(line.id, ""); }}
                  className="opacity-0 group-hover:opacity-100 p-1 hover:text-[#ff5f56] text-[#555] transition-all"
                >
                  <Trash2 size={10} />
                </button>
              )}
            </div>

            <div className="relative">
              <textarea 
                className={`w-full bg-[#1a1a1a] border border-[#444] text-[#eee] text-[11px] p-2 rounded-md outline-none focus:border-[#2680EB] transition-all resize-none h-14 custom-scrollbar ${activeLineId === line.id ? 'border-[#2680EB]/50' : ''}`}
                placeholder="Insira o diálogo aqui..."
                value={line.text}
                onChange={(e) => onInputChange(line.id, e.target.value)}
                onFocus={() => onSelect(line.id)}
              />
              {!line.text && (
                <div className="absolute right-2 bottom-2 w-1.5 h-1.5 rounded-full bg-[#ffbd2e] animate-pulse" />
              )}
              {line.text && (
                <div className="absolute right-2 bottom-2 w-1.5 h-1.5 rounded-full bg-[#2DCE89]" />
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DialogueList;