## Email Service

### Google Cloud Storage configuration

The email service can store attachments in Google Cloud Storage when enabled
and a bucket name is provided. Configure the `GoogleCloudStorage` section in
`appsettings.json` or via environment variables:

```json
"GoogleCloudStorage": {
  "Enabled": true,
  "BucketName": "your-bucket-name",
  "CredentialsPath": "/path/to/service-account.json"
}
```

If `CredentialsPath` is omitted, the service will rely on the default Google
Cloud credentials (for example, through the `GOOGLE_APPLICATION_CREDENTIALS`
environment variable). When `Enabled` is false or `BucketName` is empty,
attachments are stored locally.

