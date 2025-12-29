export function fuzzyMatch(pattern: string, str: string): { matched: boolean; score: number; indices: number[] } {
	if (!pattern) return { matched: true, score: 0, indices: [] };
	pattern = pattern.toLowerCase();
	str = str.toLowerCase();
	let patternIdx = 0;
	let score = 0;
	const indices: number[] = [];
	for (let i = 0; i < str.length && patternIdx < pattern.length; i++) {
		if (str[i] === pattern[patternIdx]) {
			score += 1;
			indices.push(i);
			patternIdx++;
		}
	}
	return { matched: patternIdx === pattern.length, score, indices };
}

export function fuzzyFilter<T>(items: T[], pattern: string, getText: (item: T) => string): T[] {
	if (!pattern) return items;
	return items
		.map(item => ({ item, ...fuzzyMatch(pattern, getText(item)) }))
		.filter(r => r.matched)
		.sort((a, b) => b.score - a.score)
		.map(r => r.item);
}
