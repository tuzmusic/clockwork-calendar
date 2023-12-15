import { google } from "googleapis";
import type { LoaderArgs} from "@remix-run/node";
import { redirect } from "@remix-run/node";
import { googleTokensCookie } from "~/cookies.server";

const { env } = process;
export const oauth2Client = new google.auth.OAuth2(
  env.GOOGLE_CLIENT_ID,
  env.GOOGLE_CLIENT_SECRET,
  "http://localhost:3000/oauth2callback"
);

export async function checkToken(request: LoaderArgs["request"]) {
  const cookieHeader = request.headers.get("Cookie");
  const googleToken = await googleTokensCookie.parse(cookieHeader);
  if (!googleToken) throw redirect("/login");
}
