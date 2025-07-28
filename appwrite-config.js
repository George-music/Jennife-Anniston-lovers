import { Client, Account, Databases, Storage } from "appwrite";

export const client = new Client();
client
    .setEndpoint('https://your-appwrite-endpoint/v1') // Your Appwrite Endpoint
    .setProject('your-project-id'); // Your project ID

export const account = new Account(client);
export const databases = new Databases(client);
export const storage = new Storage(client);
