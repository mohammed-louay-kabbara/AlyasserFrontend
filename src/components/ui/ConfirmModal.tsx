import React from "react";

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: "danger" | "warning" | "info";
}

const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "تأكيد",
  cancelText = "إلغاء",
  type = "danger"
}) => {
  if (!isOpen) return null;

  const getConfirmButtonClass = () => {
    switch (type) {
      case "danger":
        return "bg-red-600 text-white hover:bg-red-700";
      case "warning":
        return "bg-yellow-600 text-white hover:bg-yellow-700";
      case "info":
        return "bg-blue-600 text-white hover:bg-blue-700";
      default:
        return "bg-red-600 text-white hover:bg-red-700";
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-xl">
        <h2 className="text-xl font-bold text-gray-900 mb-4">{title}</h2>
        <p className="text-gray-700 mb-6">{message}</p>
        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
          >
            {cancelText}
          </button>
          <button
            onClick={async () => {
              await onConfirm();
              onClose();
            }}
            className={`px-4 py-2 rounded-lg transition-colors ${getConfirmButtonClass()}`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
