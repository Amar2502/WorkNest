import { Request, Response } from "express";
import { pool } from "../config/db";
import { ResultSetHeader } from "mysql2";


export const CreateProject = async (req: Request, res: Response) => {

    const { name, description, workspace_id, created_by, start_date, end_date } = req.body;

    if (!name || !description || !workspace_id || !created_by) {
        return res.status(400).json({ message: "All fields are required" });
    }

    try {

        const [result] = await pool.query<ResultSetHeader>(
            "INSERT INTO Projects (name, description, workspace_id, created_by, start_date, end_date) VALUES (?, ?, ?, ?, ?, ?)",
            [name, description, workspace_id, created_by, start_date, end_date]
        )

        const newProjectId = result.insertId;

        const [projectmemberresult] = await pool.query<ResultSetHeader>(
            "INSERT INTO ProjectMembers (project_id, user_id, role) VALUES (?, ?, ?)",
            [newProjectId, created_by, "Admin"]
        )

        return res.status(201).json({
            message: "Project created successfully",
            project: {
                id: newProjectId,
                name: name
            }
        })

    }
    catch (error) {
        console.error("Error creating project:", error);
        return res.status(500).json({ message: "Internal server error" });
    }

}

export const GetAllProjects = async (req: Request, res: Response) => {

    const { workspace_id } = req.body;

    if (!workspace_id) {
        return res.status(400).json({ message: "Workspace ID is required" });
    }

    try {

        const [projects] = await pool.query<ResultSetHeader[]>(
            "SELECT * FROM Projects WHERE workspace_id = ?",
            [workspace_id]
        )

        if (projects.length === 0) {
            return res.status(404).json({ message: "No projects found" });
        }

        return res.status(200).json({
            message: "Projects fetched successfully",
            projects: projects
        })
    }
    catch (error) {
        console.error("Error getting all projects:", error);
        return res.status(500).json({ message: "Internal server error" });
    }

}