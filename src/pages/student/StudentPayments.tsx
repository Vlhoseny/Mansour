import { useEffect, useState } from "react";
import { StudentLayout } from "@/components/layout/StudentLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { studentProfileApi, studentPaymentsApi } from "@/lib/api";
import { toast } from "sonner";
import { CreditCard, Upload, Loader2, CheckCircle, Clock, XCircle } from "lucide-react";
import type { FeesDto, FeePaymentDto } from "@/lib/types";

export default function StudentPayments() {
  const [fees, setFees] = useState<FeesDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedFee, setSelectedFee] = useState<FeesDto | null>(null);
  const [paymentForm, setPaymentForm] = useState<FeePaymentDto>({
    studentId: 0,
    transactionCode: "",
    receiptFilePath: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPayDialog, setShowPayDialog] = useState(false);

  useEffect(() => {
    fetchFees();
  }, []);

  const fetchFees = async () => {
    setIsLoading(true);
    try {
      const response = await studentProfileApi.getFees();
      if (response.data && Array.isArray(response.data)) setFees(response.data);
    } catch (error) {
      console.error("Error fetching fees:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFee) return;

    setIsSubmitting(true);
    try {
      const response = await studentPaymentsApi.pay(selectedFee.feeId, paymentForm);
      if (response.error) {
        toast.error(response.error);
      } else {
        toast.success("تم إرسال إيصال الدفع بنجاح");
        setShowPayDialog(false);
        setPaymentForm({ studentId: 0, transactionCode: "", receiptFilePath: "" });
        fetchFees();
      }
    } catch (error) {
      toast.error("حدث خطأ أثناء إرسال الدفع");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status?.toLowerCase()) {
      case "paid":
        return <Badge className="gap-1 bg-green-600"><CheckCircle className="h-3 w-3" /> مدفوع</Badge>;
      case "pending":
        return <Badge variant="secondary" className="gap-1"><Clock className="h-3 w-3" /> قيد المراجعة</Badge>;
      case "overdue":
        return <Badge variant="destructive" className="gap-1"><XCircle className="h-3 w-3" /> متأخر</Badge>;
      default:
        return <Badge variant="outline" className="gap-1"><Clock className="h-3 w-3" /> غير مدفوع</Badge>;
    }
  };

  const totalFees = (fees || []).reduce((sum, fee) => sum + fee.amount, 0);
  const paidFees = (fees || []).filter((f) => f.status?.toLowerCase() === "paid").reduce((sum, fee) => sum + fee.amount, 0);
  const unpaidFees = totalFees - paidFees;

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
        <div>
          <h1 className="text-2xl font-bold">الرسوم والمدفوعات</h1>
          <p className="text-muted-foreground">عرض الرسوم المستحقة وسداد المدفوعات</p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-sm text-muted-foreground">إجمالي الرسوم</p>
                <p className="text-3xl font-bold text-foreground">{totalFees.toLocaleString("ar-EG")} ج.م</p>
              </div>
            </CardContent>
          </Card>
          <Card className="border-green-500/50">
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-sm text-muted-foreground">المدفوع</p>
                <p className="text-3xl font-bold text-green-600">{paidFees.toLocaleString("ar-EG")} ج.م</p>
              </div>
            </CardContent>
          </Card>
          <Card className="border-orange-500/50">
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-sm text-muted-foreground">المتبقي</p>
                <p className="text-3xl font-bold text-orange-600">{unpaidFees.toLocaleString("ar-EG")} ج.م</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Fees List */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              قائمة الرسوم
            </CardTitle>
            <CardDescription>
              جميع الرسوم المستحقة عليك
            </CardDescription>
          </CardHeader>
          <CardContent>
            {fees.length > 0 ? (
              <div className="space-y-4">
                {fees.map((fee) => (
                  <div
                    key={fee.feeId}
                    className="p-4 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <p className="font-medium">{fee.feeType || "رسوم السكن"}</p>
                          {getStatusBadge(fee.status || "")}
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          تاريخ الإنشاء: {new Date(fee.createdAt).toLocaleDateString("ar-EG")}
                        </p>
                      </div>
                      <div className="flex items-center gap-4">
                        <p className="text-lg font-bold">{fee.amount.toLocaleString("ar-EG")} ج.م</p>
                        {fee.status?.toLowerCase() !== "paid" && (
                          <Dialog open={showPayDialog && selectedFee?.feeId === fee.feeId} onOpenChange={(open) => {
                            setShowPayDialog(open);
                            if (open) setSelectedFee(fee);
                          }}>
                            <DialogTrigger asChild>
                              <Button size="sm" className="gap-2">
                                <Upload className="h-4 w-4" />
                                دفع
                              </Button>
                            </DialogTrigger>
                            <DialogContent dir="rtl">
                              <DialogHeader>
                                <DialogTitle>تسجيل دفع رسوم</DialogTitle>
                              </DialogHeader>
                              <form onSubmit={handlePayment} className="space-y-4 mt-4">
                                <div className="p-4 rounded-lg bg-muted">
                                  <p className="text-sm text-muted-foreground">المبلغ المطلوب</p>
                                  <p className="text-2xl font-bold">{fee.amount.toLocaleString("ar-EG")} ج.م</p>
                                </div>
                                <div className="space-y-2">
                                  <Label>رقم العملية / إيصال التحويل</Label>
                                  <Input
                                    value={paymentForm.transactionCode || ""}
                                    onChange={(e) => setPaymentForm({ ...paymentForm, transactionCode: e.target.value })}
                                    placeholder="أدخل رقم العملية"
                                    required
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label>رابط صورة الإيصال (اختياري)</Label>
                                  <Input
                                    value={paymentForm.receiptFilePath || ""}
                                    onChange={(e) => setPaymentForm({ ...paymentForm, receiptFilePath: e.target.value })}
                                    placeholder="رابط الصورة"
                                  />
                                  <p className="text-xs text-muted-foreground">
                                    يمكنك رفع صورة الإيصال على خدمة تخزين سحابي ولصق الرابط هنا
                                  </p>
                                </div>
                                <div className="flex justify-end gap-3 pt-4">
                                  <Button type="button" variant="outline" onClick={() => setShowPayDialog(false)}>
                                    إلغاء
                                  </Button>
                                  <Button type="submit" disabled={isSubmitting}>
                                    {isSubmitting ? (
                                      <>
                                        <Loader2 className="h-4 w-4 animate-spin ml-2" />
                                        جارِ الإرسال...
                                      </>
                                    ) : (
                                      "إرسال"
                                    )}
                                  </Button>
                                </div>
                              </form>
                            </DialogContent>
                          </Dialog>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <CreditCard className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                <p className="text-muted-foreground">لا توجد رسوم مستحقة حالياً</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </StudentLayout>
  );
}
