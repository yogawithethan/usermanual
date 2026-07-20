import { redirect } from "next/navigation";

/** Account recovery is owned by the shared Islands identity provider. */
export default function ResetPasswordPage() {
  redirect("https://islands.bio/auth/reset-password");
}
