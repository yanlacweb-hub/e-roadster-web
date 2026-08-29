/**
 * Extraction de paires question/réponse à partir d'une section FAQ détectée
 * dans le corps HTML/markdown d'un article (contenu brut d'une content
 * collection Astro, avant rendu).
 *
 * Deux formats FAQ observés dans le contenu migré depuis WordPress :
 *  - Format "sous-titres" : un <h3>/<h4> par question, suivi d'un ou
 *    plusieurs paragraphes/listes de réponse jusqu'au sous-titre suivant.
 *  - Format "gras + retour à la ligne" : <p><strong>Question</strong><br />
 *    Réponse...</p>, sans sous-titre dédié par question.
 *
 * Utilisé pour injecter un schema.org FAQPage en plus du BlogPosting
 * existant (voir ArticleLayout.astro), sans dupliquer/retirer de contenu
 * visible : c'est une extraction en lecture seule.
 */

export interface FaqPair {
  question: string;
  answer: string;
}

const FAQ_HEADING_RE = /<h([1-4])[^>]*>([\s\S]*?)<\/h\1>/gi;
const SUBHEADING_RE = /<h([34])[^>]*>([\s\S]*?)<\/h\1>/gi;
// Pattern "gras + <br>" : <p ...><strong ...>Question</strong><br .../>Réponse</p>
const BOLD_BR_RE = /<p[^>]*>\s*<strong[^>]*>([\s\S]*?)<\/strong>\s*<br[^>]*\/?>([\s\S]*?)<\/p>/gi;
// Pattern "paragraphe gras seul" : <p><strong>Question</strong></p> suivi
// d'un <p>Réponse</p> distinct (pas de <br> dans le même paragraphe).
const BOLD_PARA_PAIR_RE = /<p[^>]*>\s*<strong[^>]*>([\s\S]*?)<\/strong>\s*<\/p>\s*<p[^>]*>([\s\S]*?)<\/p>/gi;

/** Retire les balises HTML et normalise les espaces / entités courantes. */
function stripHtml(html: string): string {
  return html
    .replace(/<[^>]+>/g, ' ')
    .replace(/&rsquo;/g, '’')
    .replace(/&lsquo;/g, '‘')
    .replace(/&rdquo;/g, '”')
    .replace(/&ldquo;/g, '“')
    .replace(/&amp;/g, '&')
    .replace(/&nbsp;/g, ' ')
    .replace(/&eacute;/g, 'é')
    .replace(/&egrave;/g, 'è')
    .replace(/\s+/g, ' ')
    .trim();
}

/** Retire une numérotation en tête de question ("1. ", "3) ", "● ", "🔹 "). */
function stripLeadingNumbering(text: string): string {
  return text.replace(/^[\s●🔹👉❓]*\d*[.)]?\s*/, '').trim();
}

/**
 * Repère la section FAQ dans le HTML brut d'un article et retourne les
 * paires {question, answer} détectées, ou un tableau vide si aucune FAQ
 * n'est trouvée ou si aucune paire n'a pu être extraite.
 */
export function extractFaqSchema(rawBody: string): FaqPair[] {
  if (!rawBody) return [];

  FAQ_HEADING_RE.lastIndex = 0;
  let faqHeadingEnd = -1;
  let match: RegExpExecArray | null;
  while ((match = FAQ_HEADING_RE.exec(rawBody))) {
    const headingText = stripHtml(match[2]);
    if (/faq|foire aux questions/i.test(headingText)) {
      faqHeadingEnd = match.index + match[0].length;
      break;
    }
  }
  if (faqHeadingEnd === -1) return [];

  const faqSection = rawBody.slice(faqHeadingEnd);

  // Format "sous-titres" (h3/h4 = question).
  SUBHEADING_RE.lastIndex = 0;
  const subheadings: { start: number; end: number; question: string }[] = [];
  while ((match = SUBHEADING_RE.exec(faqSection))) {
    subheadings.push({
      start: match.index,
      end: match.index + match[0].length,
      question: stripLeadingNumbering(stripHtml(match[2])),
    });
  }

  if (subheadings.length > 0) {
    const pairs: FaqPair[] = [];
    for (let i = 0; i < subheadings.length; i++) {
      const current = subheadings[i];
      const next = subheadings[i + 1];
      const chunkEnd = next ? next.start : faqSection.length;
      const answerHtml = faqSection.slice(current.end, chunkEnd);
      const answer = stripHtml(answerHtml);
      if (current.question && answer) {
        pairs.push({ question: current.question, answer });
      }
    }
    if (pairs.length > 0) return pairs;
  }

  // Format "gras + <br>" (pas de sous-titre par question).
  BOLD_BR_RE.lastIndex = 0;
  const boldPairs: FaqPair[] = [];
  while ((match = BOLD_BR_RE.exec(faqSection))) {
    const question = stripLeadingNumbering(stripHtml(match[1]));
    const answer = stripHtml(match[2]);
    if (question && answer) {
      boldPairs.push({ question, answer });
    }
  }
  if (boldPairs.length > 0) return boldPairs;

  // Format "paragraphe gras seul" suivi d'un paragraphe de réponse distinct.
  BOLD_PARA_PAIR_RE.lastIndex = 0;
  const boldParaPairs: FaqPair[] = [];
  while ((match = BOLD_PARA_PAIR_RE.exec(faqSection))) {
    const question = stripLeadingNumbering(stripHtml(match[1]));
    const answer = stripHtml(match[2]);
    if (question && answer && !/^<strong/i.test(match[2].trim())) {
      boldParaPairs.push({ question, answer });
    }
  }

  return boldParaPairs;
}
