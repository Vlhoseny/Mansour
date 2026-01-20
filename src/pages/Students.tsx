import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Users,
  Search,
  Filter,
  Mail,
  Phone,
  GraduationCap,
  Building2,
  UserPlus,
  Loader2,
} from 'lucide-react';
import { useAcceptedApplications, useRooms, useAssignRoom } from '@/hooks/useApi';
import { toast } from 'sonner';
import type { ApplicationDetails } from '@/lib/types';

export default function Students() {
  const [searchQuery, setSearchQuery] = useState('');
  const [facultyFilter, setFacultyFilter] = useState('all');
  const [selectedStudent, setSelectedStudent] = useState<ApplicationDetails | null>(null);
  const [selectedRoomId, setSelectedRoomId] = useState<string>('');
  const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false);

  const { data: applications = [], isLoading, error } = useAcceptedApplications();
  const { data: rooms = [] } = useRooms();
  const assignRoomMutation = useAssignRoom();

  const faculties = [
    ...new Set(
      applications
        .map((app) => app.student?.faculty)
        .filter((f): f is string => Boolean(f))
    ),
  ];

  const availableRooms = rooms.filter(room =>
    room.capacity && room.currentOccupancy !== undefined &&
    room.currentOccupancy < room.capacity
  );

  const filteredApplications = applications.filter((app) => {
    const student = app.student;
    if (!student) return false;

    const matchesSearch =
      (student.fullName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (student.nationalId || '').includes(searchQuery);
    const matchesFaculty = facultyFilter === 'all' || student.faculty === facultyFilter;
    return matchesSearch && matchesFaculty;
  });

  const handleAssignClick = (application: ApplicationDetails) => {
    setSelectedStudent(application);
    setSelectedRoomId('');
    setIsAssignDialogOpen(true);
  };

  const handleAssignRoom = async () => {
    if (!selectedStudent || !selectedRoomId) {
      toast.error('يرجى اختيار غرفة');
      return;
    }

    try {
      const result = await assignRoomMutation.mutateAsync({
        studentId: selectedStudent.student!.studentId,
        roomId: parseInt(selectedRoomId),
      });

      if (result.error) {
        toast.error(`خطأ: ${result.error}`);
      } else {
        toast.success('تم تعيين الطالب للغرفة بنجاح');
        setIsAssignDialogOpen(false);
        setSelectedStudent(null);
        setSelectedRoomId('');
      }
    } catch (error) {
      toast.error('حدث خطأ أثناء تعيين الطالب');
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-foreground">تعيين الطلاب للغرف</h1>
          <p className="text-muted-foreground">قم بتعيين الطلاب المقبولين للغرف المتاحة</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Users className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{applications.length}</p>
                  <p className="text-xs text-muted-foreground">الطلاب المقبولون</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center">
                  <Building2 className="w-5 h-5 text-success" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{availableRooms.length}</p>
                  <p className="text-xs text-muted-foreground">الغرف المتاحة</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-ocean/10 flex items-center justify-center">
                  <GraduationCap className="w-5 h-5 text-ocean" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{faculties.length}</p>
                  <p className="text-xs text-muted-foreground">الكليات</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-gold/10 flex items-center justify-center">
                  <Users className="w-5 h-5 text-gold-dark" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{applications.length}</p>
                  <p className="text-xs text-muted-foreground">قيد التعيين</p>
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

              <Select value={facultyFilter} onValueChange={setFacultyFilter}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <GraduationCap className="w-4 h-4 ml-2" />
                  <SelectValue placeholder="Faculty" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">كل الكليات</SelectItem>
                  {faculties.map((f) => (
                    <SelectItem key={f} value={f}>{f}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Students Table */}
        {isLoading ? (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle>قائمة الطلاب المقبولين</CardTitle>
            </CardHeader>
            <CardContent className="text-muted-foreground">جاري تحميل البيانات...</CardContent>
          </Card>
        ) : error ? (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle>قائمة الطلاب المقبولين</CardTitle>
            </CardHeader>
            <CardContent className="text-destructive">فشل تحميل البيانات</CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>الطالب</TableHead>
                      <TableHead>الرقم القومي</TableHead>
                      <TableHead>الكلية / المستوى</TableHead>
                      <TableHead>التواصل</TableHead>
                      <TableHead>الإجراء</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredApplications.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                          لا توجد طلبات مقبولة
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredApplications.map((application) => {
                        const student = application.student;
                        if (!student) return null;

                        const initials = (student.fullName || 'N/A')
                          .split(' ')
                          .filter(Boolean)
                          .slice(0, 2)
                          .map((n) => n[0])
                          .join('') || 'NA';

                        return (
                          <TableRow key={application.applicationid}>
                            <TableCell>
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                                  <span className="text-xs font-semibold text-primary">
                                    {initials}
                                  </span>
                                </div>
                                <span className="font-medium">{student.fullName || 'غير متاح'}</span>
                              </div>
                            </TableCell>
                            <TableCell className="font-mono text-sm">{student.nationalId || '—'}</TableCell>
                            <TableCell>
                              <div>
                                <p className="font-medium">{student.faculty || 'N/A'}</p>
                                <p className="text-sm text-muted-foreground">{student.level || 'N/A'}</p>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex flex-col gap-1">
                                <span className="text-sm flex items-center gap-1">
                                  <Phone className="w-3 h-3" />
                                  {student.phone || '—'}
                                </span>
                                <span className="text-xs text-muted-foreground flex items-center gap-1">
                                  <Mail className="w-3 h-3" />
                                  {student.email || '—'}
                                </span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Button
                                size="sm"
                                onClick={() => handleAssignClick(application)}
                                className="gap-2"
                              >
                                <UserPlus className="w-4 h-4" />
                                تعيين للغرفة
                              </Button>
                            </TableCell>
                          </TableRow>
                        );
                      })
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Assignment Dialog */}
        <Dialog open={isAssignDialogOpen} onOpenChange={setIsAssignDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>تعيين طالب لغرفة</DialogTitle>
              <DialogDescription>
                اختر الغرفة المناسبة لتعيين الطالب
              </DialogDescription>
            </DialogHeader>

            {selectedStudent && (
              <div className="space-y-4">
                <div className="p-4 bg-muted rounded-lg">
                  <p className="font-medium">{selectedStudent.student?.fullName}</p>
                  <p className="text-sm text-muted-foreground">
                    {selectedStudent.student?.faculty} - {selectedStudent.student?.level}
                  </p>
                </div>

                <div className="space-y-2">
                  <Label>اختر الغرفة</Label>
                  <Select value={selectedRoomId} onValueChange={setSelectedRoomId}>
                    <SelectTrigger>
                      <SelectValue placeholder="اختر غرفة..." />
                    </SelectTrigger>
                    <SelectContent>
                      {availableRooms.length === 0 ? (
                        <div className="p-2 text-center text-sm text-muted-foreground">
                          لا توجد غرف متاحة
                        </div>
                      ) : (
                        availableRooms.map((room) => (
                          <SelectItem key={room.roomId} value={room.roomId.toString()}>
                            غرفة {room.roomNumber} - {room.buildingName || `Building ${room.buildingId}`}
                            ({room.currentOccupancy}/{room.capacity})
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setIsAssignDialogOpen(false);
                  setSelectedStudent(null);
                  setSelectedRoomId('');
                }}
              >
                إلغاء
              </Button>
              <Button
                onClick={handleAssignRoom}
                disabled={!selectedRoomId || assignRoomMutation.isPending}
              >
                {assignRoomMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 ml-2 animate-spin" />
                    جاري التعيين...
                  </>
                ) : (
                  'تعيين'
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
