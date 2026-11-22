import { getCloudflareContext } from "@opennextjs/cloudflare";

const bucket = () => getCloudflareContext().env.BUCKET;

/*async function getR2Client() {
     const client = new S3Client({
          region: "auto",
          endpoint: process.env.R2_ENDPOINT!,
          credentials: {
               accessKeyId: process.env.R2_ACCESS_KEY_ID!,
               secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!
          }
     });
     
     return { client };
}

export async function getSignedURL(key: string): Promise<string> {
     const { client } = await getR2Client();
     
     const command = new PutObjectCommand({
          Bucket: process.env.R2_BUCKET!,
          Key: key,
          ContentType: mime.getType(key) || "application/octet-stream"
     });
     
     return await getSignedUrl(client, command, { expiresIn: 120 });
}

export async function uploadFile(source: string, destination: string): Promise<any> {
     const { client } = await getR2Client();
     
     const stream = fs.createReadStream(source);
     
     const result = await client.send(new PutObjectCommand({
          Bucket: process.env.R2_BUCKET!,
          Key: destination,  
          Body: stream,
          ContentType: mime.getType(source) ?? ""
     }));
     
     return result;
}

export async function deleteFile(key: string): Promise<any> {
     const { client } = await getR2Client();
     
     const result = await client.send(new DeleteObjectCommand({
          Bucket: process.env.R2_BUCKET!,
          Key: key
     }));
     
     return result;
}

export async function getFileMetadata(key: string): Promise<any> {
     const { client } = await getR2Client();
     
     const result = await client.send(new HeadObjectCommand({
          Bucket: process.env.R2_BUCKET!,
          Key: key
     }));
     
     return result;
}*/