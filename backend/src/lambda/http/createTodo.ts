import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import 'source-map-support/register'
import * as middy from 'middy'
import { cors } from 'middy/middlewares'
import { CreateTodoRequest } from '../../requests/CreateTodoRequest'
import { createToDo } from '../../service/todosService'
import { getUserIdFromGatewayEvent, omitUserId } from '../../auth/utils'

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const toDoRequest: CreateTodoRequest = JSON.parse(event.body)
    const newItem = await createToDo(
      toDoRequest,
      getUserIdFromGatewayEvent(event)
    )
    return {
      statusCode: 201,
      body: JSON.stringify(
        {
          item: newItem
        },
        //omit user id from response sent back to the client
        omitUserId
      )
    }
  }
)
handler.use(
  cors({
    credentials: true
  })
)
