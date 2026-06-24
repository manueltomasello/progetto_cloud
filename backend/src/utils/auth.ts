import { Request, Response } from "express"
import jwt from "jsonwebtoken"



export interface User {
IdDip: number
username: string
ruolo: "admin" | "user" 
}

const JWT_SECRET = process.env.ENCRYPTION_KEY;
const COOKIE_NAME = "vuepost-access-token"

if (!JWT_SECRET) {
  throw new Error('ENCRYPTION_KEY non configurata nelle variabili ambiente');
}
export const setUser = (req: Request, res: Response, user: any) => {
    const accessToken = jwt.sign(user, JWT_SECRET,{expiresIn:"1 day"})
    res.cookie(COOKIE_NAME, accessToken, {
        maxAge:86400000,  
        httpOnly:true,
        sameSite: "strict",
         //secure: true
    })
}
/**
* verify access token,
* check user login
*/
export const getUser = (req: Request, res: Response) => {
    const accessToken = req.cookies[COOKIE_NAME]
    if(!accessToken) return null
    try {
        const user = jwt.verify(accessToken, JWT_SECRET)
        return user
    }catch{
        return null
    }
}

/**
* delete cookie with access token.
* Used to logout.
*/
export const unsetUser = (req: Request, res: Response) => {
    res.clearCookie(COOKIE_NAME)
}