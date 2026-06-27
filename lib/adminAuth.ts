const encoder = new TextEncoder();
const SESSION_TTL_MS = 12 * 60 * 60 * 1000;

function toBase64Url(bytes: Uint8Array) {
  let binary = '';
  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
}

async function sha256(value: string) {
  const hash = await crypto.subtle.digest('SHA-256', encoder.encode(value));
  return toBase64Url(new Uint8Array(hash));
}

export function getAdminPasscode() {
  return process.env.PROKICKS_ADMIN_PASSCODE || '';
}

export async function createAdminSession(passcode: string) {
  const secret = getAdminPasscode();
  if (!secret || passcode !== secret) return null;

  const expiresAt = Date.now() + SESSION_TTL_MS;
  const signature = await sha256(`${expiresAt}.${secret}`);
  return `${expiresAt}.${signature}`;
}

export async function verifyAdminSession(session: string | undefined) {
  const secret = getAdminPasscode();
  if (!secret || !session) return false;

  const [expiresAt, signature] = session.split('.');
  const expiresAtNumber = Number(expiresAt);
  if (!expiresAtNumber || expiresAtNumber < Date.now() || !signature) return false;

  const expected = await sha256(`${expiresAt}.${secret}`);
  return expected === signature;
}
