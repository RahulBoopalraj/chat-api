import {initializeApp, cert} from "firebase-admin/app"

import { getStorage } from "firebase-admin/storage";
import fs from 'fs';
import path from 'path';

const serviceAccount = JSON.parse(fs.readFileSync(path.join(__dirname, '../serviceAccountKey.json'), 'utf8'));


const app = initializeApp({
  credential: cert(serviceAccount),
  storageBucket: 'social-media-e6af6.appspot.com'
});

export const storageInstance = getStorage(app);