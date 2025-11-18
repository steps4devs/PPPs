// Student Types
export interface Plan {
  id: number;
  company: {
    id: number;
    name: string;
  };
  period: {
    id: number;
    name: string;
  };
  objectives: string;
  activities: string;
  startDate: string;
  endDate: string;
  status: 'DRAFT' | 'IN_REVIEW' | 'APPROVED' | 'REJECTED';
  rejectionReason?: string;
  createdAt: string;
  updatedAt: string;
  submittedAt?: string;
  reviewedAt?: string;
}

export interface CreatePlanRequest {
  companyId: number;
  periodId: number;
  objectives: string;
  activities: string;
  startDate: string;
  endDate: string;
}

export interface TimeEntry {
  id: number;
  entryDate: string;
  startTime: string;
  endTime: string;
  hours: number;
  activity: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  rejectionReason?: string;
  reviewedBy?: {
    id: number;
    name: string;
  };
  reviewedAt?: string;
}

export interface CreateTimeEntryRequest {
  entryDate: string;
  startTime: string;
  endTime: string;
  activity: string;
}

export interface Evidence {
  id: number;
  filename: string;
  originalFilename: string;
  fileType: string;
  fileSize: number;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  uploadedAt: string;
  reviewedBy: {
    id: number;
    name: string;
  } | null;
  reviewedAt: string | null;
  downloadUrl: string;
  plan: {
    id: number;
    companyName: string;
  };
}

export interface UploadEvidenceRequest {
  file: File;
  description: string;
  planId?: number;
}

export interface Evaluation {
  id: number;
  type: 'PARTIAL' | 'FINAL';
  tutor: {
    id: number;
    name: string;
  };
  punctuality: number;
  teamwork: number;
  technicalKnowledge: number;
  initiative: number;
  average: number;
  comments: string;
  evaluatedAt: string;
}

export interface StudentDashboardStats {
  hasAssignedTutor: boolean;
  hours: {
    pending: number;
    total: number;
    approved: number;
    required: number;
    percentage: number;
  };
  evaluations: {
    averageScore: number | null;
    total: number;
  };
  plans: {
    pending: number;
    total: number;
    approved: number;
    status: 'DRAFT' | 'IN_REVIEW' | 'APPROVED' | 'REJECTED' | null;
  };
  evidences: {
    pending: number;
    total: number;
    approved: number;
  };
  notifications: {
    unread: number;
  };
  tutor: {
    name: string;
    email: string;
  } | null;
  period: {
    id: number;
    name: string;
  } | null;
  assignedAt: string | null;
}

export interface StudentAssignment {
  id: number;
  tutor: {
    id: number;
    name: string;
    email: string;
  };
  student: {
    id: number;
    name: string;
    email: string;
    studentCode: string;
  };
  period: {
    id: number;
    name: string;
  };
  assignedAt: string;
  active: boolean;
}
