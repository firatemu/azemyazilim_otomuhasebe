---
name: ffuf-web-fuzzing
description: Integrates ffuf web fuzzer for vulnerability analysis and endpoint discovery.
---

# FFUF Web Fuzzing

Guidance for using FFUF (Fuzz Faster U Fool) to discover endpoints and vulnerabilities.

## Common Operations
- **Directory Discovery**: Find hidden files and directories.
- **Parameter Fuzzing**: Discover hidden GET/POST parameters.
- **Vulnerability Scanning**: Test for common injection points.

## Command Pattern
```bash
ffuf -u https://example.com/FUZZ -w /path/to/wordlist
```

## Strategy
1. **Choose Wordlist**: Select appropriate list (SecLists recommended).
2. **Filter Results**: Use `-mc` (match code) or `-fc` (filter code) to hide noise (e.g., 404s).
3. **Analyze**: Review responses for unusual sizes or status codes.

## Safety Note
- ONLY run on authorized systems.
- Be mindful of rate limits to avoid crashing targets.
