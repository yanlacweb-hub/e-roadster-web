/**
 * Nettoyage des extraits/descriptions d'articles pour l'affichage en carte.
 *
 * Certains des articles migrés depuis WordPress ont une description qui
 * commence par un artefact éditorial "Introduction: " (ou "Introduction : ")
 * hérité du CMS d'origine, et/ou qui est trop longue pour tenir proprement
 * dans une carte (vedette, grille, liste catégorie). Cette fonction :
 *  1. retire le préfixe "Introduction :" s'il est présent (insensible à la casse) ;
 *  2. tronque proprement au dernier mot complet si le texte dépasse 140
 *     caractères, en ajoutant une ellipse "…".
 */
export function cleanExcerpt(text: string | undefined | null, maxLength = 140): string {
  if (!text) return '';

  const cleaned = text.replace(/^\s*Introduction\s*:\s*/i, '').trim();

  if (cleaned.length <= maxLength) return cleaned;

  return `${cleaned.slice(0, maxLength - 3).replace(/\s+\S*$/, '')}…`;
}
