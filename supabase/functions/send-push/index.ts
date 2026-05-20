// Edge Function: send-push
// Sends generic push notifications for E2E-encrypted messages
// The server NEVER has access to decrypted message content

interface PushPayload {
  userId: string;
  type: "message" | "like" | "connect" | "invest" | "milestone" | "verify";
  fromHandle: string;
  isEncrypted: boolean;
}

Deno.serve(async (req) => {
  const payload: PushPayload = await req.json();

  const title = payload.type === "message"
    ? `@${payload.fromHandle} sent you a message`
    : `@${payload.fromHandle} interacted with you`;

  const body = payload.isEncrypted
    ? "You received an encrypted message. Tap to decrypt."
    : `New ${payload.type} notification from @${payload.fromHandle}`;

  const vapidPublicKey = Deno.env.get("VAPID_PUBLIC_KEY");
  const vapidPrivateKey = Deno.env.get("VAPID_PRIVATE_KEY");
  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

  if (!vapidPublicKey || !vapidPrivateKey || !supabaseUrl || !supabaseServiceKey) {
    return new Response(JSON.stringify({ error: "Missing environment variables" }), { status: 500 });
  }

  const { data: devices } = await fetch(`${supabaseUrl}/rest/v1/push_devices?user_id=eq.${payload.userId}`, {
    headers: { "apikey": supabaseServiceKey, "Authorization": `Bearer ${supabaseServiceKey}` },
  }).then((r) => r.json());

  if (!devices || devices.length === 0) {
    return new Response(JSON.stringify({ sent: 0 }), { status: 200 });
  }

  const results = await Promise.allSettled(
    devices.map((device: { token: string; platform: string }) => {
      if (device.platform === "web") {
        return sendWebPush(device.token, { title, body }, vapidPublicKey, vapidPrivateKey);
      }
      return sendFCM(device.token, { title, body, type: payload.type }, device.platform);
    })
  );

  const sent = results.filter((r) => r.status === "fulfilled").length;

  return new Response(JSON.stringify({ sent, total: devices.length }), {
    headers: { "Content-Type": "application/json" },
    status: 200,
  });
});

async function sendWebPush(
  endpoint: string,
  notification: { title: string; body: string },
  vapidPublicKey: string,
  vapidPrivateKey: string
) {
  const webpush = await import("npm:web-push");
  webpush.setVapidDetails("mailto:support@scaletrek.app", vapidPublicKey, vapidPrivateKey);
  return webpush.sendNotification(endpoint, JSON.stringify(notification));
}

async function sendFCM(
  token: string,
  notification: { title: string; body: string; type: string },
  platform: string
) {
  const projectId = Deno.env.get("FCM_PROJECT_ID");
  if (!projectId) throw new Error("FCM_PROJECT_ID not configured");

  const message = platform === "android"
    ? { token, notification: { title: notification.title, body: notification.body } }
    : { token, notification: { title: notification.title, body: notification.body }, apns: { payload: { aps: { sound: "default" } } } };

  const accessToken = await getFirebaseAccessToken();

  await fetch(`https://fcm.googleapis.com/v1/projects/${projectId}/messages:send`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "Authorization": `Bearer ${accessToken}` },
    body: JSON.stringify({ message }),
  });
}

async function getFirebaseAccessToken(): Promise<string> {
  const credentials = Deno.env.get("FCM_SERVICE_ACCOUNT");
  if (!credentials) throw new Error("FCM_SERVICE_ACCOUNT not configured");

  const cred = JSON.parse(credentials);
  const now = Math.floor(Date.now() / 1000);
  const jwt = await createJWT(cred, { scope: "https://www.googleapis.com/auth/firebase.messaging", exp: now + 3600 });

  const { access_token } = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion: jwt,
    }),
  }).then((r) => r.json());

  return access_token;
}

async function createJWT(
  serviceAccount: { client_email: string; private_key: string },
  payload: { scope: string; exp: number }
): Promise<string> {
  const encoder = new TextEncoder();
  const header = { alg: "RS256", typ: "JWT" };
  const now = Math.floor(Date.now() / 1000);
  const claims = { iss: serviceAccount.client_email, sub: serviceAccount.client_email, aud: "https://oauth2.googleapis.com/token", iat: now, ...payload };

  const b64Encode = (obj: unknown) => btoa(JSON.stringify(obj)).replace(/=+$/, "").replace(/\+/g, "-").replace(/\//g, "_");
  const signingInput = `${b64Encode(header)}.${b64Encode(claims)}`;

  const key = await crypto.subtle.importKey(
    "pkcs8",
    pemToBinary(serviceAccount.private_key),
    { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
    false,
    ["sign"]
  );

  const signature = await crypto.subtle.sign({ name: "RSASSA-PKCS1-v1_5" }, key, encoder.encode(signingInput));
  const b64Signature = btoa(String.fromCharCode(...new Uint8Array(signature))).replace(/=+$/, "").replace(/\+/g, "-").replace(/\//g, "_");

  return `${signingInput}.${b64Signature}`;
}

function pemToBinary(pem: string): ArrayBuffer {
  const b64 = pem.replace(/-----BEGIN [\w\s]+-----/, "").replace(/-----END [\w\s]+-----/, "").replace(/\s/g, "");
  const bytes = atob(b64);
  const buf = new ArrayBuffer(bytes.length);
  const view = new Uint8Array(buf);
  for (let i = 0; i < bytes.length; i++) view[i] = bytes.charCodeAt(i);
  return buf;
}
