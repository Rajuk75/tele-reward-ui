import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// ─── Shared config ────────────────────────────────────────────────────────────
const toastConfig = {
  position: "top-right",
  autoClose: 5000,
  hideProgressBar: true,
  closeOnClick: true,
  pauseOnHover: true,
  draggable: true,
  theme: "colored",
  style: { width: "280px", fontSize: "13px", minHeight: "44px", padding: "8px 12px" },
};

// ─── Deduplication Guard (Prevents double toasts within 2 seconds) ────────────
const recentToasts = new Map();

function shouldSuppressToast(message, type) {
  if (!message || (typeof message === "string" && !message.trim())) return true;
  const key = `${type}:${String(message).trim().toLowerCase()}`;
  const now = Date.now();

  if (recentToasts.has(key) && now - recentToasts.get(key) < 2000) {
    return true; // Suppress duplicate toast
  }
  recentToasts.set(key, now);

  // Auto clean old keys
  if (recentToasts.size > 100) {
    for (const [k, time] of recentToasts.entries()) {
      if (now - time > 5000) recentToasts.delete(k);
    }
  }
  return false;
}

// ─── Base helper ──────────────────────────────────────────────────────────────
export const showNotification = (message, type = "info") => {
  if (shouldSuppressToast(message, type)) return;
  toast(message, { ...toastConfig, type });
};

// ─── Convenience helpers ──────────────────────────────────────────────────────

/** @example showSuccess(res.data.message || "Saved successfully") */
export const showSuccess = (message) => {
  if (shouldSuppressToast(message, "success")) return;
  toast.success(message, toastConfig);
};

/** @example showError(error?.response?.data?.message || "Something went wrong") */
export const showError = (message) => {
  if (shouldSuppressToast(message, "error")) return;
  toast.error(message, toastConfig);
};

/** @example showWarning("Session expiring soon") */
export const showWarning = (message) => {
  if (shouldSuppressToast(message, "warning")) return;
  toast.warning(message, toastConfig);
};

export const showWarn = showWarning;

/** @example showInfo("New update available") */
export const showInfo = (message) => {
  if (shouldSuppressToast(message, "info")) return;
  toast.info(message, toastConfig);
};

export default {
  showNotification,
  showSuccess,
  showError,
  showWarning,
  showWarn,
  showInfo,
};
