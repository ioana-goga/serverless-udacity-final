import * as AWS from 'aws-sdk'

import { createLogger } from '../../utils/logger'
import { TodoItem } from '../../models/TodoItem'
import { TodoUpdate } from '../../models/TodoUpdate'
const AWSXRay = require('aws-xray-sdk')

const XAWS = AWSXRay.captureAWS(AWS)

const logger = createLogger('todoAccess')

export class ToDoAccess {
  constructor(
    private readonly docClient = new XAWS.DynamoDB.DocumentClient(),
    private readonly toDosTable = process.env.TODOS_TABLE
  ) {}

  async getToDosForProject(
    userId: string,
    projectCreatedAt: string
  ): Promise<TodoItem[]> {
    logger.info('Getting toDo items for project ' + projectCreatedAt)

    const result = await this.docClient
      .query({
        TableName: this.toDosTable,

        KeyConditionExpression:
          'hashK = :userId and begins_with(rangeK, :toDos) ',

        ExpressionAttributeValues: {
          ':userId': userId + '#' + projectCreatedAt,
          ':toDos': 'Todo#'
        },
        //reverse order
        ScanIndexForward: false
      })
      .promise()

    const toDos = result.Items as TodoItem[]
    logger.info('toDos  =  ' + JSON.stringify(toDos))

    return toDos
  }

  async createToDo(toDoItem: TodoItem): Promise<TodoItem> {
    logger.info('creating todo = ' + JSON.stringify(toDoItem))
    try {
      await this.docClient
        .put({
          TableName: this.toDosTable,
          Item: toDoItem
        })
        .promise()
      return toDoItem
    } catch (err) {
      logger.error('Error on insert item ' + err)
      throw err
    }
  }

  async updateToDo(
    hashK: string,
    rangeK: string,
    toDoItemUpdate: TodoUpdate
  ): Promise<TodoItem> {
    logger.info('Executing update for todo')
    const params = {
      TableName: this.toDosTable,
      Key: {
        hashK: hashK,
        rangeK: rangeK
      },
      UpdateExpression: 'set #name = :name, #dueDate = :dueDate, #done = :done',
      ExpressionAttributeValues: {
        ':name': toDoItemUpdate.name,
        ':dueDate': toDoItemUpdate.dueDate,
        ':done': toDoItemUpdate.done
      },
      ExpressionAttributeNames: {
        '#name': 'name',
        '#dueDate': 'dueDate',
        '#done': 'done'
      },
      ReturnValues: 'ALL_NEW'
    }

    try {
      const response = await this.docClient.update(params).promise()

      let updatedTodoItem = {} as TodoItem
      if ('Attributes' in response) {
        updatedTodoItem = response.Attributes as TodoItem
      }
      return updatedTodoItem
    } catch (err) {
      logger.error('Error on update item ' + err)
      throw err
    }
  }

  async updateToDoAttachmentUrl(
    hashK: string,
    rangeK: string,
    attachmentUrl: string
  ): Promise<Boolean> {
    const params = {
      TableName: this.toDosTable,
      Key: {
        hashK: hashK,
        rangeK: rangeK
      },
      UpdateExpression: 'set #attachmentUrl = :attachmentUrl',
      ExpressionAttributeValues: {
        ':attachmentUrl': attachmentUrl
      },
      ExpressionAttributeNames: {
        '#attachmentUrl': 'attachmentUrl'
      },
      ReturnValues: 'ALL_NEW'
    }

    try {
      await this.docClient.update(params).promise()
      return true
    } catch (err) {
      logger.error('Error on update attachment url ' + err)
      throw err
    }
  }

  async deleteToDoItem(hashK: string, rangeK: string): Promise<Boolean> {
    logger.info('delete todo with hashK  = ' + rangeK + ' rangeK = ' + rangeK)
    try {
      await this.docClient
        .delete({
          TableName: this.toDosTable,
          Key: {
            hashK: hashK,
            rangeK: rangeK
          }
        })
        .promise()
      return true
    } catch (err) {
      logger.error(' Error on delete item ' + err)
      throw err
    }
  }

  async getToDoItem(hashK: string, rangeK: string) {
    return await this.docClient
      .get({
        TableName: this.toDosTable,
        Key: {
          hashK: hashK,
          rangeK: rangeK
        }
      })
      .promise()
  }
}
