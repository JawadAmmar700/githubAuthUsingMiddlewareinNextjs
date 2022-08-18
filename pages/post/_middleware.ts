import type { NextFetchEvent, NextRequest } from "next/server"
import { NextResponse } from "next/server"
import { createDecrypt, getSession } from "../../libs/session"

export async function middleware(req: NextRequest, ev: NextFetchEvent) {
  const [user, session] = getSession(req)

  let user_encrypted = null
  let authErr = null

  if (user && session) {
    try {
      user_encrypted = await createDecrypt(session)
    } catch (e) {
      console.error(e)
      authErr = e
    }

    if (!authErr && user_encrypted === user) {
      return NextResponse.next()
    }
  }

  const url = req.nextUrl.clone()
  url.pathname = "/"
  return NextResponse.redirect(url)
}
