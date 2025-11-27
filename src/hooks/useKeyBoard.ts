import { useEffect, useState } from "react";

export type KeyboardLevel = "parent" | "search" | "datatable" | "modal";

export function useKeyboard(handler: (e: KeyboardEvent) => void) {
  useEffect(() => {
    const fn = (e: KeyboardEvent) => handler(e);
    window.addEventListener("keydown", fn);
    return () => window.removeEventListener("keydown", fn);
  }, [handler]);
}

export function useKeyboardLevel(initial: KeyboardLevel = "parent") {
  const [level, setLevel] = useState<KeyboardLevel>(initial);

  return {
    level,
    setLevel,
    is: (l: KeyboardLevel) => level === l,
  };
}