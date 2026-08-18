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

export function getAdminUsername() {
  return process.env.PROKICKS_ADMIN_USER || '';
}

export function getAdminPasscode() {
  return process.env.PROKICKS_ADMIN_PASSCODE || '';
}

export async function createAdminSession(username: string, passcode: string) {
  const secretUser = getAdminUsername();
  const secretPass = getAdminPasscode();
  if (!secretPass) return null;
  if (secretUser && username !== secretUser) return null;
  if (passcode !== secretPass) return null;

  const expiresAt = Date.now() + SESSION_TTL_MS;
  const signature = await sha256(`${expiresAt}.${secretUser}.${secretPass}`);
  return `${expiresAt}.${signature}`;
}

export async function verifyAdminSession(session: string | undefined) {
  const secretUser = getAdminUsername();
  const secretPass = getAdminPasscode();
  if (!secretPass || !session) return false;

  const [expiresAt, signature] = session.split('.');
  const expiresAtNumber = Number(expiresAt);
  if (!expiresAtNumber || expiresAtNumber < Date.now() || !signature) return false;

  const expected = await sha256(`${expiresAt}.${secretUser}.${secretPass}`);
  return expected === signature;
}
