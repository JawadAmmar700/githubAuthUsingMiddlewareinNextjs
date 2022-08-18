import { cookie_name, session_key } from "../../libs/session"

export default function middleware(req) {
  // Set-Cookie: token=deleted; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT
  const headers = new Headers()
  headers.append(
    "Set-Cookie",
    `${cookie_name}=deleted; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`
  )
  headers.append(
    "Set-Cookie",
    `${session_key}=deleted; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`
  )

  const url = req.nextUrl.clone()
  url.pathname = "/"
  headers.append("Location", url.toString())

  return new Response("", {
    status: 302,
    headers,
  })
}
