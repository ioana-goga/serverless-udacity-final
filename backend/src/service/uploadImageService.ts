import * as AWS from 'aws-sdk'
const AWSXRay = require('aws-xray-sdk')

const bucketName = process.env.ATTACHMENT_S3_BUCKET
const urlExpiration = +process.env.SIGNED_URL_EXPIRATION

const XAWS = AWSXRay.captureAWS(AWS)

const s3 = new XAWS.S3({
  signatureVersion: 'v4'
})

export function getUploadUrl(toDoId: string) {
  return s3.getSignedUrl('putObject', {
    Bucket: bucketName,
    Key: toDoId,
    Expires: urlExpiration
  })
}
