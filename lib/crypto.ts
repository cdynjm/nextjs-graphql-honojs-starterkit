import crypto from "crypto";

const secret = process.env.CRYPTO_SECRET_KEY;

function encode(text: string): Uint8Array {
  return new TextEncoder().encode(text);
}

function decode(buffer: ArrayBuffer): string {
  return new TextDecoder().decode(buffer);
}

export async function generateKey() {
  const keyBuffer = crypto.createHash("sha256").update(secret as string).digest();
  return crypto.subtle.importKey(
    "raw",
    keyBuffer,
    "AES-GCM",
    false,
    ["decrypt", "encrypt"]
  );
}


function arrayBufferToBase64(buffer: ArrayBuffer): string {
  return btoa(String.fromCharCode(...new Uint8Array(buffer)));
}

function base64ToArrayBuffer(base64: string): ArrayBuffer {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
}

export async function encryptToBase64(
  text: string,
  key: CryptoKey
): Promise<{ cipher: string; iv: string }> {
  const iv = crypto.getRandomValues(new Uint8Array(12)); 
  const encodedText = encode(text);
  const encrypted = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    key,
    encodedText as BufferSource
  );
  return {
    cipher: arrayBufferToBase64(encrypted),
    iv: arrayBufferToBase64(iv.buffer),
  };
}

export async function decryptFromBase64(
  cipherBase64: string,
  ivBase64: string,
  key: CryptoKey
): Promise<string> {
  const cipher = base64ToArrayBuffer(cipherBase64);
  const ivBuffer = base64ToArrayBuffer(ivBase64);
  const iv = new Uint8Array(ivBuffer);

  const decrypted = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv },
    key,
    cipher
  );

  return decode(decrypted);
}

/**
 * Simplified encrypt function - returns combined iv:cipher string
 */
export async function encrypt(text: string, key: CryptoKey): Promise<string> {
  const { cipher, iv } = await encryptToBase64(text, key);
  return iv + ":" + cipher;
}

/**
 * Simplified decrypt function - accepts combined iv:cipher string
 */
export async function decrypt(data: string, key: CryptoKey): Promise<string> {
  const [iv, cipher] = data.split(":");
  if (!iv || !cipher) {
    throw new Error("Invalid encrypted data format");
  }
  return decryptFromBase64(cipher, iv, key);
}