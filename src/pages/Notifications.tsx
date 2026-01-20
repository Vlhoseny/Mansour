import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Bell,
  Send,
  Clock,
  Users,
  Mail,
  Megaphone,
} from 'lucide-react';
import { toast } from 'sonner';
import { notificationsApi } from '@/lib/api';
import type { NotificationDto } from '@/lib/types';


export default function Notifications() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [recentNotifications, setRecentNotifications] = useState<NotificationDto[]>([]);
  
  const handleSendNotification = async () => {
    if (!title || !message) {
      toast.error('الرجاء ملء جميع الحقول');
      return;
    }

    const payload = { title, message };
    const res = await notificationsApi.sendToAll(payload as any);

    if (res.error) {
      toast.error('فشل إرسال الإشعار');
      return;
    }

    // Response contains the created notification
    const created = res.data as NotificationDto | undefined;

    toast.success('تم إرسال الإشعار إلى جميع الطلاب');
    setIsDialogOpen(false);
    setTitle('');
    setMessage('');

    if (created) {
      setRecentNotifications((prev) => [created, ...prev]);
    }
  };
  
  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'payment':
        return <span className="w-8 h-8 rounded-lg bg-gold/10 flex items-center justify-center text-gold-dark">💰</span>;
      case 'maintenance':
        return <span className="w-8 h-8 rounded-lg bg-ocean/10 flex items-center justify-center text-ocean">🔧</span>;
      case 'announcement':
        return <span className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">📢</span>;
      case 'inspection':
        return <span className="w-8 h-8 rounded-lg bg-sunset/10 flex items-center justify-center text-sunset">🔍</span>;
      default:
        return <span className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center">📝</span>;
    }
  };
  const readRate = recentNotifications.length
    ? `${Math.round((recentNotifications.filter((n) => n.isRead).length / recentNotifications.length) * 100)}%`
    : '-';
  
  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">الإشعارات</h1>
            <p className="text-muted-foreground">إرسال الإعلانات إلى الطلاب</p>
          </div>
          
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-primary hover:bg-primary/90">
                <Megaphone className="w-4 h-4 ml-2" />
                إرسال إشعار
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>إرسال إشعار</DialogTitle>
                <DialogDescription>
                  إرسال إعلان إلى جميع الطلاب
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label htmlFor="title">العنوان</Label>
                  <Input
                    id="title"
                    placeholder="أدخل عنوان الإشعار"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="message">الرسالة</Label>
                  <Textarea
                    id="message"
                    placeholder="أدخل رسالتك..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    rows={4}
                  />
                </div>
                
                <div className="p-4 bg-muted/50 rounded-lg flex items-center gap-3">
                  <Users className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">المستلمون</p>
                    <p className="text-xs text-muted-foreground">جميع الطلاب المقيمون</p>
                  </div>
                </div>
                
                <Button className="w-full" onClick={handleSendNotification}>
                  <Send className="w-4 h-4 ml-2" />
                  إرسال إلى جميع الطلاب
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
        
        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Bell className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{recentNotifications.length}</p>
                  <p className="text-xs text-muted-foreground">الإجمالي المرسل</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center">
                  <Users className="w-5 h-5 text-success" />
                </div>
                <div>
                  <p className="text-2xl font-bold">-</p>
                  <p className="text-xs text-muted-foreground">المستلمون</p>
                  <p className="text-xs text-muted-foreground">جميع الطلاب</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-ocean/10 flex items-center justify-center">
                  <Mail className="w-5 h-5 text-ocean" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{readRate}</p>
                  <p className="text-xs text-muted-foreground">نسبة القراءة</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-gold/10 flex items-center justify-center">
                  <Clock className="w-5 h-5 text-gold-dark" />
                </div>
                <div>
                  <p className="text-2xl font-bold">-</p>
                  <p className="text-xs text-muted-foreground">متوسط زمن القراءة</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Recent Notifications */}
        <Card>
          <CardHeader>
            <CardTitle>الإشعارات الأخيرة</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {recentNotifications.map((notification) => (
              <div 
                key={notification.notificationId}
                className="p-4 rounded-lg border bg-card hover:bg-muted/30 transition-colors"
              >
                <div className="flex items-start gap-4">
                  {getTypeIcon('announcement')}
                  <div className="flex-1">
                    <h4 className="font-semibold text-foreground">{notification.title}</h4>
                    <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                      {notification.message}
                    </p>
                    <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {new Date(notification.createdAt).toLocaleString()}
                      </span>
                      <span className="flex items-center gap-1">
                        <Users className="w-3 h-3" />
                        {'All Students'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
