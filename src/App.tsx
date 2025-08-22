import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";

// Layouts
import { Layout } from "./components/Layout";
import { LayoutFirebase } from "./components/LayoutFirebase";

// Pages - Local Mode
import { Notes } from "./pages/Notes";
import { Tasks } from "./pages/Tasks";
import { Profile } from "./pages/Profile";
import { SharedNotes } from "./pages/SharedNotes";

// Pages - Firebase Mode
import { FirebaseHome } from "./pages/FirebaseHome";
import { SharedNotesFirebase } from "./pages/SharedNotesFirebase";
import { SharedWithMeNotes } from "./pages/SharedWithMeNotes";
import { TasksFirebase } from "./pages/TasksFirebase";
import { ChecklistPage } from "./pages/ChecklistPage";
import { ProfileFirebase } from "./pages/ProfileFirebase";

// Debug & Mode Selector
import { ModeSelector } from "./pages/ModeSelector";
import { FirebaseDebugPage } from "./pages/FirebaseDebugPage";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          {/* Main App Routes - sempre Firebase */}
          <Route path="/" element={<LayoutFirebase />}>
            <Route index element={<FirebaseHome />} />
            <Route path="tasks" element={<TasksFirebase />} />
            <Route path="checklist" element={<ChecklistPage />} />
            <Route path="shared" element={<SharedWithMeNotes />} />
            <Route path="profile" element={<ProfileFirebase />} />
          </Route>
          
          {/* Debug Firebase (rota oculta) */}
          <Route path="/debug-firebase" element={<FirebaseDebugPage />} />
          
          {/* Modo Local (rota oculta para testes) */}
          <Route path="/local" element={<Layout />}>
            <Route index element={<Notes />} />
            <Route path="tasks" element={<Tasks />} />
            <Route path="shared" element={<SharedNotes />} />
            <Route path="profile" element={<Profile />} />
          </Route>
          
          {/* Mode Selector (rota oculta) */}
          <Route path="/modes" element={<ModeSelector />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;