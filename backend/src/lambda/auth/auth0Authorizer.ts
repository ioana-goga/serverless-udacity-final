import { CustomAuthorizerEvent, CustomAuthorizerResult } from 'aws-lambda'
import 'source-map-support/register'

import { verify } from 'jsonwebtoken'
import { JwtToken } from '../../auth/JwtToken'

const cert = `-----BEGIN CERTIFICATE-----
MIIDDTCCAfWgAwIBAgIJEq8LNCeUKtctMA0GCSqGSIb3DQEBCwUAMCQxIjAgBgNV
BAMTGWRldi0zcXlud21rZS51cy5hdXRoMC5jb20wHhcNMjIwMjA0MDgyNjM0WhcN
MzUxMDE0MDgyNjM0WjAkMSIwIAYDVQQDExlkZXYtM3F5bndta2UudXMuYXV0aDAu
Y29tMIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAl0pfZIhbL+4f44fx
FWaP0Fsu4RN6Wh/eaCf3Gajj25SP8phDDl2brhn1R4t8MQ8jpGaZWpZqn3/5BPfw
WQMBpYgHAj1A1ub58JitxRU6ijSOdLMJnXTNup4HGVxIT+024UZeEGO6G6VQr0QZ
ED0/X4tPS7TpLwB1AoqiXLUDxnbxiA7MN+QPpyOwrgTjdio7GsH+dqa3JERvHjTA
KrshdnGPrSKVolrGtNDhcL3/XOQTFlYktMOaO8Jv368JP01Mp9q2TF5eJO/OD3w5
yuh2+BXdWCP0tj31LtX1QenD72Y+QsblhaxCeXzcgJfU3p1cFv37RVTp9rFFvmQF
f1SYowIDAQABo0IwQDAPBgNVHRMBAf8EBTADAQH/MB0GA1UdDgQWBBSgy2IUWIxN
1kFEWpPwhj+odjgbojAOBgNVHQ8BAf8EBAMCAoQwDQYJKoZIhvcNAQELBQADggEB
ADEnc8vmPIQg5E/ar/UrtwNsUbftICA0dY8YncwLlWRCbMpdMgsZi95d6uXFdNe9
bOC8heVmqUTaoAKws1YfU2p+6szKpswk+2BmSJHJZVOSRV6a0prw/vsT+DTvlZsQ
SFjHw3S/REnV0tNScl7q8MBdWElx1pcmtXbfrwyA7qcWjyVtUURwFTRIDUjNhLjB
Zae3nRgIAJBYBa7MdGQjYihPSr++fDHA/fQ+s2UT1I/5r9B7IM8s0Q2kfB9gLv7l
fkTqADOeiFpYisP1uC4VjdLknW9aXm64uBXCKNDvAT7WWvDMOm9hGGtSbfylL6/3
xz2zgADQe55ay81OYcnkhk4=
-----END CERTIFICATE-----`

export const handler = async (
  event: CustomAuthorizerEvent
): Promise<CustomAuthorizerResult> => {
  try {
    const jwtToken = verifyToken(event.authorizationToken)
    console.log('User was authorized', jwtToken)

    return {
      principalId: jwtToken.sub,
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'Allow',
            Resource: '*'
          }
        ]
      }
    }
  } catch (e) {
    console.log('User authorized', e.message)

    return {
      principalId: 'user',
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'Deny',
            Resource: '*'
          }
        ]
      }
    }
  }
}

function verifyToken(authHeader: string): JwtToken {
  if (!authHeader) throw new Error('No authentication header')

  if (!authHeader.toLowerCase().startsWith('bearer '))
    throw new Error('Invalid authentication header')

  const split = authHeader.split(' ')
  const token = split[1]

  return verify(token, cert, { algorithms: ['RS256'] }) as JwtToken
}
