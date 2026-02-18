---
name: aws-skills
description: AWS development with CDK best practices, cost optimization, and serverless architecture patterns.
---

# AWS Development Skill

Best practices and patterns for Amazon Web Services.

## Core Focus
- **CDK (Cloud Development Kit)**: Infrastructure as Code (IaC) best practices.
- **Serverless**: Lambda, API Gateway, DynamoDB patterns.
- **Cost Optimization**: Right-sizing resources and reducing idle costs.
- **Event-Driven**: SQS, SNS, EventBridge architectures.

## Guidelines
- Favor higher-level constructs (L2/L3) in CDK.
- Follow the principle of least privilege for IAM roles.
- Use environment variables for configuration, not hardcoded secrets (use Secrets Manager).
- Implement tracing with AWS X-Ray for distributed systems.
