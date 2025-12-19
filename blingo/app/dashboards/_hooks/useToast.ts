"use client";

import { useState, useCallback } from "react";
import { ToastState, ToastType } from "../_types";

const TOAST_DURATION = 3000;

export function useToast() {
  const [toast, setToast] = useState<ToastState>({
    show: false,
    message: "",
    type: "success",
  });

  const showToast = useCallback((message: string, type: ToastType = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast((prev) => ({ ...prev, show: false }));
    }, TOAST_DURATION);
  }, []);

  const hideToast = useCallback(() => {
    setToast((prev) => ({ ...prev, show: false }));
  }, []);

  return {
    toast,
    showToast,
    hideToast,
  };
}

