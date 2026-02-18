---
name: Connect
description: Connect Claude to any app via Composio. Send emails, create issues, post messages, update databases across 1000+ services.
---

# Connect (Composio Integration)

Enable Claude to interact with 1000+ external applications using the Composio platform.

## What it enables
- **Communication**: Send emails (Gmail/Outlook), Slack messages, Discord notifications.
- **Productivity**: Create Notion pages, update Google Sheets, manage Trello boards.
- **Development**: Create GitHub issues, trigger CI/CD pipelines, update Jira tickets.
- **Data**: Update external databases, fetch CRM data (Salesforce/HubSpot).

## Setup Requirement
- Requires a Composio API key and the `composio-core` library.
- Use `pip install composio-core` and run `composio login`.

## Usage Pattern
- When asked to perform an action on an external app, first identify if the app is supported by Composio.
- Recommend using standard tool invocations if the appropriate MCP server is installed.
