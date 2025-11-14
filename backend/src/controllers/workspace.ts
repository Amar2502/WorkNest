import { Request, Response } from "express";
import { pool } from "../config/db";
import { ResultSetHeader, RowDataPacket } from "mysql2";

interface Workspace extends RowDataPacket {
    id: number;
    name: string;
    owner_id: number;
    created_at: Date;
}

export const CreateWorkspace = async (req: Request, res: Response) => {

    const { name, user_id } = req.body;

    if (!name || !user_id) {
        return res.status(400).json({ message: "All fields are required" });
    }

    try {

        const [result] = await pool.query<ResultSetHeader>(
            "INSERT INTO Workspace (name, owner_id) VALUES (?, ?)",
            [name, user_id]
        )

        const newWorkspaceId = result.insertId;

        const [workspaceMember] = await pool.query<ResultSetHeader>(
            "INSERT INTO WorkspaceMembers (workspace_id, user_id, role) VALUES (?, ?, ?)",
            [newWorkspaceId, user_id, "Admin"]
        )

        return res.status(201).json({
            message: "Workspace created successfully",
            workspace: {
                id: newWorkspaceId,
                name: name
            }
        })

    }
    catch (error) {
        console.error("Error creating workspace:", error);
        return res.status(500).json({ message: "Internal server error" });
    }

}

export const GetAllWorkspaces = async (req: Request, res: Response) => {

    const { user_id } = req.body;

    if (!user_id) {
        return res.status(400).json({ message: "User ID is required" });
    }

    try {

        const [workspaces] = await pool.query<Workspace[]>(
            "SELECT * FROM Workspace WHERE owner_id = ?",
            [user_id]
        )

        if (workspaces.length === 0) {
            return res.status(404).json({ message: "No workspaces found" });
        }

        return res.status(200).json({
            message: "Workspaces fetched successfully",
            workspaces: workspaces
        })

    }
    catch (error) {
        console.error("Error getting all workspaces:", error);
        return res.status(500).json({ message: "Internal server error" });
    }

}

export const GetWorkspaceById = async (req: Request, res: Response) => {
    const workspace_id = req.params.workspaceId;

    if (!workspace_id) {
        return res.status(400).json({ message: "Workspace ID is required" });
    }

    try {
        const [rows] = await pool.query<RowDataPacket[]>(
            `
            SELECT 
                w.id,
                w.name,
                (SELECT name FROM Users WHERE id = w.owner_id) AS owner_name,
                w.created_at,
                (
                    SELECT JSON_ARRAYAGG(
                        JSON_OBJECT(
                            'id', wm.user_id,
                            'name', u.name,
                            'role', wm.role
                        )
                    )
                    FROM WorkspaceMembers wm
                    LEFT JOIN Users u ON u.id = wm.user_id
                    WHERE wm.workspace_id = w.id
                ) AS members,
                (
                    SELECT JSON_ARRAYAGG(
                        JSON_OBJECT(
                            'id', p.id,
                            'name', p.name,
                            'description', p.description,
                            'status', p.status,
                            'created_by_name', (SELECT name FROM Users WHERE id = p.created_by),
                            'created_at', p.created_at,
                            'start_date', p.start_date,
                            'end_date', p.end_date
                        )
                    )
                    FROM Projects p
                    WHERE p.workspace_id = w.id
                ) AS projects
            FROM Workspace w
            WHERE w.id = ?
            `,
            [workspace_id]
        );

        if (rows.length === 0) {
            return res.status(404).json({ message: "Workspace not found" });
        }

        return res.status(200).json({
            message: "Workspace fetched successfully",
            workspace: rows[0]
        });
    } catch (error) {
        console.error("Error getting workspace by ID:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};
