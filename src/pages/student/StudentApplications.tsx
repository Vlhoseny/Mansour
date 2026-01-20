import { useState } from "react";
import { StudentLayout } from "@/components/layout/StudentLayout";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { FullFormDto, StudentTypeEnum } from "@/lib/types";
import { studentApplicationsApi } from "@/lib/api";

// Egyptian governorates
const governorates = [
  "القاهرة", "الجيزة", "الإسكندرية", "الدقهلية", "البحر الأحمر", "البحيرة", "الفيوم",
  "الغربية", "الإسماعيلية", "المنوفية", "المنيا", "القليوبية", "الوادي الجديد", "السويس",
  "أسوان", "أسيوط", "بني سويف", "بورسعيد", "دمياط", "الشرقية", "جنوب سيناء", "كفر الشيخ",
  "مطروح", "الأقصر", "قنا", "شمال سيناء", "سوهاج"
];

// Guardian relations
const guardianRelations = [
  "الأب", "الأم", "الأخ", "الأخت", "العم", "الخال", "الجد", "الجدة", "أخرى"
];

// High school tracks (streams)
const highSchoolTracks = [
  "علمي علوم",
  "علمي رياضة",
  "أدبي"
];

// High school grades
const highSchoolGrades = [
  "ممتاز", "جيد جداً", "جيد", "مقبول"
];

// Academic year grades (for returning students)
const academicGrades = [
  "ممتاز", "جيد جداً", "جيد", "مقبول", "ضعيف"
];

// Faculties and levels
const faculties = [
  "كلية الهندسة", "كلية الطب", "كلية الصيدلة", "كلية العلوم", 
  "كلية الآداب", "كلية التجارة", "كلية الحقوق", "كلية التربية"
];

const levels = [
  "الفرقة الأولى", "الفرقة الثانية", "الفرقة الثالثة", "الفرقة الرابعة", "الفرقة الخامسة", "الفرقة السادسة"
];

