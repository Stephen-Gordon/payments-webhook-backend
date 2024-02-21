const express = require('express')
const path = require('path')
const socketIO = require('socket.io');
const PORT = process.env.PORT || 5000
const fetch = require('node-fetch');

// start the express server with the appropriate routes for our webhook and web requests
var app = express()
	.use(express.static(path.join(__dirname, "public")))
	.use(express.json())
	.post("/alchemyhook", (req, res) => {
		notificationReceived(req);
		res.status(200).end();
	})
	.post("/noti", (req, res) => {
		sendNoti(req);
		res.status(200).end();
	})
	.get("/*", (req, res) => res.sendFile(path.join(__dirname + "/index.html")))
	.listen(PORT, () => console.log(`Listening on ${PORT}`));

// start the websocket server
const io = socketIO(app);

// listen for client connections/calls on the WebSocket server
io.on('connection', (socket) => {
  console.log('Client connected');
  socket.on('disconnect', () => console.log('Client disconnected'));
  socket.on('register address', (msg) => {
    //send address to Alchemy to add to notification
    addAddress(msg);
  });
});

// notification received from Alchemy from the webhook. Let the clients know.
const notificationReceived = async (req, res) => {
  console.log("notification received!");
  console.log(req.body);
  try {
    await fetch("https://payments-lyart.vercel.app/notification", {
			method: "POST",
			headers: {
				"Content-type": "application/json",
			},
			body: JSON.stringify({
        title: 'Hello Web Push from aheroku',
        message: 'Heroku Your web push notification is here from heroku!',
      }),
			signal: AbortSignal.timeout(10000),
		});
  } catch (error) {
    console.error(error);
  }
  io.emit('notification', JSON.stringify(req.body));

}

// add an address to a notification in Alchemy
async function addAddress(new_address) {
  console.log("adding address " + new_address);
  const body = { webhook_id: 'wh_eddaxijt09kqs3zh', addresses_to_add: [new_address], addresses_to_remove: [] };
  try {
    fetch("https://dashboard.alchemyapi.io/api/update-webhook-addresses", {
			method: "PATCH",
			body: JSON.stringify(body),
			headers: { "Content-Type": "application/json" },
			headers: { "X-Alchemy-Token": "2CxWNMpNMB3IeHKVJBROFv-19LQ3LKKQ" },
		})
			.then((res) => res.json())
			.then((json) => console.log("Successfully added address:", json))
			.catch((err) => console.log("Error! Unable to add address:", err));
  }
  catch (err) {
    console.error(err);
  }
}


const sendNoti = async (req, res) => {

 
const sendPushNotification = async () => {
	/* const publicKey =
    'BK9FZUL3u5bgvs8NlurUeFesIq5dm3qEUwOlh3hL7wGPbNec2SELGLwjKU2jWv9P9GULDvlWlC04Lric-w8yEf8';
  const privateKey = 'EctJtRAxWnq18ayGbnjcHQ'; */
	const publicKey =
		"BKIvDJTEdSWEOc3P_-QtcaNhcBYbpESr6KXM2S7oCmlnkdgwAz1wHn8T17OZDrpkDw5GkfiHwrePpgzh55e4Qt4";
	const privateKey = "5Lys2yFtv71OQnusHfZNNQ";
	/* webPush.setVapidDetails(
    'mailto:example@yourdomain.org',
    publicKey,
    privateKey
  ); */
	const pushSubscription = {
		endpoint:
			"https://fcm.googleapis.com/fcm/send/cFpbxV7KLYc:APA91bHFlDQI1HYpYr7NMl2Y67B6WtjQRcejgewG1jhRPeJWR3wrIgIrYpWgkv8tOMsPUmAJcFHsB3up8EvpVWjfntCnir34fE827JK8u56fQ2FSmE8dhWZva21_lu08SxO2UUXjtSLf",
		expirationTime: Math.floor(Date.now() / 1000) + 10,

		keys: {
			auth: privateKey,
			p256dh: publicKey,
		},
	};
	/*  const response = await webPush.sendNotification(
    pushSubscription,
    JSON.stringify({
      title: 'Hello from script',
      message: 'Your web push notification is here!',
    })
  ); */
	console.log(pushSubscription);
	try {
		await fetch("https://payments-lyart.vercel.app/notification", {
			method: "POST",
			headers: {
				"Content-type": "application/json",
			},
			body: JSON.stringify({
				subscription: pushSubscription,
				message: "Hello from ste",
			}),
			signal: AbortSignal.timeout(10000),
		});
	} catch (error) {
		console.log(error);
	}
};

sendPushNotification();
};