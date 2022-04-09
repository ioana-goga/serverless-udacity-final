import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import * as middy from 'middy'
import { cors, httpErrorHandler } from 'middy/middlewares'
import { createLogger } from '../../utils/logger'
import { getUserIdFromGatewayEvent } from '../../auth/utils'
import { deleteProjectWithToDos } from '../../service/projectService'

const logger = createLogger('deleteProjectWithToDos')

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const projectCreatedAt = event.pathParameters.projectCreatedAt

    try {
      const result = await deleteProjectWithToDos(
        getUserIdFromGatewayEvent(event),
        projectCreatedAt
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
