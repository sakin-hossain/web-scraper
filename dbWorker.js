const { parentPort } = require("worker_threads");
const admin = require("firebase-admin");

const firebaseConfig = {
  apiKey: process.env.API_KEY,
  authDomain: process.env.AUTH_DOMAIN,
  projectId: process.env.PROJECT_ID,
  storageBucket: process.env.STORAGE_BUCKET,
  messagingSenderId: process.env.MESSAGING_SENDER_ID,
  appId: process.env.APP_ID,
};

admin.initializeApp(firebaseConfig);
let db = admin.firestore();
let date = new Date();
let currentDate = `${date.getDate()}-${date.getMonth()}-${date.getFullYear()}`;

// receive crawled data from main thread
parentPort.once("message", (message) => {
  console.log("Receive data from main worker");

  // store data from main thread into database
  db.collection("Rates")
    .doc(currentDate)
    .set({
      rates: JSON.stringify(message),
    })
    .then(() => {
      // send data back to main thread if operation was successful
      parent.postMessage("Date saved successfully");
    })
    .catch((err) => console.log(err));
});
