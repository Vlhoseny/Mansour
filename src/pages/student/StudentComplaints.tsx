import { useEffect, useState } from "react";
import { StudentLayout } from "@/components/layout/StudentLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { studentComplaintsApi } from "@/lib/api";
import { toast } from "sonner";
import { MessageSquare, Plus, Loader2, CheckCircle, Clock } from "lucide-react";
import type { SubmitComplaintDto, Complaint } from "@/lib/types";

export default function StudentComplaints() {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm] = useState<SubmitComplaintDto>({ title: "", message: "" });

  useEffect(() => {
    // Note: The API doesn't have a get complaints endpoint for students, so we'll show submitted ones
    setIsLoading(false);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await studentComplaintsApi.submit(form);
      if (response.error) {
        toast.error(response.error);
      } else {
        toast.success("تم إرسال الشكوى بنجاح");
        setShowForm(false);
        setForm({ title: "", message: "" });
        // Add to local list for display
        setComplaints((prev) => [
          {
            complaintId: Date.now(),
            studentId: 0,
            studentName: "",
            title: form.title,
            message: form.message,
            submittedAt: new Date().toISOString(),
            status: "Pending",
          },
          ...prev,
        ]);
      }
    } catch (error) {
      toast.error("حدث خطأ أثناء إرسال الشكوى");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status?.toLowerCase()) {
      case "resolved":
        return <Badge className="gap-1 bg-green-600"><CheckCircle className="h-3 w-3" /> تم الحل</Badge>;
      case "pending":
      default:
        return <Badge variant="secondary" className="gap-1"><Clock className="h-3 w-3" /> قيد المراجعة</Badge>;
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
            <h1 className="text-2xl font-bold">الشكاوى والمقترحات</h1>
            <p className="text-muted-foreground">تقديم شكوى أو اقتراح لإدارة السكن</p>
          </div>
          
          <Dialog open={showForm} onOpenChange={setShowForm}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                شكوى جديدة
              </Button>
            </DialogTrigger>
            <DialogContent dir="rtl">
              <DialogHeader>
                <DialogTitle>تقديم شكوى أو اقتراح</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label>عنوان الشكوى</Label>
                  <Input
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    placeholder="أدخل عنوان موجز للشكوى"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>تفاصيل الشكوى</Label>
                  <Textarea
                    value={form.message}
                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                    placeholder="اشرح تفاصيل الشكوى أو الاقتراح..."
                    rows={5}
                    required
                  />
                </div>
                <div className="flex justify-end gap-3 pt-4">
                  <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                    إلغاء
                  </Button>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin ml-2" />
                        جارِ الإرسال...
                      </>
                    ) : (
                      "إرسال الشكوى"
                    )}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Info Card */}
        <Card className="border-blue-500/50 bg-blue-50/50 dark:bg-blue-900/10">
          <CardContent className="pt-6">
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-lg bg-blue-100 dark:bg-blue-900/30">
                <MessageSquare className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="font-semibold text-blue-800 dark:text-blue-200">نصائح لتقديم شكوى فعّالة</p>
                <ul className="text-sm text-blue-600 dark:text-blue-400 mt-2 space-y-1 list-disc list-inside">
                  <li>اختر عنوان واضح ومختصر يعبر عن المشكلة</li>
                  <li>اشرح التفاصيل بوضوح مع ذكر الموقع والوقت إن أمكن</li>
                  <li>كن موضوعياً ومحترماً في صياغة الشكوى</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Complaints List */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              شكاواي السابقة
            </CardTitle>
            <CardDescription>
              عرض جميع الشكاوى المقدمة
            </CardDescription>
          </CardHeader>
          <CardContent>
            {complaints.length > 0 ? (
              <div className="space-y-4">
                {complaints.map((complaint) => (
                  <div
                    key={complaint.complaintId}
                    className="p-4 rounded-lg border bg-card"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <p className="font-medium">{complaint.title}</p>
                          {getStatusBadge(complaint.status)}
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {complaint.message}
                        </p>
                        <p className="text-xs text-muted-foreground mt-2">
                          تاريخ التقديم: {new Date(complaint.submittedAt).toLocaleDateString("ar-EG")}
                        </p>
                        {complaint.resolutionMessage && (
                          <div className="mt-3 p-3 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
                            <p className="text-sm font-medium text-green-800 dark:text-green-200">الرد:</p>
                            <p className="text-sm text-green-600 dark:text-green-400">
                              {complaint.resolutionMessage}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                <p className="text-muted-foreground">لم تقدم أي شكاوى بعد</p>
                <p className="text-sm text-muted-foreground mt-2">
                  يمكنك تقديم شكوى أو اقتراح من خلال الزر أعلاه
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </StudentLayout>
  );
}
