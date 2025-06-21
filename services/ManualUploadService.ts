import { PlatformService, Course, Assignment, Submission } from "./common";
import { host } from "../src/config";

export class ManualUploadService implements PlatformService {
  async getCourses(
    token: string,
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
      `${host}/manual/courses?teacher_email=${email}&page=${page}&per_page=${perPage}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Error fetching courses: ${response.statusText}`);
    }

    return response.json();
  }

  async getAssignments(
    token: string,
    courseId: string,
    email?: string
  ): Promise<{ assignments: Assignment[] }> {
    const response = await fetch(
      `${host}/manual/assignments/${courseId}?teacher_email=${email}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.json();
  }

  async getSubmissions(
    token: string,
    courseId: string,
    assignmentId: string,
    email?: string
  ): Promise<{ assignment_name: string; submissions: Submission[] }> {
    const response = await fetch(
      `${host}/manual/submissions/${courseId}/${assignmentId}?teacher_email=${email}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.json();
  }

  async gradeSubmission({
    token,
    email,
    courseId,
    assignmentId,
    submissionIds,
    rubric,
  }: {
    token: string;
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
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ submission_ids: submissionIds, rubric }),
      }
    );
    return response.json();
  }

  async getTaskStatus(
    token: string,
    taskId: string
  ): Promise<{ status: string }> {
    const response = await fetch(`${host}/classroom/task_status/${taskId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.json();
  }

  // Function to fetch submission statuses
  async fetchSubmissionStatuses(token: string, submissionIds: number[]) {
    try {
      const response = await fetch(`${host}/submissions/status`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
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

  async getGradedSubmission(
    token: string,
    submissionId: string
  ): Promise<{
    latest_graded_submission: {
      points_received: number;
      points_possible: number;
      rubric_breakdown: string;
      explanation: string;
      graded_at: string;
    };
  }> {
    const response = await fetch(
      `${host}/classroom/graded_submissions?submission_id=${submissionId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.json();
  }

  async getSubmissionLink(
    token: string,
    submissionId: string
  ): Promise<{ submission_link: string }> {
    const response = await fetch(
      `${host}/manual/submission_link/${submissionId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    if (!response.ok) {
      throw new Error(
        `Failed to fetch submission link: ${response.statusText}`
      );
    }
    return response.json();
  }

  async deleteCourse(
    token: string,
    courseId: string,
    email?: string
  ): Promise<{ message: string }> {
    const response = await fetch(
      `${host}/manual/courses/${courseId}?teacher_email=${email}`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    if (!response.ok) {
      throw new Error(`Failed to delete course: ${response.statusText}`);
    }
    return response.json();
  }

  async deleteAssignment(
    token: string,
    assignmentId: string,
    email?: string
  ): Promise<{ message: string }> {
    const response = await fetch(
      `${host}/manual/assignments/${assignmentId}?teacher_email=${email}`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    if (!response.ok) {
      throw new Error(`Failed to delete assignment: ${response.statusText}`);
    }
    return response.json();
  }
}
