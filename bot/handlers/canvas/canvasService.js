// handlers/canvas/canvasService.js
const axios = require("axios");

class CanvasService {
  constructor(token) {
    this.client = axios.create({
      baseURL: "https://aupp.instructure.com/api/v1",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  }

  // 1️⃣ Planner items (list view)
  async getPlannerAssignments(startDate = new Date().toISOString()) {
    const res = await this.client.get("/planner/items", {
      params: {
        start_date: startDate,
        filter: "incomplete_items",
        order: "asc",
        per_page: 20,
      },
    });

    return res.data
      .filter((i) => i.plannable_type === "assignment")
      .map((i) => ({
        assignmentId: i.plannable_id,
        courseId: i.course_id,
        title: i.plannable.title,
        dueAt: i.plannable_date,
        courseName: i.context_name,
        htmlUrl: `https://aupp.instructure.com${i.html_url}`,
      }));
  }

  // 2️⃣ Assignment details (detail view)
  async getAssignmentDetail(courseId, assignmentId) {
    const res = await this.client.get(
      `/courses/${courseId}/assignments/${assignmentId}`
    );

    return {
      title: res.data.name,
      description: res.data.description,
      points: res.data.points_possible,
      dueAt: res.data.due_at,
      htmlUrl: res.data.html_url,
      lockInfo: res.data.lock_explanation,
    };
  }
}

module.exports = CanvasService;