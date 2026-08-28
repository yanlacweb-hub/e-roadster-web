/**
 * Calcule un temps de lecture estimé (en minutes) à partir du contenu brut
 * (markdown/HTML) d'un article. Base : ~200 mots/minute en français.
 *
 * Le HTML est retiré avant comptage pour ne pas fausser le nombre de mots
 * avec des attributs/URLs présents dans les balises (ex: <img src="...">).
 */
export function estimateReadingTime(rawBody: string, wordsPerMinute = 200): number {
  if (!rawBody) return 1;

  const text = rawBody
    // retire les blocs de code éventuels
    .replace(/```[\s\S]*?```/g, ' ')
    // retire les balises HTML (le contenu des .md est stocké en HTML brut)
    .replace(/<[^>]+>/g, ' ')
    // retire les entités HTML basiques
    .replace(/&[a-z]+;/gi, ' ')
    // retire la syntaxe markdown la plus courante (liens, emphase, titres)
    .replace(/[#*_>`~-]/g, ' ');

  const words = text
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  const minutes = Math.ceil(words.length / wordsPerMinute);
  return Math.max(1, minutes);
}

export function formatReadingTime(minutes: number): string {
  return `${minutes} min de lecture`;
}
