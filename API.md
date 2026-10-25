# Global AI Impact Dashboard API And Forms

This project is primarily a Vite/React static dashboard hosted on Netlify.

## Netlify Forms

### job-risk-updates

Collects newsletter and role-risk update requests.

Fields:

- `email`
- `role`
- `country`
- `source_url`
- `created_at`

### analytics-events

Captures lightweight product analytics events from the dashboard.

Fields:

- `event_type`
- `visitor_id`
- `payload`
- `path`
- `created_at`

## Health

`GET /health`

Returns a lightweight service status when the Netlify function is enabled.

```json
{
  "status": "ok",
  "service": "global-ai-impact-dashboard"
}
```

## Notes

Do not store API keys, scraped personal data, or proprietary job-posting exports in this repository.
