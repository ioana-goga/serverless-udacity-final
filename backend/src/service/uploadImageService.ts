import * as AWS from 'aws-sdk'
import { ToDoAccess } from '../lambda/dbAccess/todosAccess'
import { createLogger } from '../utils/logger'
const AWSXRay = require('aws-xray-sdk')

const bucketName = process.env.ATTACHMENT_S3_BUCKET
const urlExpiration = +process.env.SIGNED_URL_EXPIRATION

const XAWS = AWSXRay.captureAWS(AWS)

const toDoAccess = new ToDoAccess()

const s3 = new XAWS.S3({
  signatureVersion: 'v4'
})

const logger = createLogger('UploadImageService')

export function getUploadUrl(toDoId: string) {
  return s3.getSignedUrl('putObject', {
    Bucket: bucketName,
    Key: toDoId,
    Expires: urlExpiration
  })
}

export async function updateTodoImageUrl(todoId: string): Promise<Boolean> {
  logger.info('Update image url for todo with id = ' + todoId)

  const todoItem = await toDoAccess.getToDoItem(todoId)
  logger.info('Found to do item to update  = ' + JSON.stringify(todoItem))
  if (todoItem === undefined || todoItem === null) {
    logger.error(
      'Could not find the todo item in the database. Todo with id = ' + todoId
    )
    throw new Error('Could not find the todo item in the database')
  }

  const attachmentUrl = `https://${bucketName}.s3.eu-central-1.amazonaws.com/${todoId}`
  logger.info('Attachment url  = ' + attachmentUrl)

  return await toDoAccess.updateToDoAttachmentUrl(
    todoItem.todoId,
    todoItem.userId,
    attachmentUrl
  )
}
