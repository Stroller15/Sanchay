import { redirect } from "next/navigation";
import type { Route } from "next";

export default function SignUpPage() {
  // Google OAuth handles sign-up automatically
  redirect("/sign-in" as Route);
}
