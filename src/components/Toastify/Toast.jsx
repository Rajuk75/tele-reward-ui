import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// ─── Shared config ────────────────────────────────────────────────────────────
const toastConfig = {
  position: "top-right",
  autoClose: 5000,
  hideProgressBar: true, // ← progress bar hidden
  closeOnClick: true,
  pauseOnHover: true,
  draggable: true,
  theme: "colored",
  style: { width: "280px", fontSize: "13px", minHeight: "44px", padding: "8px 12px" },
};

// ─── Base helper ──────────────────────────────────────────────────────────────
export const showNotification = (message, type = "info") => {
  if (!message || (typeof message === "string" && !message.trim())) return;
  toast(message, { ...toastConfig, type });
};

// ─── Convenience helpers ──────────────────────────────────────────────────────

/** @example showSuccess(res.data.message || "Saved successfully") */
export const showSuccess = (message) => {
  if (!message || (typeof message === "string" && !message.trim())) return;
  toast.success(message, toastConfig);
};

/** @example showError(error?.response?.data?.message || "Something went wrong") */
export const showError = (message) => {
  if (!message || (typeof message === "string" && !message.trim())) return;
  toast.error(message, toastConfig);
};

/** @example showWarning("Session expiring soon") */
export const showWarning = (message) => {
  if (!message || (typeof message === "string" && !message.trim())) return;
  toast.warning(message, toastConfig);
};

export const showWarn = showWarning;

/** @example showInfo("New update available") */
export const showInfo = (message) => {
  if (!message || (typeof message === "string" && !message.trim())) return;
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
