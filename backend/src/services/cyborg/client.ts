import { Client } from "cyborgdb";

const CYBORG_BASE_URL = process.env.CYBORG_BASE_URL

let client: Client | null = null;

export function getClient() {
    if (!client){
        client = new Client({
            baseUrl: CYBORG_BASE_URL ? CYBORG_BASE_URL : 'http://localhost:8000' 
        })
    }
}
