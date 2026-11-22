import { S3Client, PutObjectCommand, DeleteObjectCommand, HeadObjectCommand, CopyObjectCommand, ListObjectsV2Command } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import mime from "mime";

let _client: S3Client | null = null;

function client(): S3Client {
     _client ??= new S3Client({
          region: "auto",
          endpoint: process.env.R2_ENDPOINT!,
          credentials: {
               accessKeyId: process.env.R2_ACCESS_KEY_ID!,
               secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!
          },
          requestChecksumCalculation: "WHEN_REQUIRED",
          responseChecksumValidation: "WHEN_REQUIRED"
     });

     return _client;
}

function bucket(): string {
     return process.env.R2_BUCKET!;
}

export async function getSignedURL(key: string): Promise<string> {
     const command = new PutObjectCommand({
          Bucket: bucket(),
          Key: key,
          ContentType: mime.getType(key) || "application/octet-stream"
     });

     return await getSignedUrl(client(), command, { expiresIn: 120 });
}

export async function uploadFile(body: ArrayBuffer | Uint8Array | Blob, destination: string) {
     let bytes: Uint8Array;

     if (body instanceof Uint8Array) {
          bytes = body;
     } else if (body instanceof Blob) {
          bytes = new Uint8Array(await body.arrayBuffer());
     } else {
          bytes = new Uint8Array(body);
     }

     return await client().send(new PutObjectCommand({
          Bucket: bucket(),
          Key: destination,
          Body: bytes,
          ContentType: mime.getType(destination) || "application/octet-stream"
     }));
}

export async function deleteFile(key: string) {
     return await client().send(new DeleteObjectCommand({
          Bucket: bucket(),
          Key: key
     }));
}

export async function getFileMetadata(key: string) {
     return await client().send(new HeadObjectCommand({
          Bucket: bucket(),
          Key: key
     }));
}

export async function deleteFolder(prefix: string) {
     let token: string | undefined;

     do {
          const page = await client().send(new ListObjectsV2Command({
               Bucket: bucket(),
               Prefix: prefix,
               ContinuationToken: token
          }));

          for (const object of page.Contents ?? []) {
               if (object.Key) await deleteFile(object.Key);
          }

          token = page.IsTruncated ? page.NextContinuationToken : undefined;
     } while (token);
}

export async function moveFile(from: string, to: string) {
     if (from === to) return;

     await client().send(new CopyObjectCommand({
          Bucket: bucket(),
          CopySource: `${bucket()}/${from.split("/").map(encodeURIComponent).join("/")}`,
          Key: to
     }));

     await deleteFile(from);
}
