import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import * as middy from 'middy'
import { cors, httpErrorHandler } from 'middy/middlewares'
import { createLogger } from '../../utils/logger'
import { getAllToDos } from '../../service/todosService'
import { getUserIdFromGatewayEvent } from '../../auth/utils'

const logger = createLogger('getToDos')

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    logger.info(event)
    try {
      const todos = await getAllToDos(getUserIdFromGatewayEvent(event))
      return {
        statusCode: 200,
        body: JSON.stringify({
          items: todos
        })
      }
    } catch (err) {
      logger.error(err)
      throw new Error(err)
    }
  }
)

handler.use(httpErrorHandler()).use(
  cors({
    credentials: true
  })
)
