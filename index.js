const yaml = require('js-yaml');
const fs = require('fs');
const path = require('path');
const SmeeClient = require('smee-client');
const onDeath = require('death');

const configFile = process.env.WEBHOOK_CONFIG || path.join('etc','webhooks','config.yaml');
const config = yaml.safeLoad(fs.readFileSync(configFile, 'utf8'));

var clients = [];

config.forEach(el => {
    console.info("Configuring: " + el.name);

    el.sources.forEach(source => {
        el.targets.forEach(target => {
            const client = new SmeeClient({ source, target });
            const events = client.start();
            clients.push(events);
        })
    })
});

onDeath((signal) => {
    console.log('Received signal: ' + signal + ". Terminating...");
    clients.forEach(client => {
        client.close();
    });

    process.exit();
});