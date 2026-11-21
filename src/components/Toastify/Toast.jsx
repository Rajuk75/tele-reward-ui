import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Fallbacks used when a caller passes a falsy message.
const DEFAULT_MESSAGES = {
  error: "Something went wrong. Please try again.",
  success: "Action completed successfully.",
  info: "",
  warning: "",
};

const isBlank = (value) =>
  value === null || value === undefined || (typeof value === "string" && value.trim() === "");

export const showNotification = (message, type) => {
  const resolvedMessage = isBlank(message)
    ? DEFAULT_MESSAGES[type] || "Something went wrong. Please try again."
    : message;

  // Skip info/warning toasts with no explicit message
  if (isBlank(resolvedMessage)) return;

  toast(resolvedMessage, {
    type: type,
    position: "top-right",
    autoClose: 5000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    progress: undefined,
  });
};
