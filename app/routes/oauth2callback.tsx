import type { LoaderArgs } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import { oauth2Client } from "~/auth0.server";
import { googleTokensCookie } from "~/cookies.server";
import { google } from "googleapis";

export async function loader({ request }: LoaderArgs) {
  const code = new URL(request.url).searchParams.get("code") ?? "";
  const { tokens } = await oauth2Client.getToken(code);
  oauth2Client.setCredentials(tokens);

  oauth2Client.on("tokens", (tokens) => {
    if (tokens.access_token) {
      // store the refresh_token in my database!
      oauth2Client.setCredentials({
        access_token: tokens.access_token
      });
      console.log("access token:", tokens.access_token);
    }
    if (tokens.refresh_token) {
      // store the refresh_token in my database!
      oauth2Client.setCredentials({
        refresh_token: tokens.refresh_token
      });
      console.log("refresh token:", tokens.refresh_token);
    }
  });

  google.options({ auth: oauth2Client });

  console.log({ tokens });

  return redirect("/", {
    headers: {
      "Set-Cookie": await googleTokensCookie.serialize(tokens)
    }
  });
}
