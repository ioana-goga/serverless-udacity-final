import { S3Event, S3Handler } from 'aws-lambda'
import 'source-map-support/register'
import { updateTodoImageUrl } from '../service/uploadImageService'
import { createLogger } from '../utils/logger'

const logger = createLogger('imageUploadEvent')

export const handler: S3Handler = async (event: S3Event) => {
  for (const record of event.Records) {
    const key = record.s3.object.key
    logger.info('Processing object with key ' + key)
    await updateTodoImageUrl(key)
  }
}
