const amqp = require('amqplib')
const uuidv1 = require('uuid/v1')

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

    setInterval(() =>{
      ch.publish(exchange, 'log.error', Buffer.from('M \n' + uuidv1() + '\n'), { persistent: true, deliveryMode: 2, type: 'topic' })
      console.log('Publish log.error')
    }, 2000)

    setInterval(() => {
      ch.publish(exchange, 'new.topic', Buffer.from('M \n' + uuidv1() + '\n'), { persistent: true, deliveryMode: 2, type: 'topic' })
      console.log('Pubish DEAD')
    }, 1000)
  })


