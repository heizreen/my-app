import { redirect } from "next/navigation";
import AuthForm from "@/components/AuthForm";
import { getUser } from "@/lib/auth";

export const metadata = { title: "Log in" };

export default async function LoginPage() {
  // Someone already logged in has no reason to see this page
  if (await getUser()) redirect("/movies");

  return (
    <main>
      <AuthForm mode="login" />
    </main>
  );
}
