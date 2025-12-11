
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { useEffect } from "react";
import { initializeMobileApp, addMobileTouchOptimizations } from "@/utils/mobileOptimizations";
import Layout from "./components/Layout";
import Index from "./pages/Index";
import About from "./pages/About";
import Services from "./pages/Services";
import Resources from "./pages/Resources";
import Contact from "./pages/Contact";
import Blog from "./pages/Blog";
import BlogPost from "./components/blog/BlogPost";
import Careers from "./pages/Careers";
import Donate from "./pages/Donate";
import Auth from "./pages/Auth";
import ResetPassword from "./pages/ResetPassword";
import Dashboard from "./pages/Dashboard";
import AdminLogin from "./pages/AdminLogin";
import AdminPanel from "./pages/AdminPanel";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsOfService from "./pages/TermsOfService";
import DataProtection from "./pages/DataProtection";
import NotFound from "./pages/NotFound";
import EmployerDashboard from "./pages/EmployerDashboard";
import DonationSuccess from "./pages/DonationSuccess";
import DonationCancelled from "./pages/DonationCancelled";
import Partners from "./pages/Partners";

const queryClient = new QueryClient();

const App = () => {
  useEffect(() => {
    // Initialize mobile app features
    initializeMobileApp();
    addMobileTouchOptimizations();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Layout />}>
                <Route index element={<Index />} />
                <Route path="about" element={<About />} />
                <Route path="services" element={<Services />} />
                <Route path="resources" element={<Resources />} />
                <Route path="contact" element={<Contact />} />
                <Route path="blog" element={<Blog />} />
                <Route path="blog/:slug" element={<BlogPost />} />
                <Route path="careers" element={<Careers />} />
                <Route path="donate" element={<Donate />} />
                <Route path="partners" element={<Partners />} />
                <Route path="donation-success" element={<DonationSuccess />} />
                <Route path="donation-cancelled" element={<DonationCancelled />} />
                <Route path="auth" element={<Auth />} />
                <Route path="auth/reset" element={<ResetPassword />} />
                <Route path="dashboard" element={<Dashboard />} />
                <Route path="admin-login" element={<AdminLogin />} />
                <Route path="admin" element={<AdminPanel />} />
                <Route path="employer-dashboard" element={<EmployerDashboard />} />
                <Route path="privacy-policy" element={<PrivacyPolicy />} />
                <Route path="terms-of-service" element={<TermsOfService />} />
                <Route path="data-protection" element={<DataProtection />} />
                <Route path="*" element={<NotFound />} />
              </Route>
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default App;
