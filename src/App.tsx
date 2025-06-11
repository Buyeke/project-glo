
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
import Services from "./pages/Services";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

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
              <Route path="services" element={<Services />} />
              {/* Placeholder routes for other pages */}
              <Route path="resources" element={<div className="p-8 text-center">Resources page coming soon!</div>} />
              <Route path="shop" element={<div className="p-8 text-center">Shop page coming soon!</div>} />
              <Route path="blog" element={<div className="p-8 text-center">Blog page coming soon!</div>} />
              <Route path="contact" element={<div className="p-8 text-center">Contact page coming soon!</div>} />
              <Route path="donate" element={<div className="p-8 text-center">Donation page coming soon!</div>} />
              <Route path="*" element={<NotFound />} />
            </Route>
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
