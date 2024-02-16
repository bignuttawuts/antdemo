import { HandlerEvent } from '@netlify/functions'
import { MongoClient } from 'mongodb'

const uri = process.env.DATABASE_URL || ''
let conn

export class ApplicationError extends Error {
  code: number
  constructor(code: number = 500, msg: string = "Internal server error") {
    super(msg)
    this.code = code
  }
}

export class UnauthorizedError extends ApplicationError {
  constructor(code: number = 401, msg: string = "Unauthorized") {
    super(code, msg)
  }
}

export class BadRequestError extends ApplicationError {
  constructor(code: number = 400, msg: string = "Bad Request") {
    super(code, msg)
  }
}

export const validateAuth = function (event: HandlerEvent) {
  const authorization = event.headers['authorization']
  if (!authorization) throw new UnauthorizedError()

  const userId = authorization.replace('Basic', '').trim()
  if (!userId) throw new UnauthorizedError()

  return userId
}

export const getDb = async function () {
  if (!conn) {
    conn = await MongoClient.connect(uri)
  }
  if (!conn) throw new ApplicationError()

  return conn.db("bunshi")
}
