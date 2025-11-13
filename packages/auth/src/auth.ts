import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";

import * as schema from "@workspace/drizzle";
import { db } from "@workspace/drizzle";
import { organization } from "better-auth/plugins";

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: {
      ...schema,
    },
  }),
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false,
  },
  plugins: [organization()],
  trustedOrigins: ["http://localhost:3000", "http://localhost:3001"],
  // CRITICAL: This runs on the server (Railway), not in the browser
  // Must use BETTER_AUTH_URL (server var), NOT NEXT_PUBLIC_BETTER_AUTH_URL (client var)
  baseURL:
    process.env.BETTER_AUTH_URL || process.env.NEXT_PUBLIC_BETTER_AUTH_URL,
  session: {
    cookieCache: {
      enabled: true,
      maxAge: 60 * 60 * 24, // 1 day in seconds
    },
  },
  advanced: {
    useSecureCookies: process.env.NODE_ENV === "production",
    cookieOptions: {
      sameSite: process.env.NODE_ENV === "production" ? "lax" : "lax",
      path: "/",
      secure: process.env.NODE_ENV === "production",
    },
    crossSubDomainCookies: {
      enabled: true,
      domain:
        process.env.NODE_ENV === "production"
          ? "app.getscribr.com"
          : "localhost",
    },
  },
});
