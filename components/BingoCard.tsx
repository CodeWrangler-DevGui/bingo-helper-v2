"use client";
import { useState, useMemo, useCallback } from 'react';

export default function BingoCard({ 
  serialNumber, 
  numbers,
  color = "jornal",
  drawnNumbers = [],
  activeRoundColor = "todas",
  activeRule = "cheia",
  onDelete 
}: { 
  serialNumber: string, 
  numbers: (number | 'LIVRE')[],
  color?: string,
  drawnNumbers?: number[],
  activeRoundColor?: string,
  activeRule?: string,
  onDelete?: (serial: string) => void 
}) {
  const [marked, setMarked] = useState<(number | 'LIVRE')[]>(['LIVRE']);

  const isActiveRound = activeRoundColor === "todas" || activeRoundColor === color;

  const toggleMark = (num: number | 'LIVRE') => {
    if (num === 'LIVRE' || !isActiveRound) return;
    setMarked(prev => prev.includes(num) ? prev.filter(n => n !== num) : [...prev, num]);
  };

  const isMarked = useCallback((num: number | 'LIVRE') => {
    if (num === 'LIVRE') return true;
    const locutorMarcou = isActiveRound && drawnNumbers.includes(num);
    return marked.includes(num) || locutorMarcou;
  }, [marked, drawnNumbers, isActiveRound]);

  const winStatus = useMemo(() => {
    const grid = numbers.map(n => isMarked(n));

    const corners = grid[0] && grid[4] && grid[20] && grid[24];
    const diag1 = grid[0] && grid[6] && grid[12] && grid[18] && grid[24];
    const diag2 = grid[4] && grid[8] && grid[12] && grid[16] && grid[20];
    const diagonal = diag1 || diag2;

    let horizontal = false;
    for (let i = 0; i < 5; i++) {
      if (grid[i*5] && grid[i*5+1] && grid[i*5+2] && grid[i*5+3] && grid[i*5+4]) horizontal = true;
    }

    let vertical = false;
    for (let i = 0; i < 5; i++) {
      if (grid[i] && grid[i+5] && grid[i+10] && grid[i+15] && grid[i+20]) vertical = true;
    }

    const full = grid.every(Boolean);

    if (activeRule === 'cheia' && full) return "CARTELA CHEIA";
    if (activeRule === 'cantos' && corners) return "4 CANTOS";
    if (activeRule === 'horizontal' && horizontal) return "LINHA HORIZONTAL";
    if (activeRule === 'vertical' && vertical) return "LINHA VERTICAL";
    if (activeRule === 'diagonal' && diagonal) return "DIAGONAL";
    
    if (activeRule === 'especial') {
      if (corners) return "4 CANTOS";
      if (diagonal) return "DIAGONAL";
      if (horizontal) return "LINHA HORIZONTAL";
      if (vertical) return "LINHA VERTICAL";
    }

    return null; 
  }, [numbers, isMarked, activeRule]);

  const allThemes: Record<string, { bg: string, text: string, border: string, active: string }> = {
    jornal: { bg: 'bg-gray-50', text: 'text-gray-800', border: 'border-gray-300', active: 'bg-gray-800 text-white' },
    verde: { bg: 'bg-green-50', text: 'text-green-900', border: 'border-green-300', active: 'bg-green-600 text-white' },
    rosa: { bg: 'bg-pink-50', text: 'text-pink-900', border: 'border-pink-300', active: 'bg-pink-600 text-white' },
    amarelo: { bg: 'bg-yellow-50', text: 'text-yellow-900', border: 'border-yellow-400', active: 'bg-yellow-600 text-white' },
  };

  const theme = allThemes[color] || allThemes.jornal;
  const opacityClass = isActiveRound ? 'opacity-100' : 'opacity-50 grayscale scale-95';

  return (
    <div className={`p-5 rounded-2xl shadow-lg border-2 transition-all duration-500 relative ${theme.bg} ${theme.border} ${opacityClass} ${
      winStatus ? 'ring-4 ring-yellow-400 scale-105 shadow-yellow-200 z-20' : ''
    }`}>
      
      {onDelete && (
        <button onClick={() => onDelete(serialNumber)} className="absolute -top-3 -right-3 bg-red-100 hover:bg-red-500 text-red-600 hover:text-white rounded-full w-8 h-8 flex items-center justify-center font-bold shadow-sm transition-colors border border-red-200 z-30">✕</button>
      )}

      <div className={`flex flex-col mb-4 border-b-2 pb-2 ${theme.border}`}>
        <div className="flex justify-between items-center w-full">
          <h2 className={`text-2xl font-black tracking-widest ${winStatus ? 'text-yellow-600 animate-pulse' : theme.text}`}>
            {winStatus ? '🏆 BINGO!' : 'BINGO'}
          </h2>
          <span className={`text-sm font-mono font-bold px-2 py-1 rounded bg-white/60 ${theme.text}`}>
            Nº {serialNumber}
          </span>
        </div>
        {winStatus && (
          <span className="text-center bg-yellow-400 text-yellow-900 font-black text-xs uppercase px-2 py-1 mt-2 rounded-lg animate-bounce shadow-sm">
            BATIDA: {winStatus}
          </span>
        )}
      </div>
      
      <div className={`grid grid-cols-5 gap-2 text-center mb-2 font-black text-lg ${theme.text}`}>
        <span>B</span><span>I</span><span>N</span><span>G</span><span>O</span>
      </div>
      
      <div className="grid grid-cols-5 gap-2 text-center relative">
        {!isActiveRound && (
          <div className="absolute inset-0 z-10 flex items-center justify-center">
            <span className="bg-black/70 text-white font-bold px-4 py-2 rounded-lg rotate-12 backdrop-blur-sm shadow-xl">
              FORA DA RODADA
            </span>
          </div>
        )}

        {numbers.map((n, i) => (
          <button
            key={i}
            onClick={() => toggleMark(n)}
            disabled={!isActiveRound}
            className={`aspect-square flex items-center justify-center rounded-xl font-bold text-lg transition-all duration-200 ${
              isMarked(n)
                ? `${theme.active} scale-95 shadow-inner ring-1 ring-black/10` 
                : 'bg-white/70 text-gray-800 hover:bg-white hover:shadow-md'
            }`}
          >
            {n === 'LIVRE' ? '★' : n}
          </button>
        ))}
      </div>
    </div>
  );
}