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
    private readonly toDosTable = process.env.TODOS_TABLE,
    private readonly createdAtIndex = process.env.TODOS_CREATED_AT_INDEX,
    private readonly todoIdIndex = process.env.TODOS_ID_INDEX
  ) {}

  async getAllToDos(userId: string): Promise<TodoItem[]> {
    logger.info('Getting all todos')

    const result = await this.docClient
      .query({
        TableName: this.toDosTable,
        IndexName: this.createdAtIndex,
        KeyConditionExpression: 'userId = :userId',
        ExpressionAttributeValues: {
          ':userId': userId
        },
        //reverse order
        ScanIndexForward: false
      })
      .promise()

    const items = result.Items
    return items as TodoItem[]
  }

  async toDoExists(toDoId: string, userId: string): Promise<Boolean> {
    logger.info('searching for todo by id ' + toDoId)
    const result = await this.getToDoItemForUser(toDoId, userId)
    logger.info('to do item is : ' + JSON.stringify(result.Item))
    return !!result.Item
  }

  private async getToDoItemForUser(toDoId: string, userId: string) {
    return await this.docClient
      .get({
        TableName: this.toDosTable,
        Key: {
          todoId: toDoId,
          userId: userId
        }
      })
      .promise()
  }

  async getToDoItem(todoId: string): Promise<TodoItem> {
    logger.info('searching for todo by id ' + todoId)
    const result = await this.docClient
      .query({
        TableName: this.toDosTable,
        IndexName: this.todoIdIndex,
        KeyConditionExpression: 'todoId = :todoId',
        ExpressionAttributeValues: {
          ':todoId': todoId
        }
      })
      .promise()
    return result.Items[0] as TodoItem
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
    toDoId: string,
    userId: string,
    toDoItemUpdate: TodoUpdate
  ): Promise<TodoItem> {
    logger.info('Todo item found in the database. Executing update.')
    const params = {
      TableName: this.toDosTable,
      Key: {
        todoId: toDoId,
        userId: userId
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
    toDoId: string,
    userId: string,
    attachmentUrl: string
  ): Promise<Boolean> {
    const params = {
      TableName: this.toDosTable,
      Key: {
        todoId: toDoId,
        userId: userId
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

  async deleteToDoItem(userId: string, toDoItemId: string): Promise<Boolean> {
    logger.info('delete todo with id = ' + toDoItemId)
    try {
      await this.docClient
        .delete({
          TableName: this.toDosTable,
          Key: {
            todoId: toDoItemId,
            userId: userId
          }
        })
        .promise()
      return true
    } catch (err) {
      logger.error(' Error on delete item ' + err)
      throw err
    }
  }
}
