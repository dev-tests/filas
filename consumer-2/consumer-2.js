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
    ch.assertExchange(exchange, 'topic', { durable: true })

    const q = await ch.assertQueue('log_error_sec')

    const routingKey = 'log.#'

    ch.bindQueue(q.queue, exchange, routingKey)
    console.log(' [x] Binded %s', routingKey)

    ch.consume(q.queue, (msg) => {
      if (msg !== null) {
        console.log('%s [x] %s [%s]', Date.now(), msg.content.toString(), msg.fields.routingKey)
        ch.ack(msg)
      }
    })
  })