import { Client } from "cyborgdb";

const CYBORG_BASE_URL = process.env.CYBORG_BASE_URL
const CYBORG_API_KEY = process.env.CYBORGDB_API_KEY

let client: Client | null = null;

export function getClient() {
    if (!client){
        client = new Client({
            baseUrl: CYBORG_BASE_URL ? CYBORG_BASE_URL : 'http://localhost:8000', //fallback for development
            apiKey: CYBORG_API_KEY
        })
    }
    return client
}
