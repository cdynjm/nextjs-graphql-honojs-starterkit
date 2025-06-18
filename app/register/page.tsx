"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, UploadCloud } from "lucide-react";
import { upload } from "@vercel/blob/client";
import { NProgressLink } from "@/components/ui/nprogress-link";
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

export default function RegisterPage() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    avatar: "",
  });
  const [formErrors, setFormErrors] = useState<{
    name?: string;
    email?: string;
    password?: string;
  }>({});
  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const validateForm = () => {
    const errors: { name?: string; email?: string; password?: string } = {};
    if (!form.name.trim()) errors.name = "Name is required.";
    if (!form.email.trim()) errors.email = "Email is required.";
    else if (!/\S+@\S+\.\S+/.test(form.email))
      errors.email = "Email is invalid.";
    if (!form.password.trim()) errors.password = "Password is required.";
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const uploadImage = async (file: File) => {
    const blob = await upload(file.name, file, {
      access: "public",
      handleUploadUrl: "/api/guest/upload",
    });
    return blob.url;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitError("");
    if (!validateForm()) return;

    setLoading(true);
    try {
      let imageUrl = "";
      if (selectedFile) {
        imageUrl = await uploadImage(selectedFile);
      }

      const response = await fetch("/api/guest/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, avatar: imageUrl }),
      });

      if (!response.ok) {
        const data = await response.json();
        setSubmitError(data.message || "Registration failed.");
        return;
      }
      
      router.push("/");
    } catch (err) {
      console.error(err);
      setSubmitError(err as string);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-white px-4">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>Create your account</CardTitle>
          <CardDescription>
            Fill in the details below to register
          </CardDescription>
          <CardAction>
            <NProgressLink href="/">
              <Button variant="link">Login</Button>
            </NProgressLink>
          </CardAction>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} noValidate>
            <div className="flex flex-col gap-6 mb-4">
              {/* Avatar Preview */}
              <div className="grid gap-2">
                <Label htmlFor="avatar">Profile Image</Label>
                <div
                  className="flex items-center gap-4 cursor-pointer"
                  onClick={() => fileInputRef.current?.click()}
                >
                  {preview ? (
                    <Image
                      src={preview}
                      alt="Preview"
                      width={48}
                      height={48}
                      className="rounded-full border"
                    />
                  ) : (
                    <div className="w-12 h-12 border rounded-full bg-gray-100 flex items-center justify-center text-gray-500">
                      <UploadCloud size={20} />
                    </div>
                  )}
                  <span className="text-sm text-gray-600">
                    {selectedFile ? "Image Preview" : "Click to choose image"}
                  </span>
                </div>
                <input
                  type="file"
                  ref={fileInputRef}
                  className="hidden"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      setSelectedFile(file);
                      setPreview(URL.createObjectURL(file));
                    }
                  }}
                />
              </div>

              {/* Name */}
              <div className="grid gap-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className={formErrors.name ? "border-red-600" : ""}
                />
                {formErrors.name && (
                  <p className="text-sm text-red-600">{formErrors.name}</p>
                )}
              </div>

              {/* Email */}
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className={formErrors.email ? "border-red-600" : ""}
                />
                {formErrors.email && (
                  <p className="text-sm text-red-600">{formErrors.email}</p>
                )}
              </div>

              {/* Password */}
              <div className="grid gap-2 relative">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={form.password}
                  onChange={(e) =>
                    setForm({ ...form, password: e.target.value })
                  }
                  className={formErrors.password ? "border-red-600" : ""}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-[30px] text-gray-500 hover:text-gray-700"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-auto" />
                  ) : (
                    <Eye className="w-5 h-auto" />
                  )}
                </button>
                {formErrors.password && (
                  <p className="text-sm text-red-600">{formErrors.password}</p>
                )}
              </div>
            </div>

            {submitError && (
              <p className="mb-4 text-sm text-red-600">{submitError}</p>
            )}

            <Button
              type="submit"
              className="w-full flex items-center justify-center"
              disabled={loading}
            >
              {loading && <Spinner />}
              {loading ? "Registering..." : "Register"}
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
            rel="noreferrer"
          >
            https://jemcdyn.vercel.app/
          </a>
        </CardFooter>
      </Card>
    </div>
  );
}
