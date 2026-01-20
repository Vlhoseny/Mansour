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
    building: room.buildingName || `Building ${room.buildingId}`,
    floor: extractFloor(room.roomNumber),
    capacity: room.capacity,
    currentOccupancy: room.currentOccupancy,
    status: getStatusFromCode(room.status),
    roomData: room, // Keep original API data
  }));

  const filteredRooms = rooms.filter(room => {
    const matchesSearch = room.roomNumber.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || room.status === statusFilter;
    const matchesBuilding = buildingFilter === 'all' || room.building === buildingFilter;
    return matchesSearch && matchesStatus && matchesBuilding;
  });
  
  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">الغرف</h1>
            <p className="text-muted-foreground">إدارة تعيينات الغرف الفردية</p>
          </div>
          
          <Button className="bg-primary hover:bg-primary/90">
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
                  {buildings.map((b) => (
                    <SelectItem key={b} value={b}>{b}</SelectItem>
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
                                className={`w-6 h-6 rounded-full border-2 border-background ${
                                  i < room.currentOccupancy 
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
                          <Button variant="ghost" size="sm">
                            <Edit2 className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive">
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
    </DashboardLayout>
  );
}
