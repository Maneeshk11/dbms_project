"use server";

import { catchError } from "@/lib/catch-error";
import { headers } from "next/headers";
import { auth } from "@workspace/auth/auth";

export const getSession = async () => {
  const [resp, error] = await catchError(
    auth.api.getSession({
      headers: await headers(),
    })
  );

  if (error) {
    return { success: false, error: error.message };
  }

  return resp;
};
