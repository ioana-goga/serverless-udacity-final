import { APIGatewayProxyEvent } from 'aws-lambda'
import { decode } from 'jsonwebtoken'
import { JwtToken } from './JwtToken'

/**
 * Parse a JWT token and return a user id
 * @param jwtToken JWT token to parse
 * @returns a user id from the JWT token
 */
export function getUserId(jwtToken: string): string {
  const decodedJwt = decode(jwtToken) as JwtToken
  return decodedJwt.sub
}

export function omitUserId(key, value) {
  // Filtering out userId
  if (key === 'userId') {
    return undefined
  }
  return value
}

export function getUserIdFromGatewayEvent(event: APIGatewayProxyEvent) {
  // Filtering out userId
  const authorization = event.headers.Authorization
  const split = authorization.split(' ')
  const jwtToken = split[1]
  return getUserId(jwtToken)
}
