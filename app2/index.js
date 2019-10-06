const amqp = require('amqplib/callback_api');

const open = require('amqplib').connect('amqp://localhost:5672')

/**
 * Implementação de RabbitMQ como Worker
 */

// amqp.connect('amqp://localhost:5672', function (err, conn) {
//     conn.createChannel(function (err, ch) {
//         const nomeDoCanal = 'hello';

//         ch.assertQueue(nomeDoCanal, { durable: false });
//         ch.prefetch(1)

//         console.log(" [*] Waiting for messages in %s. To exit press CTRL+C", nomeDoCanal);

//         ch.consume(nomeDoCanal, function (msg) { // Escutar FILA
//           if (msg.content.toString() == 160000) {
//             console.log(" [x] Received %s", msg.content.toString());

//             }
//         }, { noAck: true });
//     });
// });

/** 
 * Implementação RabbitMQ com Publish e subscribe 
 */

// amqp.connect('amqp://localhost:5672', function (err, conn) {

//   conn.createChannel(function (err, ch) {
//       var ex = 'pub_sub_meetup28';

//       ch.assertExchange(ex, 'fanout', { durable: false });

//       ch.assertQueue('', { exclusive: true }, function (err, q) {
//           console.log(" [*] Waiting for messages in %s. To exit press CTRL+C", q.queue);
//           ch.bindQueue(q.queue, ex, '');

//           ch.consume(q.queue, function (msg) {
//               console.log(" [x] %s", msg.content.toString());
//           }, { noAck: true });
//       });
//   });

// })


/**
 * Implementação de Fila RabbitMQ com promise
 * OBS: Após reiniciado um server, itens da fila são direcionados para o outro ouvinte
 * aparentemente é necessário remover o item da fila
 */ 



// let ch

// open.then(conn => conn.createChannel()).then(ch_ => ch = ch_)
  
// const receiveMessageFrom = async (q, msg) => {
//   await ch.assertQueue(q)
//   ch.consume(q, msg => {
//     if (msg !== null) {
//       console.log(msg.content.toString())
//     }
    
//     // ch.ack(msg)
//   })
// }

// setTimeout(() => {
//   receiveMessageFrom('arroz')
// }, 3000)


amqp.connect('amqp://localhost:5672', (err, conn) => {
    conn.createChannel((err, ch) => {
        const q = 'rpc_queue';
        ch.assertQueue(q, { durable: false });
        ch.prefetch(1);

        console.log(' [x] Awaiting RPC requests');

        ch.consume(q, function reply(msg) {
            const id = parseInt(msg.content.toString(), 10);

            console.log(` [.] ID ${id}`);

            // {sua logica}

            ch.sendToQueue(msg.properties.replyTo,
                Buffer.from(`result_${id}`),
                { correlationId: msg.properties.correlationId });

            ch.ack(msg);
        });
    });
});