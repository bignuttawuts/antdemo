import { Handler, HandlerEvent } from '@netlify/functions'
import { ApplicationError, BadRequestError, getDb, validateAuth } from '../libs/utils'

const handler: Handler = async (event: HandlerEvent) => {
  try {
    if ('GET' === event.httpMethod) {
      return await get(event)
    } else if ('POST' === event.httpMethod) {
      return await create(event)
    } else if ('PUT' === event.httpMethod) {
      return await update(event)
    } else if ('DELETE' === event.httpMethod) {
      return await remove(event)
    } else {
      throw new ApplicationError(405)
    }
  } catch (e) {
    console.log('error customer', e.code, e)
    if (e instanceof ApplicationError) {
      return { statusCode: e.code, body: JSON.stringify(e) }
    } else {
      return { statusCode: 500 }
    }
  }
}

const get = async function (event: HandlerEvent) {
  if (!event.queryStringParameters) throw new BadRequestError()
  const { customerId } = event.queryStringParameters

  const db = await getDb()
  const result = await db.collection('customer').findOne({ customerId })
  return {
    statusCode: 200,
    body: JSON.stringify(result)
  }
}

const create = async function (event: HandlerEvent) {
  const db = await getDb()
  const requestBody = JSON.parse(event.body || '{}')
  const { customerId, customerName } = requestBody
  if (!customerId) throw new BadRequestError()

  // fake validate
  if (customerName.indexOf('_') >= 0) {
    return {
      statusCode: 400,
      body: JSON.stringify({ data: { code: 400, customerId, message: 'Customer name must not contain _' } })
    }
  }

  const customer = { customerId, customerName }
  await db.collection('customer').insertOne(customer)
  return {
    statusCode: 200,
    body: JSON.stringify({ data: { customerId } })
  }
}

const update = async function (event: HandlerEvent) {
  if (!event.queryStringParameters) throw new BadRequestError()
  const { customerId } = event.queryStringParameters
  if (!customerId) throw new BadRequestError()

  const db = await getDb()
  const requestBody = JSON.parse(event.body || '{}')

  const { customerName } = requestBody
  const customer = { customerId, customerName }
  await db.collection('customer').findOneAndUpdate({ customerId }, { '$set': customer })
  return {
    statusCode: 200
  }
}

const remove = async function (event: HandlerEvent) {
  const userId = validateAuth(event)

  if (!event.queryStringParameters) throw new BadRequestError()
  const { customerId } = event.queryStringParameters
  if (!customerId) throw new BadRequestError()

  const db = await getDb()
  await db.collection('customer').findOneAndDelete({ userId, customerId })
  return {
    statusCode: 200
  }
}

export { handler };
