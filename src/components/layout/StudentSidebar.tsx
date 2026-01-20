import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useStudentAuth } from "@/contexts/StudentAuthContext";
import { studentApplicationsApi } from "@/lib/api";
import {
  LayoutDashboard,
  FileText,
  User,
  CreditCard,
  MessageSquare,
  Bell,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import logo from "@/assets/hurghada-logo.png";

const navigation = [
  { name: "لوحة التحكم", href: "/student/dashboard", icon: LayoutDashboard },
  { name: "طلبات السكن", href: "/student/applications", icon: FileText },
  { name: "الملف الشخصي", href: "/student/profile", icon: User },
  { name: "الرسوم والمدفوعات", href: "/student/payments", icon: CreditCard },
  { name: "الشكاوى", href: "/student/complaints", icon: MessageSquare },
  { name: "الإشعارات", href: "/student/notifications", icon: Bell },
];

interface StudentSidebarProps {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
}

export function StudentSidebar({ sidebarOpen, setSidebarOpen }: StudentSidebarProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout, user } = useStudentAuth();
  const [hasApplication, setHasApplication] = useState<boolean | null>(null);

  // Check if student has already submitted an application
  useEffect(() => {
    const checkApplications = async () => {
      const result = await studentApplicationsApi.getMyApplications();
      setHasApplication(!result.error && result.data && result.data.length > 0);
    };
    checkApplications();
  }, []);

  const handleLogout = () => {
    logout();
    navigate("/student/login");
  };

  return (
    <>
      {/* Mobile backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={cn(
          "fixed inset-y-0 right-0 z-50 w-72 bg-card border-l border-border transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-auto",
          sidebarOpen ? "translate-x-0" : "translate-x-full"
        )}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-border">
            <div className="flex items-center gap-3">
              <img src={logo} alt="Logo" className="h-10 w-10 rounded-lg" />
              <div>
                <h1 className="font-semibold text-foreground">بوابة الطالب</h1>
                <p className="text-xs text-muted-foreground">جامعة الغردقة</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* User Info */}
          <div className="p-4 border-b border-border bg-muted/30">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                <User className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="font-medium text-sm text-foreground">
                  {user?.username || "طالب"}
                </p>
                <p className="text-xs text-muted-foreground">طالب</p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
            {navigation.map((item) => {
              // Hide applications link if student already has an application
              if (item.href === "/student/applications" && hasApplication) {
                return null;
              }

              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors",
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                >
                  <item.icon className="h-5 w-5" />
                  {item.name}
                </Link>
              );
            })}
          </nav>

          {/* Logout */}
          <div className="p-4 border-t border-border">
            <Button
              variant="ghost"
              className="w-full justify-start gap-3 text-destructive hover:text-destructive hover:bg-destructive/10"
              onClick={handleLogout}
            >
              <LogOut className="h-5 w-5" />
              تسجيل الخروج
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}

export function StudentMobileHeader({ onMenuClick }: { onMenuClick: () => void }) {
  return (
    <div className="sticky top-0 z-30 flex items-center justify-between p-4 bg-card border-b border-border lg:hidden">
      <div className="flex items-center gap-3">
        <img src={logo} alt="Logo" className="h-8 w-8 rounded-lg" />
        <span className="font-semibold text-foreground">بوابة الطالب</span>
      </div>
      <Button variant="ghost" size="icon" onClick={onMenuClick}>
        <Menu className="h-5 w-5" />
      </Button>
    </div>
  );
}
