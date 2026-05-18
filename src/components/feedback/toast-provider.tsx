"use client";

import * as React from "react";
import {
  ToastProviderRoot,
  ToastViewport,
  ToastRoot,
  ToastTitle,
  ToastDescription,
  ToastClose,
} from "@/components/ui/toast";

type ToastVariant = "default" | "success" | "warning" | "destructive";

type ToastEntry = {
  id: number;
  title?: string;
  description?: React.ReactNode;
  variant?: ToastVariant;
  duration?: number;
  customContent?: React.ReactNode;
};

type ToastApi = {
  push: (toast: Omit<ToastEntry, "id">) => number;
  dismiss: (id: number) => void;
};

const ToastContext = React.createContext<ToastApi | null>(null);

export function useToast(): ToastApi {
  const ctx = React.useContext(ToastContext);
  if (!ctx) {
    throw new Error("useToast precisa ser usado dentro de <ToastProvider>");
  }
  return ctx;
}

let nextId = 0;

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = React.useState<ToastEntry[]>([]);

  const dismiss = React.useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const push = React.useCallback(
    (toast: Omit<ToastEntry, "id">) => {
      const id = ++nextId;
      setToasts((prev) => [...prev, { ...toast, id }]);
      return id;
    },
    [],
  );

  const api = React.useMemo<ToastApi>(() => ({ push, dismiss }), [push, dismiss]);

  return (
    <ToastContext.Provider value={api}>
      <ToastProviderRoot swipeDirection="right">
        {children}
        {toasts.map((t) => (
          <ToastRoot
            key={t.id}
            variant={t.variant ?? "default"}
            duration={t.duration ?? 6000}
            onOpenChange={(open) => {
              if (!open) dismiss(t.id);
            }}
          >
            {t.customContent ? (
              t.customContent
            ) : (
              <div className="flex flex-col gap-1">
                {t.title && <ToastTitle>{t.title}</ToastTitle>}
                {t.description && (
                  <ToastDescription>{t.description}</ToastDescription>
                )}
              </div>
            )}
            <ToastClose />
          </ToastRoot>
        ))}
        <ToastViewport />
      </ToastProviderRoot>
    </ToastContext.Provider>
  );
}