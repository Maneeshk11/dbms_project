import { auth } from "@workspace/auth/auth";
import { createAuthClient } from "better-auth/client";
import {
  adminClient,
  customSessionClient,
  magicLinkClient,
} from "better-auth/client/plugins";
import { nextCookies } from "better-auth/next-js";

const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_BETTER_AUTH_URL || "http://localhost:3000",
  plugins: [
    adminClient(),
    customSessionClient<typeof auth>(),
    magicLinkClient(),
    nextCookies(),
  ],
});

export default authClient;
