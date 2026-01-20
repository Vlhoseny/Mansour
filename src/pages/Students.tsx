import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
  Users,
  Search,
  Filter,
  Mail,
  Phone,
  GraduationCap,
  Building2,
} from 'lucide-react';
import { useStudents } from '@/hooks/useApi';
import type { StudentDto } from '@/lib/types';

function StatusBadge({ status }: { status: string }) {
  const styles = {
    housed: 'bg-success/10 text-success border-success/20',
    pending: 'bg-gold/10 text-gold-dark border-gold/20',
    evicted: 'bg-destructive/10 text-destructive border-destructive/20',
    unknown: 'bg-muted text-foreground border-border',
  };
  const labels: Record<string, string> = {
    housed: 'مقيم',
    pending: 'قيد الانتظار',
    evicted: 'مطرود',
    unknown: 'غير معروف',
  };

  return (
    <Badge variant="outline" className={styles[status as keyof typeof styles] || styles.unknown}>
      {labels[status] ?? status ?? labels.unknown}
    </Badge>
  );
}

export default function Students() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [facultyFilter, setFacultyFilter] = useState('all');
  const { data: students = [], isLoading, error } = useStudents();

  const deriveStatus = (student: StudentDto): string => 'pending';
  const faculties = [
    ...new Set(
      students
        .map((s) => s.faculty)
        .filter((f): f is string => Boolean(f))
    ),
  ];

  const filteredStudents = students.filter((student) => {
    const status = deriveStatus(student);
    const matchesSearch =
      (student.fullName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (student.nationalId || '').includes(searchQuery);
    const matchesStatus = statusFilter === 'all' || status === statusFilter;
    const matchesFaculty = facultyFilter === 'all' || student.faculty === facultyFilter;
    return matchesSearch && matchesStatus && matchesFaculty;
  });

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-foreground">الطلاب</h1>
          <p className="text-muted-foreground">عرض وإدارة الطلاب المقيمين</p>
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
                  <p className="text-2xl font-bold">{students.length}</p>
                  <p className="text-xs text-muted-foreground">إجمالي الطلاب</p>
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
                  <p className="text-2xl font-bold">
                    {students.filter((s) => deriveStatus(s) === 'housed').length}
                  </p>
                  <p className="text-xs text-muted-foreground">المقيمون</p>
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
                  <p className="text-2xl font-bold">
                    {students.filter((s) => deriveStatus(s) === 'pending').length}
                  </p>
                  <p className="text-xs text-muted-foreground">قيد التعيين</p>
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

              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-[150px]">
                  <Filter className="w-4 h-4 ml-2" />
                  <SelectValue placeholder="الحالة" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">كل الحالات</SelectItem>
                  <SelectItem value="housed">مقيم</SelectItem>
                  <SelectItem value="pending">قيد الانتظار</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Students Table */}
        {isLoading ? (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle>Student List</CardTitle>
            </CardHeader>
            <CardContent className="text-muted-foreground">Loading students...</CardContent>
          </Card>
        ) : error ? (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle>Student List</CardTitle>
            </CardHeader>
            <CardContent className="text-destructive">Failed to load students. {error instanceof Error ? error.message : 'Unexpected error'}</CardContent>
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
                      <TableHead>الغرفة</TableHead>
                      <TableHead>التواصل</TableHead>
                      <TableHead>الحالة</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredStudents.map((student) => {
                      const initials = (student.fullName || 'N/A')
                        .split(' ')
                        .filter(Boolean)
                        .slice(0, 2)
                        .map((n) => n[0])
                        .join('') || 'NA';
                      const status = deriveStatus(student);
                      return (
                        <TableRow key={student.studentId}>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                                <span className="text-xs font-semibold text-primary">
                                  {initials}
                                </span>
                              </div>
                              <span className="font-medium">{student.fullName || 'Name unavailable'}</span>
                            </div>
                          </TableCell>
                          <TableCell className="font-mono text-sm">{student.nationalId || '—'}</TableCell>
                          <TableCell>
                            <div>
                              <p className="font-medium">{student.faculty || 'N/A'}</p>
                              <p className="text-sm text-muted-foreground">المستوى {student.level || 'N/A'}</p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <span className="text-muted-foreground">غير مُعيّن</span>
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
                          <TableCell><StatusBadge status={status} /></TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
