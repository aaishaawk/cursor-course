"use client";

import { ToastState } from "../_types";

interface ToastProps {
  toast: ToastState;
  onClose: () => void;
}

export function Toast({ toast, onClose }: ToastProps) {
  return (
    <div
      className={`fixed bottom-6 right-6 z-50 transition-all duration-300 ease-out ${
        toast.show
          ? "translate-y-0 opacity-100"
          : "translate-y-4 opacity-0 pointer-events-none"
      }`}
    >
      <div
        className={`flex items-center gap-3 px-4 py-3 text-white rounded-xl shadow-lg ${
          toast.type === "success"
            ? "bg-emerald-500 shadow-emerald-500/25"
            : toast.type === "edit"
            ? "bg-blue-500 shadow-blue-500/25"
            : "bg-red-500 shadow-red-500/25"
        }`}
      >
        <div className="flex items-center justify-center w-6 h-6 bg-white/20 rounded-full">
          <ToastIcon type={toast.type} />
        </div>
        <span className="font-medium">{toast.message}</span>
        <button
          onClick={onClose}
          className="ml-2 p-1 hover:bg-white/20 rounded-lg transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
}

function ToastIcon({ type }: { type: ToastState["type"] }) {
  if (type === "delete") {
    return (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
      </svg>
    );
  }
  
  if (type === "edit") {
    return (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
      </svg>
    );
  }

  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
    </svg>
  );
}

