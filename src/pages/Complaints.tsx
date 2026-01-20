import { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  MessageSquareWarning,
  Clock,
  CheckCircle,
  AlertTriangle,
  User,
  Calendar,
} from 'lucide-react';
import { toast } from 'sonner';
import { complaintsApi } from '@/lib/api';


type UIComplaint = {
  complaintId: number;
  title: string;
  message: string;
  studentName: string;
  room: string;
  status: 'unresolved' | 'resolved';
  createdAt: string;
  priority?: 'high' | 'medium' | 'low';
  resolution?: string;
};

function PriorityBadge({ priority }: { priority: string }) {
  const styles = {
    high: 'bg-destructive/10 text-destructive border-destructive/20',
    medium: 'bg-gold/10 text-gold-dark border-gold/20',
    low: 'bg-muted text-muted-foreground border-muted-foreground/20',
  };
  const labels: Record<string, string> = {
    high: 'أولوية عالية',
    medium: 'أولوية متوسطة',
    low: 'أولوية منخفضة',
  };
  
  return (
    <Badge variant="outline" className={styles[priority as keyof typeof styles]}>
      {labels[priority] || priority}
    </Badge>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles = {
    unresolved: 'bg-gold/10 text-gold-dark border-gold/20',
    resolved: 'bg-success/10 text-success border-success/20',
  };
  const labels: Record<string, string> = {
    unresolved: 'مفتوحة',
    resolved: 'تم حلها',
  };
  
  return (
    <Badge variant="outline" className={styles[status as keyof typeof styles]}>
      {labels[status] || status}
    </Badge>
  );
}

export default function Complaints() {
  const [selectedComplaint, setSelectedComplaint] = useState<UIComplaint | null>(null);
  const [resolutionText, setResolutionText] = useState('');
  const [allComplaints, setAllComplaints] = useState<UIComplaint[]>([]);

  useEffect(() => {
    const load = async () => {
      const res = await complaintsApi.getUnresolved();
      if (res.error) {
        console.error('Failed to load complaints', res.error);
        toast.error('فشل جلب الشكاوى');
        return;
      }

      // Support two possible response shapes: direct array or wrapper { success, data, ... }
      let items: any = res.data;
      if (!items) {
        // nothing
        setAllComplaints([]);
        return;
      }

      if ((items as any).data && Array.isArray((items as any).data)) {
        items = (items as any).data;
      }

      if (!Array.isArray(items)) {
        setAllComplaints([]);
        return;
      }

      const mapped: UIComplaint[] = items.map((it: any) => ({
        complaintId: it.complaintId,
        title: it.title,
        message: it.message,
        studentName: it.student?.fullName || '',
        room: it.room?.roomNumber || '',
        status: it.isResolved ? 'resolved' : 'unresolved',
        createdAt: it.createdAt || it.submittedAt || new Date().toISOString(),
        priority: 'medium',
        resolution: it.resolutionMessage || '',
      }));

      setAllComplaints(mapped);
    };

    void load();
  }, []);

  const unresolvedComplaints = allComplaints.filter((c) => c.status === 'unresolved');
  const resolvedComplaints = allComplaints.filter((c) => c.status === 'resolved');
  
  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-foreground">الشكاوى</h1>
          <p className="text-muted-foreground">إدارة شكاوى ومشكلات الطلاب</p>
        </div>
        
        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-destructive/10 flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5 text-destructive" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{unresolvedComplaints.length}</p>
                  <p className="text-xs text-muted-foreground">قضايا مفتوحة</p>
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
                  <p className="text-2xl font-bold">{resolvedComplaints.length}</p>
                  <p className="text-xs text-muted-foreground">تم حلها</p>
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
                  <p className="text-2xl font-bold">
                    {unresolvedComplaints.filter(c => c.priority === 'high').length}
                  </p>
                  <p className="text-xs text-muted-foreground">أولوية عالية</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <MessageSquareWarning className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{allComplaints.length}</p>
                  <p className="text-xs text-muted-foreground">إجمالي الشكاوى</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Complaints List */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Unresolved */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-destructive" />
                الشكاوى المفتوحة
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {unresolvedComplaints.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  لا توجد شكاوى مفتوحة
                </p>
              ) : (
                unresolvedComplaints.map((complaint) => (
                  <div 
                    key={complaint.complaintId}
                    className="p-4 rounded-lg border bg-card hover:bg-muted/50 transition-colors cursor-pointer"
                    onClick={() => setSelectedComplaint(complaint)}
                  >
                    <div className="flex items-start justify-between gap-4 mb-2">
                      <h4 className="font-semibold text-foreground">{complaint.title}</h4>
                      <PriorityBadge priority={complaint.priority} />
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                      {complaint.message}
                    </p>
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <User className="w-3 h-3" />
                        {complaint.studentName} • Room {complaint.room}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {new Date(complaint.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
          
          {/* Resolved */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-success" />
                الشكاوى المحلولة
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {resolvedComplaints.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  لا توجد شكاوى محلولة
                </p>
              ) : (
                resolvedComplaints.map((complaint) => (
                  <div 
                    key={complaint.complaintId}
                    className="p-4 rounded-lg border bg-muted/30 cursor-pointer"
                    onClick={() => setSelectedComplaint(complaint)}
                  >
                    <div className="flex items-start justify-between gap-4 mb-2">
                      <h4 className="font-semibold text-foreground">{complaint.title}</h4>
                      <StatusBadge status={complaint.status} />
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                      {complaint.message}
                    </p>
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <User className="w-3 h-3" />
                        {complaint.studentName} • Room {complaint.room}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {new Date(complaint.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>
        
        {/* Complaint Details Dialog */}
        <Dialog open={!!selectedComplaint} onOpenChange={() => setSelectedComplaint(null)}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>تفاصيل الشكوى</DialogTitle>
              <DialogDescription>
                مراجعة والرد على الشكوى
              </DialogDescription>
            </DialogHeader>
            
            {selectedComplaint && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <PriorityBadge priority={selectedComplaint.priority} />
                  <StatusBadge status={selectedComplaint.status} />
                </div>
                
                <div>
                  <h4 className="font-semibold text-lg">{selectedComplaint.title}</h4>
                  <p className="text-sm text-muted-foreground mt-1">
                    من: {selectedComplaint.studentName} • الغرفة {selectedComplaint.room}
                  </p>
                </div>
                
                <div className="p-4 bg-muted/50 rounded-lg">
                  <p className="text-sm">{selectedComplaint.message}</p>
                </div>
                
                <div className="text-xs text-muted-foreground">
                  التاريخ: {new Date(selectedComplaint.createdAt).toLocaleString()}
                </div>
                
                {selectedComplaint.status === 'resolved' && selectedComplaint.resolution && (
                  <div className="p-4 bg-success/10 rounded-lg border border-success/20">
                    <p className="text-sm font-medium text-success mb-1">Resolution</p>
                    <p className="text-sm">{selectedComplaint.resolution}</p>
                  </div>
                )}
                
                {selectedComplaint.status === 'unresolved' && (
                  <div className="space-y-3 pt-4 border-t">
                    <Textarea
                      placeholder="أدخل رسالة الحل..."
                      value={resolutionText}
                      onChange={(e) => setResolutionText(e.target.value)}
                      rows={3}
                    />
                    <Button className="w-full bg-success hover:bg-success/90">
                      <CheckCircle className="w-4 h-4 ml-2" />
                      تمييز كمحلول
                    </Button>
                  </div>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
