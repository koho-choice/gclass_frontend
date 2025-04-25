import { PlatformService } from "./common";
import { host } from "../src/config";

export class CanvasService implements PlatformService {
  async getCourses(email?: string, page: number = 1, perPage: number = 10) {
    const response = await fetch(
      `${host}/canvas/courses?email=${email}&page=${page}&per_page=${perPage}`
    );
    return response.json();
  }

  async getAssignments(courseId: string) {
    const response = await fetch(`${host}/canvas/assignments/${courseId}`);
    return response.json();
  }

  async getSubmissions(courseId: string, assignmentId: string) {
    const response = await fetch(
      `${host}/canvas/submissions/${courseId}/${assignmentId}`
    );
    return response.json();
  }

  async gradeSubmission({
    email,
    courseId,
    assignmentId,
    submissionIds,
    rubric,
  }) {
    const response = await fetch(
      `${host}/canvas/grade_submission?email=${email}&assignment_id=${assignmentId}&course_id=${courseId}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ submission_ids: submissionIds, rubric }),
      }
    );
    return response.json();
  }

  async getTaskStatus(taskId: string) {
    const response = await fetch(`${host}/classroom/task_status/${taskId}`);
    return response.json();
  }

  async getGradedSubmission(submissionId: string) {
    const response = await fetch(
      `${host}/classroom/graded_submissions?submission_id=${submissionId}`
    );
    return response.json();
  }
}
