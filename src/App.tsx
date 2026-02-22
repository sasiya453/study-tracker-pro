import { useState } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import SubjectPage from "./pages/SubjectPage";
import NotFound from "./pages/NotFound";
import PatternLock from "./components/PatternLock";

const queryClient = new QueryClient();

const App = () => {
  const [unlocked, setUnlocked] = useState(() => {
    return sessionStorage.getItem('al-tracker-unlocked') === 'true';
  });

  const handleUnlock = () => {
    sessionStorage.setItem('al-tracker-unlocked', 'true');
    setUnlocked(true);
  };

  if (!unlocked) {
    return (
      <PatternLock onSuccess={handleUnlock} />
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/subject/:subjectKey" element={<SubjectPage />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
