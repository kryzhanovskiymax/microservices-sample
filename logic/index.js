const amqplib = require('amqplib');
const { request, reply } = require('amqplib-rpc');

const PORT = 8484;
const QUEUE_NAME = 'link';

const start = async () => {
    try {
        queue = QUEUE_NAME;
        const connection = await amqplib.connect('amqp://localhost');
        const consumerChannel = await connection.createChannel();
        const publisherChannel = await connection.createChannel();
        console.log('server is started');
        consumerChannel.consume(QUEUE_NAME, async (msg) => {
            console.log(msg.content.toString());
            reply(publisherChannel, msg, 'Hello, ' + msg.content.toString(), {});
            consumerChannel.ack(msg)
        });
        
    } catch(e) {
        console.log(e);
    }
}

start();