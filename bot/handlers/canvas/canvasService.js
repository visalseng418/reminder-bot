// services/canvasService.js
const axios = require("axios");

class CanvasService {
  constructor(token) {
    this.baseURL = `https://aupp.instructure.com/api/v1`;
    this.token = token;
    this.headers = {
      Authorization: `Bearer ${token}`,
    };
  }

  // Fetch all active courses
  async getCourses() {
    try {
      const response = await axios.get(`${this.baseURL}/courses`, {
        headers: this.headers,
        params: {
          enrollment_state: "active",
          per_page: 100,
        },
      });
      return response.data;
    } catch (error) {
      console.error("Error fetching courses:", error.message);
      throw new Error("Failed to fetch courses from Canvas");
    }
  }

  // Fetch assignments for a specific course
  async getAssignments(courseId) {
    try {
      const response = await axios.get(
        `${this.baseURL}/courses/${courseId}/assignments`,
        {
          headers: this.headers,
          params: {
            per_page: 100,
            order_by: "due_at",
          },
        },
      );
      return response.data;
    } catch (error) {
      console.error(
        `Error fetching assignments for course ${courseId}:`,
        error.message,
      );
      return [];
    }
  }

  // Fetch all assignments from all courses
  async getAllAssignments() {
    try {
      const courses = await this.getCourses();
      const allAssignments = [];

      for (const course of courses) {
        const assignments = await this.getAssignments(course.id);

        // Filter out assignments without due dates and add course info
        const validAssignments = assignments
          .filter((a) => a.due_at)
          .map((a) => ({
            id: a.id,
            title: a.name,
            course: course.name,
            dueDate: new Date(a.due_at),
            url: a.html_url,
          }));

        allAssignments.push(...validAssignments);
      }

      return allAssignments;
    } catch (error) {
      console.error("Error fetching all assignments:", error.message);
      throw error;
    }
  }
}

module.exports = CanvasService;
