
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from '@/App.jsx';
import '@/index.css';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ClerkProvider } from '@clerk/clerk-react';
import { BrowserRouter, useNavigate } from 'react-router-dom';

const PUBLISHABLE_KEY = 'pk_test_Y2hlZXJmdWwtZHJ1bS04NC5jbGVyay5hY2NvdW50cy5kZXYk';

const queryClient = new QueryClient();

function ClerkProviderWithNavigate({ children }) {
  const navigate = useNavigate();
  return (
    <ClerkProvider
      publishableKey={PUBLISHABLE_KEY}
      navigate={(to) => navigate(to)}
    >
      {children}
    </ClerkProvider>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <ClerkProviderWithNavigate>
          <App />
        </ClerkProviderWithNavigate>
      </BrowserRouter>
    </QueryClientProvider>
  </React.StrictMode>
);
