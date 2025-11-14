import { Request, Response } from "express";
import { pool } from "../config/db";
import { hash, compare } from "../utils/hash";
import { RowDataPacket, ResultSetHeader } from "mysql2";
import jwt from "jsonwebtoken";
import config from "../config/config";


interface RegisterUserRequest {
    name: string;
    email: string;
    password: string;
}

interface LoginUserRequest {
    email: string;
    password: string;
}

interface User extends RowDataPacket {
    id: number;
    name: string;
    email: string;
    password: string;
    created_at: Date;
}


export const RegisterUser = async (req: Request, res: Response) => {

    const {name, email, password} = req.body as RegisterUserRequest;
    if (!name || !email || !password) {
        return res.status(400).json({ message: "All fields are required" });
    }

    try {
        const [ExistingUser] = await pool.query(
            "SELECT * FROM users WHERE email = ?",
            [email]
        );

        if ((ExistingUser as User[]).length > 0) {
            return res.status(400).json({ message: "User already exists" });
        }

        const hashedPassword = await hash(password);

        const [result] = await pool.query<ResultSetHeader>(
            "INSERT INTO users (name, email, password) VALUES (?, ?, ?)",
            [name, email, hashedPassword]
        );

        const newUserId = result.insertId;

        const [newUser] = await pool.query<User[]>(
            "SELECT * FROM users WHERE id = ?",
            [newUserId]
        );

        const token = jwt.sign(
            {
                userId: newUser[0].id,
                name: newUser[0].name,
                email: newUser[0].email
            },
            config.JWT_SECRET,
            {expiresIn: "30d"}
        )

        res.cookie("token", token, {
            httpOnly: true,
            sameSite: "strict",
            maxAge: 30 * 24 * 60 * 60 * 1000
        })

        return res.status(201).json({
            message: "User created successfully",
            user: {
                id: newUser[0].id,
                name: newUser[0].name,
                email: newUser[0].email
            },
            token: token
        })
    }

    catch (error) {
        console.error("Error creating user:", error);
        return res.status(500).json({ message: "Internal server error" });
    }

}

export const LoginUser = async (req: Request, res: Response) => {

    const {email, password} = req.body as LoginUserRequest;

    console.log(email, password);

    if (!email || !password) {
        return res.status(400).json({ message: "All fields are required" });
    }

    try {

        const [ExistingUser] = await pool.query(
            "SELECT * FROM users WHERE email = ?",
            [email]
        );

        if ((ExistingUser as User[]).length === 0) {
            return res.status(400).json({ message: "User not found" });
        }

        const user = (ExistingUser as User[])[0];

        console.log(user.password);
        const isPasswordValid = await compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(400).json({ message: "Invalid password" });
        }

        const token = jwt.sign(
            {
                userId: user.id,
                name: user.name,
                email: user.email
            },
            config.JWT_SECRET,
            {expiresIn: "30d"}
        )

        res.cookie("token", token, {
            httpOnly: true,
            sameSite: "strict",
            maxAge: 30 * 24 * 60 * 60 * 1000
        })

        return res.status(200).json({
            message: "User logged in successfully",
            user: {
                id: user.id,
                name: user.name,
                email: user.email
            },
            token: token
        })

    }
    catch (error) {
        console.error("Error logging in user:", error);
        return res.status(500).json({ message: "Internal server error" });
    }

}