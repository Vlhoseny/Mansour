import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useRooms, useUpdateRoom, useDeleteRoom, useCreateRoom, useBuildings } from '@/hooks/useApi';
import { Loader2, AlertCircle } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
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
import { useToast } from '@/hooks/use-toast';
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
  DoorOpen,
  Search,
  Filter,
  Users,
  Plus,
  Edit2,
  Trash2,
  Building2,
} from 'lucide-react';

// Helper function to map status code to status string
const getStatusFromCode = (statusCode: number): 'available' | 'full' | 'maintenance' => {
  switch (statusCode) {
    case 0:
      return 'available';
    case 1:
      return 'full';
    case 2:
      return 'maintenance';
    default:
      return 'available';
  }
};

// Helper function to extract floor from room number
const extractFloor = (roomNumber: string | null): number => {
  if (!roomNumber) return 1;
  const match = roomNumber.match(/^[A-D]-(\d+)/);
  return match ? Math.floor(parseInt(match[1]) / 100) : 1;
};

// Helper function to extract building from roomNumber and buildingId
const getBuildingName = (roomNumber: string | null, buildingId: number): string => {
  if (!roomNumber) return `Building ${buildingId}`;
  const buildingLetter = roomNumber.charAt(0);
  const buildingNames: Record<string, string> = {
    'A': 'Building A - Male',
    'B': 'Building B - Male',
    'C': 'Building C - Female',
    'D': 'Building D - Female',
  };
  return buildingNames[buildingLetter] || `Building ${buildingId}`;
};

function StatusBadge({ status }: { status: string }) {
  const styles = {
    available: 'bg-success/10 text-success border-success/20',
    full: 'bg-ocean/10 text-ocean border-ocean/20',
    maintenance: 'bg-gold/10 text-gold-dark border-gold/20',
  };

  const labels = {
    available: 'متاحة',
    full: 'ممتلئة',
    maintenance: 'قيد الصيانة',
  };

  return (
    <Badge variant="outline" className={styles[status as keyof typeof styles]}>
      {labels[status as keyof typeof labels]}
    </Badge>
  );
}

