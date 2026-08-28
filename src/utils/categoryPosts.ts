import type { CollectionEntry } from 'astro:content';

/**
 * Nombre d'articles affichés par page de catégorie (grille 3x3 desktop).
 * Utilisé à la fois par la page 1 (src/pages/category/[catSlug].astro)
 * et par les pages suivantes (src/pages/category/[catSlug]/page/[page].astro)
 * pour garantir une pagination cohérente entre les deux routes.
 */
export const PER_PAGE = 9;

/**
 * Retourne les articles d'une catégorie, triés du plus récent au plus ancien.
 * Logique centralisée pour éviter toute divergence de tri entre la page 1
 * (canonique, sans suffixe /page/1/) et les pages suivantes.
 */
export function getCategoryPosts(allPosts: CollectionEntry<'posts'>[], catSlug: string) {
  return allPosts
    .filter((p) => p.data.categories?.includes(catSlug))
    .sort((a, b) => new Date(b.data.date).getTime() - new Date(a.data.date).getTime());
}

/** Nombre total de pages pour une liste d'articles "hors vedette". */
export function totalPagesFor(othersCount: number): number {
  return Math.max(1, Math.ceil(othersCount / PER_PAGE));
}
