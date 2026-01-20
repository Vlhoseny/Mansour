import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
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
  CreditCard,
  Search,
  Filter,
  CheckCircle,
  XCircle,
  Eye,
  Clock,
  DollarSign,
} from 'lucide-react';
import { usePayments, useApprovePayment, useRejectPayment } from '@/hooks/useApi';

// Use API hook for payments
const noop = () => {};

function StatusBadge({ status }: { status: string }) {
  const styles = {
    pending: 'bg-gold/10 text-gold-dark border-gold/20',
    approved: 'bg-success/10 text-success border-success/20',
    rejected: 'bg-destructive/10 text-destructive border-destructive/20',
  };
  const labels: Record<string, string> = {
    pending: 'قيد المراجعة',
    approved: 'مقبول',
    rejected: 'مرفوض',
  };
  
  return (
    <Badge variant="outline" className={styles[status as keyof typeof styles]}>
      {labels[status] || status}
    </Badge>
  );
}

export default function Payments() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const { data: paymentsResponse, isLoading: paymentsLoading } = usePayments();
  const approvePayment = useApprovePayment();
  const rejectPayment = useRejectPayment();

  // Normalize API response which may be wrapped as { success, data: [...] }
  const _paymentsResp: any = paymentsResponse as any;
  const payments = Array.isArray(_paymentsResp) ? _paymentsResp : _paymentsResp?.data ?? [];

  const filteredPayments = payments.filter((payment: any) => {
    const studentName = (payment.studentName ?? '').toString();
    const transactionCode = (payment.transactionCode ?? '').toString();
    const matchesSearch =
      studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      transactionCode.toLowerCase().includes(searchQuery.toLowerCase());
    const status = payment.status ?? 'pending';
    const matchesStatus = statusFilter === 'all' || status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalPending = payments
    .filter((p: any) => (p.status ?? 'pending') === 'pending')
    .reduce((sum: number, p: any) => sum + (p.feeAmount ?? p.amount ?? 0), 0);

  const totalApproved = payments
    .filter((p: any) => (p.status ?? '') === 'approved')
    .reduce((sum: number, p: any) => sum + (p.feeAmount ?? p.amount ?? 0), 0);
  
  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-foreground">المدفوعات</h1>
          <p className="text-muted-foreground">إدارة الرسوم والمعاملات</p>
        </div>
        
        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-gold/10 flex items-center justify-center">
                  <Clock className="w-5 h-5 text-gold-dark" />
                </div>
                <div>
                  <p className="text-2xl font-bold">
                    {payments.filter(p => p.status === 'pending').length}
                  </p>
                  <p className="text-xs text-muted-foreground">قيد المراجعة</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 text-success" />
                </div>
                <div>
                  <p className="text-2xl font-bold">
                    {payments.filter(p => p.status === 'approved').length}
                  </p>
                  <p className="text-xs text-muted-foreground">مقبول</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-ocean/10 flex items-center justify-center">
                  <DollarSign className="w-5 h-5 text-ocean" />
                </div>
                <div>
                  <p className="text-2xl font-bold">
                    {totalPending.toLocaleString()}
                  </p>
                  <p className="text-xs text-muted-foreground">المبلغ المعلق (ج.م)</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <CreditCard className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">
                    {totalApproved.toLocaleString()}
                  </p>
                  <p className="text-xs text-muted-foreground">المحصَلة (ج.م)</p>
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
                  placeholder="ابحث بالاسم أو رمز المعاملة..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pr-10"
                />
              </div>
              
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <Filter className="w-4 h-4 ml-2" />
                  <SelectValue placeholder="تصفية الحالة" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">كل الحالات</SelectItem>
                  <SelectItem value="pending">قيد المراجعة</SelectItem>
                  <SelectItem value="approved">مقبول</SelectItem>
                  <SelectItem value="rejected">مرفوض</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
        
        {/* Payments Table */}
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>الطالب</TableHead>
                    <TableHead>رمز المعاملة</TableHead>
                    <TableHead>المبلغ</TableHead>
                    <TableHead>النوع</TableHead>
                    <TableHead>الحالة</TableHead>
                    <TableHead>تاريخ الإرسال</TableHead>
                    <TableHead className="text-left">الإجراءات</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPayments.map((payment: any) => {
                    const id = payment.feePaymentId ?? payment.id;
                    const studentName = payment.studentName ?? 'غير محدد';
                    const tx = payment.transactionCode ?? '';
                    const amount = payment.feeAmount ?? payment.amount ?? 0;
                    const submitted = payment.createdAt ?? payment.submittedAt ?? null;
                    const status = payment.status ?? 'pending';

                    return (
                      <TableRow key={id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                              <span className="text-xs font-semibold text-primary">
                                {studentName.split(' ').slice(0, 2).map((n: string) => n[0]).join('')}
                              </span>
                            </div>
                            <span className="font-medium">{studentName}</span>
                          </div>
                        </TableCell>
                        <TableCell className="font-mono text-sm">{tx}</TableCell>
                        <TableCell className="font-semibold">{(amount).toLocaleString()} EGP</TableCell>
                        <TableCell>{payment.type ?? 'رسوم السكن'}</TableCell>
                        <TableCell><StatusBadge status={status} /></TableCell>
                        <TableCell className="text-muted-foreground">{submitted ? new Date(submitted).toLocaleDateString() : ''}</TableCell>
                        <TableCell className="text-left">
                          <div className="flex items-center justify-start gap-2">
                            <Button variant="ghost" size="sm">
                              <Eye className="w-4 h-4" />
                            </Button>
                            {status === 'pending' && (
                              <>
                                            <Button
                                              variant="ghost"
                                              size="sm"
                                              className="text-success hover:text-success"
                                              onClick={() => approvePayment.mutate(id)}
                                              disabled={Boolean((approvePayment as any).isLoading)}
                                            >
                                  <CheckCircle className="w-4 h-4" />
                                </Button>
                                            <Button
                                              variant="ghost"
                                              size="sm"
                                              className="text-destructive hover:text-destructive"
                                              onClick={() => rejectPayment.mutate(id)}
                                              disabled={Boolean((rejectPayment as any).isLoading)}
                                            >
                                  <XCircle className="w-4 h-4" />
                                </Button>
                              </>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
