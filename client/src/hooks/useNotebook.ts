import { useCallback, useState } from "react";
import {
  addNotebookItem,
  clearNotebook,
  readNotebook,
  setNotebookItemQuantity,
  writeNotebook,
  type Notebook,
  type NotebookItem,
} from "@/lib/notebook";

export function useNotebook(restaurantId: string) {
  const [notebook, setNotebook] = useState<Notebook | null>(() => readNotebook());

  const commit = useCallback((next: Notebook) => {
    writeNotebook(next);
    setNotebook(next);
  }, []);

  const addItem = useCallback(
    (item: Omit<NotebookItem, "quantity">) => {
      commit(addNotebookItem(notebook, restaurantId, item));
    },
    [commit, notebook, restaurantId],
  );

  const setQuantity = useCallback(
    (menuItemId: string, quantity: number) => {
      const source = notebook?.restaurantId === restaurantId ? notebook : { version: 1 as const, restaurantId, items: [] };
      commit(setNotebookItemQuantity(source, menuItemId, quantity));
    },
    [commit, notebook, restaurantId],
  );

  const clear = useCallback(() => {
    clearNotebook();
    setNotebook(null);
  }, []);

  const activeNotebook = notebook?.restaurantId === restaurantId ? notebook : null;
  return { notebook: activeNotebook, addItem, setQuantity, clear };
}
