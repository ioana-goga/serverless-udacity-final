import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import * as middy from 'middy'
import { cors, httpErrorHandler } from 'middy/middlewares'

import { UpdateTodoRequest } from '../../requests/UpdateTodoRequest'
import { updateToDo } from '../../service/todosService'
import { createLogger } from '../../utils/logger'
import { getUserIdFromGatewayEvent } from '../../auth/utils'

const logger = createLogger('updateTodo')

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const projectCreatedAt = event.pathParameters.projectCreatedAt
    const todoCreatedAt = event.pathParameters.todoCreatedAt

    const updatedTodoReq: UpdateTodoRequest = JSON.parse(event.body)

    try {
      const updatedItem = await updateToDo(
        projectCreatedAt,
        todoCreatedAt,
        getUserIdFromGatewayEvent(event),
        updatedTodoReq
      )
      return {
        statusCode: 200,
        body: JSON.stringify(updatedItem)
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
