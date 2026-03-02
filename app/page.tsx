"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../lib/supabase";
import BingoCard from "../components/BingoCard";
import AddCardModal from "../components/AddCardModal";
import { saveCard, getCards, deleteCard, deleteAllCards } from "../actions/bingo";

interface BingoCardData {
    id: string;
    serialNumber: string;
    numbers: number[];
    color: string;
    userId: string;
}

export default function Home() {
    const router = useRouter();
    const [userId, setUserId] = useState<string | null>(null);
    const [cards, setCards] = useState<{ serial: string, numbers: (number | 'LIVRE')[], color: string }[]>([]);
    const [mounted, setMounted] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [drawnNumbers, setDrawnNumbers] = useState<number[]>([]);
    const [stoneInput, setStoneInput] = useState("");
    const [isModalOpen, setIsModalOpen] = useState(false);

    const [activeRoundColor, setActiveRoundColor] = useState("todas");
    const [activeRule, setActiveRule] = useState("cheia");

    useEffect(() => {
        const fetchCards = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                router.push("/login");
                return;
            }
            setUserId(user.id);

            const result = await getCards(user.id);
            if (result.success && result.cards) {
                const loadedCards = (result.cards as BingoCardData[]).map((c) => ({
                    serial: c.serialNumber,
                    numbers: c.numbers.map((n) => (n === 0 ? 'LIVRE' as const : n)),
                    color: c.color || "jornal"
                }));
                setCards(loadedCards);
            }
            setIsLoading(false);
            setMounted(true);
        };
        fetchCards();
    }, [router]);

    const handleDeleteAll = async () => {
        if (!userId || !confirm("Apagar TUDO?")) return;
        const result = await deleteAllCards(userId);
        if (result.success) {
            setCards([]);
            setDrawnNumbers([]);
        }
    };

    const handleSaveManualCard = async (serial: string, numbers: (number | 'LIVRE')[], color: string) => {
        if (!userId) return;
        const result = await saveCard(serial, numbers, color, userId);
        if (result.success) {
            setCards(prev => [...prev, { serial, numbers, color }]);
            setIsModalOpen(false);
        } else {
            alert("Erro ao guardar na nuvem!");
        }
    };

    const handleDeleteCard = async (serial: string) => {
        if (!userId || !confirm(`Excluir cartela Nº ${serial}?`)) return;
        const result = await deleteCard(serial, userId);
        if (result.success) {
            setCards(prev => prev.filter(c => c.serial !== serial));
        }
    };

    const handleSignOut = async () => {
        await supabase.auth.signOut();
        router.push("/login");
    };

    const handleCallStone = (e: React.FormEvent) => {
        e.preventDefault();
        const num = parseInt(stoneInput);
        if (!num || num < 1 || num > 75 || drawnNumbers.includes(num)) {
            setStoneInput("");
            return;
        }
        setDrawnNumbers(prev => [...prev, num]);
        setStoneInput("");
    };

    const filteredCards = cards.filter(card => card.serial.includes(searchTerm));

    // 👉 LÓGICA DE AGRUPAMENTO
    const groupedCards = filteredCards.reduce((acc, card) => {
        const cor = card.color || "jornal";
        if (!acc[cor]) acc[cor] = [];
        acc[cor].push(card);
        return acc;
    }, {} as Record<string, typeof filteredCards>);

    // 👉 CONFIGURAÇÃO VISUAL DAS SEÇÕES
    const colorSections: Record<string, { label: string, emoji: string, bg: string, text: string }> = {
        jornal: { label: "Jornal", emoji: "📰", bg: "bg-gray-200", text: "text-gray-800" },
        verde: { label: "Verde", emoji: "🟩", bg: "bg-green-200", text: "text-green-900" },
        rosa: { label: "Rosa", emoji: "🌸", bg: "bg-pink-200", text: "text-pink-900" },
        amarelo: { label: "Amarelo", emoji: "🟨", bg: "bg-yellow-200", text: "text-yellow-900" },
    };

    // 👉 A MÁGICA DA ORDENAÇÃO ACONTECE AQUI
    const colorOrder = ["jornal", "verde", "rosa", "amarelo"];
    const sortedColorKeys = Object.keys(groupedCards).sort((a, b) => {
        const posA = colorOrder.indexOf(a);
        const posB = colorOrder.indexOf(b);
        return (posA === -1 ? 999 : posA) - (posB === -1 ? 999 : posB);
    });

    if (!mounted) return null;

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 font-black text-indigo-600">
                PREPARANDO A ARENA... 🐎
            </div>
        );
    }

    return (
        <main className="min-h-screen bg-gray-50 p-4 sm:p-8 relative">
            <div className="max-w-7xl mx-auto">

                {/* CABEÇALHO */}
                <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <div>
                        <h1 className="text-3xl font-black text-slate-800 tracking-tight">Bingo Helper</h1>
                        <p className="text-slate-500 font-medium mt-1">{cards.length} cartelas cadastradas</p>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                        <button onClick={handleSignOut} className="text-red-500 font-bold px-4 uppercase text-xs">Sair</button>
                        <button onClick={handleDeleteAll} className="bg-red-50 text-red-700 px-6 py-4 rounded-xl font-bold">🗑️ Limpar Arena</button>
                        <button onClick={() => setIsModalOpen(true)} className="bg-indigo-600 text-white px-8 py-4 rounded-xl font-bold shadow-lg">📝 + Cadastrar Cartela</button>
                    </div>
                </div>

                {/* PAINEL DO LOCUTOR */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-indigo-200 mb-6">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-6 gap-4">
                        <h2 className="text-xl font-black text-indigo-800 flex items-center gap-2">🎤 Painel do Locutor</h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full lg:w-auto">
                            <div className="flex items-center justify-between gap-3 bg-indigo-50 px-5 py-4 rounded-xl border border-indigo-100">
                                <span className="font-bold text-indigo-800 text-sm uppercase tracking-wider">Rodada:</span>
                                <select value={activeRoundColor} onChange={(e) => setActiveRoundColor(e.target.value)} className="bg-transparent font-black text-indigo-900 outline-none">
                                    <option value="todas">🎯 Todas</option>
                                    <option value="jornal">📰 Jornal</option>
                                    <option value="verde">🟩 Verde</option>
                                    <option value="rosa">🌸 Rosa</option>
                                    <option value="amarelo">🟨 Amarelo</option>
                                </select>
                            </div>
                            <div className="flex items-center justify-between gap-3 bg-indigo-50 px-5 py-4 rounded-xl border border-indigo-100">
                                <span className="font-bold text-indigo-800 text-sm uppercase tracking-wider">Regra:</span>
                                <select value={activeRule} onChange={(e) => setActiveRule(e.target.value)} className="bg-transparent font-black text-indigo-900 outline-none">
                                    <option value="cheia">📦 Cartela Cheia</option>
                                    <option value="especial">✨ Padrão Especial</option>
                                    <option value="horizontal">➖ Horizontal</option>
                                    <option value="vertical">│ Vertical</option>
                                    <option value="diagonal">✖️ Diagonal</option>
                                    <option value="cantos">🔲 4 Cantos</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    <form onSubmit={handleCallStone} className="flex flex-col sm:flex-row gap-4 items-center">
                        <input type="number" value={stoneInput} onChange={(e) => setStoneInput(e.target.value)} placeholder="Nº da pedra..." className="w-full sm:w-48 px-4 py-3 rounded-xl border border-gray-200 outline-none font-black text-indigo-900 placeholder:text-slate-300" />
                        <button type="submit" className="w-full sm:w-auto bg-indigo-600 text-white px-8 py-3 rounded-xl font-bold shadow-md hover:bg-indigo-700 transition-all">Cantar Pedra</button>
                        {drawnNumbers.length > 0 && (
                            <button type="button" onClick={() => setDrawnNumbers([])} className="text-red-500 hover:text-red-700 font-black px-4 py-3 transition-all uppercase text-xs tracking-widest">✖ Limpar Sorteio</button>
                        )}
                    </form>

                    {drawnNumbers.length > 0 && (
                        <div className="mt-6 flex flex-wrap gap-2 p-4 bg-gray-50 rounded-xl border border-gray-100">
                            <span className="w-full text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Pedras Cantadas:</span>
                            {drawnNumbers.map(n => (
                                <span key={n} className="bg-indigo-600 text-white font-black px-3 py-1 rounded-lg shadow-sm animate-in fade-in zoom-in duration-200">{n}</span>
                            ))}
                        </div>
                    )}
                </div>

                {/* BUSCA */}
                <div className="mb-8">
                    <input type="text" placeholder="🔍 Procurar cartela pelo número de série..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full md:w-1/2 px-5 py-4 rounded-xl border border-gray-200 outline-none shadow-sm text-indigo-900 font-black placeholder:text-slate-300" />
                </div>

                {/* 👉 RENDERIZAÇÃO SEPARADA POR CORES (ORDEM FIXA) */}
                {sortedColorKeys.length === 0 ? (
                    <div className="text-center py-10">
                        <p className="text-slate-400 font-bold uppercase tracking-widest">Nenhuma cartela encontrada</p>
                    </div>
                ) : (
                    sortedColorKeys.map((colorKey) => {
                        const cardsInColor = groupedCards[colorKey];
                        const config = colorSections[colorKey] || { label: colorKey, emoji: "🏷️", bg: "bg-gray-200", text: "text-gray-800" };

                        return (
                            <div key={colorKey} className="mb-12">

                                {/* Cabeçalho da Seção de Cor com erro do flex resolvido */}
                                <div className={`inline-flex items-center gap-3 px-5 py-3 rounded-xl mb-6 shadow-sm border border-white/50 ${config.bg} ${config.text}`}>
                                    <span className="text-2xl">{config.emoji}</span>
                                    <h3 className="font-black text-lg uppercase tracking-wider">Cartelas {config.label}</h3>
                                    <span className="bg-white/60 px-3 py-1 rounded-lg text-sm font-black ml-2">{cardsInColor.length}</span>
                                </div>

                                {/* Grid */}
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                    {cardsInColor.map((c) => (
                                        <BingoCard
                                            key={c.serial}
                                            serialNumber={c.serial}
                                            numbers={c.numbers}
                                            color={c.color}
                                            drawnNumbers={drawnNumbers}
                                            activeRoundColor={activeRoundColor}
                                            activeRule={activeRule}
                                            onDelete={handleDeleteCard}
                                        />
                                    ))}
                                </div>

                                <hr className="mt-12 border-gray-200/60" />
                            </div>
                        );
                    })
                )}
            </div>

            <AddCardModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSave={handleSaveManualCard} />
        </main>
    );
}