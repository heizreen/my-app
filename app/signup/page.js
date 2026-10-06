import { redirect } from "next/navigation";
import AuthForm from "@/components/AuthForm";
import { getUser } from "@/lib/auth";

export const metadata = { title: "Sign up" };

export default async function SignupPage() {
  if (await getUser()) redirect("/movies");

  return (
    <main>
      <AuthForm mode="signup" />
    </main>
  );
}
