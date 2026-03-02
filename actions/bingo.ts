"use server";
import { prisma } from "@/lib/prisma";

interface PrismaError {
    code?: string;
}

export async function saveCard(serial: string, numbers: (number | 'LIVRE' | 0)[], color: string, userId: string) {
    try {
        const formattedNumbers = numbers.map(n => (n === 'LIVRE' || n === 0) ? 0 : Number(n));
        await prisma.bingoCard.create({
            data: { serialNumber: serial, numbers: formattedNumbers, color: color, userId: userId },
        });
        return { success: true };
    } catch (err) {
        const error = err as PrismaError;
        if (error.code === 'P2002') return { success: false, error: "Série duplicada!" };
        return { success: false };
    }
}

export async function getCards(userId: string) {
    try {
        const cards = await prisma.bingoCard.findMany({
            where: { userId: userId },
            orderBy: { createdAt: 'desc' }
        });
        return { success: true, cards };
    } catch { 
        return { success: false, cards: [] };
    }
}

export async function deleteCard(serial: string, userId: string) {
    try {
        await prisma.bingoCard.deleteMany({ where: { serialNumber: serial, userId: userId } });
        return { success: true };
    } catch { 
        return { success: false }; 
    }
}

export async function deleteAllCards(userId: string) {
    try {
        await prisma.bingoCard.deleteMany({ where: { userId: userId } });
        return { success: true };
    } catch { 
        return { success: false }; 
    }
}