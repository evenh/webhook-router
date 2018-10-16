# webhook-router

Uses [smee](https://github.com/probot/smee) to forward webhooks to services not exposed to the open internet.

## Installation

Tested with Node 8.x.

### Directly
`npm install && node index.js`

### Docker
`docker run -v /tmp/hooks.yml:/etc/webhooks/config.yaml:ro evenh/webhook-router`

## Config

The server looks for `/etc/webhooks/config.yaml` by default. This can be overridden: `WEBHOOK_CONFIG=/tmp/hooks.yaml`

Format:
```yaml
- name: Foo
  sources:
    - https://hooks.example.com/foo
  targets:
    - http://jenkins.internal.corp/github-webhook/
- name: Bar
  sources:
    - https://hooks.example.com/bar
    - https://hooks.example.com/baz
  targets:
    - http://my-server.internal.corp/webhooks
```