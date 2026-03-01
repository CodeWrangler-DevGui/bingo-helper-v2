"use client";
import { useState, useEffect } from "react";
import BingoCard from "../components/BingoCard";
import AddCardModal from "../components/AddCardModal";
import { saveCard, getCards, deleteCard, deleteAllCards } from "../actions/bingo";

export default function Home() {
  const [cards, setCards] = useState<{ serial: string, numbers: (number | 'LIVRE')[], color: string }[]>([]);
  const [mounted, setMounted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [drawnNumbers, setDrawnNumbers] = useState<number[]>([]);
  const [stoneInput, setStoneInput] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  // ESTADOS DO LOCUTOR: Cor e Regra da Rodada
  const [activeRoundColor, setActiveRoundColor] = useState("todas");
  const [activeRule, setActiveRule] = useState("cheia"); // Começa com Cartela Cheia por padrão

  useEffect(() => {
    const fetchCards = async () => {
      const result = await getCards();
      if (result.success && result.cards) {
        const loadedCards = result.cards.map((c) => ({
          serial: c.serialNumber,
          numbers: c.numbers.map((n) => (n === 0 ? 'LIVRE' : n)),
          color: c.color || "jornal"
        }));
        setCards(loadedCards);
      }
      setIsLoading(false);
    };

    const timer = setTimeout(() => {
      setMounted(true);
      fetchCards();
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  const handleSaveManualCard = async (serial: string, numbers: (number | 'LIVRE')[], color: string) => {
    const result = await saveCard(serial, numbers, color);
    if (result.success) {
      setCards(prev => [...prev, { serial, numbers, color }]);
    } else {
      alert("Erro ao guardar a cartela na nuvem!");
    }
  };

  const handleDeleteCard = async (serial: string) => {
    if (!confirm(`Tem certeza que deseja excluir a cartela Nº ${serial}?`)) return;
    const result = await deleteCard(serial);
    if (result.success) {
      setCards(prev => prev.filter(c => c.serial !== serial));
    } else {
      alert("Erro ao excluir a cartela no banco de dados.");
    }
  };

  const handleDeleteAll = async () => {
    if (!confirm("⚠️ ATENÇÃO: Isso vai apagar TODAS as cartelas do banco de dados! Tem certeza?")) return;
    const result = await deleteAllCards();
    if (result.success) {
      setCards([]);
      setDrawnNumbers([]);
    } else {
      alert("Erro ao limpar o banco de dados.");
    }
  };

  const handleCallStone = (e: React.FormEvent) => {
    e.preventDefault();
    const num = parseInt(stoneInput);
    if (!num || num < 1 || num > 75) {
      alert("A pedra deve ser um número entre 1 e 75!");
      return;
    }
    if (drawnNumbers.includes(num)) {
      alert(`A pedra ${num} já foi cantada!`);
      setStoneInput("");
      return;
    }
    setDrawnNumbers(prev => [...prev, num]);
    setStoneInput("");
  };

  const filteredCards = cards.filter(card =>
    card.serial.includes(searchTerm)
  );

  if (!mounted) return null;

  return (
    <main className="min-h-screen bg-gray-50 p-4 sm:p-8 relative">
      <div className="max-w-7xl mx-auto">

        {/* Cabeçalho */}
        <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div>
            <h1 className="text-3xl font-black text-slate-800">Bingo Helper 2.0</h1>
            <p className="text-slate-500 font-medium mt-1">
              {cards.length} {cards.length === 1 ? 'cartela física cadastrada' : 'cartelas físicas cadastradas'}
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            {cards.length > 0 && (
              <button
                onClick={handleDeleteAll}
                className="w-full sm:w-auto bg-red-100 hover:bg-red-200 text-red-700 px-6 py-4 rounded-xl font-bold transition-all shadow-sm"
              >
                🗑️ Limpar Arena
              </button>
            )}
            <button
              onClick={() => setIsModalOpen(true)}
              className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-4 rounded-xl font-bold transition-all shadow-lg"
            >
              📝 + Cadastrar Cartela
            </button>
          </div>
        </div>

        {/* Painel do Locutor */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-indigo-200 mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-6 gap-4">
            <h2 className="text-xl font-black text-indigo-800 flex items-center gap-2">🎤 Painel do Locutor</h2>

            {/* SELETORES: Cor da Rodada e Regra da Vitória */}
            <div className="flex flex-col sm:flex-row items-center gap-4 bg-indigo-50 px-5 py-3 rounded-xl border border-indigo-100">

              <div className="flex items-center gap-2">
                <span className="font-bold text-indigo-800 text-sm uppercase tracking-wider">Rodada:</span>
                <select
                  value={activeRoundColor}
                  onChange={(e) => setActiveRoundColor(e.target.value)}
                  className="bg-transparent font-black text-indigo-900 outline-none cursor-pointer"
                >
                  <option value="todas">🎯 Todas</option>
                  <option value="jornal">📰 Jornal</option>
                  <option value="verde">🟩 Verde</option>
                  <option value="rosa">⬜ Rosa</option>
                  <option value="amarelo">🟨 Amarelo</option>
                </select>
              </div>

              <div className="hidden sm:block w-px h-6 bg-indigo-200"></div>

              <div className="flex items-center gap-2">
                <span className="font-bold text-indigo-800 text-sm uppercase tracking-wider">Regra:</span>
                <select
                  value={activeRule}
                  onChange={(e) => setActiveRule(e.target.value)}
                  className="bg-transparent font-black text-indigo-900 outline-none cursor-pointer"
                >
                  <option value="cheia">📦 Cartela Cheia</option>
                  <option value="especial">✨ Padrão Especial</option>
                  <option value="horizontal">➖ Linha Horizontal</option>
                  <option value="vertical">│ Linha Vertical</option>
                  <option value="diagonal">✖️ Diagonal</option>
                  <option value="cantos">🔲 4 Cantos</option>
                </select>
              </div>

            </div>
          </div>

          <form onSubmit={handleCallStone} className="flex flex-col sm:flex-row gap-4 items-center">
            <input
              type="number"
              value={stoneInput}
              onChange={(e) => setStoneInput(e.target.value)}
              placeholder="Nº da pedra..."
              className="w-full sm:w-48 px-4 py-3 rounded-xl border border-gray-200 outline-none font-bold text-indigo-900"
            />
            <button type="submit" className="w-full sm:w-auto bg-indigo-100 hover:bg-indigo-200 text-indigo-800 px-6 py-3 rounded-xl font-bold transition-all">Cantar Pedra</button>
            {drawnNumbers.length > 0 && (
              <button type="button" onClick={() => setDrawnNumbers([])} className="text-red-500 hover:text-red-700 font-bold px-4 py-3">Limpar Sorteio</button>
            )}
          </form>
          {drawnNumbers.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {drawnNumbers.map(n => <span key={n} className="bg-indigo-600 text-white font-black px-3 py-1 rounded-lg">{n}</span>)}
            </div>
          )}
        </div>

        {/* Barra de Pesquisa */}
        <div className="mb-8">
          <input
            type="text"
            placeholder="🔍 Procurar cartela pelo número de série..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full md:w-1/2 px-5 py-4 rounded-xl border border-gray-200 outline-none shadow-sm text-indigo-900 font-bold"
          />
        </div>

        {/* Grid de Cartelas */}
        {isLoading ? (
          <p className="text-center font-bold text-gray-400">A carregar do Supabase...</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredCards.map((c) => (
              <BingoCard
                key={c.serial}
                serialNumber={c.serial}
                numbers={c.numbers}
                color={c.color}
                drawnNumbers={drawnNumbers}
                activeRoundColor={activeRoundColor}
                activeRule={activeRule} // <-- ENVIAMOS A REGRA PARA A CARTELA AQUI
                onDelete={handleDeleteCard}
              />
            ))}

            {filteredCards.length === 0 && cards.length > 0 && (
              <h3 className="col-span-full text-center py-10 font-bold text-gray-400">Nenhuma cartela com o número &quot;{searchTerm}&quot;</h3>
            )}

            {cards.length === 0 && (
              <div className="col-span-full text-center py-20">
                <span className="text-6xl mb-4 block">🤠</span>
                <h3 className="text-xl font-bold text-gray-700">Nenhuma cartela física cadastrada!</h3>
                <p className="text-gray-500 mt-2">Clique no botão &quot;Cadastrar Cartela&quot; para inserir os números que estão no papel.</p>
              </div>
            )}
          </div>
        )}

      </div>

      <AddCardModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveManualCard}
      />
    </main>
  );
}