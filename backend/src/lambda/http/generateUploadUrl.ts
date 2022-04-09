import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import * as middy from 'middy'
import { cors, httpErrorHandler } from 'middy/middlewares'
import { getUploadUrl } from '../../service/uploadImageService'
import { createLogger } from '../../utils/logger'
import { getUserIdFromGatewayEvent } from '../../auth/utils'

const logger = createLogger('generateUploadUrl')

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const projectCreatedAt = event.pathParameters.projectCreatedAt
    const todoCreatedAt = event.pathParameters.todoCreatedAt
    const userId = getUserIdFromGatewayEvent(event)
    logger.info('Getting upload url for todoCreatedAt = ' + todoCreatedAt)
    try {
      const uploadUrl = getUploadUrl(userId, projectCreatedAt, todoCreatedAt)
      logger.info('Upload url = ' + uploadUrl)
      return {
        statusCode: 200,
        body: JSON.stringify({
          uploadUrl: uploadUrl
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
