# webhook-router
Uses [smee](https://github.com/probot/smee) to forward webhooks to services not exposed to the open internet.

---

## Setup Webhook Router
Tested with Node 8.x.

### Config
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

#### Jenkins Authentication
In order for webhook router to have permission to view Jenkins `jobs` and forward webhooks, we would need to include a username and password in the target url, or setup another kind of authentication. 

##### Using Generic Webhook Trigger Plugin:
```yaml
targets:
- http://user:password@jenkins.internal.com:8080/generic-webhook-trigger/invoke/
```
The `user` and `password` is your jenkins user and jenkins user password with the appropriate permissions.
**More on how to setup Jenkins with Generic Webhook Trigger Plugin below.**

---

## Installation

### Directly
`npm install && node index.js`

### Docker
`docker run -v /tmp/hooks.yml:/etc/webhooks/config.yaml:ro evenh/webhook-router`

### Setup Webhook Router service (WINDOWS)
Prequsites: [Nodejs (with npm)](https://nodejs.org/en/)

#### Open command prompt
We need to run cmd as administrator.  
![](https://i.imgur.com/rJqDm4f.png)

#### Navigate to the app folder
Go to the D drive: `D:`  
Navigate to the folder: `cd D:\tools\webhook-router\`

#### Install node-windows
node-windows is need in order to easily setup node apps as services on Windows.

##### Install node-windows globally
`npm install -g node-windows`  
> If it already has been previously installed, it will simply update it.

`npm link node-windows`  
> For this to work, you need to be in the same folder as the node app you wish to install.  

![](https://i.imgur.com/AwqSr8y.png)

#### Install Webhook Router as a service
In order to install (or uninstall) the Webhook Router as a service, we need to create two javascript files. _Change the variables as needed_

> Recommend you put them in the same directory as the app.

**install-service.js**
```javascript
var Service = require('node-windows').Service;

// Create a new service object
var svc = new Service({
  name:'Webhook Router',
  description: 'Forward webhooks to services not exposed to the open internet.',
  script: 'D:\\tools\\webhook-router\\index.js',
  nodeOptions: [
    '--harmony',
    '--max_old_space_size=4096'
  ]
});

// Listen for the "install" event, which indicates the
// process is available as a service.
svc.on('install',function(){
  svc.start();
});

svc.install();
```

**uninstall-service.js**
```javascript
var Service = require('node-windows').Service;

// Create a new service object
var svc = new Service({
  name:'Webhook Router',
  script: 'D:\\tools\\webhook-router\\index.js')
});

// Listen for the "uninstall" event so we know when it's done.
svc.on('uninstall',function(){
  console.log('Uninstall complete.');
  console.log('The service exists: ',svc.exists);
});

// Uninstall the service.
svc.uninstall();
```

##### Install the service
`node install-service.js`

You can uninstall in a similar manner, simply by replacing `install-service.js` with `uninstall-service.js`.

If you check your services, you should now be able to find it in the list.   
![](https://i.imgur.com/zoYc67s.png)
> You can read more on https://github.com/coreybutler/node-windows for how to setup node-windows and install services on different OS.

-----

## Setup Jenkins to receive webhooks
### Prequisites
- Setup the Github repository to forward webhooks to Smee.
- Setup webhook router to forward (`targets`) the jenkins server.

### Create a Jenkins user for the Webhook Router
We need a jenkins user that have permission to view jobs and send webhooks. Otherwise Webhook Proxy will be unable to find any jenkins jobs. Alternatively you can assign `Tokens` and use that instead.

#### Generic Webhook Trigger Plugin
In order to receive webhooks, we can use the [Generic webhook Trigger Plugin](https://wiki.jenkins.io/display/JENKINS/Generic+Webhook+Trigger+Plugin).

Install it, and navigate to a Job you wish to enable webhook in. Check `Generic Webhook Trigger`.
![](https://i.imgur.com/oK0OjDo.png)
