import type { NextFetchEvent, NextRequest } from "next/server"
import { cookie_name, createEncrypt, session_seb } from "../../libs/session"

const CLIENT_ID = process.env.GITHUB_CLIENT
const CLIENT_SECRET = process.env.GITHUB_SECRET

export async function middleware(req: NextRequest, ev: NextFetchEvent) {
  const { searchParams } = req.nextUrl
  const query = Object.fromEntries(searchParams)
  const { code } = query

  if (!code) {
    return new Response("", {
      status: 302,
      headers: {
        Location: `https://github.com/login/oauth/authorize?client_id=${CLIENT_ID}&allow_signup=false`,
      },
    })
  }

  let token = ""
  try {
    const data = await (
      await fetch("https://github.com/login/oauth/access_token", {
        method: "POST",
        body: JSON.stringify({
          client_id: CLIENT_ID,
          client_secret: CLIENT_SECRET,
          code,
        }),
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
      })
    ).json()

    const accessToken = data.access_token

    // Let's also fetch the user info and store it in the session.
    if (accessToken) {
      const userInfo = await (
        await fetch("https://api.github.com/user", {
          method: "GET",
          headers: {
            Authorization: `token ${accessToken}`,
            Accept: "application/json",
          },
        })
      ).json()

      token = userInfo.login
    }
  } catch (err: any) {
    console.error(err)
    return new Response(err.toString(), {
      status: 500,
    })
  }

  if (!token) {
    return new Response("Github authorization failed", {
      status: 400,
    })
  }
  const user = {
    name: token,
    encrypted: await createEncrypt(token),
  }

  const headers = new Headers()
  headers.append(
    "Set-Cookie",
    `${cookie_name}=${user.name}${session_seb}${user.encrypted}; Secure; HttpOnly`
  )

  const url = req.nextUrl.clone()
  url.searchParams.delete("code")
  url.pathname = "/"
  headers.append("Location", url.toString())

  return new Response("", {
    status: 302,
    headers,
  })
}
