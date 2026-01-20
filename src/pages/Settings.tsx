import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import {
  Settings as SettingsIcon,
  DollarSign,
  Calendar,
  Bell,
  Shield,
  Save,
  Loader2,
  Trash2,
} from 'lucide-react';
import { toast } from 'sonner';
import { useBaseHousingFees, useSetGlobalFee, useUpdateGlobalFee, useDeleteBaseHousingFee } from '@/hooks/useApi';
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

export default function Settings() {
  const [globalFee, setGlobalFee] = useState('');
  const [feeNotes, setFeeNotes] = useState('');
  const [applicationOpen, setApplicationOpen] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [smsNotifications, setSmsNotifications] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);

  const { data: housingFees, isLoading: feesLoading } = useBaseHousingFees();
  const setGlobalMutation = useSetGlobalFee();
  const updateGlobalMutation = useUpdateGlobalFee();
  const deleteMutation = useDeleteBaseHousingFee();

  const currentFee = Array.isArray(housingFees) && housingFees.length > 0 ? housingFees[0] : null;

  useEffect(() => {
    if (currentFee) {
      setGlobalFee(currentFee.amount?.toString() || '');
      setFeeNotes(currentFee.notes || '');
    }
  }, [currentFee]);

  const handleSaveFee = async () => {
    const amount = parseFloat(globalFee);

    if (!amount || amount <= 0) {
      toast.error('الرجاء إدخال مبلغ صحيح');
      return;
    }

    try {
      if (currentFee) {
        // Update existing fee
        await updateGlobalMutation.mutateAsync(amount);
        toast.success('تم تحديث الرسوم بنجاح');
      } else {
        // Set new fee
        await setGlobalMutation.mutateAsync({ amount, notes: feeNotes });
        toast.success('تم تعيين الرسوم بنجاح');
      }
    } catch (error) {
      toast.error('فشل في حفظ الرسوم');
    }
  };

  const handleDeleteFee = async () => {
    if (!deleteConfirm) return;

    try {
      await deleteMutation.mutateAsync(deleteConfirm);
      toast.success('تم حذف الرسوم بنجاح');
      setGlobalFee('');
      setFeeNotes('');
      setDeleteConfirm(null);
    } catch (error) {
      toast.error('فشل في حذف الرسوم');
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-4xl">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-foreground">الإعدادات</h1>
          <p className="text-muted-foreground">إدارة إعدادات النظام</p>
        </div>

        {/* Housing Fees */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-ocean" />
              رسوم السكن
            </CardTitle>
            <CardDescription>
              ضبط المبلغ الافتراضي لرسوم السكن
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {feesLoading ? (
              <div className="flex items-center justify-center p-8">
                <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="globalFee">الرسوم العامة للسكن (ج.م)</Label>
                    <Input
                      id="globalFee"
                      type="number"
                      value={globalFee}
                      onChange={(e) => setGlobalFee(e.target.value)}
                      placeholder="أدخل المبلغ"
                      min="0"
                      step="0.01"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="feeNotes">ملاحظات</Label>
                    <Textarea
                      id="feeNotes"
                      value={feeNotes}
                      onChange={(e) => setFeeNotes(e.target.value)}
                      placeholder="أدخل ملاحظات حول الرسوم (اختياري)"
                      rows={3}
                    />
                  </div>
                </div>

                {currentFee && (
                  <div className="p-4 bg-ocean/5 border border-ocean/20 rounded-lg">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-medium text-sm">الرسوم الحالية</p>
                        <p className="text-2xl font-bold text-ocean mt-1">{currentFee.amount} ج.م</p>
                        {currentFee.notes && (
                          <p className="text-sm text-muted-foreground mt-2">{currentFee.notes}</p>
                        )}
                        {currentFee.updatedAt && (
                          <p className="text-xs text-muted-foreground mt-1">
                            آخر تحديث: {new Date(currentFee.updatedAt).toLocaleDateString('ar-EG')}
                          </p>
                        )}
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-destructive hover:text-destructive"
                        onClick={() => setDeleteConfirm(currentFee.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                )}

                <div className="flex gap-2">
                  <Button
                    onClick={handleSaveFee}
                    disabled={setGlobalMutation.isPending || updateGlobalMutation.isPending}
                    className="bg-ocean hover:bg-ocean/90"
                  >
                    {(setGlobalMutation.isPending || updateGlobalMutation.isPending) ? (
                      <>
                        <Loader2 className="w-4 h-4 ml-2 animate-spin" />
                        جاري الحفظ...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4 ml-2" />
                        {currentFee ? 'تحديث الرسوم' : 'حفظ الرسوم'}
                      </>
                    )}
                  </Button>
                </div>

                <div className="p-4 bg-muted/50 rounded-lg">
                  <p className="text-sm text-muted-foreground">
                    💡 سيتم تطبيق الرسوم العامة على جميع الطلبات الجديدة. يمكن تعديل الرسوم لكل طالب على حدة.
                  </p>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Application Window */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-gold" />
              نافذة التقديم
            </CardTitle>
            <CardDescription>
              التحكم بفترة قبول طلبات السكن
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
              <div>
                <p className="font-medium">قبول الطلبات</p>
                <p className="text-sm text-muted-foreground">السماح بتقديم طلبات سكن جديدة</p>
              </div>
              <Switch
                checked={applicationOpen}
                onCheckedChange={setApplicationOpen}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startDate">تاريخ البدء</Label>
                <Input
                  id="startDate"
                  type="date"
                  defaultValue="2024-01-01"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="endDate">تاريخ الانتهاء</Label>
                <Input
                  id="endDate"
                  type="date"
                  defaultValue="2024-02-28"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Notifications */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="w-5 h-5 text-sunset" />
              الإشعارات
            </CardTitle>
            <CardDescription>
              إعداد كيفية إرسال الإشعارات
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
              <div>
                <p className="font-medium">إشعارات البريد الإلكتروني</p>
                <p className="text-sm text-muted-foreground">إرسال إشعارات عبر البريد الإلكتروني</p>
              </div>
              <Switch
                checked={emailNotifications}
                onCheckedChange={setEmailNotifications}
              />
            </div>

            <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
              <div>
                <p className="font-medium">إشعارات الرسائل النصية</p>
                <p className="text-sm text-muted-foreground">إرسال إشعارات عبر الرسائل النصية</p>
              </div>
              <Switch
                checked={smsNotifications}
                onCheckedChange={setSmsNotifications}
              />
            </div>
          </CardContent>
        </Card>

        {/* Security */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-primary" />
              الأمان
            </CardTitle>
            <CardDescription>
              إدارة إعدادات الأمان والوصول
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="currentPassword">كلمة المرور الحالية</Label>
              <Input
                id="currentPassword"
                type="password"
                placeholder="أدخل كلمة المرور الحالية"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="newPassword">كلمة المرور الجديدة</Label>
                <Input
                  id="newPassword"
                  type="password"
                  placeholder="أدخل كلمة المرور الجديدة"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">تأكيد كلمة المرور</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="تأكيد كلمة المرور الجديدة"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Save Button */}
        <div className="flex justify-start lg:justify-end">
          <Button onClick={() => toast.success('تم حفظ الإعدادات بنجاح')} className="bg-primary hover:bg-primary/90">
            <Save className="w-4 h-4 ml-2" />
            حفظ التغييرات الأخرى
          </Button>
        </div>
      </div>

      {/* Delete Fee Confirmation Dialog */}
      <AlertDialog open={!!deleteConfirm} onOpenChange={(open) => !open && setDeleteConfirm(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>تأكيد حذف الرسوم</AlertDialogTitle>
            <AlertDialogDescription>
              هل أنت متأكد من حذف الرسوم الحالية؟ لن يمكنك التراجع عن هذا الإجراء.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>إلغاء</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteFee}
              disabled={deleteMutation.isPending}
              className="bg-destructive text-white hover:bg-destructive/90"
            >
              {deleteMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 ml-2 animate-spin" />
                  جاري الحذف...
                </>
              ) : (
                'تأكيد الحذف'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  );
}
