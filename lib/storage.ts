import { S3Client, PutObjectCommand, DeleteObjectCommand, HeadObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import fs from "fs";
import mime from "mime";

import getEnvironmentVariables from "@/lib/variables";

async function getR2Client() {
     const env = await getEnvironmentVariables();
     
     const client = new S3Client({
          region: "auto",
          endpoint: env.R2_ENDPOINT!,
          credentials: {
               accessKeyId: env.R2_ACCESS_KEY_ID!,
               secretAccessKey: env.R2_SECRET_ACCESS_KEY!
          }
     });
     
     return { client, env };
}

export async function getSignedURL(key: string): Promise<string> {
     const { client, env } = await getR2Client();
     
     const command = new PutObjectCommand({
          Bucket: env.R2_BUCKET!,
          Key: key,
          ContentType: mime.getType(key) || "application/octet-stream"
     });
     
     return await getSignedUrl(client, command, { expiresIn: 120 });
}

export async function uploadFile(source: string, destination: string): Promise<any> {
     const { client, env } = await getR2Client();
     
     const stream = fs.createReadStream(source);
     
     const result = await client.send(new PutObjectCommand({
          Bucket: env.R2_BUCKET!,
          Key: destination,  
          Body: stream,
          ContentType: mime.getType(source) ?? ""
     }));
     
     return result;
}

export async function deleteFile(key: string): Promise<any> {
     const { client, env } = await getR2Client();
     
     const result = await client.send(new DeleteObjectCommand({
          Bucket: env.R2_BUCKET!,
          Key: key
     }));
     
     return result;
}

export async function getFileMetadata(key: string): Promise<any> {
     const { client, env } = await getR2Client();
     
     const result = await client.send(new HeadObjectCommand({
          Bucket: env.R2_BUCKET!,
          Key: key
     }));
     
     return result;
}