export default function Rooms() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [buildingFilter, setBuildingFilter] = useState('all');
  const [editingRoom, setEditingRoom] = useState<any>(null);
  const [deletingRoomId, setDeletingRoomId] = useState<number | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editFormData, setEditFormData] = useState({ capacity: '', currentOccupancy: '', status: '0' });
  const [addFormData, setAddFormData] = useState({
    roomNumber: '',
    capacity: '',
    currentOccupancy: '',
    buildingId: '',
    apartmentName: '',
    status: '0',
  });

  // API hooks
  const { data: apiRooms = [], isLoading, error } = useRooms();
  const { data: buildings = [] } = useBuildings();
  const updateMutation = useUpdateRoom();
  const deleteMutation = useDeleteRoom();
  const createMutation = useCreateRoom();
  const { toast } = useToast();

  // Transform API data to component format
  const rooms = apiRooms.map(room => ({
    id: room.roomId,
    roomNumber: room.roomNumber || '',
    building: getBuildingName(room.roomNumber, room.buildingId),
    floor: extractFloor(room.roomNumber),
    capacity: room.capacity,
    currentOccupancy: room.currentOccupancy,
    status: getStatusFromCode(room.status),
    roomData: room, // Keep original API data
  }));

  const filteredRooms = rooms.filter(room => {
    const matchesSearch = room.roomNumber.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || room.status === statusFilter;
    const matchesBuilding = buildingFilter === 'all' || room.roomData.buildingId === parseInt(buildingFilter);
    return matchesSearch && matchesStatus && matchesBuilding;
  });

  // Handle edit click
  const handleEditClick = (room: any) => {
    setEditingRoom(room);
    setEditFormData({
      capacity: room.capacity.toString(),
      currentOccupancy: room.currentOccupancy.toString(),
      status: room.roomData.status.toString(),
    });
  };

  // Handle edit save
  const handleEditSave = async () => {
    if (!editingRoom) return;

    try {
      await updateMutation.mutateAsync({
        id: editingRoom.id,
        data: {
          roomNumber: editingRoom.roomData.roomNumber,
          capacity: parseInt(editFormData.capacity),
          currentOccupancy: parseInt(editFormData.currentOccupancy),
          buildingId: editingRoom.roomData.buildingId,
          apartmentName: editingRoom.roomData.apartmentName,
          status: parseInt(editFormData.status),
        },
      });

      toast({
        title: 'تم التحديث',
        description: 'تم تحديث بيانات الغرفة بنجاح',
      });

      setEditingRoom(null);
    } catch (err) {
      toast({
        title: 'خطأ',
        description: 'فشل تحديث الغرفة',
        variant: 'destructive',
      });
    }
  };

  // Handle delete
  const handleDelete = async () => {
    if (deletingRoomId === null) return;

    try {
      await deleteMutation.mutateAsync(deletingRoomId);

      toast({
        title: 'تم الحذف',
        description: 'تم حذف الغرفة بنجاح',
      });

      setDeletingRoomId(null);
    } catch (err) {
      toast({
        title: 'خطأ',
        description: 'فشل حذف الغرفة',
        variant: 'destructive',
      });
    }
  };

  // Handle add room
  const handleAddRoom = async () => {
    // Validation
    if (!addFormData.roomNumber.trim() || !addFormData.capacity || !addFormData.buildingId) {
      toast({
        title: 'خطأ في البيانات',
        description: 'يرجى ملء جميع الحقول المطلوبة',
        variant: 'destructive',
      });
      return;
    }

    try {
      await createMutation.mutateAsync({
        roomNumber: addFormData.roomNumber,
        capacity: parseInt(addFormData.capacity),
        currentOccupancy: parseInt(addFormData.currentOccupancy) || 0,
        buildingId: parseInt(addFormData.buildingId),
        apartmentName: addFormData.apartmentName || addFormData.roomNumber,
        status: parseInt(addFormData.status),
      });

      toast({
        title: 'تم الإضافة',
        description: 'تم إضافة الغرفة بنجاح',
      });

      // Reset form
      setAddFormData({
        roomNumber: '',
        capacity: '',
        currentOccupancy: '',
        buildingId: '',
        apartmentName: '',
        status: '0',
      });
      setIsAddDialogOpen(false);
    } catch (err) {
      toast({
        title: 'خطأ',
        description: 'فشل إضافة الغرفة',
        variant: 'destructive',
      });
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-screen">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <p className="text-lg font-semibold text-destructive">حدث خطأ في تحميل البيانات</p>
            <p className="text-muted-foreground">{error instanceof Error ? error.message : 'حاول مرة أخرى'}</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">الغرف</h1>
            <p className="text-muted-foreground">إدارة تعيينات الغرف الفردية</p>
          </div>

          <Button className="bg-primary hover:bg-primary/90" onClick={() => setIsAddDialogOpen(true)}>
            <Plus className="w-4 h-4 ml-2" />
            إضافة غرفة
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <DoorOpen className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{rooms.length}</p>
                  <p className="text-xs text-muted-foreground">إجمالي الغرف</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center">
                  <DoorOpen className="w-5 h-5 text-success" />
                </div>
                <div>
                  <p className="text-2xl font-bold">
                    {rooms.filter(r => r.status === 'available').length}
                  </p>
                  <p className="text-xs text-muted-foreground">متاحة</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-ocean/10 flex items-center justify-center">
                  <Users className="w-5 h-5 text-ocean" />
                </div>
                <div>
                  <p className="text-2xl font-bold">
                    {rooms.filter(r => r.status === 'full').length}
                  </p>
                  <p className="text-xs text-muted-foreground">ممتلئة</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-gold/10 flex items-center justify-center">
                  <DoorOpen className="w-5 h-5 text-gold-dark" />
                </div>
                <div>
                  <p className="text-2xl font-bold">
                    {rooms.filter(r => r.status === 'maintenance').length}
                  </p>
                  <p className="text-xs text-muted-foreground">قيد الصيانة</p>
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
                  placeholder="ابحث برقم الغرفة..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pr-10"
                />
              </div>

              <Select value={buildingFilter} onValueChange={setBuildingFilter}>
                <SelectTrigger className="w-full sm:w-[200px]">
                  <Building2 className="w-4 h-4 ml-2" />
                  <SelectValue placeholder="المبنى" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">جميع المباني</SelectItem>
                  {buildings.map((building: any) => (
                    <SelectItem key={building.buildingId} value={building.buildingId.toString()}>{building.name}</SelectItem>
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
                  <SelectItem value="available">متاحة</SelectItem>
                  <SelectItem value="full">ممتلئة</SelectItem>
                  <SelectItem value="maintenance">قيد الصيانة</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Rooms Table */}
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>رقم الغرفة</TableHead>
                    <TableHead>المبنى</TableHead>
                    <TableHead>الطابق</TableHead>
                    <TableHead>الإشغال</TableHead>
                    <TableHead>الحالة</TableHead>
                    <TableHead className="text-left">الإجراءات</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRooms.map((room) => (
                    <TableRow key={room.id}>
                      <TableCell className="font-medium">{room.roomNumber}</TableCell>
                      <TableCell>{room.building}</TableCell>
                      <TableCell>الطابق {room.floor}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="flex -space-x-1">
                            {Array.from({ length: room.capacity }).map((_, i) => (
                              <div
                                key={i}
                                className={`w-6 h-6 rounded-full border-2 border-background ${i < room.currentOccupancy
                                  ? 'bg-primary'
                                  : 'bg-muted'
                                  }`}
                              />
                            ))}
                          </div>
                          <span className="text-sm text-muted-foreground">
                            {room.currentOccupancy}/{room.capacity}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell><StatusBadge status={room.status} /></TableCell>
                      <TableCell className="text-left">
                        <div className="flex items-center justify-start gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditClick(room)}
                          >
                            <Edit2 className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-destructive hover:text-destructive"
                            onClick={() => setDeletingRoomId(room.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Edit Room Dialog */}
      <Dialog open={!!editingRoom} onOpenChange={(open) => !open && setEditingRoom(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>تعديل الغرفة</DialogTitle>
            <DialogDescription>
              تعديل بيانات الغرفة {editingRoom?.roomNumber}
            </DialogDescription>
          </DialogHeader>

          {editingRoom && (
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">السعة</label>
                <Input
                  type="number"
                  min="1"
                  value={editFormData.capacity}
                  onChange={(e) => setEditFormData({ ...editFormData, capacity: e.target.value })}
                  className="mt-1"
                />
              </div>

              <div>
                <label className="text-sm font-medium">الإشغال الحالي</label>
                <Input
                  type="number"
                  min="0"
                  max={parseInt(editFormData.capacity) || 0}
                  value={editFormData.currentOccupancy}
                  onChange={(e) => setEditFormData({ ...editFormData, currentOccupancy: e.target.value })}
                  className="mt-1"
                />
              </div>

              <div>
                <label className="text-sm font-medium">الحالة</label>
                <Select value={editFormData.status} onValueChange={(value) => setEditFormData({ ...editFormData, status: value })}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">متاحة</SelectItem>
                    <SelectItem value="1">ممتلئة</SelectItem>
                    <SelectItem value="2">قيد الصيانة</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingRoom(null)}>
              إلغاء
            </Button>
            <Button
              onClick={handleEditSave}
              disabled={updateMutation.isPending}
            >
              {updateMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 ml-2 animate-spin" />
                  جاري الحفظ...
                </>
              ) : (
                'حفظ التغييرات'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Room Confirmation Dialog */}
      <AlertDialog open={deletingRoomId !== null} onOpenChange={(open) => !open && setDeletingRoomId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>حذف الغرفة</AlertDialogTitle>
            <AlertDialogDescription>
              هل أنت متأكد من حذف هذه الغرفة؟ لا يمكن التراجع عن هذا الإجراء.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>إلغاء</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleteMutation.isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 ml-2 animate-spin" />
                  جاري الحذف...
                </>
              ) : (
                'حذف'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Add Room Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>إضافة غرفة جديدة</DialogTitle>
            <DialogDescription>
              ملء البيانات لإضافة غرفة جديدة
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">رقم الغرفة *</label>
              <Input
                placeholder="مثال: A-101"
                value={addFormData.roomNumber}
                onChange={(e) => setAddFormData({ ...addFormData, roomNumber: e.target.value })}
                className="mt-1"
              />
            </div>

            <div>
              <label className="text-sm font-medium">المبنى *</label>
              <Select value={addFormData.buildingId} onValueChange={(value) => setAddFormData({ ...addFormData, buildingId: value })}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="اختر المبنى" />
                </SelectTrigger>
                <SelectContent>
                  {buildings.map((building: any) => (
                    <SelectItem key={building.buildingId} value={building.buildingId.toString()}>
                      {building.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium">السعة *</label>
              <Input
                type="number"
                min="1"
                placeholder="مثال: 4"
                value={addFormData.capacity}
                onChange={(e) => setAddFormData({ ...addFormData, capacity: e.target.value })}
                className="mt-1"
              />
            </div>

            <div>
              <label className="text-sm font-medium">الإشغال الحالي</label>
              <Input
                type="number"
                min="0"
                placeholder="0"
                value={addFormData.currentOccupancy}
                onChange={(e) => setAddFormData({ ...addFormData, currentOccupancy: e.target.value })}
                className="mt-1"
              />
            </div>

            <div>
              <label className="text-sm font-medium">اسم الغرفة</label>
              <Input
                placeholder="مثال: Room A-101"
                value={addFormData.apartmentName}
                onChange={(e) => setAddFormData({ ...addFormData, apartmentName: e.target.value })}
                className="mt-1"
              />
            </div>

            <div>
              <label className="text-sm font-medium">الحالة</label>
              <Select value={addFormData.status} onValueChange={(value) => setAddFormData({ ...addFormData, status: value })}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">متاحة</SelectItem>
                  <SelectItem value="1">ممتلئة</SelectItem>
                  <SelectItem value="2">قيد الصيانة</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
              إلغاء
            </Button>
            <Button
              onClick={handleAddRoom}
              disabled={createMutation.isPending}
            >
              {createMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 ml-2 animate-spin" />
                  جاري الإضافة...
                </>
              ) : (
                'إضافة الغرفة'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
