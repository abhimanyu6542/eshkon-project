"use client";

import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { clearToast } from "@/store/slices/uiSlice";
import { CheckCircle, XCircle, Info, X } from "lucide-react";

export function ToastNotification() {
  const dispatch = useAppDispatch();
  const { toastMessage, toastType } = useAppSelector((s) => s.ui);

  useEffect(() => {
    if (!toastMessage) return;
    const timer = setTimeout(() => dispatch(clearToast()), 4000);
    return () => clearTimeout(timer);
  }, [toastMessage, dispatch]);

  if (!toastMessage) return null;

  const icons = {
    success: <CheckCircle size={18} aria-hidden="true" className="text-green-600" />,
    error: <XCircle size={18} aria-hidden="true" className="text-red-600" />,
    info: <Info size={18} aria-hidden="true" className="text-blue-600" />,
  };

  const bg = {
    success: "bg-green-50 border-green-200",
    error: "bg-red-50 border-red-200",
    info: "bg-blue-50 border-blue-200",
  };

  return (
    <div
      role="status"
      aria-live="polite"
      aria-atomic="true"
      className={`fixed bottom-4 right-4 z-50 flex items-center gap-3 rounded-xl border px-4 py-3 shadow-lg ${bg[toastType ?? "info"]}`}
    >
      {icons[toastType ?? "info"]}
      <span className="text-sm font-medium text-gray-800">{toastMessage}</span>
      <button
        onClick={() => dispatch(clearToast())}
        aria-label="Dismiss notification"
        className="ml-2 rounded p-0.5 text-gray-400 hover:text-gray-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-indigo-600"
      >
        <X size={14} aria-hidden="true" />
      </button>
    </div>
  );
}
