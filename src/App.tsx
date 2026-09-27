import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { ToastProvider } from './contexts/ToastContext';
import { GuestProvider } from './contexts/GuestContext';
import { AppRouter } from './router';

export default function App() {
  return (
    <ThemeProvider>
      <GuestProvider>
        <AuthProvider>
          <ToastProvider>
            <AppRouter />
          </ToastProvider>
        </AuthProvider>
      </GuestProvider>
    </ThemeProvider>
  );
}
