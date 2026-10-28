"use client";

import { create } from "zustand";

export type ToastTone = "default" | "success";

export interface ToastItem {
  id: string;
  message: string;
  tone: ToastTone;
}

interface ToastState {
  toasts: ToastItem[];
  push: (message: string, tone?: ToastTone) => void;
  dismiss: (id: string) => void;
}

export const useToast = create<ToastState>((set, get) => ({
  toasts: [],
  push: (message, tone = "default") => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    set({ toasts: [...get().toasts, { id, message, tone }] });
    window.setTimeout(() => get().dismiss(id), 2800);
  },
  dismiss: (id) =>
    set({ toasts: get().toasts.filter((toast) => toast.id !== id) }),
}));
