import * as AWS from 'aws-sdk'
import { ToDoAccess } from '../lambda/dbAccess/todosAccess'
import { createLogger } from '../utils/logger'
import { generateToDoHashKey, generateToDoRangeKey } from './KeyUtils'
const AWSXRay = require('aws-xray-sdk')

const bucketName = process.env.ATTACHMENT_S3_BUCKET
const urlExpiration = +process.env.SIGNED_URL_EXPIRATION

const XAWS = AWSXRay.captureAWS(AWS)

const toDoAccess = new ToDoAccess()

const s3 = new XAWS.S3({
  signatureVersion: 'v4'
})

const logger = createLogger('UploadImageService')

export function getUploadUrl(
  userId: string,
  projectCreatedAt: string,
  todoCreatedAt: string
) {
  return s3.getSignedUrl('putObject', {
    Bucket: bucketName,
    Key: getImageId(userId, projectCreatedAt, todoCreatedAt),
    Expires: urlExpiration
  })
}

export async function updateTodoImageUrl(imageId: string): Promise<Boolean> {
  logger.info('Update image url for todo with id = ' + imageId)
  const toDoIdTokens = imageId.split('_')
  const userId = toDoIdTokens[0]
  const projectCreatedAt = toDoIdTokens[1]
  const hashK = generateToDoHashKey(userId, projectCreatedAt)

  const toDoCreatedAt = toDoIdTokens[2]
  const rangeK = generateToDoRangeKey(toDoCreatedAt)
  const todoItem = await toDoAccess.getToDoItem(hashK, rangeK)

  logger.info('Found to do item to update  = ' + JSON.stringify(todoItem))
  if (todoItem === undefined || todoItem === null) {
    logger.error(
      'Could not find the todo item in the database. Todo with id = ' + imageId
    )
    throw new Error('Could not find the todo item in the database')
  }

  const attachmentUrl = `https://${bucketName}.s3.eu-central-1.amazonaws.com/${imageId}`
  logger.info('Attachment url  = ' + attachmentUrl)

  return await toDoAccess.updateToDoAttachmentUrl(hashK, rangeK, attachmentUrl)
}

function getImageId(
  userId: any,
  projectCreatedAt: string,
  todoCreatedAt: string
): string {
  return userId + '_' + projectCreatedAt + '_' + todoCreatedAt
}
