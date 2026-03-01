"use server";

import { prisma } from "../lib/prisma";

// AGORA RECEBE A COR (color)
export async function saveCard(serial: string, numbers: (number | 'LIVRE')[], color: string = "jornal") {
    const numericNumbers = numbers.map(n => n === 'LIVRE' ? 0 : n);

    try {
        const card = await prisma.card.create({
            data: {
                serialNumber: serial,
                numbers: numericNumbers,
                color: color // Salvando a cor no banco
            }
        });

        return { success: true, card };
    } catch (error) {
        console.error("Erro ao salvar a cartela no Supabase:", error);
        return { success: false, error: "Falha ao salvar no banco de dados." };
    }
}

// ... o resto do arquivo (getCards, deleteCard, deleteAllCards) continua igualzinho!
export async function getCards() {
    try {
        const cards = await prisma.card.findMany({
            orderBy: {
                createdAt: 'asc', // Traz as mais antigas primeiro, para manter a ordem no ecrã
            },
        });
        return { success: true, cards };
    } catch (error) {
        console.error("Erro ao buscar as cartelas no Supabase:", error);
        return { success: false, cards: [] };
    }
}
export async function deleteCard(serial: string) {
    try {
        await prisma.card.delete({
            where: { serialNumber: serial }
        });
        return { success: true };
    } catch (error) {
        console.error(`Erro ao apagar a cartela ${serial}:`, error);
        return { success: false, error: "Falha ao apagar a cartela." };
    }
}

// Função para apagar TODAS as cartelas de uma vez (O "Reset")
export async function deleteAllCards() {
    try {
        await prisma.card.deleteMany({}); // O objeto vazio {} significa "apague tudo"
        return { success: true };
    } catch (error) {
        console.error("Erro ao limpar o banco de dados:", error);
        return { success: false, error: "Falha ao limpar o banco de dados." };
    }
}