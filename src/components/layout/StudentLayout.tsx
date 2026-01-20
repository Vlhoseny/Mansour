import { useState } from "react";
import { Navigate } from "react-router-dom";
import { useStudentAuth } from "@/contexts/StudentAuthContext";
import { StudentSidebar, StudentMobileHeader } from "./StudentSidebar";

interface StudentLayoutProps {
  children: React.ReactNode;
}

export function StudentLayout({ children }: StudentLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { isAuthenticated, isLoading } = useStudentAuth();

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/student/login" replace />;
  }

  return (
    <div className="min-h-screen bg-background" dir="rtl">
      <StudentMobileHeader onMenuClick={() => setSidebarOpen(true)} />
      <div className="flex">
        <StudentSidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
        <main className="flex-1 p-4 lg:p-6 overflow-x-hidden">
          {children}
        </main>
      </div>
    </div>
  );
}
