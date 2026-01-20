// API Configuration and Base Functions for Hurghada University Housing API
import type {
  ApiResponse,
  LoginDto,
  LoginResponse,
  RegisterDto,
  ApplicationWindowDto,
  ApplicationStatusDto,
  BuildingDto,
  RoomDto,
  StudentDto,
  FamilyContactDto,
  SecondaryEducationDto,
  AcademicEducationDto,
  FullFormDto,
  FeesDto,
  FeePaymentDto,
  NotificationDto,
  SubmitComplaintDto,
  ResolveComplaintDto,
  ApplicationDetails,
  Complaint,
  Payment,
  RoomAssignment,
  DashboardSummary,
} from './types';

const API_BASE_URL = "http://housingms.runasp.net/api";

// Get stored auth token
const getAuthToken = (): string | null => {
  return localStorage.getItem('auth_token');
};

// Set auth token
export const setAuthToken = (token: string): void => {
  localStorage.setItem('auth_token', token);
};

// Remove auth token
export const removeAuthToken = (): void => {
  localStorage.removeItem('auth_token');
};

// Base fetch wrapper with authentication
async function apiFetch<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const token = getAuthToken();

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
  }

  try {
    const url = `${API_BASE_URL}${endpoint}`;
    console.log(`API Request: ${options.method || 'GET'} ${url}`);

    const response = await fetch(url, {
      ...options,
      headers,
    });

    console.log(`API Response: ${response.status} for ${endpoint}`);

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`API Error: ${response.status} - ${errorText}`);
      return {
        error: errorText || `HTTP Error: ${response.status}`,
        status: response.status,
      };
    }

    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      const data = await response.json();
      console.log(`API Success data for ${endpoint}:`, data);
      return { data, status: response.status };
    }

    return { data: undefined, status: response.status };
  } catch (error) {
    console.error(`API Network Error for ${endpoint}:`, error);
    return {
      error: error instanceof Error ? error.message : 'Network error',
      status: 0,
    };
  }
}

// Auth API
export const authApi = {
  login: (credentials: LoginDto) =>
    apiFetch<LoginResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    }),

  createAdmin: (data: RegisterDto) =>
    apiFetch('/auth/create-admin', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
};

