import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Search, Filter, Eye, CheckCircle, XCircle, FileText, Loader2, Users, Building2, Home } from 'lucide-react';
import { useApplications, useAcceptApplication, useRejectApplication, useReportsSummary } from '@/hooks/useApi';
import { useToast } from '@/hooks/use-toast';
import type { ApplicationDetails } from '@/lib/types';

// Store the raw application data for reference
let rawApplicationsMap: Map<number, any> = new Map();

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

export default function Applications() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState<'date' | 'name' | 'status'>('date');
  const [selectedApplication, setSelectedApplication] = useState<ApplicationDetails | null>(null);
  const [confirmAction, setConfirmAction] = useState<{ type: 'accept' | 'reject'; applicationId: number; studentName: string } | null>(null);

  const { data: applications = [], isLoading, error } = useApplications();
  const { data: summary } = useReportsSummary();
  const acceptMutation = useAcceptApplication();
  const rejectMutation = useRejectApplication();
  const { toast } = useToast();
  const normalizeApplication = (app: any): ApplicationDetails => {
    const studentInfo = app.studentInfo || app.student || app.studentData || app.studentDto || {};
    const fatherInfo = app.fatherInfo || app.father || app.fatherData || undefined;
    const guardianInfo = app.guardianInfo || app.guardian || app.guardianData || undefined;
    const secondaryInfo = app.secondaryInfo || app.secondary || app.secondaryData || undefined;
    const academicInfo = app.academicInfo || app.academic || app.academicData || undefined;

    // Find the correct applicationId field
    let appId = app.applicationId ?? app.applicationID ?? app.id;

    // If still not found, check all numeric properties that might be the ID
    if (!appId || appId === 0) {
      // Try to find any property that looks like an ID
      for (const key in app) {
        if (key.toLowerCase().includes('applicationid') || key.toLowerCase().includes('application_id')) {
          appId = app[key];
          break;
        }
      }
    }

    return {
      applicationId: appId ?? 0,
      studentId: app.studentId ?? studentInfo.studentId ?? 0,
      studentName: app.studentName || studentInfo.fullName || studentInfo.name || 'غير متوفر',
      status: app.status || app.applicationStatus || 'pending',
      submittedAt: app.submittedAt || app.submissionDate || app.createdAt || '',
      studentInfo,
      fatherInfo,
      guardianInfo,
      secondaryInfo,
      academicInfo,
    } as ApplicationDetails;
  };

  const normalizedApplications = Array.isArray(applications)
    ? applications.map((app, idx) => {
      const normalized = normalizeApplication(app);
      // Store raw data for fallback
      rawApplicationsMap.set(idx, app);
      return normalized;
    })
    : Array.isArray((applications as any)?.data)
      ? (applications as any).data.map((app: any, idx: number) => {
        const normalized = normalizeApplication(app);
        rawApplicationsMap.set(idx, app);
        return normalized;
      })
      : [];

  const filteredApplications = normalizedApplications.filter(app => {
    const matchesSearch =
      app.studentName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.studentInfo?.nationalId?.includes(searchQuery);
    const matchesStatus = statusFilter === 'all' || app.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Sort applications
  const sortedApplications = [...filteredApplications].sort((a, b) => {
    switch (sortBy) {
      case 'name':
        return (a.studentName || '').localeCompare(b.studentName || '');
      case 'status':
        const statusOrder = { pending: 0, approved: 1, rejected: 2 };
        return (statusOrder[a.status as keyof typeof statusOrder] || 0) -
          (statusOrder[b.status as keyof typeof statusOrder] || 0);
      case 'date':
      default:
        return new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime();
    }
  });

  // Handle accept action
  const handleAccept = async () => {
    if (!confirmAction || confirmAction.type !== 'accept') return;

    try {
      // Use the applicationId from the confirmation action
      const appId = confirmAction.applicationId;

      // If applicationId is 0, try to find it from raw data
      if (appId === 0) {
        const rawApp = Array.from(rawApplicationsMap.values()).find(app =>
          app.studentName === confirmAction.studentName
        );
        if (rawApp) {
          // Try to use any ID field from raw data
          const actualId = rawApp.applicationId || rawApp.applicationID || rawApp.id || 0;
          if (actualId) {
            await acceptMutation.mutateAsync(actualId);
          } else {
            throw new Error('Cannot find application ID');
          }
        }
      } else {
        await acceptMutation.mutateAsync(appId);
      }

      toast({
        title: 'تم القبول',
        description: 'تم قبول الطلب بنجاح',
      });
      setConfirmAction(null);
      setSelectedApplication(null);
      // Cache will be automatically invalidated by the mutation hook
    } catch (err) {
      toast({
        title: 'خطأ',
        description: 'فشل قبول الطلب',
        variant: 'destructive',
      });
    }
  };

  // Handle reject action
  const handleReject = async () => {
    if (!confirmAction || confirmAction.type !== 'reject') return;

    try {
      // Use the applicationId from the confirmation action
      const appId = confirmAction.applicationId;

      // If applicationId is 0, try to find it from raw data
      if (appId === 0) {
        const rawApp = Array.from(rawApplicationsMap.values()).find(app =>
          app.studentName === confirmAction.studentName
        );
        if (rawApp) {
          // Try to use any ID field from raw data
          const actualId = rawApp.applicationId || rawApp.applicationID || rawApp.id || 0;
          if (actualId) {
            await rejectMutation.mutateAsync(actualId);
          } else {
            throw new Error('Cannot find application ID');
          }
        }
      } else {
        await rejectMutation.mutateAsync(appId);
      }

      toast({
        title: 'تم الرفض',
        description: 'تم رفض الطلب بنجاح',
      });
      setConfirmAction(null);
      setSelectedApplication(null);
      // Cache will be automatically invalidated by the mutation hook
    } catch (err) {
      toast({
        title: 'خطأ',
        description: 'فشل رفض الطلب',
        variant: 'destructive',
      });
    }
  };

  if (error) {
    return (
      <DashboardLayout>
        <Card>
          <CardContent className="p-6 text-center text-destructive">
            فشل في تحميل البيانات: {error instanceof Error ? error.message : 'خطأ غير معروف'}
          </CardContent>
        </Card>
      </DashboardLayout>
    );
  }

  if (isLoading) {
    return (
      <DashboardLayout>
        <Card>
          <CardContent className="p-6 text-center text-muted-foreground">
            جاري تحميل الطلبات...
          </CardContent>
        </Card>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">الطلبات</h1>
            <p className="text-muted-foreground">إدارة طلبات سكن الطلاب</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">
              {sortedApplications.length} طلب
            </span>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          <Card className="bg-gold/5 border-gold/20">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-gold/10 flex items-center justify-center">
                  <FileText className="w-5 h-5 text-gold-dark" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">
                    {summary?.pendingApplications ?? normalizedApplications.filter(a => a.status === 'pending').length}
                  </p>
                  <p className="text-xs text-muted-foreground">قيد الانتظار</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-success/5 border-success/20">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 text-success" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">
                    {summary?.acceptedApplications ?? normalizedApplications.filter(a => a.status === 'approved').length}
                  </p>
                  <p className="text-xs text-muted-foreground">مقبول</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-ocean/5 border-ocean/20">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-ocean/10 flex items-center justify-center">
                  <Users className="w-5 h-5 text-ocean" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">
                    {summary?.totalStudents ?? 0}
                  </p>
                  <p className="text-xs text-muted-foreground">إجمالي الطلاب</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-primary/5 border-primary/20">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Building2 className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">
                    {summary?.totalBuildings ?? 0}
                  </p>
                  <p className="text-xs text-muted-foreground">المباني</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-secondary/5 border-secondary/20">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-secondary/10 flex items-center justify-center">
                  <Home className="w-5 h-5 text-secondary-foreground" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">
                    {summary?.occupiedRooms ?? 0}/{summary?.totalRooms ?? 0}
                  </p>
                  <p className="text-xs text-muted-foreground">الغرف المشغولة</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="ابحث بالاسم أو الرقم القومي..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pr-10"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <Filter className="w-4 h-4 ml-2" />
                  <SelectValue placeholder="فرز حسب الحالة" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">كل الحالات</SelectItem>
                  <SelectItem value="pending">قيد الانتظار</SelectItem>
                  <SelectItem value="approved">مقبول</SelectItem>
                  <SelectItem value="rejected">مرفوض</SelectItem>
                </SelectContent>
              </Select>
              <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
                <SelectTrigger className="w-full sm:w-[150px]">
                  <Filter className="w-4 h-4 ml-2" />
                  <SelectValue placeholder="ترتيب" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="date">الأحدث أولاً</SelectItem>
                  <SelectItem value="name">حسب الاسم</SelectItem>
                  <SelectItem value="status">حسب الحالة</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Applications Table */}
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>الطالب</TableHead>
                    <TableHead>الرقم القومي</TableHead>
                    <TableHead>الكلية</TableHead>
                    <TableHead>المرحلة</TableHead>
                    <TableHead>الحالة</TableHead>
                    <TableHead>تاريخ الإرسال</TableHead>
                    <TableHead className="text-left">الإجراءات</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedApplications.map((app) => (
                    <TableRow key={app.applicationId}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                            <span className="text-xs font-semibold text-primary">
                              {app.studentName?.split(' ').slice(0, 2).map(n => n[0]).join('') || 'NA'}
                            </span>
                          </div>
                          <span className="font-medium">{app.studentName || 'غير متوفر'}</span>
                        </div>
                      </TableCell>
                      <TableCell className="font-mono text-sm">{app.studentInfo?.nationalId || '—'}</TableCell>
                      <TableCell>{app.studentInfo?.faculty || '—'}</TableCell>
                      <TableCell>{app.studentInfo?.level ? `المرحلة ${app.studentInfo.level}` : '—'}</TableCell>
                      <TableCell><StatusBadge status={app.status} /></TableCell>
                      <TableCell className="text-muted-foreground">
                        {app.submittedAt ? new Date(app.submittedAt).toLocaleDateString() : '—'}
                      </TableCell>
                      <TableCell className="text-left">
                        <div className="flex items-center justify-start gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setSelectedApplication(app)}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          {app.status === 'pending' && (
                            <>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-success hover:text-success"
                                onClick={() => setConfirmAction({ type: 'accept', applicationId: app.applicationId, studentName: app.studentName || 'الطالب' })}
                                disabled={acceptMutation.isPending || rejectMutation.isPending}
                              >
                                <CheckCircle className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-destructive hover:text-destructive"
                                onClick={() => setConfirmAction({ type: 'reject', applicationId: app.applicationId, studentName: app.studentName || 'الطالب' })}
                                disabled={acceptMutation.isPending || rejectMutation.isPending}
                              >
                                <XCircle className="w-4 h-4" />
                              </Button>
                            </>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Application Details Dialog */}
        <Dialog open={!!selectedApplication} onOpenChange={() => setSelectedApplication(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>تفاصيل الطلب</DialogTitle>
              <DialogDescription>
                مراجعة طلب سكن الطالب
              </DialogDescription>
            </DialogHeader>

            {selectedApplication && (
              <div className="space-y-6">
                <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-lg">
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="text-xl font-semibold text-primary">
                      {selectedApplication.studentName?.split(' ').slice(0, 2).map(n => n[0]).join('') || 'NA'}
                    </span>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold">{selectedApplication.studentName || 'غير متوفر'}</h3>
                    <p className="text-muted-foreground">{selectedApplication.studentInfo?.email || '—'}</p>
                    <StatusBadge status={selectedApplication.status} />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">الرقم القومي</p>
                    <p className="font-medium font-mono">{selectedApplication.studentInfo?.nationalId || '—'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">الهاتف</p>
                    <p className="font-medium">{selectedApplication.studentInfo?.phone || '—'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">الكلية</p>
                    <p className="font-medium">{selectedApplication.studentInfo?.faculty || '—'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">القسم</p>
                    <p className="font-medium">{selectedApplication.studentInfo?.department || '—'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">المرحلة</p>
                    <p className="font-medium">{selectedApplication.studentInfo?.level ? `المرحلة ${selectedApplication.studentInfo.level}` : '—'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">تاريخ الإرسال</p>
                    <p className="font-medium">
                      {selectedApplication.submittedAt ? new Date(selectedApplication.submittedAt).toLocaleString() : '—'}
                    </p>
                  </div>
                </div>

                {selectedApplication.status === 'pending' && (
                  <div className="flex gap-3 pt-4 border-t">
                    <Button
                      className="flex-1 bg-success hover:bg-success/90"
                      onClick={() => setConfirmAction({ type: 'accept', applicationId: selectedApplication.applicationId, studentName: selectedApplication.studentName || 'الطالب' })}
                      disabled={acceptMutation.isPending || rejectMutation.isPending}
                    >
                      <CheckCircle className="w-4 h-4 ml-2" />
                      اعتماد الطلب
                    </Button>
                    <Button
                      variant="destructive"
                      className="flex-1"
                      onClick={() => setConfirmAction({ type: 'reject', applicationId: selectedApplication.applicationId, studentName: selectedApplication.studentName || 'الطالب' })}
                      disabled={acceptMutation.isPending || rejectMutation.isPending}
                    >
                      <XCircle className="w-4 h-4 ml-2" />
                      رفض الطلب
                    </Button>
                  </div>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Accept Application Confirmation Dialog */}
        <AlertDialog open={confirmAction?.type === 'accept'} onOpenChange={(open) => !open && setConfirmAction(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>تأكيد قبول الطلب</AlertDialogTitle>
              <AlertDialogDescription>
                هل أنت متأكد من قبول طلب {confirmAction?.studentName}؟
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>إلغاء</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleAccept}
                disabled={acceptMutation.isPending}
                className="bg-success text-white hover:bg-success/90"
              >
                {acceptMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 ml-2 animate-spin" />
                    جاري القبول...
                  </>
                ) : (
                  'تأكيد القبول'
                )}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Reject Application Confirmation Dialog */}
        <AlertDialog open={confirmAction?.type === 'reject'} onOpenChange={(open) => !open && setConfirmAction(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>تأكيد رفض الطلب</AlertDialogTitle>
              <AlertDialogDescription>
                هل أنت متأكد من رفض طلب {confirmAction?.studentName}؟
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>إلغاء</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleReject}
                disabled={rejectMutation.isPending}
                className="bg-destructive text-white hover:bg-destructive/90"
              >
                {rejectMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 ml-2 animate-spin" />
                    جاري الرفض...
                  </>
                ) : (
                  'تأكيد الرفض'
                )}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </DashboardLayout>
  );
}
