const amqplib = require('amqplib');
const { createClient } = require('redis');
const express = require('express');
const { request } = require('amqplib-rpc');
const config = require('config');

const app = express() ;
const redisClient = createClient();
const PORT = 4848;

const QUEUE_NAME = 'link';
let CHANNEL;
let CONNECTION;

const getGreeting = async (msg, connection) => {
    let res;
    res = await request(connection, QUEUE_NAME, msg);
    console.log(res.content.toString());
    return res.content.toString();
}

app.get("/:login", async (req, res) => {
    try {
        const login = req.params['login'];
        console.log(`processing ${login}`);
        let value = await redisClient.get(login);
        if (!value) {
            value = await getGreeting(login, CONNECTION);
            await redisClient.set(login, value + ' cached');
        }
        console.log(`processed ${value}`);
        return res.status(200).json({
            message: value
        });
    } catch(e) {
        return res.status(400).json({
            error: e.message
        })
    }
});

const start = async () => {
    try {
        const connection = await amqplib.connect(config.get('AMQP_URL'));
        CHANNEL = channel;
        CONNECTION = connection;

        await redisClient.connect(config.get('REDIS_URL'))
        app.listen(PORT, () => {
            console.log(`gateway is listening PORT ${PORT}`);
        })
    } catch(e) {
        console.log(e);
    }

}

start();