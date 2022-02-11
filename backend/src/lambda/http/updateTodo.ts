import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import * as middy from 'middy'
import { cors, httpErrorHandler } from 'middy/middlewares'

import { UpdateTodoRequest } from '../../requests/UpdateTodoRequest'
import { updateToDo } from '../../service/todosService'
import { getUserIdFromGatewayEvent, omitUserId } from '../../auth/utils'
import { createLogger } from '../../utils/logger'

const logger = createLogger('updateTodo')

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const todoId = event.pathParameters.todoId
    const updatedTodoReq: UpdateTodoRequest = JSON.parse(event.body)

    try {
      const updatedItem = await updateToDo(
        todoId,
        updatedTodoReq,
        getUserIdFromGatewayEvent(event)
      )
      return {
        statusCode: 200,
        body: JSON.stringify(
          {
            updatedItem: updatedItem
          },
          //omit user id from response sent back to the client
          omitUserId
        )
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
