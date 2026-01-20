import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { studentAuthApi, setAuthToken, removeAuthToken } from '@/lib/api';
import type { StudentDto, RegisterDto } from '@/lib/types';

interface StudentUser {
  id: number;
  username: string;
  role: string;
  studentId?: number;
}

interface StudentAuthContextType {
  user: StudentUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (data: RegisterDto) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
}

const StudentAuthContext = createContext<StudentAuthContextType | undefined>(undefined);

export function StudentAuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<StudentUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem('student_user');
    const token = localStorage.getItem('student_auth_token');

    if (storedUser && token) {
      try {
        setUser(JSON.parse(storedUser));
        // Set token for API calls
        localStorage.setItem('auth_token', token);
      } catch {
        localStorage.removeItem('student_user');
        localStorage.removeItem('student_auth_token');
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (username: string, password: string) => {
    try {
      const response = await studentAuthApi.login({ username, password });

      if (response.error) {
        return { success: false, error: response.error };
      }

      if (response.data) {
        const payload = response.data as any;
        const inner = payload.data ?? payload;
        const token = inner.token;

        if (!token) {
          return { success: false, error: 'لم يتم استلام رمز الدخول من الخادم' };
        }

        const userData: StudentUser = {
          id: inner.userId ?? inner.id ?? 0,
          username: inner.userName ?? inner.username ?? username,
          role: inner.role ?? 'Student',
          studentId: inner.studentId,
        };

        // Store student-specific tokens
        localStorage.setItem('student_auth_token', token);
        localStorage.setItem('student_user', JSON.stringify(userData));
        localStorage.setItem('auth_token', token); // For API calls
        setUser(userData);

        return { success: true };
      }

      return { success: false, error: 'لم يتم استلام بيانات صحيحة من الخادم' };
    } catch (error) {
      console.error('Student login error:', error);
      return { success: false, error: 'فشل الاتصال بالخادم' };
    }
  };

  const register = async (data: RegisterDto) => {
    try {
      const response = await studentAuthApi.register({
        ...data,
        role: 'Student',
      });

      if (response.error) {
        return { success: false, error: response.error };
      }

      if (response.data) {
        const payload = response.data as any;
        const inner = payload.data ?? payload;
        const token = inner.token;

        if (token) {
          const userData: StudentUser = {
            id: inner.userId ?? inner.id ?? 0,
            username: inner.userName ?? inner.username ?? data.userName,
            role: 'Student',
            studentId: inner.studentId,
          };

          localStorage.setItem('student_auth_token', token);
          localStorage.setItem('student_user', JSON.stringify(userData));
          localStorage.setItem('auth_token', token);
          setUser(userData);
        }

        return { success: true };
      }

      return { success: false, error: 'فشل إنشاء الحساب' };
    } catch (error) {
      console.error('Student register error:', error);
      return { success: false, error: 'فشل الاتصال بالخادم' };
    }
  };

  const logout = () => {
    setUser(null);
    removeAuthToken();
    localStorage.removeItem('student_user');
    localStorage.removeItem('student_auth_token');
  };

  return (
    <StudentAuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        register,
        logout,
      }}
    >
      {children}
    </StudentAuthContext.Provider>
  );
}

export function useStudentAuth() {
  const context = useContext(StudentAuthContext);
  if (context === undefined) {
    throw new Error('useStudentAuth must be used within a StudentAuthProvider');
  }
  return context;
}
