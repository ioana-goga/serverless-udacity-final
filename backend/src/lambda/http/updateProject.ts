import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import * as middy from 'middy'
import { cors, httpErrorHandler } from 'middy/middlewares'

import { createLogger } from '../../utils/logger'
import { getUserIdFromGatewayEvent } from '../../auth/utils'
import { CreateProjectRequest } from '../../requests/CreateProjectRequest'
import { updateProject } from '../../service/projectService'

const logger = createLogger('updateProject')

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const projectCreatedAt = event.pathParameters.projectCreatedAt

    const updatedTodoReq: CreateProjectRequest = JSON.parse(event.body)

    try {
      const updatedItem = await updateProject(
        projectCreatedAt,

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
