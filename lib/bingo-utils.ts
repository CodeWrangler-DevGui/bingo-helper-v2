export const generateColumn = (min: number, max: number, count: number): number[] => {
    const numbers = new Set<number>();
    while (numbers.size < count) {
        numbers.add(Math.floor(Math.random() * (max - min + 1)) + min);
    }
    return Array.from(numbers);
};

export const generateBingoCard = (): (number | 'LIVRE')[] => {
    const colB = generateColumn(1, 15, 5);
    const colI = generateColumn(16, 30, 5);
    const colN = generateColumn(31, 45, 5);
    const colG = generateColumn(46, 60, 5);
    const colO = generateColumn(61, 75, 5);

    const finalCard: (number | 'LIVRE')[] = [];

    for (let row = 0; row < 5; row++) {
        finalCard.push(
            colB[row],
            colI[row],
            row === 2 ? 'LIVRE' : colN[row],
            colG[row],
            colO[row]
        );
    }

    return finalCard;
};