"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { z } from "zod";

const loginSchema = z.object({
  email: z.string().email("البريد الإلكتروني غير صالح | Invalid email address"),
  password: z
    .string()
    .min(6, "كلمة المرور يجب أن تكون 6 أحرف على الأقل | Password must be at least 6 characters"),
});

export type LoginState = {
  error?: string;
  success?: boolean;
};

/**
 * Server Action: Authenticate Admin User
 *
 * Verifies credentials with Supabase Auth, checks against the ADMIN_EMAIL
 * environment variable, and creates a secure HTTP-only cookie session.
 */
export async function loginAdmin(
  prevState: LoginState | null,
  formData: FormData
): Promise<LoginState> {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const redirectTo = (formData.get("redirectTo") as string) || "/admin";

  // Validate input schema
  const parsed = loginSchema.safeParse({ email, password });
  if (!parsed.success) {
    return {
      error: parsed.error.issues[0]?.message || "بيانات تسجيل الدخول غير صالحة",
    };
  }

  const adminEmail = process.env.ADMIN_EMAIL;
  if (adminEmail && parsed.data.email.toLowerCase() !== adminEmail.toLowerCase()) {
    return {
      error: "غير مصرح لك بالدخول إلى لوحة التحكم الإدارية | Unauthorized access",
    };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email: parsed.data.email,
    password: parsed.data.password,
  });

  if (error) {
    return {
      error: "البريد الإلكتروني أو كلمة المرور غير صحيحة | Invalid credentials",
    };
  }

  revalidatePath("/", "layout");
  redirect(redirectTo);
}

/**
 * Server Action: Sign Out Admin
 */
export async function logoutAdmin(): Promise<void> {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/auth/login");
}

