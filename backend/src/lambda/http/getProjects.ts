import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import * as middy from 'middy'
import { cors, httpErrorHandler } from 'middy/middlewares'
import { createLogger } from '../../utils/logger'
import { getUserIdFromGatewayEvent } from '../../auth/utils'
import { getAllProjects } from '../../service/projectService'

const logger = createLogger('getProjectsHandler')

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    logger.info(event)
    let orderField = 'default'
    if (event.queryStringParameters && event.queryStringParameters.order) {
      orderField = event.queryStringParameters.order
    }

    logger.info('orderField = ' + orderField)
    try {
      const projects = await getAllProjects(
        getUserIdFromGatewayEvent(event),
        orderField
      )
      return {
        statusCode: 200,
        body: JSON.stringify({
          items: projects
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
