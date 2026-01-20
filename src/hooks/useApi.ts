// Custom React Query hooks for API calls
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
    applicationsApi,
    buildingsApi,
    roomsApi,
    studentsApi,
    complaintsApi,
    paymentsApi,
    housingFeesApi,
    baseHousingFeesApi,
    notificationsApi,
    studentApplicationsApi,
    studentComplaintsApi,
    studentProfileApi,
    reportsApi,
    applicationWindowApi,
    roomAssignmentsApi,
} from '@/lib/api';
import type {
    BuildingDto,
    RoomDto,
    StudentDto,
    ApplicationDetails,
    Complaint,
    Payment,
    FeesDto,
    NotificationDto,
    FullFormDto,
    SubmitComplaintDto,
    DashboardSummary,
    ApplicationWindowDto,
    ReportsSummary,
} from '@/lib/types';

// Query keys for cache management
export const queryKeys = {
    applications: ['applications'],
    applicationDetails: (id: number) => ['applications', id],
    buildings: ['buildings'],
    building: (id: number) => ['buildings', id],
    rooms: ['rooms'],
    room: (id: number) => ['rooms', id],
    students: ['students'],
    student: (id: number) => ['students', id],
    complaints: ['complaints'],
    payments: ['payments'],
    housingFees: ['housingFees'],
    reports: ['reports', 'summary'],
    reportsSummary: ['reports', 'summary'],
    studentApplications: ['student', 'applications'],
    studentProfile: ['student', 'profile'],
    studentNotifications: ['student', 'notifications'],
    studentFees: ['student', 'fees'],
    studentAssignments: ['student', 'assignments'],
    applicationWindows: ['applicationWindows'],
};

// ============ Admin Hooks ============

// Applications
export const useApplications = () => {
    return useQuery({
        queryKey: queryKeys.applications,
        queryFn: async () => {
            const response = await applicationsApi.getAll();
            if (response.error) throw new Error(response.error);
            return response.data || [];
        },
    });
};

export const useApplicationDetails = (applicationId: number) => {
    return useQuery({
        queryKey: queryKeys.applicationDetails(applicationId),
        queryFn: async () => {
            const response = await applicationsApi.getDetails(applicationId);
            if (response.error) throw new Error(response.error);
            return response.data;
        },
        enabled: !!applicationId,
    });
};

export const useAcceptApplication = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (applicationId: number) => applicationsApi.accept(applicationId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.applications });
        },
    });
};

export const useRejectApplication = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (applicationId: number) => applicationsApi.reject(applicationId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.applications });
        },
    });
};

// Buildings
export const useBuildings = () => {
    return useQuery({
        queryKey: queryKeys.buildings,
        queryFn: async () => {
            const response = await buildingsApi.getAll();
            if (response.error) throw new Error(response.error);
            const payload: any = response.data;
            if (Array.isArray(payload)) return payload as BuildingDto[];
            if (payload && typeof payload === 'object' && 'data' in payload) {
                const inner = (payload as any).data;
                return Array.isArray(inner) ? (inner as BuildingDto[]) : [];
            }
            return [];
        },
    });
};

export const useBuilding = (id: number) => {
    return useQuery({
        queryKey: queryKeys.building(id),
        queryFn: async () => {
            const response = await buildingsApi.get(id);
            if (response.error) throw new Error(response.error);
            const payload: any = response.data;
            if (payload && typeof payload === 'object' && 'data' in payload) {
                return (payload as any).data as BuildingDto;
            }
            return payload as BuildingDto;
        },
        enabled: !!id,
    });
};

export const useCreateBuilding = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: Omit<BuildingDto, 'buildingId'>) => buildingsApi.create(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.buildings });
        },
    });
};

export const useUpdateBuilding = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, data }: { id: number; data: Omit<BuildingDto, 'buildingId'> }) =>
            buildingsApi.update(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.buildings });
        },
    });
};

export const useDeleteBuilding = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: number) => buildingsApi.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.buildings });
        },
    });
};

// Rooms
export const useRooms = () => {
    return useQuery({
        queryKey: queryKeys.rooms,
        queryFn: async () => {
            const response = await roomsApi.getAll();
            if (response.error) throw new Error(response.error);
            return response.data || [];
        },
    });
};

export const useRoom = (id: number) => {
    return useQuery({
        queryKey: queryKeys.room(id),
        queryFn: async () => {
            const response = await roomsApi.get(id);
            if (response.error) throw new Error(response.error);
            return response.data;
        },
        enabled: !!id,
    });
};

export const useCreateRoom = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: Omit<RoomDto, 'roomId'>) => roomsApi.create(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.rooms });
        },
    });
};

export const useUpdateRoom = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, data }: { id: number; data: Omit<RoomDto, 'roomId'> }) =>
            roomsApi.update(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.rooms });
        },
    });
};

export const useDeleteRoom = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: number) => roomsApi.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.rooms });
        },
    });
};

// Room Assignments
export const useAssignRoom = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ studentId, roomId }: { studentId: number; roomId: number }) =>
            roomAssignmentsApi.assign(studentId, roomId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.rooms });
            queryClient.invalidateQueries({ queryKey: queryKeys.students });
        },
    });
};

// Students
export const useStudents = () => {
    return useQuery({
        queryKey: queryKeys.students,
        queryFn: async () => {
            const response = await studentsApi.getAll();
            if (response.error) throw new Error(response.error);
            return response.data || [];
        },
    });
};

