import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import fs from 'fs'
import dotenv from 'dotenv'
dotenv.config()

const publicKeyPath = process.env.Token_public
const privateKeyPath = process.env.Token_private

const publicKey = fs.readFileSync(publicKeyPath, 'utf8');
const privateKey = fs.readFileSync(privateKeyPath, 'utf8');
console.log(publicKey)
console.log(privateKey)

const i = 'jwt-node'
const s = 'jwt-node'
const a = 'jwt-node'

const verifyOptions = {
    issuer: i,
    subject: s,
    audience: a,
    expiresIn: '8784h',
    algorithm: ['RS256'],
}

const saltRounds = 10

const salt = bcrypt.genSaltSync(saltRounds)

const generateJWT = (payload) => {
    const signOptions = {
        issuer: i,
        subject: s,
        audience: a,
        expiresIn: '8784h',
        algorithm: 'RS256',
    }

    const options = signOptions
    if (payload && payload.exp) {
        delete options.expiresIn
    }
    return jwt.sign(payload, privateKey, options)
}

const verifyJWT = (payload) => {
    return jwt.verify(payload, publicKey, verifyOptions)
}

const hashPassword = (password) => {
    const hash = bcrypt.hashSync(password, salt)
    return hash
}

export default {
    hashPassword, verifyJWT, generateJWT
}