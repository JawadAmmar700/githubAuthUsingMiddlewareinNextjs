export const cookie_name = "_un"
export const session_key = `${process.env.SESSION_KEY}`
export const session_seb = "@(_)?/"

const encode = (value: string) => {
  return new TextEncoder().encode(value)
}

const iv = encode("encrypt_iv")
const session_key_encoded = encode(session_key)
const algorithm = {
  name: "AES-GCM",
  iv,
}

const decode = (value: ArrayBuffer) => {
  return new TextDecoder().decode(value)
}

const arrayBufferToBase64 = (buffer: ArrayBuffer) => {
  const bytes = new Uint8Array(buffer)
  const binary = String.fromCharCode(...bytes)
  return btoa(binary)
}

export const createEncrypt = async (data: string) => {
  const digest = await crypto.subtle.digest("SHA-256", session_key_encoded)
  const key = await crypto.subtle.importKey("raw", digest, algorithm, false, [
    "encrypt",
  ])
  const encrypted = await crypto.subtle.encrypt(algorithm, key, encode(data))
  return arrayBufferToBase64(encrypted)
}

const base64ToArrayBuffer = (base64: any) => {
  const binary = atob(base64)
  const len = binary.length
  const bytes = new Uint8Array(len)
  for (let i = 0; i < len; i++) {
    bytes[i] = binary.charCodeAt(i)
  }
  return bytes.buffer
}

export const createDecrypt = async (data: any) => {
  const digest = await crypto.subtle.digest("SHA-256", session_key_encoded)
  const key = await crypto.subtle.importKey("raw", digest, algorithm, false, [
    "decrypt",
  ])
  const buffer = base64ToArrayBuffer(data)
  const decrypted = await crypto.subtle.decrypt(algorithm, key, buffer)
  return decode(decrypted)
}

export const getSession = (req: any): any => {
  const { cookies } = req
  if (!cookies) return [null, null]
  const user_cookie = cookies[cookie_name]
  if (!user_cookie) return [null, null]
  const split = user_cookie.split(session_seb)
  const user = split[0]
  const session = split[1]
  return [user, session]
}

export const getUser = (req: any) => {
  return !getSession(req) ? null : getSession(req)[0]
}
