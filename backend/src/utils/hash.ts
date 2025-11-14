import bcrypt from "bcryptjs";

export const hash = async ( password : string) => {

    return await bcrypt.hash(password, 10);

}

export const compare = async (password: string, hashedPassword: string) => {

    return await bcrypt.compare(password, hashedPassword);

}