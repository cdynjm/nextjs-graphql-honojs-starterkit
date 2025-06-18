"use client";

import { useState } from "react";
import { signIn, getSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { NProgressLink } from "@/components/ui/nprogress-link";
import { Eye, EyeOff } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardFooter,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Image from "next/image";

import { redirectUserByRole } from "@/lib/redirect";

// A simple loading spinner icon component (SVG)
function Spinner() {
  return (
    <svg
      className="animate-spin h-5 w-5 mr-2 text-white inline-block"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      ></circle>
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
      ></path>
    </svg>
  );
}

export default function LoginPage() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [formErrors, setFormErrors] = useState<{
    email?: string;
    password?: string;
  }>({});
  const [loginError, setLoginError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const router = useRouter();

  const validateForm = () => {
    const errors: { email?: string; password?: string } = {};
    if (!form.email.trim()) errors.email = "Email is required.";
    if (!form.password.trim()) errors.password = "Password is required.";

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoginError("");
    if (!validateForm()) return;

    setLoading(true);

    const res = await signIn("credentials", {
      email: form.email,
      password: form.password,
      redirect: false,
    });

    if (res?.ok) {
      const session = await getSession();
      const role = session?.user?.role;

      redirectUserByRole(role, router);
    } else {
      setLoginError("Login failed. Please check your email and password.");
    }

    setLoading(false);
  };

  return (
    <div className="flex items-center justify-center min-h-screen px-4 bg-white">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>Login to your account</CardTitle>
          <CardDescription>
            Enter your email below to login to your account
          </CardDescription>
          <CardAction>
            <NProgressLink href="/register">
              <Button variant="link">Sign Up</Button>
            </NProgressLink>
          </CardAction>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} noValidate>
            <div className="flex flex-col gap-6 mb-4">
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  aria-invalid={!!formErrors.email}
                  aria-describedby="email-error"
                />
                {formErrors.email && (
                  <p id="email-error" className="text-sm text-red-600 mt-1">
                    {formErrors.email}
                  </p>
                )}
              </div>
              <div className="grid gap-2 relative">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
                  value={form.password}
                  onChange={(e) =>
                    setForm({ ...form, password: e.target.value })
                  }
                  aria-invalid={!!formErrors.password}
                  aria-describedby={
                    formErrors.password ? "password-error" : undefined
                  }
                  className={formErrors.password ? "border-red-600" : ""}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-[30px] text-sm text-gray-500 hover:text-gray-700 focus:outline-none select-none"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-auto" />
                  ) : (
                    <Eye className="w-5 h-auto" />
                  )}
                </button>
                {formErrors.password && (
                  <p id="password-error" className="text-sm text-red-600 mt-1">
                    {formErrors.password}
                  </p>
                )}
              </div>
            </div>

            {loginError && (
              <p className="mb-4 text-sm text-red-600">{loginError}</p>
            )}

            <Button
              type="submit"
              className="w-full flex items-center justify-center"
              disabled={loading}
            >
              {loading && <Spinner />}
              {loading ? "Logging in..." : "Login"}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="text-center flex flex-col justify-center">
          <small className="font-semibold flex items-center gap-2">
            <Image src="/logo.png" width={24} height={24} alt="Logo" priority />
            JEM CDYN, Dev.
          </small>
          <a
            href="https://jemcdyn.vercel.app/"
            target="_blank"
            className="text-[12px]"
          >
            https://jemcdyn.vercel.app/
          </a>
        </CardFooter>
      </Card>
    </div>
  );
}
