export const NOTEBOOK_COOKIE_NAME = "restaurant_notebook_v1";
const NOTEBOOK_MAX_AGE_SECONDS = 60 * 60 * 24 * 30;
const MAX_NOTEBOOK_ITEMS = 20;
const MAX_QUANTITY_PER_ITEM = 20;

export type NotebookItem = {
  menuItemId: string;
  title: string;
  price: number;
  imageUrl?: string | null;
  quantity: number;
};

export type Notebook = {
  version: 1;
  restaurantId: string;
  items: NotebookItem[];
};

type NotebookCandidate = Partial<Notebook> & { items?: unknown };

function isNotebookItem(value: unknown): value is NotebookItem {
  if (!value || typeof value !== "object") return false;
  const item = value as Record<string, unknown>;
  return (
    typeof item.menuItemId === "string" &&
    typeof item.title === "string" &&
    typeof item.price === "number" &&
    Number.isFinite(item.price) &&
    typeof item.quantity === "number" &&
    Number.isInteger(item.quantity) &&
    item.quantity > 0
  );
}

export function normalizeNotebook(candidate: unknown): Notebook | null {
  if (!candidate || typeof candidate !== "object") return null;
  const notebook = candidate as NotebookCandidate;
  if (notebook.version !== 1 || typeof notebook.restaurantId !== "string" || !notebook.restaurantId || !Array.isArray(notebook.items)) {
    return null;
  }

  const deduplicated = new Map<string, NotebookItem>();
  for (const rawItem of notebook.items) {
    if (!isNotebookItem(rawItem)) continue;
    const item = rawItem as NotebookItem;
    const existing = deduplicated.get(item.menuItemId);
    const quantity = Math.min(MAX_QUANTITY_PER_ITEM, (existing?.quantity ?? 0) + item.quantity);
    deduplicated.set(item.menuItemId, {
      menuItemId: item.menuItemId,
      title: item.title.slice(0, 160),
      price: Math.max(0, item.price),
      imageUrl: typeof item.imageUrl === "string" ? item.imageUrl.slice(0, 1024) : null,
      quantity,
    });
    if (deduplicated.size >= MAX_NOTEBOOK_ITEMS) break;
  }

  return { version: 1, restaurantId: notebook.restaurantId.slice(0, 64), items: Array.from(deduplicated.values()) };
}

export function serializeNotebook(notebook: Notebook) {
  return encodeURIComponent(JSON.stringify(normalizeNotebook(notebook)));
}

export function deserializeNotebook(value: string | undefined): Notebook | null {
  if (!value) return null;
  try {
    return normalizeNotebook(JSON.parse(decodeURIComponent(value)));
  } catch {
    return null;
  }
}

function readCookieValue(name: string) {
  if (typeof document === "undefined") return undefined;
  const target = `${name}=`;
  return document.cookie
    .split(";")
    .map(part => part.trim())
    .find(part => part.startsWith(target))
    ?.slice(target.length);
}

export function readNotebook(): Notebook | null {
  return deserializeNotebook(readCookieValue(NOTEBOOK_COOKIE_NAME));
}

export function writeNotebook(notebook: Notebook) {
  if (typeof document === "undefined") return;
  const normalized = normalizeNotebook(notebook);
  if (!normalized) return;
  const secure = window.location.protocol === "https:" ? "; Secure" : "";
  document.cookie = `${NOTEBOOK_COOKIE_NAME}=${serializeNotebook(normalized)}; Path=/; Max-Age=${NOTEBOOK_MAX_AGE_SECONDS}; SameSite=Lax${secure}`;
}

export function clearNotebook() {
  if (typeof document === "undefined") return;
  document.cookie = `${NOTEBOOK_COOKIE_NAME}=; Path=/; Max-Age=0; SameSite=Lax`;
}

export function addNotebookItem(
  notebook: Notebook | null,
  restaurantId: string,
  item: Omit<NotebookItem, "quantity">,
): Notebook {
  const source = notebook?.restaurantId === restaurantId ? notebook : { version: 1 as const, restaurantId, items: [] };
  const matching = source.items.find(existing => existing.menuItemId === item.menuItemId);
  const updatedItems = matching
    ? source.items.map(existing =>
        existing.menuItemId === item.menuItemId
          ? { ...existing, quantity: Math.min(MAX_QUANTITY_PER_ITEM, existing.quantity + 1) }
          : existing,
      )
    : [...source.items.slice(0, MAX_NOTEBOOK_ITEMS - 1), { ...item, quantity: 1 }];
  return { ...source, items: updatedItems };
}

export function setNotebookItemQuantity(notebook: Notebook, menuItemId: string, quantity: number): Notebook {
  const safeQuantity = Math.max(0, Math.min(MAX_QUANTITY_PER_ITEM, Math.floor(quantity)));
  return {
    ...notebook,
    items: safeQuantity
      ? notebook.items.map(item => (item.menuItemId === menuItemId ? { ...item, quantity: safeQuantity } : item))
      : notebook.items.filter(item => item.menuItemId !== menuItemId),
  };
}

export function notebookItemCount(notebook: Notebook | null) {
  return notebook?.items.reduce((total, item) => total + item.quantity, 0) ?? 0;
}

export function notebookTotal(notebook: Notebook | null) {
  return notebook?.items.reduce((total, item) => total + item.price * item.quantity, 0) ?? 0;
}
