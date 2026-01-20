import { useEffect, useState } from "react";
import { StudentLayout } from "@/components/layout/StudentLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { studentProfileApi, studentsApi } from "@/lib/api";
import { toast } from "sonner";
import { User, Home, Loader2, Save } from "lucide-react";
import type { StudentDto, RoomAssignment } from "@/lib/types";

export default function StudentProfile() {
  const [profile, setProfile] = useState<StudentDto | null>(null);
  const [assignments, setAssignments] = useState<RoomAssignment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editedProfile, setEditedProfile] = useState<Partial<StudentDto>>({});

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [profileRes, assignmentsRes] = await Promise.all([
        studentProfileApi.getDetails(),
        studentProfileApi.getAssignments(),
      ]);

      if (profileRes.data) {
        setProfile(profileRes.data);
        setEditedProfile(profileRes.data);
      }
      if (assignmentsRes.data) setAssignments(assignmentsRes.data);
    } catch (error) {
      console.error("Error fetching profile:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const response = await studentsApi.selfUpdate(editedProfile);
      if (response.error) {
        toast.error(response.error);
      } else {
        toast.success("تم تحديث البيانات بنجاح");
        setProfile({ ...profile, ...editedProfile } as StudentDto);
        setEditMode(false);
      }
    } catch (error) {
      toast.error("حدث خطأ أثناء حفظ البيانات");
    } finally {
      setIsSaving(false);
    }
  };

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
            <h1 className="text-2xl font-bold">الملف الشخصي</h1>
            <p className="text-muted-foreground">عرض وتعديل بياناتك الشخصية</p>
          </div>
          {!editMode ? (
            <Button onClick={() => setEditMode(true)}>تعديل البيانات</Button>
          ) : (
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => {
                setEditMode(false);
                setEditedProfile(profile || {});
              }}>
                إلغاء
              </Button>
              <Button onClick={handleSave} disabled={isSaving}>
                {isSaving ? <Loader2 className="h-4 w-4 animate-spin ml-2" /> : <Save className="h-4 w-4 ml-2" />}
                حفظ
              </Button>
            </div>
          )}
        </div>

        <Tabs defaultValue="personal" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="personal">البيانات الشخصية</TabsTrigger>
            <TabsTrigger value="housing">السكن</TabsTrigger>
          </TabsList>

          <TabsContent value="personal" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  البيانات الشخصية
                </CardTitle>
              </CardHeader>
              <CardContent>
                {profile ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label>الاسم الكامل</Label>
                      {editMode ? (
                        <Input
                          value={editedProfile.fullName || ""}
                          onChange={(e) => setEditedProfile({ ...editedProfile, fullName: e.target.value })}
                        />
                      ) : (
                        <p className="p-2 bg-muted rounded-md">{profile.fullName || "-"}</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label>الرقم القومي</Label>
                      <p className="p-2 bg-muted rounded-md">{profile.nationalId || "-"}</p>
                    </div>
                    <div className="space-y-2">
                      <Label>تاريخ الميلاد</Label>
                      <p className="p-2 bg-muted rounded-md">
                        {profile.birthDate ? new Date(profile.birthDate).toLocaleDateString("ar-EG") : "-"}
                      </p>
                    </div>
                    <div className="space-y-2">
                      <Label>محل الميلاد</Label>
                      <p className="p-2 bg-muted rounded-md">{profile.birthPlace || "-"}</p>
                    </div>
                    <div className="space-y-2">
                      <Label>النوع</Label>
                      <p className="p-2 bg-muted rounded-md">
                        {profile.gender === "Male" ? "ذكر" : profile.gender === "Female" ? "أنثى" : "-"}
                      </p>
                    </div>
                    <div className="space-y-2">
                      <Label>الديانة</Label>
                      <p className="p-2 bg-muted rounded-md">{profile.religion || "-"}</p>
                    </div>
                    <div className="space-y-2">
                      <Label>المحافظة</Label>
                      {editMode ? (
                        <Input
                          value={editedProfile.governorate || ""}
                          onChange={(e) => setEditedProfile({ ...editedProfile, governorate: e.target.value })}
                        />
                      ) : (
                        <p className="p-2 bg-muted rounded-md">{profile.governorate || "-"}</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label>المدينة</Label>
                      {editMode ? (
                        <Input
                          value={editedProfile.city || ""}
                          onChange={(e) => setEditedProfile({ ...editedProfile, city: e.target.value })}
                        />
                      ) : (
                        <p className="p-2 bg-muted rounded-md">{profile.city || "-"}</p>
                      )}
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <Label>العنوان</Label>
                      {editMode ? (
                        <Input
                          value={editedProfile.address || ""}
                          onChange={(e) => setEditedProfile({ ...editedProfile, address: e.target.value })}
                        />
                      ) : (
                        <p className="p-2 bg-muted rounded-md">{profile.address || "-"}</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label>البريد الإلكتروني</Label>
                      {editMode ? (
                        <Input
                          type="email"
                          value={editedProfile.email || ""}
                          onChange={(e) => setEditedProfile({ ...editedProfile, email: e.target.value })}
                        />
                      ) : (
                        <p className="p-2 bg-muted rounded-md">{profile.email || "-"}</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label>رقم الهاتف</Label>
                      {editMode ? (
                        <Input
                          value={editedProfile.phone || ""}
                          onChange={(e) => setEditedProfile({ ...editedProfile, phone: e.target.value })}
                        />
                      ) : (
                        <p className="p-2 bg-muted rounded-md">{profile.phone || "-"}</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label>الكلية</Label>
                      <p className="p-2 bg-muted rounded-md">{profile.faculty || "-"}</p>
                    </div>
                    <div className="space-y-2">
                      <Label>القسم</Label>
                      <p className="p-2 bg-muted rounded-md">{profile.department || "-"}</p>
                    </div>
                    <div className="space-y-2">
                      <Label>المستوى الدراسي</Label>
                      <p className="p-2 bg-muted rounded-md">{profile.level || "-"}</p>
                    </div>
                  </div>
                ) : (
                  <p className="text-center text-muted-foreground py-8">
                    لم يتم العثور على بيانات الملف الشخصي
                  </p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="housing" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Home className="h-5 w-5" />
                  السكن المخصص
                </CardTitle>
              </CardHeader>
              <CardContent>
                {assignments.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {assignments.map((assignment) => (
                      <div
                        key={assignment.assignmentId}
                        className="p-6 rounded-xl bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/30 dark:to-green-800/20 border border-green-200 dark:border-green-800"
                      >
                        <div className="flex items-center gap-3 mb-4">
                          <div className="p-2 rounded-lg bg-green-500/20">
                            <Home className="h-6 w-6 text-green-600" />
                          </div>
                          <div>
                            <p className="font-semibold text-green-800 dark:text-green-200">
                              {assignment.buildingName}
                            </p>
                            <p className="text-sm text-green-600 dark:text-green-400">
                              غرفة رقم {assignment.roomNumber}
                            </p>
                          </div>
                        </div>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">تاريخ التخصيص:</span>
                            <span className="font-medium">
                              {new Date(assignment.assignedAt).toLocaleDateString("ar-EG")}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Home className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                    <p className="text-muted-foreground">لم يتم تخصيص سكن لك بعد</p>
                    <p className="text-sm text-muted-foreground mt-2">
                      قم بتقديم طلب سكن وانتظر الموافقة
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </StudentLayout>
  );
}
