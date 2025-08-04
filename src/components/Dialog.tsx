import React from 'react';

export type DialogType = 'success' | 'error' | 'warning';

export interface DialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  type: DialogType;
  onClose: () => void;
  confirmText?: string;
}

const Dialog: React.FC<DialogProps> = ({
  isOpen,
  title,
  message,
  type,
  onClose,
  confirmText = 'OK'
}) => {
  if (!isOpen) return null;

  const getIconAndColors = () => {
    switch (type) {
      case 'success':
        return {
          icon: '✓',
          bgColor: 'bg-green-100',
          textColor: 'text-green-600'
        };
      case 'error':
        return {
          icon: '✕',
          bgColor: 'bg-red-100',
          textColor: 'text-red-600'
        };
      case 'warning':
      default:
        return {
          icon: '⚠',
          bgColor: 'bg-yellow-100',
          textColor: 'text-yellow-600'
        };
    }
  };

  const { icon, bgColor, textColor } = getIconAndColors();

  return (
    <div className="fixed inset-0 bg-gray-900/30 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-xl">
        <div className="flex items-center mb-4">
          <div className={`w-6 h-6 rounded-full flex items-center justify-center mr-3 ${bgColor} ${textColor}`}>
            {icon}
          </div>
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        </div>
        <p className="text-gray-600 mb-6">{message}</p>
        <div className="flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dialog; 