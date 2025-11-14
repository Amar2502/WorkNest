import { Request, Response } from "express";
import { pool } from "../config/db";
import { ResultSetHeader } from "mysql2";


export const CreateProject = async (req: Request, res: Response) => {
  const { name, description, workspace_id, created_by, start_date, end_date } =
    req.body;

  if (!name || !description || !workspace_id || !created_by) {
    return res.status(400).json({ message: "All fields are required" });
  }

  try {
    const [result] = await pool.query<ResultSetHeader>(
      "INSERT INTO Projects (name, description, workspace_id, created_by, start_date, end_date) VALUES (?, ?, ?, ?, ?, ?)",
      [name, description, workspace_id, created_by, start_date, end_date]
    );

    const newProjectId = result.insertId;

    await pool.query<ResultSetHeader>(
      "INSERT INTO ProjectMembers (project_id, user_id, role) VALUES (?, ?, ?)",
      [newProjectId, created_by, "Admin"]
    );

    return res.status(201).json({
      message: "Project created successfully",
      project: {
        id: newProjectId,
        name,
      },
    });
  } catch (error) {
    console.error("Error creating project:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};


export const GetAllProjects = async (req: Request, res: Response) => {
  const { workspace_id } = req.body;

  if (!workspace_id) {
    return res.status(400).json({ message: "Workspace ID is required" });
  }

  try {
    const [projects] = await pool.query<ResultSetHeader[]>(
      "SELECT * FROM Projects WHERE workspace_id = ?",
      [workspace_id]
    );

    if (projects.length === 0) {
      return res.status(404).json({ message: "No projects found" });
    }

    return res.status(200).json({
      message: "Projects fetched successfully",
      projects,
    });
  } catch (error) {
    console.error("Error getting all projects:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const GetProjectById = async (req: Request, res: Response) => {
  const project_id = parseInt(req.params.projectId);

  if (!project_id) {
    return res.status(400).json({ message: "Project ID is required" });
  }

  try {
    // Fetch project + members
    const [project] = await pool.query<ResultSetHeader[]>(
      `
      SELECT 
        Projects.id AS project_id,
        Projects.name AS project_name,
        Projects.description,
        Projects.status,
        Projects.start_date,
        Projects.end_date,
        JSON_ARRAYAGG(
          JSON_OBJECT(
            'member', Users.name,
            'role', ProjectMembers.role
          )
        ) AS members
      FROM Projects
      JOIN ProjectMembers ON Projects.id = ProjectMembers.project_id
      JOIN Users ON ProjectMembers.user_id = Users.id
      WHERE Projects.id = ?
      GROUP BY Projects.id;
      `,
      [project_id]
    );

    if (project.length === 0) {
      return res.status(404).json({ message: "Project not found" });
    }

    // Fetch all boards for the project
    const [boards] = await pool.query<ResultSetHeader[]>(
      `
      SELECT id, name, updated_at
      FROM Boards
      WHERE project_id = ?;
      `,
      [project_id]
    );

    // No boards → prompt to create
    if (boards.length === 0) {
      return res.status(200).json({
        message: "No boards found. Create a board to get started.",
        project: project[0],
        boards: [],
      });
    }

    // One board → fetch columns + tasks for that board
    if (boards.length === 1) {
      const board_id = (boards[0] as any).id;

      const [board_details] = await pool.query<ResultSetHeader[]>(
        `
        SELECT 
          bc.id AS column_id,
          bc.name AS column_name,
          bc.order_index,
          bc.updated_at,
          JSON_ARRAYAGG(
            JSON_OBJECT(
              'task_id', t.id,
              'title', t.title,
              'description', t.description,
              'priority', t.priority,
              'due_date', t.due_date,
              'created_by', u.name,
              'updated_at', t.updated_at
            )
          ) AS tasks
        FROM BoardColumns bc
        LEFT JOIN Tasks t ON bc.id = t.column_id
        LEFT JOIN Users u ON t.created_by = u.id
        WHERE bc.board_id = ?
        GROUP BY bc.id
        ORDER BY bc.order_index;
        `,
        [board_id]
      );

      return res.status(200).json({
        message: "Project fetched successfully",
        project: project[0],
        board: boards[0],
        board_details,
      });
    }

    // Multiple boards → show list of boards for user to choose
    return res.status(200).json({
      message: "Project has multiple boards. Select one to view.",
      project: project[0],
      boards,
    });
  } catch (error) {
    console.error("Error getting project by ID:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
