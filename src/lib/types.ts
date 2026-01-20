// TypeScript types based on Housing API Swagger specification

export enum StudentTypeEnum {
    Type0 = 0,
    Type1 = 1,
}

export interface AcademicEducationDto {
    studentId: number;
    currentGPA: number;
    lastYearGrade: string | null;
}

export interface ApplicationStatusDto {
    statusId: number;
    label: string | null;
    colorCode: string | null;
    description: string | null;
}

export interface ApplicationWindowDto {
    windowId: number;
    title: string | null;
    description: string | null;
    createdAt: string;
    startDate: string;
    endDate: string;
    status: string | null;
    userId: number;
}

export interface BuildingDto {
    buildingId: number;
    name: string | null;
    type: string | null;
    numberOfFloors: number;
    status: string | null;
}

export interface FamilyContactDto {
    contactId: number;
    fullName: string | null;
    nationalId: string | null;
    relation: string | null;
    job: string | null;
    phoneNumber: string | null;
    address: string | null;
}

export interface FeePaymentDto {
    studentId: number;
    transactionCode: string | null;
    receiptFilePath: string | null;
}

export interface FeesDto {
    feeId: number;
    amount: number;
    feeType: string | null;
    status: string | null;
    createdAt: string;
    studentId: number;
    userId: number;
    assignmentId: number | null;
}

export interface FullFormDto {
    studentType: StudentTypeEnum;
    studentInfo: StudentDto;
    fatherInfo: FamilyContactDto;
    selectedGuardianRelation: string | null;
    otherGuardianInfo: FamilyContactDto;
    secondaryInfo: SecondaryEducationDto;
    academicInfo: AcademicEducationDto;
}

export interface LoginDto {
    username: string;
    password: string;
}

export interface NotificationDto {
    notificationId: number;
    title: string | null;
    message: string | null;
    createdAt: string;
    isRead: boolean;
    studentId: number;
    userId: number | null;
    applicationId: number | null;
}

export interface RegisterDto {
    userName: string;
    password: string;
    role: string;
    studentId?: number | null;
}

export interface ResolveComplaintDto {
    resolutionMessage: string;
}

export interface RoomDto {
    roomId: number;
    roomNumber: string | null;
    capacity: number;
    currentOccupancy: number;
    buildingId: number;
    buildingName?: string | null;
    apartmentName: string | null;
    status: number;
}

export interface SecondaryEducationDto {
    studentId: number;
    secondaryStream: string | null;
    totalScore: number;
    percentage: number;
    grade: string | null;
}

export interface StudentDto {
    studentId: number;
    nationalId: string | null;
    fullName: string | null;
    studentType: StudentTypeEnum;
    birthDate: string;
    birthPlace: string | null;
    gender: string | null;
    religion: string | null;
    governorate: string | null;
    city: string | null;
    address: string | null;
    email: string | null;
    phone: string | null;
    faculty: string | null;
    department: string | null;
    level: string | null;
    fatherContactId: number;
    guardianContactId: number;
    userId: number;
}

export interface SubmitComplaintDto {
    title: string;
    message: string;
}

export interface ApiResponse<T> {
    data?: T;
    error?: string;
    status: number;
}

// The backend returns token plus user identity fields (userId/userName/role)
// Sometimes it may wrap them in a `user` object; keep both shapes.
export interface LoginResponse {
    token: string;
    userId?: number;
    userName?: string;
    role?: string;
    user?: {
        id: number;
        username: string;
        role: string;
    };
}

export interface ApplicationDetails {
    applicationId?: number;
    applicationid?: number; // API returns lowercase
    studentId: number;
    studentName?: string;
    status?: string;
    submittedAt?: string;
    student?: StudentDto; // API includes student object
    studentInfo?: StudentDto;
    fatherInfo?: FamilyContactDto;
    guardianInfo?: FamilyContactDto;
    secondaryInfo?: SecondaryEducationDto;
    academicInfo?: AcademicEducationDto;
    windowId?: number;
    statusId?: number;
    formType?: string;
    createdAt?: string;
    reviewedAt?: string;
    reviewedByAdminId?: string;
    paymentReceiptPath?: string | null;
}

export interface Complaint {
    complaintId: number;
    studentId: number;
    studentName: string;
    title: string;
    message: string;
    submittedAt: string;
    status: string;
    resolutionMessage?: string;
}

export interface Payment {
    feePaymentId: number;
    studentId: number;
    studentName: string;
    feeId: number;
    amount: number;
    transactionCode: string;
    receiptFilePath: string;
    submittedAt: string;
    status: string;
}

export interface RoomAssignment {
    assignmentId: number;
    studentId: number;
    studentName: string;
    roomId: number;
    roomNumber: string;
    buildingName: string;
    assignedAt: string;
}

export interface DashboardSummary {
    totalStudents: number;
    totalBuildings: number;
    totalRooms: number;
    occupiedRooms: number;
    pendingApplications: number;
    unresolvedComplaints: number;
    pendingPayments: number;
}

export interface ReportsSummary {
    generatedAt: string;
    totalBuildings: number;
    totalRooms: number;
    occupiedRooms: number;
    acceptedApplications: number;
    pendingApplications: number;
    totalStudents: number;
    residentStudents: number;
    newStudents: number;
    bannedStudents: number;
}

export interface BaseHousingFee {
    id: number;
    amount: number;
    notes?: string;
    createdAt?: string;
    updatedAt?: string;
}
