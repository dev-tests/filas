const amqp = require('amqplib/callback_api') //  importação da biblioteca amqplib
const { EventEmitter } = require('events')
const uuid = require('uuid')

const open = require('amqplib').connect('amqp://localhost:5672')

const listenEvent = new EventEmitter()


/**
 * Implementação de RabbitMQ como Worker
 */

// amqp.connect('amqp://localhost:5672', function (err, conn) { // Conexão com o RabbitMQ
//     conn.createChannel(function (err, ch) { // Criação de um novo canal
//         const nomeDoCanal = 'hello' // nome do canal
//         const msg = 'Hello World 123!';

//         ch.assertQueue(nomeDoCanal, { durable: false }) // passando o nome da fila para conexão do RabbitMQ
//         ch.sendToQueue(nomeDoCanal, Buffer.from(msg)) // O RabbitMQ trabalha com Buffer, estou passando a msg para ele e para qual fila ela deve ser enviada

//         listenEvent.on('arroz', (message) => {
//           ch.sendToQueue(nomeDoCanal, Buffer.from(message))
//         })

//         console.log(" [x] Sent %s", msg);

//         for (let i = 0; i < 200000; i++) {
//           listenEvent.emit('arroz', i.toString())
//           if (i == 150000) console.log(i)
//         }

//     });

//     setTimeout(function () { conn.close(); process.exit(0) }, 500);
// });

/** 
 * Implementação RabbitMQ com Publish e subscribe 
 */

// amqp.connect('amqp://localhost:5672', function (err, conn) {

//   conn.createChannel(function (err, ch) {
//       const nomeDoCanal = 'pub_sub_meetup28'
//       const msg = 'Hello World!'

//       ch.assertExchange(nomeDoCanal, 'fanout', { durable: false });
//       ch.publish(nomeDoCanal, '', Buffer.from(msg));
//       console.log(" [x] Sent %s", msg);
//   });

//   setTimeout(function () { conn.close(); process.exit(0) }, 500);


// })

/**
 * Implementação de Fila RabbitMQ com promise
 * OBS: Após reiniciado um server, itens da fila são direcionados para o outro ouvinte
 * aparentemente é necessário remover o item da fila
 */ 


// let ch
// open.then(conn => conn.createChannel().then(ch_ => ch = ch_))
 
// const sendMessageTo = async (q, msg) => {
//   if (typeof msg !== 'string') msg = msg.toString()
//   await ch.assertQueue(q)
//   await ch.sendToQueue(q, Buffer.from(msg))
// }

// setTimeout(() => {
//   sendMessageTo('arroz', 3500)
//   console.log('arroz')
// }, 3000)

const id = 321

amqp.connect('amqp://localhost:5672', (err, conn) => {

    conn.createChannel((err, ch) => {
        ch.assertQueue('', { exclusive: true }, (err, q) => {
            const corr = uuid();
            console.log(` [x] Requesting user ${id}`);
           
            ch.sendToQueue('rpc_queue',
                Buffer.from(id.toString()),
                { correlationId: corr, replyTo: q.queue });

            ch.consume(q.queue, (msg) => {
                if (msg.properties.correlationId === corr) {
                    console.log(` [.] Got ${msg.content.toString()}`);
                    setTimeout(function () { conn.close(); process.exit(0) }, 500);
                }
            }, { noAck: true });


        });
    });


})