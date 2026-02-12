"use client";

import React from "react";

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
    <div className="w-[350px] flex flex-col border-r border-[#292929] bg-[#333]">
      <div className="p-3 border-b border-[#292929] bg-[#2a2a2a] text-[10px] font-bold uppercase text-[#989898] flex justify-between">
        <span>Lista de Diálogos</span>
        <span>{Object.values(lines).filter(l => l.text).length}/10</span>
      </div>
      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {Object.values(lines).map(line => (
          <div 
            key={line.id} 
            onClick={() => onSelect(line.id)}
            className={`flex items-center gap-2 p-2 rounded cursor-pointer transition-colors ${activeLineId === line.id ? 'bg-[#2680EB]/15 border border-[#2680EB]' : 'border border-transparent hover:bg-white/5'}`}
          >
            <span className={`w-5 text-center font-bold text-[11px] ${activeLineId === line.id ? 'text-[#2680EB]' : 'text-[#666]'}`}>{line.id}</span>
            <input 
              className="flex-1 bg-[#232323] border border-[#505050] text-[#F5F5F5] h-7 px-2 rounded text-xs outline-none focus:border-[#2680EB]"
              placeholder="Digite o texto..."
              value={line.text}
              onChange={(e) => onInputChange(line.id, e.target.value)}
              onFocus={() => onSelect(line.id)}
            />
            {line.text && <div className="w-1.5 h-1.5 rounded-full bg-[#2DCE89]" />}
          </div>
        ))}
      </div>
    </div>
  );
};

export default DialogueList;