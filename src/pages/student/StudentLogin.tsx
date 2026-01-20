import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useStudentAuth } from "@/contexts/StudentAuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import logo from "@/assets/hurghada-logo.png";

export default function StudentLogin() {
  const navigate = useNavigate();
  const { login, register, isAuthenticated } = useStudentAuth();
  const [isLoading, setIsLoading] = useState(false);

  // Login form state
  const [loginForm, setLoginForm] = useState({ username: "", password: "" });
  // Register form state
  const [registerForm, setRegisterForm] = useState({ userName: "", password: "", confirmPassword: "" });

  if (isAuthenticated) {
    navigate("/student/dashboard");
    return null;
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const result = await login(loginForm.username, loginForm.password);

    if (result.success) {
      toast.success("تم تسجيل الدخول بنجاح");
      navigate("/student/dashboard");
    } else {
      toast.error(result.error || "فشل تسجيل الدخول");
    }

    setIsLoading(false);
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    if (registerForm.password !== registerForm.confirmPassword) {
      toast.error("كلمات المرور غير متطابقة");
      return;
    }

    if (registerForm.password.length < 6) {
      toast.error("يجب أن تكون كلمة المرور 6 أحرف على الأقل");
      return;
    }

    setIsLoading(true);

    const result = await register({
      userName: registerForm.userName,
      password: registerForm.password,
      role: "Student",
    });

    if (result.success) {
      toast.success("تم إنشاء الحساب بنجاح");
      navigate("/student/dashboard");
    } else {
      toast.error(result.error || "فشل إنشاء الحساب");
    }

    setIsLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-secondary/5 p-4" dir="rtl">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center space-y-4">
          <div className="flex justify-center">
            <img src={logo} alt="Logo" className="h-20 w-20 rounded-xl shadow-lg" />
          </div>
          <div>
            <CardTitle className="text-2xl font-bold">بوابة الطالب</CardTitle>
            <CardDescription>نظام إدارة السكن الجامعي - جامعة الغردقة</CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="login">تسجيل الدخول</TabsTrigger>
              <TabsTrigger value="register">حساب جديد</TabsTrigger>
            </TabsList>

            <TabsContent value="login">
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="login-username">اسم المستخدم</Label>
                  <Input
                    id="login-username"
                    type="text"
                    placeholder="أدخل اسم المستخدم"
                    value={loginForm.username}
                    onChange={(e) => setLoginForm({ ...loginForm, username: e.target.value })}
                    required
                    disabled={isLoading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="login-password">كلمة المرور</Label>
                  <Input
                    id="login-password"
                    type="password"
                    placeholder="أدخل كلمة المرور"
                    value={loginForm.password}
                    onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                    required
                    disabled={isLoading}
                  />
                </div>
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? "جارِ تسجيل الدخول..." : "تسجيل الدخول"}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="register">
              <form onSubmit={handleRegister} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="register-username">اسم المستخدم</Label>
                  <Input
                    id="register-username"
                    type="text"
                    placeholder="اختر اسم مستخدم"
                    value={registerForm.userName}
                    onChange={(e) => setRegisterForm({ ...registerForm, userName: e.target.value })}
                    required
                    disabled={isLoading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="register-password">كلمة المرور</Label>
                  <Input
                    id="register-password"
                    type="password"
                    placeholder="اختر كلمة مرور قوية"
                    value={registerForm.password}
                    onChange={(e) => setRegisterForm({ ...registerForm, password: e.target.value })}
                    required
                    disabled={isLoading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="register-confirm">تأكيد كلمة المرور</Label>
                  <Input
                    id="register-confirm"
                    type="password"
                    placeholder="أعد إدخال كلمة المرور"
                    value={registerForm.confirmPassword}
                    onChange={(e) => setRegisterForm({ ...registerForm, confirmPassword: e.target.value })}
                    required
                    disabled={isLoading}
                  />
                </div>
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? "جارِ إنشاء الحساب..." : "إنشاء حساب"}
                </Button>
              </form>
            </TabsContent>
          </Tabs>

          <div className="mt-6 text-center">
            <Link to="/login" className="text-sm text-muted-foreground hover:text-primary transition-colors">
              دخول كمسؤول؟
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
