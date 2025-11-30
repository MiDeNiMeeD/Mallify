import React from "react";
import { CheckCircle, Info, AlertTriangle, X } from "lucide-react";
import "./Toast.css";

const Toast = ({ show, message, type = "error", onClose }) => {
  if (!show) return null;

  const getIcon = () => {
    switch (type) {
      case "success":
        return <CheckCircle size={20} />;
      case "info":
        return <Info size={20} />;
      case "warning":
        return <AlertTriangle size={20} />;
      case "error":
        return <X size={20} />;
      default:
        return <Info size={20} />;
    }
  };

  const getTypeClass = () => {
    switch (type) {
      case "success":
        return "toast-success";
      case "info":
        return "toast-info";
      case "warning":
        return "toast-warning";
      case "error":
        return "toast-error";
      default:
        return "toast-error";
    }
  };

  return (
    <div className={`toast-notification ${getTypeClass()}`}>
      <div className="toast-icon">{getIcon()}</div>
      <span className="toast-message">{message}</span>
    </div>
  );
};

export default Toast;
