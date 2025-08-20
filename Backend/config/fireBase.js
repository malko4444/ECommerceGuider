import admin from 'firebase-admin';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);

const serviceAccount = require("../ecommerce-guider-firebase-adminsdk-fbsvc-aefd798f1a.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  storageBucket: "ecommerce-guider.appspot.com"
});

const db = admin.firestore();
const bucket = admin.storage().bucket();
const auth = admin.auth();

export { db, bucket, auth };
