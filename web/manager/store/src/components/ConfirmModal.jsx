import React, { useState, useEffect } from "react";
import "./ConfirmModal.css";

const ConfirmModal = ({ 
  show, 
  title = "Confirm Action",
  message, 
  confirmText = "Confirm", 
  cancelText = "Cancel",
  onConfirm, 
  onCancel,
  type = "default", // default, danger, success
  showInput = false,
  inputPlaceholder = "Enter text...",
  inputRequired = false
}) => {
  const [inputValue, setInputValue] = useState("");

  useEffect(() => {
    if (!show) {
      setInputValue("");
    }
  }, [show]);

  if (!show) return null;

  const handleConfirm = () => {
    if (showInput) {
      if (inputRequired && !inputValue.trim()) {
        return;
      }
      onConfirm(inputValue);
    } else {
      onConfirm();
    }
  };

  const getIcon = () => {
    switch (type) {
      case "success":
        return (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
            <polyline points="22 4 12 14.01 9 11.01"></polyline>
          </svg>
        );
      case "danger":
        return (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
            <line x1="12" y1="9" x2="12" y2="13"></line>
            <line x1="12" y1="17" x2="12.01" y2="17"></line>
          </svg>
        );
      default:
        return (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="16" x2="12" y2="12"></line>
            <line x1="12" y1="8" x2="12.01" y2="8"></line>
          </svg>
        );
    }
  };

  const getTypeClass = () => {
    switch (type) {
      case "success":
        return "confirm-modal-success";
      case "danger":
        return "confirm-modal-danger";
      default:
        return "confirm-modal-default";
    }
  };

  return (
    <>
      <div className="confirm-modal-backdrop" onClick={onCancel}></div>
      <div className="confirm-modal-container">
        <div className={`confirm-modal ${getTypeClass()}`}>
          <div className="confirm-modal-icon">
            {getIcon()}
          </div>
          <div className="confirm-modal-content">
            <h3 className="confirm-modal-title">{title}</h3>
            <p className="confirm-modal-message">{message}</p>
            {showInput && (
              <input 
                type="text"
                className="confirm-modal-input"
                placeholder={inputPlaceholder}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                autoFocus
              />
            )}
          </div>
          <div className="confirm-modal-actions">
            <button 
              className="confirm-modal-button confirm-modal-cancel" 
              onClick={onCancel}
            >
              {cancelText}
            </button>
            <button 
              className={`confirm-modal-button confirm-modal-confirm ${
                type === "danger" ? "confirm-modal-danger-button" : ""
              }`}
              onClick={handleConfirm}
            >
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default ConfirmModal;
