const amqp = require('amqplib')
const uuidv1 = require('uuid/v1')

async function createConnection(uri = 'guest:guest@localhost:5672') {
  const connection = await amqp.connect('amqp://' + uri)
  return connection
}

createConnection()
  .then(conn => conn.createChannel())
  .then(ch => {
    console.log('Channel created!')

    const exchange = 'logs'

    ch.assertExchange(exchange, 'topic', { durable: true })
    setInterval(() => {
      ch.publish(exchange, 'log.warn', Buffer.from('M \n' + uuidv1() + '\n'), { persistent: true, deliveryMode: 2, type: 'topic' })
      console.log('Pubish log.warn')
    }, 2000)

  })

// docker run -p 15672:15672 --rm -d --hostname rabbit --name communication-m rabbitmq:3-management

/**
 *  exchange_name = 'user_updates'
 *  queue?
 *  routing_key   = 'user.profile.update'
 *  exchange_type = topic
 *
 */