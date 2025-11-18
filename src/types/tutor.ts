// Tutor Dashboard Types
export interface TutorDashboardStats {
  assignedStudents: {
    total: number;
    active: number;
  };
  plans: {
    pending: number;
    approved: number;
    total: number;
  };
  hours: {
    pendingApproval: number;
    approvedThisWeek: number;
  };
  evaluations: {
    pending: number;
    completed: number;
  };
  evidences: {
    pendingReview: number;
  };
}

// Assigned Student
export interface AssignedStudent {
  id: number;
  student: {
    id: number;
    name: string;
    email: string;
    studentCode: string;
  };
  tutor: {
    id: number;
    name: string;
    email: string;
  };
  period: {
    id: number;
    name: string;
  };
  assignedAt: string;
  active: boolean;
  company: string | null;
  planStatus: 'DRAFT' | 'IN_REVIEW' | 'APPROVED' | 'REJECTED' | null;
  pendingHours: number;
  totalApprovedHours: number;
}

// Student Detail for Tutor View
export interface StudentDetailData {
  student: {
    id: number;
    name: string;
    code: string;
    email: string;
  };
  assignment: {
    id: number;
    company: string;
    period: string;
    assignedAt: string;
  };
  plan: {
    id: number;
    company: string;
    objectives: string;
    activities: string;
    startDate: string;
    endDate: string;
    status: string;
  } | null;
  stats: {
    totalHours: number;
    approvedHours: number;
    pendingHours: number;
    rejectedHours: number;
    evidencesCount: number;
    evaluationsCount: number;
  };
}

// Time Entry for Tutor Review
export interface TimeEntryForReview {
  id: number;
  studentName: string;
  entryDate: string;
  startTime: string;
  endTime: string;
  hours: number;
  activity: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  createdAt: string;
}

// Evidence for Tutor Review
export interface EvidenceForReview {
  id: number;
  studentName: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  uploadedAt: string;
  description: string;
}

// Plan for Tutor Review
export interface PlanForReview {
  id: number;
  studentId: number;
  studentName: string;
  studentCode: string;
  company: string;
  objectives: string;
  activities: string;
  startDate: string;
  endDate: string;
  status: 'DRAFT' | 'IN_REVIEW' | 'APPROVED' | 'REJECTED';
  submittedAt: string;
}

// Evaluation Form
export interface EvaluationFormData {
  assignmentId: number;
  punctuality: number;
  workQuality: number;
  technicalKnowledge: number;
  initiative: number;
  comments: string;
}

export interface Evaluation {
  id: number;
  assignmentId: number;
  studentName: string;
  punctuality: number;
  workQuality: number;
  technicalKnowledge: number;
  initiative: number;
  average: number;
  comments: string;
  evaluatedAt: string;
}

// Recent Activity
export interface RecentActivity {
  studentId: number;
  studentName: string;
  activityType: 'EVIDENCE' | 'TIME_ENTRY' | 'PLAN';
  activityDescription: string;
  timestamp: string;
}
