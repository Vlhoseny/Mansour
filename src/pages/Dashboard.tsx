import { useAuth } from '@/contexts/AuthContext';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  FileText,
  Building2,
  DoorOpen,
  Users,
  CreditCard,
  MessageSquareWarning,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertTriangle,
} from 'lucide-react';
import {
  useDashboardSummary,
  useApplications,
  usePayments,
  useComplaints,
} from '@/hooks/useApi';

function StatCard({ stat }: { stat: { title: string; value: string; change: string; icon: any; color: string; trend: string } }) {
  const colorClasses = {
    primary: 'stat-card-primary',
    secondary: 'stat-card-secondary',
    accent: 'stat-card-accent',
    success: 'stat-card-warning',
  };

  const iconBgClasses = {
    primary: 'bg-primary/10 text-primary',
    secondary: 'bg-ocean/10 text-ocean',
    accent: 'bg-gold/10 text-gold-dark',
    success: 'bg-success/10 text-success',
  };

  return (
    <div className={`stat-card ${colorClasses[stat.color as keyof typeof colorClasses]}`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-muted-foreground font-medium">{stat.title}</p>
          <p className="text-3xl font-bold mt-2 text-foreground">{stat.value}</p>
          <p className={`text-sm mt-1 flex items-center gap-1 ${stat.trend === 'up' ? 'text-success' : stat.trend === 'down' ? 'text-destructive' : 'text-muted-foreground'
            }`}>
            {stat.trend === 'up' && <TrendingUp className="w-4 h-4" />}
            {stat.change}
          </p>
        </div>
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${iconBgClasses[stat.color as keyof typeof iconBgClasses]}`}>
          <stat.icon className="w-6 h-6" />
        </div>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles = {
    pending: 'bg-gold/10 text-gold-dark border-gold/20',
    approved: 'bg-success/10 text-success border-success/20',
    rejected: 'bg-destructive/10 text-destructive border-destructive/20',
  };
  const labels: Record<string, string> = {
    pending: 'قيد الانتظار',
    approved: 'مقبول',
    rejected: 'مرفوض',
  };

  return (
    <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${styles[status as keyof typeof styles]}`}>
      {labels[status] || status}
    </span>
  );
}


