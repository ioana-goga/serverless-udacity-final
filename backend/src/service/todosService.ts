import { TodoItem } from '../models/TodoItem'
import { CreateTodoRequest } from '../requests/CreateTodoRequest'
import { ToDoAccess } from '../lambda/dbAccess/todosAccess'
import { createLogger } from '../utils/logger'
import { UpdateTodoRequest } from '../requests/UpdateTodoRequest'
import { generateToDoHashKey, generateToDoRangeKey } from './KeyUtils'

const toDoAccess = new ToDoAccess()

const logger = createLogger('ToDoService')

export async function getToDosForProject(
  userId: string,
  projectCreatedAt: string
): Promise<TodoItem[]> {
  logger.info(userId)
  return toDoAccess.getToDosForProject(userId, projectCreatedAt)
}

export async function createToDo(
  createToDoRequest: CreateTodoRequest,
  userId: string
): Promise<TodoItem> {
  logger.info(userId)

  const createdAt = new Date().toISOString()
  return toDoAccess.createToDo({
    hashK: generateToDoHashKey(userId, createToDoRequest.projectCreatedAt),
    rangeK: generateToDoRangeKey(createdAt),
    createdAt: createdAt,
    name: createToDoRequest.name,
    dueDate: createToDoRequest.dueDate,
    done: false
  })
}

export async function updateToDo(
  projectCreatedAt: string,
  todoCreatedAt: string,
  userId: string,
  updateTodoRequest: UpdateTodoRequest
): Promise<TodoItem> {
  logger.info(
    'update to do with hashK ' +
      projectCreatedAt +
      ' todoCreatedAt = ' +
      todoCreatedAt
  )

  return toDoAccess.updateToDo(
    generateToDoHashKey(userId, projectCreatedAt),
    generateToDoRangeKey(todoCreatedAt),
    {
      name: updateTodoRequest.name,
      dueDate: updateTodoRequest.dueDate,
      done: updateTodoRequest.done
    }
  )
}

export async function deleteToDoItem(
  projectCreatedAt: string,
  todoCreatedAt: string,
  userId: string
): Promise<Boolean> {
  logger.info(
    'delete to do  projectCreatedAt ' +
      projectCreatedAt +
      ' todoCreatedAt = ' +
      todoCreatedAt
  )

  return toDoAccess.deleteToDoItem(
    generateToDoHashKey(userId, projectCreatedAt),
    generateToDoRangeKey(todoCreatedAt)
  )
}


