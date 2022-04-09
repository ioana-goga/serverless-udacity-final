import { createLogger } from '../utils/logger'
import { CreateProjectRequest } from '../requests/CreateProjectRequest'
import { ProjectAccess } from '../lambda/dbAccess/projectAccess'
import { Project } from '../models/Project'
import { ToDoAccess } from '../lambda/dbAccess/todosAccess'

const projectAccess = new ProjectAccess()
const todoAccess = new ToDoAccess()

const logger = createLogger('ProjectService')

export async function createProject(
  createProjectRequest: CreateProjectRequest,
  userId: string
): Promise<Project> {
  logger.info(userId)

  const createdAt = new Date().toISOString()
  return projectAccess.createProject({
    hashK: userId,
    rangeK: generateProjectRangeKey(createdAt),
    createdAt: createdAt,
    name: createProjectRequest.name,
    description: createProjectRequest.description
  })
}

export async function getAllProjects(
  userId: string,
  orderField: string
): Promise<Project[]> {
  let projects = null

  if (orderField == 'name') {
    projects = await projectAccess.getAllProjectsOrderByName(userId)
  } else {
    projects = await projectAccess.getAllProjects(userId)
  }
  return projects
}

export async function deleteProjectWithToDos(
  userId: string,
  projectCreatedAt: string
) {
  const toDoItems = await todoAccess.getToDosForProject(
    userId,
    projectCreatedAt
  )
  if (toDoItems.length > 0) {
    await toDoItems.forEach((todoItem) => {
      logger.info(
        'delete todo with hashK  = ' +
          todoItem.hashK +
          ' rangeK = ' +
          todoItem.rangeK
      )
      todoAccess.deleteToDoItem(todoItem.hashK, todoItem.rangeK)
    })
  }
  await projectAccess.deleteProject(
    userId,
    generateProjectRangeKey(projectCreatedAt)
  )
}

export async function updateProject(
  projectCreatedAt: string,
  userId: string,
  createProjectRequest: CreateProjectRequest
): Promise<Project> {
  logger.info('update project with projectCreatedAt ' + projectCreatedAt)

  return projectAccess.updateProject(
    userId,
    generateProjectRangeKey(projectCreatedAt),
    {
      name: createProjectRequest.name,
      description: createProjectRequest.description
    }
  )
}

function generateProjectRangeKey(createdAt: string): string {
  return 'Project#' + createdAt
}
