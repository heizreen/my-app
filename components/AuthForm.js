"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { signUp } from "@/lib/actions";
import styles from "./AuthForm.module.css";

// One form for both pages: mode is "login" or "signup"
export default function AuthForm({ mode }) {
  const isSignup = mode === "signup";
  const [error, setError] = useState(null);
  const [pending, setPending] = useState(false);
  const router = useRouter();

  async function handleSubmit(event) {
    event.preventDefault();
    setError(null);
    setPending(true);
    const formData = new FormData(event.target);

    // Signing up first creates the account, then logs in like normal
    if (isSignup) {
      const result = await signUp(formData);
      if (result.error) {
        setError(result.error);
        setPending(false);
        return;
      }
    }

    // redirect: false lets us show an error here instead of leaving the page
    const result = await signIn("credentials", {
      email: formData.get("email"),
      password: formData.get("password"),
      redirect: false,
    });
    if (result.error) {
      setError("Wrong email or password.");
      setPending(false);
      return;
    }

    router.push("/movies");
    // Re-renders the layout on the server so the navbar shows the new user
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      <h1>{isSignup ? "Sign up" : "Log in"}</h1>

      {isSignup && (
        <label className={styles.field}>
          Name
          <input name="name" autoComplete="name" maxLength={50} required />
        </label>
      )}

      <label className={styles.field}>
        Email
        <input type="email" name="email" autoComplete="email" required />
      </label>

      <label className={styles.field}>
        Password
        <input
          type="password"
          name="password"
          autoComplete={isSignup ? "new-password" : "current-password"}
          minLength={isSignup ? 8 : undefined}
          required
        />
        {isSignup && <span className={styles.hint}>At least 8 characters</span>}
      </label>

      {error && (
        <p role="alert" className="error">
          {error}
        </p>
      )}

      <button type="submit" disabled={pending} className="button">
        {pending ? "Please wait..." : isSignup ? "Create account" : "Log in"}
      </button>

      <p className="muted">
        {isSignup ? "Already have an account? " : "New here? "}
        <Link href={isSignup ? "/login" : "/signup"} className="link">
          {isSignup ? "Log in" : "Sign up"}
        </Link>
      </p>
    </form>
  );
}
