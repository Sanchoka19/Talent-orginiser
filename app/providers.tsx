'use client';

import React from 'react';
import { LanguageProvider } from '../src/context/LanguageContext';
import { AppProvider } from '../src/context/AppContext';
import { ConfirmProvider } from '../src/context/ConfirmContext';
import { ToastProvider } from '../src/context/ToastContext';
import { ModalProvider } from '../src/context/ModalContext';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <LanguageProvider>
      <AppProvider>
        <ConfirmProvider>
          <ToastProvider>
            <ModalProvider>
              {children}
            </ModalProvider>
          </ToastProvider>
        </ConfirmProvider>
      </AppProvider>
    </LanguageProvider>
  );
}
