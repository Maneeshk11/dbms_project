import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";

import * as authSchema from "@workspace/drizzle/auth";
import { db } from "@workspace/drizzle";
import { organization } from "better-auth/plugins";

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: {
      user: authSchema.user,
      session: authSchema.session,
      account: authSchema.account,
      verification: authSchema.verification,
      organization: authSchema.organization,
      member: authSchema.member,
      invitation: authSchema.invitation,
    },
  }),
  user: {
    additionalFields: {
      isAdmin: {
        type: "boolean",
        defaultValue: false,
        required: false,
      },
    },
  },
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false,
  },
  plugins: [organization()],
  trustedOrigins: [
    "http://localhost:3000",
    "http://localhost:3001",
    "https://dbms-project-web-mocha.vercel.app",
  ].filter(Boolean),
  // CRITICAL: This runs on the server (Railway), not in the browser
  // Must use BETTER_AUTH_URL (server var), NOT NEXT_PUBLIC_BETTER_AUTH_URL (client var)
  baseURL:
    process.env.BETTER_AUTH_URL ||
    (process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : undefined) ||
    process.env.NEXT_PUBLIC_BETTER_AUTH_URL,
  session: {
    cookieCache: {
      enabled: true,
      maxAge: 60 * 60 * 24, // 1 day in seconds
    },
  },
  advanced: {
    useSecureCookies: process.env.NODE_ENV === "production",
    cookieOptions: {
      sameSite: "lax",
      path: "/",
      secure: process.env.NODE_ENV === "production",
      httpOnly: process.env.NODE_ENV === "production",
    },
    crossSubDomainCookies: {
      enabled: false, // Disable for Vercel deployment
    },
  },
});
