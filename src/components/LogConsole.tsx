"use client";

import React, { useEffect, useRef } from "react";

interface Log {
  type: string;
  time: string;
  msg: string;
}

interface LogConsoleProps {
  logs: Log[];
}

const LogConsole = ({ logs }: LogConsoleProps) => {
  const logEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [logs]);

  return (
    <div className="flex-1 p-2 overflow-y-auto bg-[#1a1a1a] font-mono text-[10px]">
      {logs.map((log, idx) => (
        <div key={idx} className={`mb-1 flex gap-2 ${log.type === 'error' ? 'text-[#ff6b6b]' : (log.type === 'success' ? 'text-[#69db7c]' : 'text-[#ced4da]')}`}>
          <span className="text-[#555]">[{log.time}]</span>
          <span>{log.msg}</span>
        </div>
      ))}
      <div ref={logEndRef} />
    </div>
  );
};

export default LogConsole;