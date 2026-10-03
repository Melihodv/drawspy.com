import type { Word, Language, Difficulty } from '@drawspy/shared';
export declare const ALL_WORDS: Word[];
export declare function getWordsByLanguage(language: Language): Word[];
export declare function getCategories(language: Language): string[];
export declare function pickWord(params: {
    language: Language;
    category?: string;
    difficulty?: Difficulty | 'easy+medium' | 'all';
    recentWordIds?: string[];
}): Word | null;
//# sourceMappingURL=index.d.ts.map