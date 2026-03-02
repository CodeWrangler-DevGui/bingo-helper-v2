"use client";
import { useMemo, useEffect, useRef } from "react";

interface BingoCardProps {
  serialNumber: string;
  numbers: (number | 'LIVRE')[];
  color: string;
  drawnNumbers: number[];
  activeRoundColor: string;
  activeRule: string;
  onDelete: (serial: string) => void;
}

export default function BingoCard({ 
  serialNumber, numbers, color, drawnNumbers, activeRoundColor, activeRule, onDelete 
}: BingoCardProps) {
  
  const cardRef = useRef<HTMLDivElement>(null);

  // Verifica se a cartela está participando da rodada atual
  const isOutOfRound = activeRoundColor !== "todas" && activeRoundColor !== color;

  const isWinner = useMemo(() => {
    // Se estiver fora da rodada, não tem como ganhar
    if (isOutOfRound) return false;

    const isMarked = (idx: number) => numbers[idx] === 'LIVRE' || drawnNumbers.includes(numbers[idx] as number);

    switch (activeRule) {
      case "cheia":
        return numbers.every((_, i) => isMarked(i));
      case "cantos":
        return [0, 4, 20, 24].every(isMarked);
      case "horizontal":
        for (let row = 0; row < 5; row++) {
          if ([0, 1, 2, 3, 4].every(col => isMarked(row * 5 + col))) return true;
        }
        return false;
      case "vertical":
        for (let col = 0; col < 5; col++) {
          if ([0, 1, 2, 3, 4].every(row => isMarked(row * 5 + col))) return true;
        }
        return false;
      case "diagonal":
        const diag1 = [0, 6, 12, 18, 24].every(isMarked);
        const diag2 = [4, 8, 12, 16, 20].every(isMarked);
        return diag1 || diag2;
      case "especial":
        return [0, 4, 6, 8, 12, 16, 18, 20, 24].every(isMarked);
      default:
        return false;
    }
  // 👉 CORREÇÃO 1: Tiramos o 'color' da lista de dependências
  }, [numbers, drawnNumbers, isOutOfRound, activeRule]); 

  useEffect(() => {
    if (isWinner && cardRef.current) {
      cardRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [isWinner]);

  const colorStyles = {
    jornal: "border-gray-200 bg-white",
    verde: "border-green-300 bg-green-50/50",
    rosa: "border-pink-300 bg-pink-50/50",
    amarelo: "border-yellow-300 bg-yellow-50/50"
  }[color] || "border-gray-200 bg-white";

  return (
    <div 
      ref={cardRef} 
      className={`relative p-5 rounded-2xl border-2 transition-all duration-500 
      ${colorStyles} 
      ${isWinner ? 'scale-105 ring-4 ring-yellow-400 shadow-2xl shadow-yellow-400/30 z-10' : 'shadow-sm hover:shadow-md'}
      ${isOutOfRound ? 'opacity-60 grayscale-50' : ''}`} // 👉 CORREÇÃO 2: grayscale-50
    >
      <button 
        onClick={() => onDelete(serialNumber)} 
        className="absolute -top-3 -right-3 bg-white text-red-400 rounded-full p-1.5 border border-red-100 hover:bg-red-500 hover:text-white transition-colors shadow-sm z-30"
        title="Excluir Cartela"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
      </button>

      {isOutOfRound && (
        <div className="absolute inset-0 bg-slate-100/40 backdrop-blur-[1px] rounded-2xl flex items-center justify-center z-20 overflow-hidden">
          <span className="font-black text-slate-500 uppercase tracking-widest border-2 border-slate-300 px-4 py-2 rounded-xl bg-white/90 -rotate-12 shadow-sm">
            Fora de Rodada
          </span>
        </div>
      )}

      {isWinner && (
        <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px] rounded-2xl flex items-center justify-center z-20 overflow-hidden">
          <div className="animate-bounce flex flex-col items-center -rotate-12">
            <span className="text-5xl font-black text-yellow-400 drop-shadow-[0_0_20px_rgba(250,204,21,1)] tracking-widest border-4 border-yellow-400 px-6 py-3 rounded-2xl bg-black/50 uppercase mb-2">
              Bingo!
            </span>
            <span className="text-xl font-black text-white bg-slate-900 px-5 py-2 rounded-xl border-2 border-yellow-400 drop-shadow-[0_0_10px_rgba(250,204,21,0.5)]">
              Nº {serialNumber}
            </span>
          </div>
        </div>
      )}

      <div className="flex justify-between items-end mb-4 border-b border-gray-200 pb-3">
        <h3 className="text-2xl font-black text-slate-800 tracking-[0.3em]">BINGO</h3>
        <span className="text-xs font-bold text-slate-500 bg-white px-2 py-1 rounded-lg shadow-sm border border-gray-100">
          Nº {serialNumber}
        </span>
      </div>

      <div className="grid grid-cols-5 gap-2 text-center">
        {['B', 'I', 'N', 'G', 'O'].map((letter, i) => (
          <div key={`letter-${i}`} className="font-black text-slate-800 mb-1 text-lg">{letter}</div>
        ))}

        {numbers.map((num, i) => {
          const isMarked = num === 'LIVRE' || drawnNumbers.includes(num as number);
          
          return (
            <div 
              key={`num-${i}`} 
              className={`aspect-square flex items-center justify-center rounded-xl font-bold text-sm sm:text-base transition-all duration-300
                ${isMarked 
                  ? 'bg-slate-800 text-white shadow-inner scale-95' 
                  : 'bg-white text-slate-700 border border-gray-100 hover:bg-gray-50'}`}
            >
              {isMarked ? (
                num === 'LIVRE' ? (
                  <span className="text-yellow-400 text-xl">★</span>
                ) : (
                  <span className="flex flex-col items-center">
                    <span>{num}</span>
                    <span className="text-[10px] text-yellow-400 -mt-1 leading-none">★</span>
                  </span>
                )
              ) : (
                num
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}