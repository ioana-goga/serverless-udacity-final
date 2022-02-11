import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import * as middy from 'middy'
import { cors, httpErrorHandler } from 'middy/middlewares'
import { deleteToDoItem } from '../../service/todosService'
import { createLogger } from '../../utils/logger'
import { getUserIdFromGatewayEvent } from '../../auth/utils'

const logger = createLogger('deleteToDo')

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const todoId = event.pathParameters.todoId

    try {
      const result = await deleteToDoItem(
        todoId,
        getUserIdFromGatewayEvent(event)
      )
      return {
        statusCode: 200,
        body: JSON.stringify({
          result: result
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
