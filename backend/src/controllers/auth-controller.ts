import { Request, Response } from "express"
import { connection } from "../utils/db"
import bcrypt from "bcrypt"
import {getUser, setUser, unsetUser} from "../utils/auth"

export const login = async (req: Request, res: Response) => {
    const conn = await connection.promise().getConnection();
    try {
        const {username, password} = req.body

        const [results] = await conn.query(`SELECT * FROM operatore WHERE username = ?`,[username])
        if(!Array.isArray(results) || results.length == 0){
            res.status(400).send("Credenziali Errate")
            return
        }
        const user = results[0] as any
        const correctPassword = await bcrypt.compare(password, user.PassDip)
        if(!correctPassword){
            res.status(400).send("credenziali Errate")
            return
        }
        delete user.PassDip

        setUser(req, res, user)
        res.json({ message: "Login effettuato con successo" })

    }catch (err) {
        console.error("Errore durante il login:", err); 
        res.status(500).json({ message: 'Errore interno del server durante il login'}); 
    } finally {
        if (conn) conn.release();
    }

}

export const logout = async (req: Request, res: Response) =>{
    unsetUser(req, res)
    res.json({ message: "Logout effettuato con successo" })
}

export const getProfile = async (req: Request, res: Response) => {
    const user = getUser(req, res)
    res.json(user)
}