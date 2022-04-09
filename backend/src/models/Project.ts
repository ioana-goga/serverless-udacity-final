import { TodoItem } from './TodoItem'

export interface Project {
  rangeK: string
  hashK: string
  createdAt: string
  name: string
  description: string
  toDoItems?: TodoItem[]
}
