import { BrowserRouter as Router } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import AppRoutes from "./routes/AppRoutes";
import ScrollToTopOnNavigate from "./components/ScrollToTopOnNavigate";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./context/ThemeContext";

import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,       // 30s cache
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

const App = () => {
  return (
    <ThemeProvider>
      <QueryClientProvider client={queryClient}>
        <Router basename={import.meta.env.BASE_URL}>
          <ErrorBoundary>
            <ScrollToTopOnNavigate />
            <AppRoutes />
            <ToastContainer />
          </ErrorBoundary>
        </Router>
      </QueryClientProvider>
    </ThemeProvider>
  );
};

export default App;
