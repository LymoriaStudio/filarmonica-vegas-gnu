import { apiClient } from '../../lib/apiClient';
import { Banner } from '../validations/types';

export interface PublicBanner {
  id: string;
  image_desktop: string;
  image_mobile: string;
  tag: string | null;
  title: string;
  subtitle: string | null;
  text: string | null;
  primary_btn_text: string | null;
  primary_btn_link: string | null;
  secondary_btn_text: string | null;
  secondary_btn_link: string | null;
  order: number;
  status: string;
}

interface ApiBannerDto {
  id: string;
  imageDesktopUrl: string;
  imageMobileUrl: string;
  tag: string | null;
  title: string;
  subtitle: string | null;
  text: string | null;
  primaryBtnText: string | null;
  primaryBtnLink: string | null;
  secondaryBtnText: string | null;
  secondaryBtnLink: string | null;
  displayOrder: number;
}

// GET — banners ativos, ordenados (usado no Hero do site institucional).
// Fala com o backend próprio (filarmonica-api) — já vem só com os ativos,
// com a URL das imagens resolvida.
export async function getBannersAtivos(): Promise<PublicBanner[]> {
  const data = await apiClient.get<ApiBannerDto[]>('/api/banners/ativos');
  return data.map(b => ({
    id: b.id,
    image_desktop: b.imageDesktopUrl,
    image_mobile: b.imageMobileUrl,
    tag: b.tag,
    title: b.title,
    subtitle: b.subtitle,
    text: b.text,
    primary_btn_text: b.primaryBtnText,
    primary_btn_link: b.primaryBtnLink,
    secondary_btn_text: b.secondaryBtnText,
    secondary_btn_link: b.secondaryBtnLink,
    order: b.displayOrder,
    status: 'ativo',
  }));
}

// ── Admin (SiteCMS.tsx) ─────────────────────────────────────────────────────
// AdminBannerDto expõe o caminho RELATIVO cru de imageDesktop/imageMobile
// (não a URL resolvida) — é o que create/update esperam de volta.
interface AdminBannerDto {
  id: string;
  imageDesktop: string;
  imageMobile: string;
  tag: string | null;
  title: string;
  subtitle: string | null;
  text: string | null;
  primaryBtnText: string | null;
  primaryBtnLink: string | null;
  secondaryBtnText: string | null;
  secondaryBtnLink: string | null;
  displayOrder: number;
  status: string;
}

function mapAdminDtoToBanner(dto: AdminBannerDto): Banner {
  return {
    id: dto.id,
    imageDesktop: dto.imageDesktop,
    imageMobile: dto.imageMobile,
    title: dto.title,
    subtitle: dto.subtitle ?? '',
    text: dto.text ?? '',
    primaryBtnText: dto.primaryBtnText ?? '',
    primaryBtnLink: dto.primaryBtnLink ?? '',
    secondaryBtnText: dto.secondaryBtnText ?? '',
    secondaryBtnLink: dto.secondaryBtnLink ?? '',
    order: dto.displayOrder,
    status: dto.status.toLowerCase() as Banner['status'],
    ...(dto.tag ? { tag: dto.tag } : {}),
  } as Banner;
}

export interface BannerFormPayload {
  imageDesktop: string; // caminho relativo (de mediaService.uploadMedia)
  imageMobile: string;
  tag?: string | null;
  title: string;
  subtitle?: string | null;
  text?: string | null;
  primaryBtnText?: string | null;
  primaryBtnLink?: string | null;
  secondaryBtnText?: string | null;
  secondaryBtnLink?: string | null;
  order: number;
  status: 'ativo' | 'rascunho' | 'agendado';
}

function toApiPayload(b: BannerFormPayload) {
  const capitalized = b.status.charAt(0).toUpperCase() + b.status.slice(1);
  return {
    imageDesktop: b.imageDesktop,
    imageMobile: b.imageMobile,
    tag: b.tag || null,
    title: b.title,
    subtitle: b.subtitle || null,
    text: b.text || null,
    primaryBtnText: b.primaryBtnText || null,
    primaryBtnLink: b.primaryBtnLink || null,
    secondaryBtnText: b.secondaryBtnText || null,
    secondaryBtnLink: b.secondaryBtnLink || null,
    displayOrder: b.order,
    status: capitalized,
  };
}

// GET — todos os banners (painel admin, qualquer status)
export async function getAllBannersAdmin(): Promise<Banner[]> {
  const data = await apiClient.get<AdminBannerDto[]>('/api/admin/banners');
  return data.map(mapAdminDtoToBanner).sort((a, b) => a.order - b.order);
}

// POST — cria banner. A reordenação por colisão de `order` é feita no
// próprio backend (BannerAdminService) — o front não precisa mais calcular
// a cadeia de deslocamento manualmente.
export async function createBanner(payload: BannerFormPayload): Promise<Banner> {
  const dto = await apiClient.post<AdminBannerDto>('/api/admin/banners', toApiPayload(payload));
  return mapAdminDtoToBanner(dto);
}

// PUT — atualiza banner
export async function updateBanner(id: string, payload: BannerFormPayload): Promise<Banner> {
  const dto = await apiClient.put<AdminBannerDto>(`/api/admin/banners/${id}`, toApiPayload(payload));
  return mapAdminDtoToBanner(dto);
}

// DELETE — remove banner
export async function deleteBanner(id: string): Promise<void> {
  await apiClient.delete(`/api/admin/banners/${id}`);
}
