export function generateToDoHashKey(
  userId: string,
  projectCreatedAt: string
): string {
  return userId + '#' + projectCreatedAt
}
export function generateToDoRangeKey(createdAt: string): string {
  return 'Todo#' + createdAt
}
