var amqp = require("amqplib/callback_api");
const router = require("./routes");
const mongoose = require("mongoose");

const credentials = {
	user: "root",
	password: "vAECqPQIanQb5qOj",
	db: "cluster0.8bf5t",
};

mongoose
	.connect(
		`mongodb+srv://${credentials.user}:${credentials.password}@${credentials.db}.mongodb.net/RCA?retryWrites=true&w=majority`,
	)
	.then(() => {
		console.log("Conectou ao banco!");
	})
	.catch((err) => console.log(err));

amqp.connect("amqp://localhost", function (error0, connection) {
	if (error0) {
		throw error0;
	}
	connection.createChannel(function (error1, channel) {
		if (error1) {
			throw error1;
		}

		var queue = "api-redes";

		channel.assertQueue(queue, {
			durable: false,
		});

		console.log(" [*] Waiting for messages in %s. To exit press CTRL+C", queue);

		channel.consume(
			queue,
			async (msg) => {
				const message = JSON.parse(msg.content);
				let responseMessage = {
					code: 200,
					message: "Teste",
					...message,
				};
				try {
					const res = await router(message);
					// console.log("--- RES", res);
					if (message.method === "GET") {
						responseMessage = {
							...responseMessage,
							body: res,
						};
					}
					if (res instanceof Error || !res) {
						throw new Error(res);
					}
				} catch (err) {
					// console.log("TRYERRO", err);
					responseMessage = {
						code: 400,
						body: {message: err},
					};
				}
				channel.sendToQueue(
					queue,
					Buffer.from(JSON.stringify(responseMessage)),
					{
						correlationId: msg.properties.correlationId,
					},
				);
				channel.ack({
					...msg,
					content: Buffer.from(JSON.stringify(responseMessage)),
				});
			},
			{ noAck: false },
			(err) => {
				if (err) {
					throw err;
				}
			},
		);
	});
});
