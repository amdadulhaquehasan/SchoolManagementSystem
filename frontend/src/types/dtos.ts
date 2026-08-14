
export type Role = "Admin" | "Teacher" | "Student";

export type AssignmentStatus = "Draft" | "Published";

export type SubmissionStatus =
  | "Submitted"
  | "Late"
  | "UnderReview"
  | "Graded"
  | "Resubmitted"
  | "Rejected";

// ---------- Auth ----------
export interface LoginDto {
  email: string;
  password: string;
}

export interface AuthResponseDto {
  token: string;
  expiresAtUtc: string;
  userId: string;
  email: string;
  fullName: string;
  role: Role;
}

// ---------- Users (Admin) ----------
export interface UserDto {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: Role;
  isActive: boolean;
  createdAtUtc: string;
}

export interface CreateTeacherDto {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

export interface CreateStudentDto {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  classCourseId?: number | null;
}

// ---------- Classes / Courses ----------
export interface ClassCourseDto {
  id: number;
  name: string;
  description?: string | null;
  subjectCount: number;
  enrolledStudentCount: number;
}

export interface CreateClassCourseDto {
  name: string;
  description?: string | null;
}

export interface EnrollStudentDto {
  studentId: string;
}

// ---------- Subjects ----------
export interface AssignedTeacherDto {
  id: string;
  fullName: string;
}

export interface SubjectDto {
  id: number;
  name: string;
  description?: string | null;
  classCourseId: number;
  classCourseName: string;
  assignedTeachers: AssignedTeacherDto[];
}

export interface CreateSubjectDto {
  name: string;
  description?: string | null;
  classCourseId: number;
}

export interface AssignTeacherDto {
  teacherId: string;
}

// ---------- Assignments ----------
export interface AssignmentDto {
  id: number;
  title: string;
  description?: string | null;
  deadlineUtc: string;
  maxMarks: number;
  status: AssignmentStatus;
  attachmentUrl?: string | null;
  attachmentOriginalFileName?: string | null;
  teacherId: string;
  teacherName: string;
  subjectId: number;
  subjectName: string;
  classCourseId: number;
  classCourseName: string;
  submissionCount: number;
  createdAtUtc: string;
  mySubmissionStatus?: SubmissionStatus | null;
}

export interface CreateAssignmentFormValues {
  Title: string;
  Description?: string;
  DeadlineUtc: string;
  MaxMarks: number;
  SubjectId: number;
  ClassCourseId: number;
  Publish: boolean;
  File?: FileList;
}

export interface UpdateAssignmentFormValues {
  Title: string;
  Description?: string;
  DeadlineUtc: string;
  MaxMarks: number;
  File?: FileList;
  RemoveExistingFile: boolean;
}

export interface ChangeAssignmentStatusDto {
  publish: boolean;
}

// ---------- Submissions ----------
export interface SubmissionDto {
  id: number;
  assignmentId: number;
  assignmentTitle: string;
  studentId: string;
  studentName: string;
  textAnswer?: string | null;
  fileUrl?: string | null;
  originalFileName?: string | null;
  submittedAtUtc: string;
  lastUpdatedAtUtc?: string | null;
  status: SubmissionStatus;
  marksObtained?: number | null;
  maxMarks: number;
  feedback?: string | null;
  gradedAtUtc?: string | null;
}

export interface CreateSubmissionFormValues {
  TextAnswer?: string;
  File?: FileList;
}

export interface UpdateSubmissionFormValues {
  TextAnswer?: string;
  File?: FileList;
  RemoveExistingFile: boolean;
}

export interface GradeSubmissionDto {
  marksObtained: number;
  feedback?: string | null;
}

export interface ChangeSubmissionStatusDto {
  status: SubmissionStatus;
}

// ---------- Errors ----------
export interface ApiErrorBody {
  status: number;
  title: string;
  message: string;
  traceId?: string;
  errors?: Record<string, string[]>;
}
