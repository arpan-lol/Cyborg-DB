import fs from 'fs';
import path from 'path';
import { OAuth2Client } from 'google-auth-library';
import dotenv from 'dotenv';

dotenv.config();

const credsPath = path.join(process.cwd(), 'google-creds.json');
let creds: any = null;

console.log('[googleClient] Looking for google-creds.json at:', credsPath);
console.log('[googleClient] File exists:', fs.existsSync(credsPath));

if (fs.existsSync(credsPath)) {
  creds = JSON.parse(fs.readFileSync(credsPath, 'utf8'));
  console.log('[googleClient] Loaded credentials, client_id:', creds?.web?.client_id);
} else {
  console.log('[googleClient] google-creds.json not found - Google OAuth disabled');
}

export const googleClient = creds
  ? new OAuth2Client(
      creds.web.client_id,
      creds.web.client_secret,
      process.env.REDIRECT_URI
    )
  : null;

export const GOOGLE_CLIENT_ID = creds?.web.client_id || null;

console.log('[googleClient] GOOGLE_CLIENT_ID:', GOOGLE_CLIENT_ID ? 'SET' : 'NOT SET');