export type BrowseHistoryItem = {
  id: string;
  slug: string;
  name: string;
  price?: number;
  image?: string;
  vendor?: string;
  viewedAt: string; // ISO
};

const STORAGE_KEY = 'bazaarwala:browse_history:v1';
const MAX_ITEMS = 50;

function safeParse(json: string | null): BrowseHistoryItem[] {
  if (!json) return [];
  try {
    const data = JSON.parse(json);
    return Array.isArray(data) ? (data as BrowseHistoryItem[]) : [];
  } catch {
    return [];
  }
}

export function getBrowseHistory(): BrowseHistoryItem[] {
  if (typeof window === 'undefined') return [];
  return safeParse(window.localStorage.getItem(STORAGE_KEY));
}

export function setBrowseHistory(items: BrowseHistoryItem[]) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

export function clearBrowseHistory() {
  if (typeof window === 'undefined') return;
  window.localStorage.removeItem(STORAGE_KEY);
}

export function addToBrowseHistory(item: Omit<BrowseHistoryItem, 'viewedAt'> & { viewedAt?: string }) {
  if (typeof window === 'undefined') return;

  const now = item.viewedAt ?? new Date().toISOString();
  const current = getBrowseHistory();

  // de-dupe by slug (preferred) then id
  const next = [
    { ...item, viewedAt: now } as BrowseHistoryItem,
    ...current.filter((x) => (item.slug ? x.slug !== item.slug : true) && (item.id ? x.id !== item.id : true)),
  ].slice(0, MAX_ITEMS);

  setBrowseHistory(next);
}


