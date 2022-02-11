import { TodoItem } from '../models/TodoItem'
import { CreateTodoRequest } from '../requests/CreateTodoRequest'
import * as uuid from 'uuid'
import { ToDoAccess } from '../lambda/dbAccess/todosAccess'
import { createLogger } from '../utils/logger'
import { UpdateTodoRequest } from '../requests/UpdateTodoRequest'

const toDoAccess = new ToDoAccess()

const logger = createLogger('ToDos')

export async function getAllToDos(userId: string): Promise<TodoItem[]> {
  logger.info(userId)
  return toDoAccess.getAllToDos(userId)
}

export async function createToDo(
  createToDoRequest: CreateTodoRequest,
  userId: string
): Promise<TodoItem> {
  logger.info(userId)

  const idV = uuid.v4()

  return toDoAccess.createToDo({
    userId: userId,
    todoId: idV,
    createdAt: new Date().toISOString(),
    name: createToDoRequest.name,
    dueDate: createToDoRequest.dueDate,
    done: false
  })
}

export async function updateToDo(
  toDoId: string,
  updateTodoRequest: UpdateTodoRequest,
  userId: string
): Promise<TodoItem> {
  logger.info('update to do with id ' + toDoId)
  logger.info('new values ' + JSON.stringify(updateTodoRequest))
  logger.info(userId)
  const toDoExists = await toDoAccess.toDoExists(toDoId, userId)

  if (toDoExists) {
    return await toDoAccess.updateToDo(toDoId, userId, {
      name: updateTodoRequest.name,
      dueDate: updateTodoRequest.dueDate,
      done: updateTodoRequest.done,

      userId: userId
    })
  } else {
    throw new Error(
      'ToDoItem to update does not exist in the database. To do item id = ' +
        toDoId
    )
  }
}

export async function deleteToDoItem(
  toDoId: string,
  userId: string
): Promise<Boolean> {
  logger.info('delete to do with id ' + toDoId + ' for user  Id = ' + userId)
  const toDoExists = await toDoAccess.toDoExists(toDoId, userId)

  if (toDoExists) {
    return await toDoAccess.deleteToDoItem(userId, toDoId)
  } else {
    throw new Error(
      'ToDoItem to delete does not exist in the database. To do item id = ' +
        toDoId +
        ' for user  Id = ' +
        userId
    )
  }
}
