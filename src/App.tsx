
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import Layout from "./components/Layout";
import Index from "./pages/Index";
import Home from "./pages/Home";
import About from "./pages/About";
import Auth from "./pages/Auth";
import Blog from "./pages/Blog";
import Donate from "./pages/Donate";
import Careers from "./pages/Careers";
import NotFound from "./pages/NotFound";
import AdminLogin from "./pages/AdminLogin";
import { LazyComponents } from "./utils/performanceOptimizations";
import { Suspense } from "react";

// Enhanced QueryClient configuration for better performance
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
      refetchOnWindowFocus: false,
      refetchOnReconnect: 'always',
      retry: (failureCount, error: any) => {
        // Don't retry on 4xx errors
        if (error?.status >= 400 && error?.status < 500) {
          return false;
        }
        return failureCount < 3;
      },
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    },
    mutations: {
      retry: 1,
      retryDelay: 1000,
    },
  },
});

// Loading fallback component
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="text-center space-y-4">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
      <p className="text-muted-foreground">Loading...</p>
    </div>
  </div>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Layout />}>
              <Route index element={<Home />} />
              <Route path="about" element={<About />} />
              <Route path="auth" element={<Auth />} />
              <Route path="services" element={
                <Suspense fallback={<PageLoader />}>
                  <LazyComponents.Services />
                </Suspense>
              } />
              <Route path="dashboard" element={
                <Suspense fallback={<PageLoader />}>
                  <LazyComponents.Dashboard />
                </Suspense>
              } />
              <Route path="admin" element={
                <Suspense fallback={<PageLoader />}>
                  <LazyComponents.AdminPanel />
                </Suspense>
              } />
              <Route path="resources" element={
                <Suspense fallback={<PageLoader />}>
                  <LazyComponents.Resources />
                </Suspense>
              } />
              <Route path="blog" element={<Blog />} />
              <Route path="donate" element={<Donate />} />
              <Route path="careers" element={<Careers />} />
              {/* Placeholder routes for other pages */}
              <Route path="shop" element={<div className="p-8 text-center">Shop page coming soon!</div>} />
              <Route path="contact" element={<div className="p-8 text-center">Contact page coming soon!</div>} />
              <Route path="*" element={<NotFound />} />
            </Route>
            {/* Admin login route outside of main layout */}
            <Route path="/admin-login" element={<AdminLogin />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
