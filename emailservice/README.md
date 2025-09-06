## Email Service

### Google Cloud Storage configuration

The email service can store attachments in Google Cloud Storage when a bucket is
specified. Configure the storage section in `appsettings.json` or via
environment variables:

```json
"Storage": {
  "Bucket": "your-bucket-name",
  "CredentialsPath": "/path/to/service-account.json"
}
```

If `CredentialsPath` is omitted, the service will rely on the default Google
Cloud credentials (for example, through the `GOOGLE_APPLICATION_CREDENTIALS`
environment variable). When `Bucket` is empty, attachments are stored locally.

