import { BrowserRouter } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { SnackbarProvider } from 'notistack';
import { ThemeModeProvider } from './contexts/ThemeModeContext';
import { AuthProvider } from './contexts/AuthContext';
import { queryClient } from './services/queryClient';
import AppRouter from './app/AppRouter';

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeModeProvider>
        <SnackbarProvider maxSnack={3} anchorOrigin={{ vertical: 'top', horizontal: 'right' }}>
          <BrowserRouter>
            <AuthProvider>
              <AppRouter />
            </AuthProvider>
          </BrowserRouter>
        </SnackbarProvider>
      </ThemeModeProvider>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}
