import { PlatformService } from "./common";
import { host } from "../src/config";

export class ClassroomService implements PlatformService {
  async getCourses(email?: string) {
    const response = await fetch(`${host}/classroom/courses?email=${email}`);
    return response.json();
  }

  async getAssignments(courseId: string, email?: string) {
    const response = await fetch(
      `${host}/classroom/assignments?email=${email}&course_id=${courseId}`
    );
    return response.json();
  }

  async getSubmissions(courseId: string, assignmentId: string, email?: string) {
    const response = await fetch(
      `${host}/classroom/submissions?email=${email}&course_id=${courseId}&assignment_id=${assignmentId}`
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
      `${host}/classroom/grade_submission?email=${email}&assignment_id=${assignmentId}&course_id=${courseId}`,
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
