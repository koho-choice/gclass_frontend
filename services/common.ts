// Common interfaces that match your existing component structures
export interface Course {
  id: string | number; // Support both platforms' ID types
  name: string;
  section: string;
  room?: string;
}

export interface Assignment {
  id: string;
  title: string;
  due_date: string;
  max_points: number;
}

export interface Submission {
  student_name: string;
  student_email: string;
  submission_id: string;
  submission_title: string;
  submission_link: string;
  submission_date: string;
  submission_status: string;
  submission_score: string | number;
  grading_status?: "pending" | "in_progress" | "completed";
  task_id?: string;
}

// Service interface that matches your current API calls
export interface PlatformService {
  getCourses: (
    email?: string,
    page?: number,
    perPage?: number
  ) => Promise<{
    courses: Course[];
    page: number;
    per_page: number;
    total_courses: number;
  }>;
  getAssignments: (
    courseId: string,
    email?: string
  ) => Promise<{ assignments: Assignment[] }>;
  getSubmissions: (
    courseId: string,
    assignmentId: string,
    email?: string
  ) => Promise<{
    assignment_name: string;
    submissions: Submission[];
  }>;
  gradeSubmission: (params: {
    email?: string;
    courseId: string;
    assignmentId: string;
    submissionIds: string[];
    rubric: string;
  }) => Promise<{ task_id: string }>;
  getTaskStatus: (taskId: string) => Promise<{ status: string }>;
  getGradedSubmission: (submissionId: string) => Promise<{
    latest_graded_submission: {
      points_received: number;
      points_possible: number;
      rubric_breakdown: string;
      explanation: string;
      graded_at: string;
    };
  }>;
  fetchSubmissionStatuses: (submissionIds: number[]) => Promise<
    {
      status: string;
      submission_id: number;
    }[]
  >;
}
