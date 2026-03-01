"use client";
import { useState } from "react";

interface AddCardModalProps {
  isOpen: boolean;
  onClose: () => void;
  // ATUALIZADO: Agora enviamos a cor também para a página principal guardar no banco
  onSave: (serial: string, numbers: (number | 'LIVRE')[], color: string) => Promise<void>;
}

export default function AddCardModal({ isOpen, onClose, onSave }: AddCardModalProps) {
  const [serial, setSerial] = useState("");
  const [error, setError] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [color, setColor] = useState("jornal"); // NOVO ESTADO: A cor da cartela

  const [grid, setGrid] = useState<string[]>(() => {
    const initial = Array(25).fill("");
    initial[12] = "LIVRE";
    return initial;
  });

  if (!isOpen) return null;

  const ranges = [
    { letter: 'B', min: 1, max: 15 },
    { letter: 'I', min: 16, max: 30 },
    { letter: 'N', min: 31, max: 45 },
    { letter: 'G', min: 46, max: 60 },
    { letter: 'O', min: 61, max: 75 },
  ];

  const handleChange = (index: number, value: string) => {
    if (index === 12) return;
    const newGrid = [...grid];
    newGrid[index] = value;
    setGrid(newGrid);
    setError("");
  };

  const handleSubmit = async () => {
    if (!serial.trim()) {
      setError("Digite o número de série da cartela.");
      return;
    }

    const finalNumbers: (number | 'LIVRE')[] = [];
    const seenNumbers = new Set<number>();

    for (let i = 0; i < 25; i++) {
      if (i === 12) {
        finalNumbers.push('LIVRE');
        continue;
      }

      const val = grid[i];
      if (val === "") {
        setError("Preencha todos os espaços da cartela!");
        return;
      }

      const num = parseInt(val);
      const col = i % 5;
      const { letter, min, max } = ranges[col];

      if (isNaN(num) || num < min || num > max) {
        setError(`Erro na coluna ${letter}: O número ${num || 'vazio'} deve ser entre ${min} e ${max}.`);
        return;
      }

      if (seenNumbers.has(num)) {
        setError(`Atenção: O número ${num} está repetido na cartela!`);
        return;
      }

      seenNumbers.add(num);
      finalNumbers.push(num);
    }

    setIsSaving(true);
    // ATUALIZADO: Passamos a cor escolhida para a função de guardar
    await onSave(serial, finalNumbers, color);
    setIsSaving(false);

    setSerial("");
    setColor("jornal"); // Volta para o padrão
    setGrid(() => {
      const initial = Array(25).fill("");
      initial[12] = "LIVRE";
      return initial;
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-lg border-2 border-indigo-500 animate-fade-in max-h-[90vh] overflow-y-auto">

        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-black text-indigo-800 flex items-center gap-2">
            📝 Cadastrar Cartela
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-red-500 font-bold text-xl">✕</button>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex-1">
            <label className="block text-sm font-bold text-gray-600 mb-2 uppercase tracking-wider">Número de Série</label>
            <input
              type="text"
              value={serial}
              onChange={(e) => { setSerial(e.target.value); setError(""); }}
              placeholder="Ex: 15482"
              className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-4 focus:ring-indigo-100 outline-none font-bold text-indigo-900 text-lg"
            />
          </div>

          {/* NOVO CAMPO: Seleção da Cor da Cartela */}
          <div className="flex-1">
            <label className="block text-sm font-bold text-gray-600 mb-2 uppercase tracking-wider">Cor da Cartela</label>
            <select
              value={color}
              onChange={(e) => setColor(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-4 focus:ring-indigo-100 outline-none font-bold text-indigo-900 text-lg bg-white"
            >
              <option value="jornal">Jornal (Padrão)</option>
              <option value="verde">Verde (Extra)</option>
              <option value="rosa">Rosa (Extra)</option>
              <option value="amarelo">Amarelo (Extra)</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-5 gap-2 text-center mb-2">
          {ranges.map(r => (
            <div key={r.letter} className="flex flex-col">
              <span className="font-black text-indigo-900 text-xl">{r.letter}</span>
              <span className="text-[10px] font-bold text-gray-400">{r.min}-{r.max}</span>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-5 gap-2 mb-6">
          {grid.map((val, i) => (
            <input
              key={i}
              type={i === 12 ? "text" : "number"}
              value={val}
              disabled={i === 12}
              onChange={(e) => handleChange(i, e.target.value)}
              className={`aspect-square w-full rounded-xl text-center font-bold text-lg outline-none transition-all ${i === 12
                  ? 'bg-indigo-600 text-white shadow-inner cursor-not-allowed text-xs sm:text-lg'
                  : 'bg-gray-50 border border-gray-200 text-indigo-900 focus:ring-2 focus:ring-indigo-400 focus:bg-white'
                }`}
            />
          ))}
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-300 text-red-700 rounded-xl font-bold text-center animate-shake">
            ⚠️ {error}
          </div>
        )}

        <div className="flex justify-end gap-3 mt-4">
          <button onClick={onClose} className="px-6 py-3 rounded-xl font-bold text-gray-500 hover:bg-gray-100 transition-all">Cancelar</button>
          <button
            onClick={handleSubmit}
            disabled={isSaving}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3 rounded-xl font-bold transition-all shadow-lg disabled:opacity-50"
          >
            {isSaving ? 'A guardar...' : 'Guardar no Banco'}
          </button>
        </div>

      </div>
    </div>
  );
}