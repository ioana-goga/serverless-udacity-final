import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import 'source-map-support/register'
import * as middy from 'middy'
import { cors } from 'middy/middlewares'
import { CreateProjectRequest } from '../../requests/CreateProjectRequest'
import { createProject } from '../../service/projectService'
import { getUserIdFromGatewayEvent } from '../../auth/utils'

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const createProjectRequest: CreateProjectRequest = JSON.parse(event.body)
    const newItem = await createProject(
      createProjectRequest,
      getUserIdFromGatewayEvent(event)
    )
    return {
      statusCode: 201,
      body: JSON.stringify({
        item: newItem
      })
    }
  }
)
handler.use(
  cors({
    credentials: true
  })
)
