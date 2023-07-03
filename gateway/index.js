const amqplib = require('amqplib');
const { createClient } = require('redis');
const express = require('express');
const {request } = require('amqplib-rpc')

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
        const greeting = await getGreeting(login, CONNECTION);
        console.log(`processed ${greeting}`);
        return res.status(200).json({
            message: 'hi' + ' ' + greeting
        });
    } catch(e) {
        return res.status(400).json({
            error: e.message
        })
    }
});

const start = async () => {
    try {
        const connection = await amqplib.connect('amqp://localhost');
        const channel = await connection.createChannel()
        await channel.assertQueue(QUEUE_NAME + '.request');
        await channel.assertQueue(QUEUE_NAME + '.response');
        CHANNEL = channel;
        CONNECTION = connection;

        await redisClient.connect()
        app.listen(PORT, () => {
            console.log(`gateway is listening PORT ${PORT}`);
        })
    } catch(e) {
        console.log(e);
    }

}

start();