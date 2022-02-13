# Image uploader

Paste from clipboard to any S3 bucket, very wow!


# Setup

Create `src/config.js` that looks like this

```
export const config = {
    bucketName: "your bucket name",
    region: "region",
    accessKeyId: "access key",
    secretAccessKey: "secret key"
}
```

run `npm run start` and you are done. Paste an image and click go baby.

URL gets copied to your clipboard
