const encoder = new TextEncoder();
async function sessionKey() {
  const secret = process.env.NEXTAUTH_SECRET || process.env.ADMIN_PASSWORD;
  if (!secret) throw new Error("Admin session key missing");
  return crypto.subtle.importKey("raw", encoder.encode(secret), {name:"HMAC",hash:"SHA-256"},false,["sign","verify"]);
}
export async function issueSession() {
  const expiry = String(Date.now() + 7 * 86400000);
  const signature = new Uint8Array(await crypto.subtle.sign("HMAC",await sessionKey(),encoder.encode(expiry)));
  return expiry+"."+Array.from(signature,b=>b.toString(16).padStart(2,"0")).join("");
}
export async function validSession(value?:string) {
  if (!value || !/^\d{13}\.[0-9a-f]{64}$/.test(value)) return false;
  const [expiry,hex] = value.split(".");
  return Number(expiry)>Date.now() && crypto.subtle.verify("HMAC",await sessionKey(),Uint8Array.from(hex.match(/../g)!,v=>parseInt(v,16)),encoder.encode(expiry));
}
