import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import * as middy from 'middy'
import { cors, httpErrorHandler } from 'middy/middlewares'
import { createLogger } from '../../utils/logger'
import { getUserIdFromGatewayEvent } from '../../auth/utils'
import { getToDosForProject } from '../../service/todosService'

const logger = createLogger('getToDos')

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    logger.info(event)
    const projectCreatedAt = event.pathParameters.projectCreatedAt
    try {
      const toDoItems = await getToDosForProject(
        getUserIdFromGatewayEvent(event),
        projectCreatedAt
      )
      return {
        statusCode: 200,
        body: JSON.stringify({
          items: toDoItems
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
