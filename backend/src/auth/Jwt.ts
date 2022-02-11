import { JwtHeader } from 'jsonwebtoken'
import { JwtToken } from './JwtToken'

/**
 * Interface representing a JWT token
 */
export interface Jwt {
  header: JwtHeader
  payload: JwtToken
}
