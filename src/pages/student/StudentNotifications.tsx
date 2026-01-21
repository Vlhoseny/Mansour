import { useEffect, useState } from "react";
import { StudentLayout } from "@/components/layout/StudentLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { studentProfileApi } from "@/lib/api";
import { toast } from "sonner";
import { Bell, Loader2, CheckCircle, Circle } from "lucide-react";
import type { NotificationDto } from "@/lib/types";

export default function StudentNotifications() {
  const [notifications, setNotifications] = useState<NotificationDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    setIsLoading(true);
    try {
      // Prefer notifications included in the profile details payload
      const [detailsRes, notificationsRes] = await Promise.all([
        studentProfileApi.getDetails(),
        studentProfileApi.getNotifications(),
      ]);

      const detailsPayload: any = detailsRes?.data;
      let fromDetails: any[] | undefined;
      if (detailsPayload) {
        const inner = detailsPayload.data ?? detailsPayload;
        if (Array.isArray(inner?.notifications)) fromDetails = inner.notifications;
      }

      if (fromDetails && Array.isArray(fromDetails)) {
        setNotifications(fromDetails as NotificationDto[]);
      } else if (notificationsRes.data && Array.isArray(notificationsRes.data)) {
        setNotifications(notificationsRes.data);
      }
    } catch (error) {
      console.error("Error fetching notifications:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const markAsRead = async (id: number) => {
    try {
      const response = await studentProfileApi.markNotificationRead(id);
      if (response.error) {
        toast.error(response.error);
      } else {
        setNotifications((prev) =>
          prev.map((n) => (n.notificationId === id ? { ...n, isRead: true } : n))
        );
      }
    } catch (error) {
      toast.error("حدث خطأ");
    }
  };

  const markAllAsRead = async () => {
    const unreadNotifications = (notifications || []).filter((n) => !n.isRead);
    for (const notification of unreadNotifications) {
      await studentProfileApi.markNotificationRead(notification.notificationId);
    }
    setNotifications((prev) => (prev || []).map((n) => ({ ...n, isRead: true })));
    toast.success("تم تعليم جميع الإشعارات كمقروءة");
  };

  const unreadCount = (notifications || []).filter((n) => !n.isRead).length;

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
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">الإشعارات</h1>
            <p className="text-muted-foreground">
              {unreadCount > 0 ? `لديك ${unreadCount} إشعار جديد` : "لا توجد إشعارات جديدة"}
            </p>
          </div>
          
          {unreadCount > 0 && (
            <Button variant="outline" onClick={markAllAsRead}>
              <CheckCircle className="h-4 w-4 ml-2" />
              تعليم الكل كمقروء
            </Button>
          )}
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              جميع الإشعارات
            </CardTitle>
            <CardDescription>
              إشعارات من إدارة السكن الجامعي
            </CardDescription>
          </CardHeader>
          <CardContent>
            {notifications.length > 0 ? (
              <div className="space-y-3">
                {notifications.map((notification) => (
                  <div
                    key={notification.notificationId}
                    className={`p-4 rounded-lg border transition-colors ${
                      !notification.isRead
                        ? "bg-primary/5 border-primary/20"
                        : "bg-card hover:bg-muted/50"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="mt-1">
                        {notification.isRead ? (
                          <CheckCircle className="h-5 w-5 text-muted-foreground" />
                        ) : (
                          <Circle className="h-5 w-5 text-primary fill-primary" />
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <p className="font-medium">{notification.title}</p>
                            <p className="text-sm text-muted-foreground mt-1">
                              {notification.message}
                            </p>
                            <p className="text-xs text-muted-foreground mt-2">
                              {new Date(notification.createdAt).toLocaleDateString("ar-EG", {
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </p>
                          </div>
                          {!notification.isRead && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => markAsRead(notification.notificationId)}
                            >
                              تعليم كمقروء
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Bell className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                <p className="text-muted-foreground">لا توجد إشعارات حالياً</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </StudentLayout>
  );
}
