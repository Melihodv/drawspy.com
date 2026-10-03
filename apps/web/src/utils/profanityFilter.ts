/**
 * Multi-language Profanity Filter for User Nicknames
 * Filters inappropriate, offensive, and profane words in TR, EN, DE, ES, FR.
 */

const BAD_WORDS = new Set([
  // English
  'fuck', 'shit', 'bitch', 'asshole', 'cunt', 'dick', 'pussy', 'bastard', 'whore',
  'slut', 'nigger', 'nigga', 'faggot', 'retard', 'cock', 'penis', 'vagina', 'clitoris',

  // Turkish
  'amk', 'aq', 'amq', 'amına', 'amina', 'sik', 'sikerim', 'sikim', 'siktiğimin',
  'siktigimin', 'orospu', 'oroç', 'oç', 'piç', 'pic', 'yarrak', 'yarak', 'göt',
  'got', 'götveren', 'ibne', 'gavat', 'kancık', 'kancik', 'yarram', 'sikis',
  'sikiş', 'amcık', 'amcik', 'kahpe', 'puşt', 'pust', 'dızo', 'yaragim',

  // German
  'scheisse', 'scheiße', 'fick', 'fotze', 'arschloch', 'wichser', 'hurensohn',

  // Spanish
  'puta', 'puto', 'mierda', 'coño', 'cabron', 'cabrón', 'maricon', 'gilipollas',

  // French
  'putain', 'merde', 'salope', 'connard', 'encule', 'enculé', 'chienne',
]);

export function isProfane(text: string): boolean {
  if (!text) return false;

  // Normalize: lower case, replace numbers with similar letters (1337 speak)
  const normalized = text
    .toLowerCase()
    .replace(/0/g, 'o')
    .replace(/1/g, 'i')
    .replace(/3/g, 'e')
    .replace(/4/g, 'a')
    .replace(/5/g, 's')
    .replace(/7/g, 't')
    .replace(/@/g, 'a')
    .replace(/\$/g, 's')
    .replace(/[^a-zçğıöşü]/gi, ''); // remove non-alphabet characters

  // 1. Direct word match
  for (const word of BAD_WORDS) {
    if (normalized.includes(word)) {
      return true;
    }
  }

  // 2. Check tokenized words
  const tokens = text.toLowerCase().split(/[\s_\-.]+/);
  for (const token of tokens) {
    const cleanToken = token.replace(/[^a-zçğıöşü]/gi, '');
    if (BAD_WORDS.has(cleanToken)) {
      return true;
    }
  }

  return false;
}