export const useStudent = (id: number) => {
    return useQuery({
        queryKey: queryKeys.student(id),
        queryFn: async () => {
            const response = await studentsApi.get(id);
            if (response.error) throw new Error(response.error);
            return response.data;
        },
        enabled: !!id,
    });
};

// Complaints
export const useComplaints = () => {
    return useQuery({
        queryKey: queryKeys.complaints,
        queryFn: async () => {
            const response = await complaintsApi.getUnresolved();
            if (response.error) throw new Error(response.error);
            return response.data || [];
        },
    });
};

export const useResolveComplaint = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ complaintId, resolutionMessage }: { complaintId: number; resolutionMessage: string }) =>
            complaintsApi.resolve(complaintId, { resolutionMessage }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.complaints });
        },
    });
};

// Payments
export const usePayments = () => {
    return useQuery({
        queryKey: queryKeys.payments,
        queryFn: async () => {
            const response = await paymentsApi.getPending();
            if (response.error) throw new Error(response.error);
            return response.data || [];
        },
    });
};

export const useApprovePayment = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (feePaymentId: number) => paymentsApi.approve(feePaymentId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.payments });
        },
    });
};

export const useRejectPayment = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (feePaymentId: number) => paymentsApi.reject(feePaymentId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.payments });
        },
    });
};

// Housing Fees
export const useHousingFees = () => {
    return useQuery({
        queryKey: queryKeys.housingFees,
        queryFn: async () => {
            const response = await housingFeesApi.getAll();
            if (response.error) throw new Error(response.error);
            return response.data || [];
        },
    });
};

// Notifications
export const useSendNotificationToAll = () => {
    return useMutation({
        mutationFn: (notification: { title: string | null; message: string | null }) =>
            notificationsApi.sendToAll(notification),
    });
};

// Reports/Dashboard
export const useDashboardSummary = () => {
    return useQuery({
        queryKey: queryKeys.reports,
        queryFn: async () => {
            const response = await reportsApi.getSummary();
            if (response.error) throw new Error(response.error);
            return response.data;
        },
    });
};

// Application Windows
export const useApplicationWindows = () => {
    return useQuery({
        queryKey: queryKeys.applicationWindows,
        queryFn: async () => {
            const response = await applicationWindowApi.getAll();
            if (response.error) throw new Error(response.error);
            return response.data || [];
        },
    });
};

export const useActiveApplicationWindow = () => {
    return useQuery({
        queryKey: [...queryKeys.applicationWindows, 'active'],
        queryFn: async () => {
            const response = await applicationWindowApi.getActive();
            if (response.error) throw new Error(response.error);
            return response.data;
        },
    });
};

// ============ Student Hooks ============

// Student Applications
export const useStudentApplications = () => {
    return useQuery({
        queryKey: queryKeys.studentApplications,
        queryFn: async () => {
            const response = await studentApplicationsApi.getMyApplications();
            if (response.error) throw new Error(response.error);
            return response.data || [];
        },
    });
};

export const useSubmitApplication = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (application: FullFormDto) => studentApplicationsApi.submit(application),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.studentApplications });
        },
    });
};

// Student Complaints
export const useSubmitComplaint = () => {
    return useMutation({
        mutationFn: (complaint: SubmitComplaintDto) => studentComplaintsApi.submit(complaint),
    });
};

// Student Profile
export const useStudentProfile = () => {
    return useQuery({
        queryKey: queryKeys.studentProfile,
        queryFn: async () => {
            const response = await studentProfileApi.getDetails();
            if (response.error) throw new Error(response.error);
            return response.data;
        },
    });
};

export const useStudentNotifications = () => {
    return useQuery({
        queryKey: queryKeys.studentNotifications,
        queryFn: async () => {
            const response = await studentProfileApi.getNotifications();
            if (response.error) throw new Error(response.error);
            return response.data || [];
        },
    });
};

export const useMarkNotificationRead = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: number) => studentProfileApi.markNotificationRead(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.studentNotifications });
        },
    });
};

export const useStudentFees = () => {
    return useQuery({
        queryKey: queryKeys.studentFees,
        queryFn: async () => {
            const response = await studentProfileApi.getFees();
            if (response.error) throw new Error(response.error);
            return response.data || [];
        },
    });
};

export const useStudentAssignments = () => {
    return useQuery({
        queryKey: queryKeys.studentAssignments,
        queryFn: async () => {
            const response = await studentProfileApi.getAssignments();
            if (response.error) throw new Error(response.error);
            return response.data || [];
        },
    });
};

// Reports Summary
export const useReportsSummary = () => {
    return useQuery({
        queryKey: queryKeys.reportsSummary,
        queryFn: async (): Promise<ReportsSummary> => {
            const response = await reportsApi.getSummary();
            if (response.error) throw new Error(response.error);
            return response.data as ReportsSummary;
        },
    });
};

// Base Housing Fees
export const useBaseHousingFees = () => {
    return useQuery({
        queryKey: ['baseHousingFees'],
        queryFn: async () => {
            const response = await baseHousingFeesApi.getAll();
            if (response.error) throw new Error(response.error);
            return response.data || [];
        },
    });
};

export const useSetGlobalFee = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ amount, notes }: { amount: number; notes?: string }) =>
            baseHousingFeesApi.setGlobal(amount, notes),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['baseHousingFees'] });
        },
    });
};

export const useUpdateGlobalFee = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (newAmount: number) => baseHousingFeesApi.updateGlobal(newAmount),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['baseHousingFees'] });
        },
    });
};

export const useDeleteBaseHousingFee = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: number) => baseHousingFeesApi.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['baseHousingFees'] });
        },
    });
};