// Student Auth API
export const studentAuthApi = {
  register: (data: RegisterDto) =>
    apiFetch<LoginResponse>('/student/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  login: (credentials: LoginDto) =>
    apiFetch<LoginResponse>('/student/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    }),
};

// Admin Applications API
export const applicationsApi = {
  getAll: () => apiFetch<ApplicationDetails[]>('/admin/applications'),

  getDetails: (applicationId: number) =>
    apiFetch<ApplicationDetails>(`/admin/applications/${applicationId}/details`),

  accept: (applicationId: number) =>
    apiFetch(`/admin/applications/${applicationId}/accept`, { method: 'POST' }),

  reject: (applicationId: number) =>
    apiFetch(`/admin/applications/${applicationId}/reject`, { method: 'POST' }),

  setFees: (applicationId: number, fees: FeesDto) =>
    apiFetch(`/admin/applications/${applicationId}/fees`, {
      method: 'POST',
      body: JSON.stringify(fees),
    }),

  sendNotification: (applicationId: number, notification: NotificationDto) =>
    apiFetch(`/admin/applications/${applicationId}/notifications`, {
      method: 'POST',
      body: JSON.stringify(notification),
    }),
};

// Student Applications API
export const studentApplicationsApi = {
  submit: (application: FullFormDto | any) => {
    // Default template to fill empty fields
    const defaults = {
      studentType: 0,
      studentInfo: {
        studentId: 0,
        nationalId: "string",
        fullName: "string",
        studentType: 0,
        birthDate: "2026-01-20T21:25:06.669Z",
        birthPlace: "string",
        gender: "string",
        religion: "string",
        governorate: "string",
        city: "string",
        address: "string",
        email: "string",
        phone: "string",
        faculty: "string",
        department: "string",
        level: "string",
        fatherContactId: 0,
        guardianContactId: 0,
        userId: 0,
      },
      fatherInfo: {
        contactId: 0,
        fullName: "string",
        nationalId: "string",
        relation: "string",
        job: "string",
        phoneNumber: "string",
        address: "string",
      },
      selectedGuardianRelation: "string",
      otherGuardianInfo: {
        contactId: 0,
        fullName: "string",
        nationalId: "string",
        relation: "string",
        job: "string",
        phoneNumber: "string",
        address: "string",
      },
      secondaryInfo: {
        studentId: 0,
        secondaryStream: "string",
        totalScore: 0,
        percentage: 0,
        grade: "string",
      },
      academicInfo: {
        studentId: 0,
        currentGPA: 0,
        lastYearGrade: "string",
      },
    } as any;

    // Helper to merge defaults into target for empty values
    const mergeDefaults = (target: any, def: any) => {
      if (target == null) return JSON.parse(JSON.stringify(def));
      // Only merge objects
      if (typeof def !== 'object' || Array.isArray(def)) return target === undefined || target === null ? def : target;

      const out: any = Array.isArray(def) ? [] : { ...target };
      for (const key of Object.keys(def)) {
        const tVal = target ? target[key] : undefined;
        const dVal = def[key];

        if (dVal && typeof dVal === 'object' && !Array.isArray(dVal)) {
          out[key] = mergeDefaults(tVal, dVal);
        } else {
          // If tVal is undefined, null, or empty string, use default
          if (tVal === undefined || tVal === null || (typeof tVal === 'string' && tVal.trim() === '')) {
            out[key] = dVal;
          } else {
            out[key] = tVal;
          }
        }
      }

      // Preserve any extra properties present in target but not in defaults
      if (target && typeof target === 'object') {
        for (const key of Object.keys(target)) {
          if (out[key] === undefined) out[key] = target[key];
        }
      }

      return out;
    };

    const body = mergeDefaults(application ?? {}, defaults);

    return apiFetch('/student/applications/submit', {
      method: 'POST',
      body: JSON.stringify(body),
    });
  },

  getMyApplications: () =>
    apiFetch<ApplicationDetails[]>('/student/applications/my-applications'),
};

// Admin Complaints API
export const complaintsApi = {
  getUnresolved: () => apiFetch<Complaint[]>('/admin/complaints/unresolved'),

  resolve: (complaintId: number, data: ResolveComplaintDto) =>
    apiFetch(`/admin/complaints/resolve/${complaintId}`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),
};

// Student Complaints API
export const studentComplaintsApi = {
  submit: (complaint: SubmitComplaintDto) =>
    apiFetch('/student/complaints/submit', {
      method: 'POST',
      body: JSON.stringify(complaint),
    }),
};

// Admin Payments API
export const paymentsApi = {
  getPending: () => apiFetch<Payment[]>('/admin/payments/pending'),

  approve: (feePaymentId: number) =>
    apiFetch(`/admin/payments/approve/${feePaymentId}`, { method: 'POST' }),

  reject: (feePaymentId: number) =>
    apiFetch(`/admin/payments/reject/${feePaymentId}`, { method: 'POST' }),
};

// Student Payments API
export const studentPaymentsApi = {
  pay: (feeId: number, payment: FeePaymentDto) =>
    apiFetch(`/student/payments/pay/${feeId}`, {
      method: 'POST',
      body: JSON.stringify(payment),
    }),
};

// Admin Housing Fees API
export const housingFeesApi = {
  getAll: () => apiFetch<FeesDto[]>('/admin/housing-fees'),

  getByStudent: (studentId: number) =>
    apiFetch<FeesDto>(`/admin/housing-fees/student/${studentId}`),

  setGlobal: (amount: number, notes?: string) =>
    apiFetch(`/admin/housing-fees/set-global?amount=${amount}${notes ? `&notes=${encodeURIComponent(notes)}` : ''}`, {
      method: 'POST',
    }),

  update: (id: number, amount: number) =>
    apiFetch(`/admin/housing-fees/${id}`, {
      method: 'PUT',
      body: JSON.stringify(amount),
    }),

  delete: (id: number) =>
    apiFetch(`/admin/housing-fees/${id}`, { method: 'DELETE' }),

  markPaid: (id: number) =>
    apiFetch(`/admin/housing-fees/${id}/mark-paid`, { method: 'PUT' }),
};

// Base Housing Fees API
export const baseHousingFeesApi = {
  setGlobal: (amount: number, notes?: string) =>
    apiFetch(`/admin/base-housing-fees/set-global?amount=${amount}${notes ? `&notes=${encodeURIComponent(notes)}` : ''}`, {
      method: 'POST',
    }),

  updateGlobal: (newAmount: number) =>
    apiFetch(`/admin/base-housing-fees/update-global?newAmount=${newAmount}`, {
      method: 'PUT',
    }),

  getAll: () => apiFetch<any[]>('/admin/base-housing-fees'),

  delete: (id: number) =>
    apiFetch(`/admin/base-housing-fees/${id}`, { method: 'DELETE' }),
};

// Buildings API
export const buildingsApi = {
  getAll: () => apiFetch<BuildingDto[]>('/Building'),

  get: (id: number) => apiFetch<BuildingDto>(`/Building/${id}`),

  create: (data: Omit<BuildingDto, 'buildingId'>) =>
    apiFetch<BuildingDto>('/Building', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  update: (id: number, data: Omit<BuildingDto, 'buildingId'>) =>
    apiFetch<BuildingDto>(`/Building/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  delete: (id: number) =>
    apiFetch(`/Building/${id}`, { method: 'DELETE' }),
};

// Rooms API
export const roomsApi = {
  getAll: () => apiFetch<RoomDto[]>('/Room'),

  get: (id: number) => apiFetch<RoomDto>(`/Room/${id}`),

  create: (data: Omit<RoomDto, 'roomId'>) =>
    apiFetch<RoomDto>('/Room', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  update: (id: number, data: Omit<RoomDto, 'roomId'>) =>
    apiFetch<RoomDto>(`/Room/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  delete: (id: number) =>
    apiFetch(`/Room/${id}`, { method: 'DELETE' }),
};

// Room Assignments API
export const roomAssignmentsApi = {
  assign: (studentId: number, roomId: number) =>
    apiFetch(`/RoomAssignment/assign?studentId=${studentId}&roomId=${roomId}`, {
      method: 'POST',
    }),

  remove: (assignmentId: number) =>
    apiFetch(`/RoomAssignment/${assignmentId}`, { method: 'DELETE' }),
};

// Admin Notifications API
export const notificationsApi = {
  sendToAll: (notification: Omit<NotificationDto, 'notificationId' | 'createdAt' | 'isRead' | 'studentId' | 'userId' | 'applicationId'>) =>
    apiFetch('/admin/notifications/send-to-all', {
      method: 'POST',
      body: JSON.stringify(notification),
    }),
};

// Application Status API
export const applicationStatusApi = {
  getAll: () => apiFetch<ApplicationStatusDto[]>('/admin/application-statuses'),

  get: (id: number) => apiFetch<ApplicationStatusDto>(`/admin/application-statuses/${id}`),

  create: (data: Omit<ApplicationStatusDto, 'statusId'>) =>
    apiFetch<ApplicationStatusDto>('/admin/application-statuses', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  update: (id: number, data: Omit<ApplicationStatusDto, 'statusId'>) =>
    apiFetch<ApplicationStatusDto>(`/admin/application-statuses/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  delete: (id: number) =>
    apiFetch(`/admin/application-statuses/${id}`, { method: 'DELETE' }),
};

// Application Window API
export const applicationWindowApi = {
  getAll: () => apiFetch<ApplicationWindowDto[]>('/admin/application-windows'),

  get: (id: number) => apiFetch<ApplicationWindowDto>(`/admin/application-windows/${id}`),

  getActive: () => apiFetch<ApplicationWindowDto>('/admin/application-windows/active'),

  create: (data: Omit<ApplicationWindowDto, 'windowId' | 'createdAt'>) =>
    apiFetch<ApplicationWindowDto>('/admin/application-windows', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  update: (id: number, data: Omit<ApplicationWindowDto, 'windowId' | 'createdAt'>) =>
    apiFetch<ApplicationWindowDto>(`/admin/application-windows/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  delete: (id: number) =>
    apiFetch(`/admin/application-windows/${id}`, { method: 'DELETE' }),
};

// Students API
export const studentsApi = {
  getAll: () => apiFetch<StudentDto[]>('/Student'),

  get: (id: number) => apiFetch<StudentDto>(`/Student/${id}`),

  create: (data: Omit<StudentDto, 'studentId'>) =>
    apiFetch<StudentDto>('/Student', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  update: (id: number, data: Omit<StudentDto, 'studentId'>) =>
    apiFetch<StudentDto>(`/Student/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  selfUpdate: (data: Partial<StudentDto>) =>
    apiFetch<StudentDto>('/Student/self-update', {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  delete: (id: number) =>
    apiFetch(`/Student/${id}`, { method: 'DELETE' }),
};

// Student Profile API
export const studentProfileApi = {
  getNotifications: () => apiFetch<NotificationDto[]>('/student/profile/notifications'),

  markNotificationRead: (id: number) =>
    apiFetch(`/student/profile/notifications/${id}/read`, { method: 'PUT' }),

  getFees: () => apiFetch<FeesDto[]>('/student/profile/fees'),

  getAssignments: () => apiFetch<RoomAssignment[]>('/student/profile/assignments'),

  getDetails: () => apiFetch<StudentDto>('/student/profile/details'),
};

// Family Contact API
export const familyContactApi = {
  getAll: () => apiFetch<FamilyContactDto[]>('/FamilyContact'),

  get: (id: number) => apiFetch<FamilyContactDto>(`/FamilyContact/${id}`),

  create: (data: Omit<FamilyContactDto, 'contactId'>) =>
    apiFetch<FamilyContactDto>('/FamilyContact', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  update: (id: number, data: Omit<FamilyContactDto, 'contactId'>) =>
    apiFetch<FamilyContactDto>(`/FamilyContact/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  delete: (id: number) =>
    apiFetch(`/FamilyContact/${id}`, { method: 'DELETE' }),
};

// Secondary Education API
export const secondaryEducationApi = {
  getAll: () => apiFetch<SecondaryEducationDto[]>('/SecondaryEducation'),

  getByStudent: (studentId: number) =>
    apiFetch<SecondaryEducationDto>(`/SecondaryEducation/${studentId}`),

  create: (data: SecondaryEducationDto) =>
    apiFetch<SecondaryEducationDto>('/SecondaryEducation', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  update: (studentId: number, data: SecondaryEducationDto) =>
    apiFetch<SecondaryEducationDto>(`/SecondaryEducation/${studentId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  delete: (studentId: number) =>
    apiFetch(`/SecondaryEducation/${studentId}`, { method: 'DELETE' }),
};

// Academic Education API
export const academicEducationApi = {
  getAll: () => apiFetch<AcademicEducationDto[]>('/AcademicEducation'),

  getByStudent: (studentId: number) =>
    apiFetch<AcademicEducationDto>(`/AcademicEducation/${studentId}`),

  create: (data: AcademicEducationDto) =>
    apiFetch<AcademicEducationDto>('/AcademicEducation', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  update: (studentId: number, data: AcademicEducationDto) =>
    apiFetch<AcademicEducationDto>(`/AcademicEducation/${studentId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
};

// Fees API (General)
export const feesApi = {
  getAll: () => apiFetch<FeesDto[]>('/Fees'),

  get: (id: number) => apiFetch<FeesDto>(`/Fees/${id}`),

  create: (data: Omit<FeesDto, 'feeId' | 'createdAt'>) =>
    apiFetch<FeesDto>('/Fees', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  update: (id: number, data: Omit<FeesDto, 'feeId' | 'createdAt'>) =>
    apiFetch<FeesDto>(`/Fees/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  delete: (id: number) =>
    apiFetch(`/Fees/${id}`, { method: 'DELETE' }),
};

// Reports API
export const reportsApi = {
  getSummary: () => apiFetch<DashboardSummary>('/Reports/summary'),
};

// Users API
export const usersApi = {
  delete: (id: number) =>
    apiFetch(`/users/${id}`, { method: 'DELETE' }),
};


export default {
  auth: authApi,
  studentAuth: studentAuthApi,
  applications: applicationsApi,
  studentApplications: studentApplicationsApi,
  complaints: complaintsApi,
  studentComplaints: studentComplaintsApi,
  payments: paymentsApi,
  studentPayments: studentPaymentsApi,
  housingFees: housingFeesApi,
  baseHousingFees: baseHousingFeesApi,
  buildings: buildingsApi,
  rooms: roomsApi,
  roomAssignments: roomAssignmentsApi,
  notifications: notificationsApi,
  applicationStatus: applicationStatusApi,
  applicationWindow: applicationWindowApi,
  students: studentsApi,
  studentProfile: studentProfileApi,
  familyContact: familyContactApi,
  secondaryEducation: secondaryEducationApi,
  academicEducation: academicEducationApi,
  fees: feesApi,
  reports: reportsApi,
  users: usersApi,
};

