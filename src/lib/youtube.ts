// Aceita qualquer formato de link do YouTube que um admin normalmente colaria
// (assistir, youtu.be, shorts, ou já embed) e devolve a URL de embed correta.
// Sem isso, colar o link normal de "assistir" (youtube.com/watch?v=...) direto
// num <iframe src> quebra com "Refused to display ... X-Frame-Options: sameorigin",
// porque o YouTube bloqueia a própria página de assistir dentro de iframe.
export function toYouTubeEmbedUrl(url: string | null | undefined): string {
  if (!url) return '';

  try {
    const parsed = new URL(url);
    const host = parsed.hostname.replace(/^www\./, '');

    if (host === 'youtu.be') {
      const id = parsed.pathname.slice(1);
      return id ? `https://www.youtube.com/embed/${id}` : '';
    }

    if (host === 'youtube.com' || host === 'm.youtube.com') {
      if (parsed.pathname === '/watch') {
        const id = parsed.searchParams.get('v');
        return id ? `https://www.youtube.com/embed/${id}` : '';
      }
      if (parsed.pathname.startsWith('/shorts/')) {
        const id = parsed.pathname.split('/')[2];
        return id ? `https://www.youtube.com/embed/${id}` : '';
      }
      if (parsed.pathname.startsWith('/embed/')) {
        return url; // já está no formato certo
      }
    }
  } catch {
    // URL inválida — deixa vazio em vez de tentar embutir algo quebrado
    return '';
  }

  return '';
}