export default function StudentApplications() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [studentType, setStudentType] = useState<"new" | "returning">("new");
  
  // Student Info
  const [nationalId, setNationalId] = useState("");
  const [fullName, setFullName] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [birthPlace, setBirthPlace] = useState("");
  const [gender, setGender] = useState("");
  const [religion, setReligion] = useState("");
  const [governorate, setGovernorate] = useState("");
  const [city, setCity] = useState("");
  const [address, setAddress] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [faculty, setFaculty] = useState("");
  const [department, setDepartment] = useState("");
  const [level, setLevel] = useState("");
  
  // Father Info
  const [fatherFullName, setFatherFullName] = useState("");
  const [fatherNationalId, setFatherNationalId] = useState("");
  const [fatherJob, setFatherJob] = useState("");
  const [fatherPhone, setFatherPhone] = useState("");
  const [fatherAddress, setFatherAddress] = useState("");
  
  // Guardian Info
  const [selectedGuardianRelation, setSelectedGuardianRelation] = useState("");
  const [guardianFullName, setGuardianFullName] = useState("");
  const [guardianNationalId, setGuardianNationalId] = useState("");
  const [guardianJob, setGuardianJob] = useState("");
  const [guardianPhone, setGuardianPhone] = useState("");
  const [guardianAddress, setGuardianAddress] = useState("");
  
  // Secondary Education Info
  const [secondaryStream, setSecondaryStream] = useState("");
  const [totalScore, setTotalScore] = useState("");
  const [percentage, setPercentage] = useState("");
  const [secondaryGrade, setSecondaryGrade] = useState("");
  
  // Academic Info (for returning students)
  const [currentGPA, setCurrentGPA] = useState("");
  const [lastYearGrade, setLastYearGrade] = useState("");
  
  // Agreement
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!agreedToTerms) {
      toast.error("يجب الموافقة على الإقرار للمتابعة");
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const formData: FullFormDto = {
        studentType: studentType === "new" ? StudentTypeEnum.Type0 : StudentTypeEnum.Type1,
        studentInfo: {
          studentId: 0,
          nationalId,
          fullName,
          studentType: studentType === "new" ? StudentTypeEnum.Type0 : StudentTypeEnum.Type1,
          birthDate: new Date(birthDate).toISOString(),
          birthPlace,
          gender,
          religion,
          governorate,
          city,
          address,
          email,
          phone,
          faculty,
          department,
          level,
          fatherContactId: 0,
          guardianContactId: 0,
          userId: 0
        },
        fatherInfo: {
          contactId: 0,
          fullName: fatherFullName,
          nationalId: fatherNationalId,
          relation: "الأب",
          job: fatherJob,
          phoneNumber: fatherPhone,
          address: fatherAddress
        },
        selectedGuardianRelation,
        otherGuardianInfo: {
          contactId: 0,
          fullName: guardianFullName,
          nationalId: guardianNationalId,
          relation: selectedGuardianRelation,
          job: guardianJob,
          phoneNumber: guardianPhone,
          address: guardianAddress
        },
        ...(studentType === "new" && {
          secondaryInfo: {
            studentId: 0,
            secondaryStream,
            totalScore: parseFloat(totalScore) || 0,
            percentage: parseFloat(percentage) || 0,
            grade: secondaryGrade
          }
        }),
        academicInfo: {
          studentId: 0,
          currentGPA: parseFloat(currentGPA) || 0,
          lastYearGrade: lastYearGrade || null
        }
      };

      const response = await studentApplicationsApi.submit(formData);
      
      if (response.error) {
        toast.error(response.error);
      } else {
        toast.success("تم تسجيل طلب الالتحاق بنجاح");
      }
    } catch (error) {
      toast.error("حدث خطأ أثناء تقديم الطلب");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <StudentLayout>
      <div className="space-y-6 max-w-5xl mx-auto">
        {/* Header Banner */}
        <div className="bg-muted p-4 rounded-lg text-center space-y-1">
          <p className="text-foreground font-medium">
            قم باختيار (قدامى/مستجدين) وملء بياناتك ثم الموافقة على الإقرار بالأسفل
          </p>
          <p className="text-muted-foreground text-sm">
            مع ملاحظة ان الطلاب المستجدين هم طلاب الفرق الأولى أو الاعدادية، الطلاب القدامى هم طلاب مابعد الفرق الأولى أو الاعدادية
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Student Type Tabs */}
          <Tabs value={studentType} onValueChange={(v) => setStudentType(v as "new" | "returning")} className="w-full">
            <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 h-12">
              <TabsTrigger value="returning" className="text-base">الطلاب القدامى</TabsTrigger>
              <TabsTrigger value="new" className="text-base">الطلاب المستجدين</TabsTrigger>
            </TabsList>

            <TabsContent value="new" className="mt-6 space-y-6">
              {/* Student Personal Info Section */}
              <div className="bg-card p-6 rounded-lg border space-y-6">
                <h3 className="text-lg font-semibold text-foreground border-b pb-2">بيانات الطالب</h3>
                
                {/* National ID & Full Name */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">الرقم القومى</Label>
                    <Input
                      value={nationalId}
                      onChange={(e) => setNationalId(e.target.value)}
                      className="text-right"
                      dir="ltr"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">الاسم الكامل</Label>
                    <Input
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="الاسم رباعى باللغة العربية"
                      className="text-right"
                      required
                    />
                  </div>
                </div>

                {/* Birth Date & Birth Place */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">تاريخ الميلاد</Label>
                    <Input
                      type="date"
                      value={birthDate}
                      onChange={(e) => setBirthDate(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">محل الميلاد</Label>
                    <Input
                      value={birthPlace}
                      onChange={(e) => setBirthPlace(e.target.value)}
                      className="text-right"
                      required
                    />
                  </div>
                </div>

                {/* Gender & Religion */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">النوع</Label>
                    <Select value={gender} onValueChange={setGender} required>
                      <SelectTrigger>
                        <SelectValue placeholder="اختر النوع" />
                      </SelectTrigger>
                      <SelectContent className="bg-popover">
                        <SelectItem value="ذكر">ذكر</SelectItem>
                        <SelectItem value="أنثى">أنثى</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">الديانة</Label>
                    <Select value={religion} onValueChange={setReligion} required>
                      <SelectTrigger>
                        <SelectValue placeholder="اختر الديانة" />
                      </SelectTrigger>
                      <SelectContent className="bg-popover">
                        <SelectItem value="مسلم">مسلم</SelectItem>
                        <SelectItem value="مسيحى">مسيحى</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Governorate & City */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">المحافظة</Label>
                    <Select value={governorate} onValueChange={setGovernorate} required>
                      <SelectTrigger>
                        <SelectValue placeholder="اختر المحافظة" />
                      </SelectTrigger>
                      <SelectContent className="bg-popover">
                        {governorates.map((gov) => (
                          <SelectItem key={gov} value={gov}>{gov}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">المدينة</Label>
                    <Input
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="text-right"
                      required
                    />
                  </div>
                </div>

                {/* Address */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium">العنوان بالتفصيل</Label>
                  <Input
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="text-right"
                    required
                  />
                </div>

                {/* Email & Phone */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">البريد الإلكتروني</Label>
                    <Input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      dir="ltr"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">رقم الهاتف</Label>
                    <Input
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      dir="ltr"
                      required
                    />
                  </div>
                </div>

                {/* Faculty, Department & Level */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">الكلية</Label>
                    <Select value={faculty} onValueChange={setFaculty} required>
                      <SelectTrigger>
                        <SelectValue placeholder="اختر الكلية" />
                      </SelectTrigger>
                      <SelectContent className="bg-popover">
                        {faculties.map((f) => (
                          <SelectItem key={f} value={f}>{f}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">القسم</Label>
                    <Input
                      value={department}
                      onChange={(e) => setDepartment(e.target.value)}
                      className="text-right"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">الفرقة</Label>
                    <Select value={level} onValueChange={setLevel} required>
                      <SelectTrigger>
                        <SelectValue placeholder="اختر الفرقة" />
                      </SelectTrigger>
                      <SelectContent className="bg-popover">
                        {levels.map((l) => (
                          <SelectItem key={l} value={l}>{l}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Father Info Section */}
              <div className="bg-card p-6 rounded-lg border space-y-6">
                <h3 className="text-lg font-semibold text-foreground border-b pb-2">بيانات الأب</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">اسم الأب الكامل</Label>
                    <Input
                      value={fatherFullName}
                      onChange={(e) => setFatherFullName(e.target.value)}
                      placeholder="الاسم رباعى باللغة العربية"
                      className="text-right"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">الرقم القومى للأب</Label>
                    <Input
                      value={fatherNationalId}
                      onChange={(e) => setFatherNationalId(e.target.value)}
                      dir="ltr"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">وظيفة الأب</Label>
                    <Input
                      value={fatherJob}
                      onChange={(e) => setFatherJob(e.target.value)}
                      className="text-right"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">رقم هاتف الأب</Label>
                    <Input
                      value={fatherPhone}
                      onChange={(e) => setFatherPhone(e.target.value)}
                      dir="ltr"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium">عنوان الأب</Label>
                  <Input
                    value={fatherAddress}
                    onChange={(e) => setFatherAddress(e.target.value)}
                    className="text-right"
                  />
                </div>
              </div>

              {/* Guardian Info Section */}
              <div className="bg-card p-6 rounded-lg border space-y-6">
                <h3 className="text-lg font-semibold text-foreground border-b pb-2">بيانات ولى الأمر (إذا كان غير الأب)</h3>
                
                <div className="space-y-2">
                  <Label className="text-sm font-medium">صلة القرابة</Label>
                  <Select value={selectedGuardianRelation} onValueChange={setSelectedGuardianRelation}>
                    <SelectTrigger>
                      <SelectValue placeholder="اختر صلة القرابة" />
                    </SelectTrigger>
                    <SelectContent className="bg-popover">
                      {guardianRelations.map((rel) => (
                        <SelectItem key={rel} value={rel}>{rel}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {selectedGuardianRelation && selectedGuardianRelation !== "الأب" && (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label className="text-sm font-medium">اسم ولى الأمر الكامل</Label>
                        <Input
                          value={guardianFullName}
                          onChange={(e) => setGuardianFullName(e.target.value)}
                          placeholder="الاسم رباعى باللغة العربية"
                          className="text-right"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm font-medium">الرقم القومى لولى الأمر</Label>
                        <Input
                          value={guardianNationalId}
                          onChange={(e) => setGuardianNationalId(e.target.value)}
                          dir="ltr"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label className="text-sm font-medium">وظيفة ولى الأمر</Label>
                        <Input
                          value={guardianJob}
                          onChange={(e) => setGuardianJob(e.target.value)}
                          className="text-right"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm font-medium">رقم هاتف ولى الأمر</Label>
                        <Input
                          value={guardianPhone}
                          onChange={(e) => setGuardianPhone(e.target.value)}
                          dir="ltr"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-sm font-medium">عنوان ولى الأمر</Label>
                      <Input
                        value={guardianAddress}
                        onChange={(e) => setGuardianAddress(e.target.value)}
                        className="text-right"
                      />
                    </div>
                  </>
                )}
              </div>

              {/* Secondary Education Section */}
              <div className="bg-card p-6 rounded-lg border space-y-6">
                <h3 className="text-lg font-semibold text-foreground border-b pb-2">بيانات الثانوية العامة</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">شعبة الثانوية العامة</Label>
                    <Select value={secondaryStream} onValueChange={setSecondaryStream} required>
                      <SelectTrigger>
                        <SelectValue placeholder="اختر الشعبة" />
                      </SelectTrigger>
                      <SelectContent className="bg-popover">
                        {highSchoolTracks.map((track) => (
                          <SelectItem key={track} value={track}>{track}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">التقدير</Label>
                    <Select value={secondaryGrade} onValueChange={setSecondaryGrade} required>
                      <SelectTrigger>
                        <SelectValue placeholder="اختر التقدير" />
                      </SelectTrigger>
                      <SelectContent className="bg-popover">
                        {highSchoolGrades.map((grade) => (
                          <SelectItem key={grade} value={grade}>{grade}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">المجموع الكلى</Label>
                    <Input
                      type="number"
                      value={totalScore}
                      onChange={(e) => setTotalScore(e.target.value)}
                      dir="ltr"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">النسبة المئوية</Label>
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        step="0.01"
                        max="100"
                        value={percentage}
                        onChange={(e) => setPercentage(e.target.value)}
                        dir="ltr"
                        required
                      />
                      <span className="text-muted-foreground">%</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Important Notes */}
              <div className="bg-amber-50 dark:bg-amber-950/30 p-6 rounded-lg space-y-3 border border-amber-200 dark:border-amber-800">
                <h3 className="text-lg font-semibold text-foreground text-right">ملاحظات هامة</h3>
                <ul className="space-y-2 text-sm text-foreground list-disc list-inside pr-2">
                  <li>تأكد من صحة جميع البيانات المدخلة قبل التقديم</li>
                  <li>سيتم مراجعة الطلب والرد عليه خلال أيام العمل الرسمية</li>
                  <li>يجب إحضار الأوراق الرسمية عند الحضور للمدينة في حالة القبول</li>
                </ul>
              </div>

              {/* Agreement */}
              <div className="flex items-start gap-3 p-4 bg-card rounded-lg border">
                <Checkbox
                  id="agreement"
                  checked={agreedToTerms}
                  onCheckedChange={(checked) => setAgreedToTerms(checked === true)}
                  className="mt-1"
                />
                <Label htmlFor="agreement" className="cursor-pointer text-sm leading-relaxed">
                  أقر بأن البيانات (محل الإقامة - التقدير - الفرقة/الكلية) صحيحة طبقاً للأوراق الرسمية على أن أقدم هذه الأوراق عند حضوري للمدينة في حالة القبول وإذا ثبت أي خطأ في البيانات يتم تحويلي للشئون القانونية وفصلي نهائياً من المدينة
                </Label>
              </div>

              {/* Submit Button */}
              <div className="flex justify-center">
                <Button 
                  type="submit" 
                  size="lg"
                  className="min-w-[300px] h-12 text-lg"
                  disabled={isSubmitting || !agreedToTerms}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin ml-2" />
                      جاري التسجيل...
                    </>
                  ) : (
                    "تسجيل طلب الالتحاق"
                  )}
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="returning" className="mt-6 space-y-6">
              {/* Returning Students Form */}
              <div className="bg-card p-6 rounded-lg border space-y-6">
                <h3 className="text-lg font-semibold text-foreground border-b pb-2">بيانات الطالب القديم</h3>
                
                {/* National ID & Full Name */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">الرقم القومى</Label>
                    <Input
                      value={nationalId}
                      onChange={(e) => setNationalId(e.target.value)}
                      className="text-right"
                      dir="ltr"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">الاسم الكامل</Label>
                    <Input
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="الاسم رباعى باللغة العربية"
                      className="text-right"
                      required
                    />
                  </div>
                </div>

                {/* Birth Date & Birth Place */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">تاريخ الميلاد</Label>
                    <Input
                      type="date"
                      value={birthDate}
                      onChange={(e) => setBirthDate(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">محل الميلاد</Label>
                    <Input
                      value={birthPlace}
                      onChange={(e) => setBirthPlace(e.target.value)}
                      className="text-right"
                      required
                    />
                  </div>
                </div>

                {/* Gender & Religion */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">النوع</Label>
                    <Select value={gender} onValueChange={setGender} required>
                      <SelectTrigger>
                        <SelectValue placeholder="اختر النوع" />
                      </SelectTrigger>
                      <SelectContent className="bg-popover">
                        <SelectItem value="ذكر">ذكر</SelectItem>
                        <SelectItem value="أنثى">أنثى</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">الديانة</Label>
                    <Select value={religion} onValueChange={setReligion} required>
                      <SelectTrigger>
                        <SelectValue placeholder="اختر الديانة" />
                      </SelectTrigger>
                      <SelectContent className="bg-popover">
                        <SelectItem value="مسلم">مسلم</SelectItem>
                        <SelectItem value="مسيحى">مسيحى</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Governorate & City */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">المحافظة</Label>
                    <Select value={governorate} onValueChange={setGovernorate} required>
                      <SelectTrigger>
                        <SelectValue placeholder="اختر المحافظة" />
                      </SelectTrigger>
                      <SelectContent className="bg-popover">
                        {governorates.map((gov) => (
                          <SelectItem key={gov} value={gov}>{gov}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">المدينة</Label>
                    <Input
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="text-right"
                      required
                    />
                  </div>
                </div>

                {/* Address */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium">العنوان بالتفصيل</Label>
                  <Input
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="text-right"
                    required
                  />
                </div>

                {/* Email & Phone */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">البريد الإلكتروني</Label>
                    <Input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      dir="ltr"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">رقم الهاتف</Label>
                    <Input
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      dir="ltr"
                      required
                    />
                  </div>
                </div>

                {/* Faculty, Department & Level */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">الكلية</Label>
                    <Select value={faculty} onValueChange={setFaculty} required>
                      <SelectTrigger>
                        <SelectValue placeholder="اختر الكلية" />
                      </SelectTrigger>
                      <SelectContent className="bg-popover">
                        {faculties.map((f) => (
                          <SelectItem key={f} value={f}>{f}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">القسم</Label>
                    <Input
                      value={department}
                      onChange={(e) => setDepartment(e.target.value)}
                      className="text-right"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">الفرقة</Label>
                    <Select value={level} onValueChange={setLevel} required>
                      <SelectTrigger>
                        <SelectValue placeholder="اختر الفرقة" />
                      </SelectTrigger>
                      <SelectContent className="bg-popover">
                        {levels.map((l) => (
                          <SelectItem key={l} value={l}>{l}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Father Info Section */}
              <div className="bg-card p-6 rounded-lg border space-y-6">
                <h3 className="text-lg font-semibold text-foreground border-b pb-2">بيانات الأب</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">اسم الأب الكامل</Label>
                    <Input
                      value={fatherFullName}
                      onChange={(e) => setFatherFullName(e.target.value)}
                      placeholder="الاسم رباعى باللغة العربية"
                      className="text-right"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">الرقم القومى للأب</Label>
                    <Input
                      value={fatherNationalId}
                      onChange={(e) => setFatherNationalId(e.target.value)}
                      dir="ltr"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">وظيفة الأب</Label>
                    <Input
                      value={fatherJob}
                      onChange={(e) => setFatherJob(e.target.value)}
                      className="text-right"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">رقم هاتف الأب</Label>
                    <Input
                      value={fatherPhone}
                      onChange={(e) => setFatherPhone(e.target.value)}
                      dir="ltr"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium">عنوان الأب</Label>
                  <Input
                    value={fatherAddress}
                    onChange={(e) => setFatherAddress(e.target.value)}
                    className="text-right"
                  />
                </div>
              </div>

              {/* Guardian Info Section */}
              <div className="bg-card p-6 rounded-lg border space-y-6">
                <h3 className="text-lg font-semibold text-foreground border-b pb-2">بيانات ولى الأمر (إذا كان غير الأب)</h3>
                
                <div className="space-y-2">
                  <Label className="text-sm font-medium">صلة القرابة</Label>
                  <Select value={selectedGuardianRelation} onValueChange={setSelectedGuardianRelation}>
                    <SelectTrigger>
                      <SelectValue placeholder="اختر صلة القرابة" />
                    </SelectTrigger>
                    <SelectContent className="bg-popover">
                      {guardianRelations.map((rel) => (
                        <SelectItem key={rel} value={rel}>{rel}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {selectedGuardianRelation && selectedGuardianRelation !== "الأب" && (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label className="text-sm font-medium">اسم ولى الأمر الكامل</Label>
                        <Input
                          value={guardianFullName}
                          onChange={(e) => setGuardianFullName(e.target.value)}
                          placeholder="الاسم رباعى باللغة العربية"
                          className="text-right"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm font-medium">الرقم القومى لولى الأمر</Label>
                        <Input
                          value={guardianNationalId}
                          onChange={(e) => setGuardianNationalId(e.target.value)}
                          dir="ltr"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label className="text-sm font-medium">وظيفة ولى الأمر</Label>
                        <Input
                          value={guardianJob}
                          onChange={(e) => setGuardianJob(e.target.value)}
                          className="text-right"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm font-medium">رقم هاتف ولى الأمر</Label>
                        <Input
                          value={guardianPhone}
                          onChange={(e) => setGuardianPhone(e.target.value)}
                          dir="ltr"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-sm font-medium">عنوان ولى الأمر</Label>
                      <Input
                        value={guardianAddress}
                        onChange={(e) => setGuardianAddress(e.target.value)}
                        className="text-right"
                      />
                    </div>
                  </>
                )}
              </div>

              {/* Academic Info Section (for returning students) */}
              <div className="bg-card p-6 rounded-lg border space-y-6">
                <h3 className="text-lg font-semibold text-foreground border-b pb-2">البيانات الأكاديمية</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">المعدل التراكمى الحالى (GPA)</Label>
                    <Input
                      type="number"
                      step="0.01"
                      max="4"
                      value={currentGPA}
                      onChange={(e) => setCurrentGPA(e.target.value)}
                      dir="ltr"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">تقدير العام الماضى</Label>
                    <Select value={lastYearGrade} onValueChange={setLastYearGrade} required>
                      <SelectTrigger>
                        <SelectValue placeholder="اختر التقدير" />
                      </SelectTrigger>
                      <SelectContent className="bg-popover">
                        {academicGrades.map((grade) => (
                          <SelectItem key={grade} value={grade}>{grade}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Important Notes */}
              <div className="bg-amber-50 dark:bg-amber-950/30 p-6 rounded-lg space-y-3 border border-amber-200 dark:border-amber-800">
                <h3 className="text-lg font-semibold text-foreground text-right">ملاحظات هامة</h3>
                <ul className="space-y-2 text-sm text-foreground list-disc list-inside pr-2">
                  <li>تأكد من صحة جميع البيانات المدخلة قبل التقديم</li>
                  <li>سيتم مراجعة الطلب والرد عليه خلال أيام العمل الرسمية</li>
                  <li>يجب إحضار الأوراق الرسمية عند الحضور للمدينة في حالة القبول</li>
                </ul>
              </div>

              {/* Agreement */}
              <div className="flex items-start gap-3 p-4 bg-card rounded-lg border">
                <Checkbox
                  id="agreement-returning"
                  checked={agreedToTerms}
                  onCheckedChange={(checked) => setAgreedToTerms(checked === true)}
                  className="mt-1"
                />
                <Label htmlFor="agreement-returning" className="cursor-pointer text-sm leading-relaxed">
                  أقر بأن البيانات (محل الإقامة - التقدير - الفرقة/الكلية) صحيحة طبقاً للأوراق الرسمية على أن أقدم هذه الأوراق عند حضوري للمدينة في حالة القبول وإذا ثبت أي خطأ في البيانات يتم تحويلي للشئون القانونية وفصلي نهائياً من المدينة
                </Label>
              </div>

              {/* Submit Button */}
              <div className="flex justify-center">
                <Button 
                  type="submit" 
                  size="lg"
                  className="min-w-[300px] h-12 text-lg"
                  disabled={isSubmitting || !agreedToTerms}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin ml-2" />
                      جاري التسجيل...
                    </>
                  ) : (
                    "تسجيل طلب الالتحاق"
                  )}
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </form>
      </div>
    </StudentLayout>
  );
}
