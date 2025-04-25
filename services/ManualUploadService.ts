import { PlatformService, Course, Assignment, Submission } from "./common";
import { host } from "../src/config";

export class ManualUploadService implements PlatformService {
  async getCourses(
    email?: string,
    page: number = 1,
    perPage: number = 10
  ): Promise<{
    courses: Course[];
    page: number;
    per_page: number;
    total_courses: number;
  }> {
    const response = await fetch(
      `${host}/manual/courses?teacher_email=${email}&page=${page}&per_page=${perPage}`
    );
    return response.json();
  }

  async getAssignments(
    courseId: string,
    email?: string
  ): Promise<{ assignments: Assignment[] }> {
    const response = await fetch(
      `${host}/manual/assignments/${courseId}?teacher_email=${email}`
    );
    return response.json();
  }

  async getSubmissions(
    courseId: string,
    assignmentId: string,
    email?: string
  ): Promise<{ assignment_name: string; submissions: Submission[] }> {
    const response = await fetch(
      `${host}/manual/submissions/${courseId}/${assignmentId}?teacher_email=${email}`
    );
    return response.json();
  }

  async gradeSubmission({
    email,
    courseId,
    assignmentId,
    submissionIds,
    rubric,
  }: {
    email?: string;
    courseId: string;
    assignmentId: string;
    submissionIds: string[];
    rubric: string;
  }): Promise<{ task_id: string }> {
    const response = await fetch(
      `${host}/manual/grade_submission?email=${email}&assignment_id=${assignmentId}&course_id=${courseId}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ submission_ids: submissionIds, rubric }),
      }
    );
    return response.json();
  }

  async getTaskStatus(taskId: string): Promise<{ status: string }> {
    const response = await fetch(`${host}/classroom/task_status/${taskId}`);
    return response.json();
  }

  // Function to fetch submission statuses
  async fetchSubmissionStatuses(submissionIds: number[]) {
    try {
      const response = await fetch(`${host}/submissions/status`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ submission_ids: submissionIds }),
      });

      if (!response.ok) {
        throw new Error("Failed to fetch submission statuses");
      }

      const data = await response.json();
      const submissionsList = data.submissions;
      return submissionsList;
    } catch (error) {
      console.error("Error fetching submission statuses:", error);
    }
  }

  async getGradedSubmission(submissionId: string): Promise<{
    latest_graded_submission: {
      points_received: number;
      points_possible: number;
      rubric_breakdown: string;
      explanation: string;
      graded_at: string;
    };
  }> {
    const response = await fetch(
      `${host}/classroom/graded_submissions?submission_id=${submissionId}`
    );
    return response.json();
  }

  async getSubmissionLink(
    submissionId: string
  ): Promise<{ submission_link: string }> {
    const response = await fetch(
      `${host}/manual/submission_link/${submissionId}`
    );
    if (!response.ok) {
      throw new Error(
        `Failed to fetch submission link: ${response.statusText}`
      );
    }
    return response.json();
  }
}