export default function Dashboard() {
  const { user } = useAuth();

  // Fetch data from API
  const { data: summary, isLoading: summaryLoading } = useDashboardSummary();
  const { data: applications, isLoading: applicationsLoading } = useApplications();
  const { data: payments, isLoading: paymentsLoading } = usePayments();
  const { data: complaints, isLoading: complaintsLoading } = useComplaints();

  // Calculate stats from API data
  const stats = [
    {
      title: 'إجمالي الطلبات',
      value: summary?.pendingApplications?.toString() || '0',
      change: applications?.length ? `${applications.length} طلب` : 'لا يوجد',
      icon: FileText,
      color: 'primary',
      trend: 'neutral',
    },
    {
      title: 'المباني النشطة',
      value: summary?.totalBuildings?.toString() || '0',
      change: `${summary?.totalRooms || 0} غرفة`,
      icon: Building2,
      color: 'secondary',
      trend: 'neutral',
    },
    {
      title: 'الغرف المتاحة',
      value: ((summary?.totalRooms || 0) - (summary?.occupiedRooms || 0)).toString(),
      change: `${summary?.occupiedRooms || 0} مشغولة`,
      icon: DoorOpen,
      color: 'accent',
      trend: 'neutral',
    },
    {
      title: 'الطلاب المقيمين',
      value: summary?.totalStudents?.toString() || '0',
      change: 'طالب',
      icon: Users,
      color: 'success',
      trend: 'neutral',
    },
  ];

  const pendingActions = [
    {
      type: 'application',
      count: summary?.pendingApplications || 0,
      label: 'الطلبات المعلقة',
      icon: FileText,
      urgent: (summary?.pendingApplications || 0) > 0
    },
    {
      type: 'payment',
      count: payments?.length || 0,
      label: 'المدفوعات المعلقة',
      icon: CreditCard,
      urgent: false
    },
    {
      type: 'complaint',
      count: complaints?.length || 0,
      label: 'الشكاوى المفتوحة',
      icon: MessageSquareWarning,
      urgent: (complaints?.length || 0) > 0
    },
  ];

  // Use the getAll applications response and show first 5 as returned
  const recentApplications = applications?.slice(0, 5) || [];

  // Calculate occupancy percentage
  const occupancyPercentage = summary?.totalRooms
    ? Math.round((summary.occupiedRooms / summary.totalRooms) * 100)
    : 0;

  const availableBeds = (summary?.totalRooms || 0) - (summary?.occupiedRooms || 0);

  if (summaryLoading) {
    return (
      <DashboardLayout>
        <div className="space-y-8">
          <div className="space-y-2">
            <Skeleton className="h-10 w-64" />
            <Skeleton className="h-6 w-96" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-32" />
            ))}
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="animate-fade-in">
          <h1 className="text-3xl font-bold text-foreground">
            مرحبًا بعودتك، {user?.username || 'المسؤول'}!
          </h1>
          <p className="text-muted-foreground mt-2">
            نظرة عامة على حالة إدارة الإسكان اليوم.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 animate-slide-up">
          {stats.map((stat) => (
            <StatCard key={stat.title} stat={stat} />
          ))}
        </div>

        {/* Pending Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-slide-up delay-100">
          {pendingActions.map((action) => (
            <Card key={action.type} className="card-hover cursor-pointer">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className={`w-14 h-14 rounded-xl flex items-center justify-center ${action.urgent ? 'bg-destructive/10' : 'bg-muted'
                    }`}>
                    <action.icon className={`w-7 h-7 ${action.urgent ? 'text-destructive' : 'text-muted-foreground'}`} />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-foreground">{action.count}</p>
                    <p className="text-sm text-muted-foreground">{action.label}</p>
                  </div>
                  {action.urgent && (
                    <AlertTriangle className="w-5 h-5 text-destructive ml-auto" />
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Recent Applications & Quick Stats */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-slide-up delay-200">
          {/* Recent Applications */}
          <Card className="lg:col-span-2">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg font-semibold">الطلبات الأخيرة</CardTitle>
              <a href="/applications" className="text-sm text-ocean hover:text-ocean-dark font-medium">
                عرض الكل →
              </a>
            </CardHeader>
            <CardContent>
              {applicationsLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-20" />
                  ))}
                </div>
              ) : recentApplications.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">لا توجد طلبات حالياً</p>
              ) : (
                <div className="space-y-4">
                  {recentApplications.map((app: any) => {
                    const id = app.applicationId ?? app.applicationid;
                    const student = app.student ?? app.studentInfo ?? {};
                    const name = student.fullName ?? app.studentName ?? 'غير محدد';
                    const faculty = student.faculty ?? app.studentInfo?.faculty ?? 'غير محدد';
                    const initials = name !== 'غير محدد' ? name.split(' ').map((n: string) => n[0]).join('') : 'N/A';
                    const submitted = app.submittedAt ?? app.createdAt ?? null;
                    const status = typeof app.status === 'string'
                      ? app.status
                      : app.statusId === 2
                        ? 'approved'
                        : app.statusId === 3
                          ? 'rejected'
                          : 'pending';

                    return (
                      <div
                        key={id ?? name}
                        className="flex items-center justify-between p-4 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                            <span className="text-sm font-semibold text-primary">{initials}</span>
                          </div>
                          <div>
                            <p className="font-medium text-foreground">{name}</p>
                            <p className="text-sm text-muted-foreground">{faculty}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className="text-sm text-muted-foreground hidden sm:block">
                            {submitted ? new Date(submitted).toLocaleDateString('ar-EG') : ''}
                          </span>
                          <StatusBadge status={status} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-semibold">نظرة عامة على الإشغال</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Occupancy Progress */}
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-muted-foreground">نسبة الإشغال الكلية</span>
                  <span className="font-semibold text-foreground">{occupancyPercentage}%</span>
                </div>
                <div className="h-3 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-ocean rounded-full transition-all duration-500"
                    style={{ width: `${occupancyPercentage}%` }}
                  />
                </div>
              </div>

              {/* Building Stats */}
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-success" />
                    <span className="text-sm">الأسرّة المتاحة</span>
                  </div>
                  <span className="font-semibold">{availableBeds}</span>
                </div>

                <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                  <div className="flex items-center gap-3">
                    <Clock className="w-5 h-5 text-gold" />
                    <span className="text-sm">قيد الصيانة</span>
                  </div>
                  <span className="font-semibold">0</span>
                </div>

                <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                  <div className="flex items-center gap-3">
                    <Users className="w-5 h-5 text-ocean" />
                    <span className="text-sm">الطاقة الكاملة</span>
                  </div>
                  <span className="font-semibold">{summary?.occupiedRooms || 0} غرف</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
