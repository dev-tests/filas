// SERVIÇO SECUNDÁRIO


const amqp = require('amqplib')

async function createConnection(uri = 'guest:guest@localhost:5672') {
    const connection = await amqp.connect('amqp://' + uri)
    return connection
}

createConnection()
    .then(async conn => {
        const ch = await conn.createChannel()

        console.log('Channel created!')

        const exchange = 'logs'

        ch.assertExchange(exchange, 'topic', { durable: true, alternateExchange: 'dead' })

        const q = await ch.assertQueue('log_error', { deadLetterExchange: 'dead' })

        const routingKey = 'log.error'

        ch.bindQueue(q.queue, exchange, routingKey)
        console.log(' [x] Binded %s', routingKey)

        ch.consume(q.queue, (msg) => {
            if (msg !== null) {
                console.log('%s [x] %s [%s]', Date.now(), msg.content.toString(), msg.fields.routingKey)
                ch.reject(msg, false)
            }
        })

        const ch2 = await conn.createChannel()
        ch2.assertExchange('dead', 'topic', { durable: true })

        const deadQueue = 'deadQ'
        const queue2 = await ch2.assertQueue(deadQueue)

        ch2.bindQueue(queue2.queue, 'empty', 'dead')
        ch2.consume(deadQueue, (msg) => {
            if (msg !== null) {
                console.log('DEAD')
                ch2.ack(msg)
            }
        })
    })
