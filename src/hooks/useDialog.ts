import type { DialogType } from '../components/Dialog';
import { useState } from 'react';

interface DialogState {
  isOpen: boolean;
  title: string;
  message: string;
  type: DialogType;
}

export const useDialog = () => {
  const [dialog, setDialog] = useState<DialogState>({
    isOpen: false,
    title: '',
    message: '',
    type: 'success'
  });

  const showDialog = (title: string, message: string, type: DialogType = 'success') => {
    setDialog({ isOpen: true, title, message, type });
  };

  const closeDialog = () => {
    setDialog(prev => ({ ...prev, isOpen: false }));
  };

  return {
    dialog,
    showDialog,
    closeDialog
  };
}; 