import React from 'react';
import { AppProps } from 'next/app';
import { AuthProvider } from '../contexts/AuthContext';
import { NotificationProvider } from '../contexts/NotificationContext';
import '../styles/globals.css';
import { Toaster } from 'react-hot-toast';

export default function App({ Component, pageProps }: AppProps) {
  return (
    <AuthProvider>
      <NotificationProvider>
        <Component {...pageProps} />
        <Toaster position="top-right" />
      </NotificationProvider>
    </AuthProvider>
  );
}
