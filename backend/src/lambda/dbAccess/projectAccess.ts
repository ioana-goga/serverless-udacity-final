import * as AWS from 'aws-sdk'

import { createLogger } from '../../utils/logger'
import { Project } from '../../models/Project'
import { ProjectUpdate } from '../../models/ProjectUpdate'
const AWSXRay = require('aws-xray-sdk')

const XAWS = AWSXRay.captureAWS(AWS)

const logger = createLogger('ProjectAccess')

export class ProjectAccess {
  constructor(
    private readonly docClient = new XAWS.DynamoDB.DocumentClient(),
    private readonly toDosTable = process.env.TODOS_TABLE,
    private readonly nameIndex = process.env.TODOS_NAME_INDEX
  ) {}

  async getAllProjects(userId: string): Promise<Project[]> {
    logger.info('Getting all projects for user ' + userId)

    const result = await this.docClient
      .query({
        TableName: this.toDosTable,

        KeyConditionExpression:
          'hashK = :userId and begins_with(rangeK, :project) ',

        ExpressionAttributeValues: {
          ':userId': userId,
          ':project': 'Project'
        },
        //reverse order
        ScanIndexForward: false
      })
      .promise()

    const items = result.Items
    // logger.info('Found items ' + JSON.stringify(items))
    return items as Project[]
  }

  async getAllProjectsOrderByName(userId: string): Promise<Project[]> {
    logger.info('Getting all projects ordered by name for user ' + userId)
    const result = await this.docClient
      .query({
        TableName: this.toDosTable,
        IndexName: this.nameIndex,
        KeyConditionExpression: 'hashK = :userId ',
        ExpressionAttributeValues: {
          ':userId': userId
        },
        //reverse order
        ScanIndexForward: true
      })
      .promise()

    const items = result.Items
    return items as Project[]
  }

  async createProject(project: Project): Promise<Project> {
    logger.info('creating project = ' + JSON.stringify(project))
    try {
      await this.docClient
        .put({
          TableName: this.toDosTable,
          Item: project
        })
        .promise()
      return project
    } catch (err) {
      logger.error('Error on insert item ' + err)
      throw err
    }
  }

  async deleteProject(hashK: string, rangeK: string) {
    logger.info('delete project with hashK  = ' + hashK + ' rangeK = ' + rangeK)
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

  async updateProject(
    hashK: string,
    rangeK: string,
    project: ProjectUpdate
  ): Promise<Project> {
    logger.info('Executing update for project')
    const params = {
      TableName: this.toDosTable,
      Key: {
        hashK: hashK,
        rangeK: rangeK
      },
      UpdateExpression: 'set #name = :name, #description = :description',
      ExpressionAttributeValues: {
        ':name': project.name,
        ':description': project.description
      },
      ExpressionAttributeNames: {
        '#name': 'name',
        '#description': 'description'
      },
      ReturnValues: 'ALL_NEW'
    }

    try {
      const response = await this.docClient.update(params).promise()

      let updatedProject = {} as Project
      if ('Attributes' in response) {
        updatedProject = response.Attributes as Project
      }
      return updatedProject
    } catch (err) {
      logger.error('Error on update item ' + err)
      throw err
    }
  }
}
