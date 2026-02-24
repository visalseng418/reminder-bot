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

  // services/canvasService.js
  async getPlannerItems() {
    try {
      const response = await axios.get(`${this.baseURL}/planner/items`, {
        headers: this.headers,
        params: {
          start_date: "2026-02-04T17:00:00.000Z", // Your specific start date
          filter: "incomplete_items",
          order: "asc",
          per_page: 14
        },
      });
      return response.data;
    } catch (error) {
      console.error("Error fetching Planner Items:", error.message);
      throw new Error("Failed to fetch planner items from Canvas");
    }
  }

  // services/canvasService.js
  async getAssignmentDetail(courseId, assignmentId) {
    try {
      const response = await axios.get(
        `${this.baseURL}/courses/${courseId}/assignments/${assignmentId}`,
        { headers: this.headers }
      );
      return response.data; // Contains 'description', 'points_possible', and 'html_url'
    } catch (error) {
      console.error(`Error fetching assignment ${assignmentId}:`, error.message);
      throw error;
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
