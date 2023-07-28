const amqplib = require('amqplib');
const { request, reply } = require('amqplib-rpc');
const mongoose = require('mongoose');
const User = require('./User');
const config = require('config');

const PORT = 8484;
const QUEUE_NAME = 'link';

const createUser = async (user) => {
    const exists = await User.findOne({login: user});
    if (!exists) {
        const newUser = new User({ login: user });
        await newUser.save();
        return {
            message: "Пользователь успешно создан"
        }
    } else {
        return {
            message: "Пользователь уже существует"
        }
    }
}


const start = async () => {
    try {
        const clusterUrl = config.get('DATABASE_URL');
        mongoose.set('strictQuery', true);
        await mongoose.connect(clusterUrl, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });

        console.log('connected to databse succesfully');

        queue = QUEUE_NAME;
        const connection = await amqplib.connect(config.get('AMQP_URL'));
        const consumerChannel = await connection.createChannel();
        const publisherChannel = await connection.createChannel();
        console.log('server is started');
        consumerChannel.consume(QUEUE_NAME, async (msg) => {
            const user = msg.content.toString();
            const exists = await User.findOne({login: user});
            if (!exists) {
                const newUser = new User({ login: user });
                await newUser.save();
                console.log('User added to DataBase');
            }
            console.log(user);
            reply(publisherChannel, msg, 'Hello, ' + msg.content.toString(), {});
            consumerChannel.ack(msg)
        });
        
    } catch(e) {
        console.log(e);
    }
}

start();