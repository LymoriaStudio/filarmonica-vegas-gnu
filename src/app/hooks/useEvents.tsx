import { useState, useEffect } from 'react';
import { getEvents, EventFromDb } from '../services/eventsService';

export interface EventView {
  id: string;
  image: string;
  title: string;
  description: string;
  longDescription: string;
  rawDate: string;
  date: string;
  time: string;
  location: string;
  address: string;
  mapsUrl: string | null;
  category: string;
  status: string;
  featured: boolean;
  link: string | null;
  isPaid: boolean;
  ticket: number | null;
  // Campos extras esperados pelo EventsPage
  theme: string;
  color: string;
  price: string;
  ticketsUrl: string | null;
  whatsapp: string;
}

const WHATSAPP_NUMBER = '5519998453478';

function formatDate(raw: string): string {
  const [year, month, day] = raw.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  return date.toLocaleDateString('pt-BR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

function formatPrice(isPaid: boolean, ticket: number | null): string {
  if (!isPaid || ticket === null) return 'Entrada gratuita';
  return `R$ ${Number(ticket).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;
}

// Paleta de cores ciclada por index para manter variedade visual
const COLOR_PALETTE = ['#ffc300', '#001856', '#1a56db', '#0B4DA2'];

function mapEventFromDb(row: EventFromDb, index: number): EventView {
  return {
    id: row.id,
    image: row.cover_image || 'https://images.unsplash.com/photo-1511192336575-5a79af67a629?auto=format&fit=crop&w=800&q=80',
    title: row.title,
    description: row.description,
    longDescription: row.description,
    rawDate: row.date,
    date: formatDate(row.date),
    time: row.time,
    location: row.venue,
    address: row.address,
    mapsUrl: row.google_maps_url,
    category: row.category,
    status: row.status,
    featured: row.highlighted,
    link: row.link,
    isPaid: row.is_paid,
    ticket: row.ticket,
    // Campos de display
    theme: row.category,
    color: COLOR_PALETTE[index % COLOR_PALETTE.length],
    price: formatPrice(row.is_paid, row.ticket),
    ticketsUrl: row.link || null,
    whatsapp: WHATSAPP_NUMBER,
  };
}

interface UseEventsOptions {
  /** Se true, retorna apenas eventos com status 'published'. Default: true */
  onlyPublished?: boolean;
  /** Se true, ordena por highlighted primeiro. Default: false */
  highlightedFirst?: boolean;
}

export function useEvents(options: UseEventsOptions = {}) {
  const { onlyPublished = true, highlightedFirst = false } = options;

  const [events, setEvents] = useState<EventView[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const fetch = async () => {
      setLoading(true);
      setError(null);

      try {
        const data = await getEvents({ onlyPublished, highlightedFirst });
        if (cancelled) return;
        setEvents(data.map((row, i) => mapEventFromDb(row, i)));
      } catch (err) {
        if (cancelled) return;
        setError(err instanceof Error ? err.message : 'Erro ao carregar eventos');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetch();

    return () => { cancelled = true; };
  }, [onlyPublished, highlightedFirst]);

  return { events, loading, error };
}