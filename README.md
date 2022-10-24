# garmin-report

A python, react, and nextjs application that creates visualizations with garmin data via [python-garminconnect](https://github.com/cyberjunky/python-garminconnect).

## About

This application:

- Runs an hourly cron job via a github actions workflow that calls a vercel python serverless function, which fetches garmin data and pushes it to S3.
- Uses nextjs `getServerSideProps` to call another vercel python serverless function that retrieves the current garmin data stored in S3.
- Renders the garmin data via react components.

## Environment Variables

In the `.env`:

```
GARMIN_USERNAME="..."
GARMIN_PASSWORD="..."

S3_AWS_ACCESS_KEY_ID="..."
S3_AWS_SECRET_ACCESS_KEY="..."
S3_BUCKET_NAME="..."

API_KEY="..."
```
