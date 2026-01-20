import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { StudentAuthProvider } from "./contexts/StudentAuthContext";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Applications from "./pages/Applications";
import Buildings from "./pages/Buildings";
import Rooms from "./pages/Rooms";
import Students from "./pages/Students";
import Payments from "./pages/Payments";
import Complaints from "./pages/Complaints";
import Notifications from "./pages/Notifications";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";

// Student pages
import StudentLogin from "./pages/student/StudentLogin";
import StudentDashboard from "./pages/student/StudentDashboard";
import StudentApplications from "./pages/student/StudentApplications";
import StudentProfile from "./pages/student/StudentProfile";
import StudentPayments from "./pages/student/StudentPayments";
import StudentComplaints from "./pages/student/StudentComplaints";
import StudentNotifications from "./pages/student/StudentNotifications";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AuthProvider>
        <StudentAuthProvider>
          <BrowserRouter>
            <Routes>
              {/* Admin Routes */}
              <Route path="/" element={<Navigate to="/login" replace />} />
              <Route path="/login" element={<Login />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/applications" element={<Applications />} />
              <Route path="/buildings" element={<Buildings />} />
              <Route path="/rooms" element={<Rooms />} />
              <Route path="/students" element={<Students />} />
              <Route path="/payments" element={<Payments />} />
              <Route path="/complaints" element={<Complaints />} />
              <Route path="/notifications" element={<Notifications />} />
              <Route path="/settings" element={<Settings />} />

              {/* Student Routes */}
              <Route path="/student/login" element={<StudentLogin />} />
              <Route path="/student/dashboard" element={<StudentDashboard />} />
              <Route path="/student/applications" element={<StudentApplications />} />
              <Route path="/student/profile" element={<StudentProfile />} />
              <Route path="/student/payments" element={<StudentPayments />} />
              <Route path="/student/complaints" element={<StudentComplaints />} />
              <Route path="/student/notifications" element={<StudentNotifications />} />

              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </StudentAuthProvider>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
