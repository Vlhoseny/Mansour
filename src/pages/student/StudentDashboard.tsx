import { useEffect, useState } from "react";
import { StudentLayout } from "@/components/layout/StudentLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { studentProfileApi, studentApplicationsApi } from "@/lib/api";
import { useStudentAuth } from "@/contexts/StudentAuthContext";
import {
  FileText,
  Home,
  Bell,
  CreditCard,
  User,
  Loader2,
} from "lucide-react";
import type { StudentDto, NotificationDto, FeesDto, RoomAssignment, ApplicationDetails } from "@/lib/types";

export default function StudentDashboard() {
  const { user } = useStudentAuth();
  const [profile, setProfile] = useState<StudentDto | null>(null);
  const [notifications, setNotifications] = useState<NotificationDto[]>([]);
  const [fees, setFees] = useState<FeesDto[]>([]);
  const [assignments, setAssignments] = useState<RoomAssignment[]>([]);
  const [applications, setApplications] = useState<ApplicationDetails[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [profileRes, notificationsRes, feesRes, assignmentsRes, applicationsRes] = await Promise.all([
          studentProfileApi.getDetails(),
          studentProfileApi.getNotifications(),
          studentProfileApi.getFees(),
          studentProfileApi.getAssignments(),
          studentApplicationsApi.getMyApplications(),
        ]);

        // The details endpoint may return a wrapper: { success, data: { student, fees, notifications }, message }
        const detailsPayload: any = profileRes?.data;

        if (detailsPayload) {
          const inner = detailsPayload.data ?? detailsPayload;
          if (inner?.student) {
            setProfile(inner.student as StudentDto);
            if (Array.isArray(inner.notifications)) setNotifications(inner.notifications as NotificationDto[]);
            if (Array.isArray(inner.fees)) setFees(inner.fees as FeesDto[]);
          } else if (inner && inner.fullName) {
            // already a StudentDto shape
            setProfile(inner as StudentDto);
          }
        }

        // Fallbacks: if details didn't provide notifications/fees, use the dedicated endpoints
        if ((!notifications || notifications.length === 0) && notificationsRes.data && Array.isArray(notificationsRes.data)) {
          setNotifications(notificationsRes.data);
        }

        if ((!fees || fees.length === 0) && feesRes.data && Array.isArray(feesRes.data)) {
          setFees(feesRes.data);
        }

        if (assignmentsRes.data && Array.isArray(assignmentsRes.data)) setAssignments(assignmentsRes.data);
        if (applicationsRes.data && Array.isArray(applicationsRes.data)) setApplications(applicationsRes.data);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const unreadNotifications = (notifications || []).filter((n) => !n.isRead).length;
  const pendingFees = (fees || []).filter((f) => f.status !== "Paid").length;
  const pendingApplications = (applications || []).filter((a) => a.status === "Pending").length;

  if (isLoading) {
    return (
      <StudentLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </StudentLayout>
    );
  }

  return (
    <StudentLayout>
      <div className="space-y-6">
        {/* Welcome Header */}
        <div className="bg-gradient-to-l from-primary/10 to-primary/5 rounded-xl p-6 border border-primary/20">
          <h1 className="text-2xl font-bold text-foreground">
            مرحباً، {profile?.fullName || user?.username || "طالب"}
          </h1>
          <p className="text-muted-foreground mt-1">
            مرحباً بك في بوابة الطالب - نظام إدارة السكن الجامعي
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-lg bg-blue-100 dark:bg-blue-900/30">
                  <FileText className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">طلباتي</p>
                  <p className="text-2xl font-bold">{applications.length}</p>
                  {pendingApplications > 0 && (
                    <Badge variant="secondary" className="mt-1">
                      {pendingApplications} قيد المراجعة
                    </Badge>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-lg bg-green-100 dark:bg-green-900/30">
                  <Home className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">السكن</p>
                  <p className="text-2xl font-bold">
                    {assignments.length > 0 ? "مُخصص" : "غير مُخصص"}
                  </p>
                  {assignments.length > 0 && (
                    <p className="text-xs text-muted-foreground mt-1">
                      غرفة {assignments[0].roomNumber}
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-lg bg-yellow-100 dark:bg-yellow-900/30">
                  <Bell className="h-6 w-6 text-yellow-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">الإشعارات</p>
                  <p className="text-2xl font-bold">{notifications.length}</p>
                  {unreadNotifications > 0 && (
                    <Badge variant="destructive" className="mt-1">
                      {unreadNotifications} غير مقروءة
                    </Badge>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-lg bg-purple-100 dark:bg-purple-900/30">
                  <CreditCard className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">الرسوم</p>
                  <p className="text-2xl font-bold">{fees.length}</p>
                  {pendingFees > 0 && (
                    <Badge variant="outline" className="mt-1 text-orange-600 border-orange-600">
                      {pendingFees} غير مدفوعة
                    </Badge>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Info */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Profile Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                معلومات الطالب
              </CardTitle>
            </CardHeader>
            <CardContent>
              {profile ? (
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">الاسم:</span>
                    <span className="font-medium">{profile.fullName || "-"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">الكلية:</span>
                    <span className="font-medium">{profile.faculty || "-"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">القسم:</span>
                    <span className="font-medium">{profile.department || "-"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">المستوى:</span>
                    <span className="font-medium">{profile.level || "-"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">البريد:</span>
                    <span className="font-medium">{profile.email || "-"}</span>
                  </div>
                </div>
              ) : (
                <p className="text-muted-foreground text-center py-4">
                  لم يتم تحديث بيانات الملف الشخصي بعد
                </p>
              )}
            </CardContent>
          </Card>

          {/* Recent Notifications */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                آخر الإشعارات
              </CardTitle>
            </CardHeader>
            <CardContent>
              {notifications.length > 0 ? (
                <div className="space-y-3">
                  {notifications.slice(0, 4).map((notification) => (
                    <div
                      key={notification.notificationId}
                      className={`p-3 rounded-lg border ${
                        !notification.isRead
                          ? "bg-primary/5 border-primary/20"
                          : "bg-muted/50"
                      }`}
                    >
                      <p className="font-medium text-sm">{notification.title}</p>
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                        {notification.message}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-center py-4">
                  لا توجد إشعارات حالياً
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Housing Assignment */}
        {assignments.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Home className="h-5 w-5" />
                السكن المُخصص
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {assignments.map((assignment) => (
                  <div
                    key={assignment.assignmentId}
                    className="p-4 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800"
                  >
                    <p className="font-medium text-green-800 dark:text-green-200">
                      {assignment.buildingName}
                    </p>
                    <p className="text-sm text-green-600 dark:text-green-400">
                      غرفة رقم: {assignment.roomNumber}
                    </p>
                    <p className="text-xs text-muted-foreground mt-2">
                      تاريخ التخصيص: {new Date(assignment.assignedAt).toLocaleDateString("ar-EG")}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </StudentLayout>
  );
}
