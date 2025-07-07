"use client";

import { useState, useRef, useEffect } from "react";
import { signIn, getSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { NProgressLink } from "@/components/ui/nprogress-link";
import { Eye, EyeOff } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Image from "next/image";
import { SendIcon, MessageCircle } from "lucide-react";

import { redirectUserByRole } from "@/lib/redirect";

// A simple loading spinner icon component (SVG)
function Spinner() {
  return (
    <svg
      className="animate-spin h-5 w-5 mr-0 text-white inline-block"
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

interface Message {
  sender: "user" | "ai";
  text: string;
  isTyping?: boolean;
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
      const role = session?.user?.roleName;

      redirectUserByRole(role, router);
    } else {
      setLoginError("Login failed. Please check your email and password.");
    }

    setLoading(false);
  };

  const ai_endpoint = process.env.NEXT_PUBLIC_FLASK_AI_ENDPOINT_CHAT as string;

  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [loadingChat, setLoadingChat] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const typeText = (fullText: string, callback: (text: string) => void) => {
    let index = 0;
    const speed = 20;

    const type = () => {
      if (index <= fullText.length) {
        callback(fullText.slice(0, index));
        index++;
        setTimeout(type, speed);
      }
    };

    type();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage: Message = { sender: "user", text: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoadingChat(true);

    try {
      const res = await fetch(ai_endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: userMessage.text }),
      });

      const data = await res.json();
      const fullAIResponse = data.response || "No response from AI.";

      setMessages((prev) => [
        ...prev,
        { sender: "ai", text: "", isTyping: true },
      ]);

      typeText(fullAIResponse, (typedText) => {
        setMessages((prev) => {
          const updated = [...prev];
          const last = updated[updated.length - 1];
          if (last && last.sender === "ai") {
            updated[updated.length - 1] = { ...last, text: typedText };
          }
          return updated;
        });
      });
    } catch {
      setMessages((prev) => [
        ...prev,
        { sender: "ai", text: "Error fetching AI response." },
      ]);
    } finally {
      setLoadingChat(false);
    }
  };

  return (
    <div className="grid md:grid-cols-2 grid-cols-1 p-6 md:p-10 gap-6">
      <Card className="shadow-none">
        <CardContent>
            <div className="flex flex-col items-center justify-center text-center">
            <h1 className="text-2xl font-bold mb-4 flex items-center gap-1 text-blue-500">
              <MessageCircle />
              AI Chatbot
            </h1>
            </div>

          <div className="flex-1 overflow-y-auto rounded-lg p-4">
            {messages.length === 0 && (
              <p className="text-center text-gray-400">
                Start the conversation...
              </p>
            )}
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`mb-3 flex ${
                  msg.sender === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[70%] px-4 py-2 rounded-lg ${
                    msg.sender === "user"
                      ? "bg-blue-600 text-white rounded-br-none"
                      : "bg-gray-200 text-gray-900 rounded-bl-none"
                  }`}
                >
                  {msg.text}
                  {msg.isTyping && <span className="animate-pulse"></span>}
                </div>
              </div>
            ))}
            <div ref={chatEndRef} />
          </div>

          <form
            onSubmit={handleSubmit}
            className="mt-4 flex gap-2 items-center"
          >
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type something..."
              disabled={loadingChat}
              className="flex-1"
            />
            <Button
              type="submit"
              disabled={loadingChat}
              className="bg-blue-600 text-white px-6 py-2 rounded disabled:opacity-50"
            >
              <SendIcon />
            </Button>
          </form>
        </CardContent>
      </Card>

      <div className="w-full">
        <Card className="overflow-hidden p-0 shadow-none">
          <CardContent className="grid p-0 md:grid-cols-2">
            <form className="p-6 md:p-8" onSubmit={handleLogin} noValidate>
              <div className="flex flex-col gap-6">
                <div className="flex flex-col items-center text-center">
                  <h1 className="text-[16px] font-bold">Welcome Back</h1>
                  <p className="text-muted-foreground text-[14px]">
                    Log in with your credentials to continue.
                  </p>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Email"
                    value={form.email}
                    onChange={(e) =>
                      setForm({ ...form, email: e.target.value })
                    }
                    aria-invalid={!!formErrors.email}
                    aria-describedby="email-error"
                  />
                  {formErrors.email && (
                    <p id="email-error" className="text-sm text-red-600 mt-0">
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
                    aria-label={
                      showPassword ? "Hide password" : "Show password"
                    }
                  >
                    {showPassword ? (
                      <EyeOff className="w-5 h-auto" />
                    ) : (
                      <Eye className="w-5 h-auto" />
                    )}
                  </button>
                  {formErrors.password && (
                    <p
                      id="password-error"
                      className="text-sm text-red-600 mt-0"
                    >
                      {formErrors.password}
                    </p>
                  )}
                </div>
                {loginError && (
                  <p className="text-sm text-red-600 my-[-10px]">
                    {loginError}
                  </p>
                )}

                <Button
                  type="submit"
                  className="w-full flex items-center justify-center"
                  disabled={loading}
                >
                  {loading && <Spinner />}
                  {loading ? "Logging in..." : "Login"}
                </Button>

                <div className="after:border-border relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t">
                  <span className="bg-card text-muted-foreground relative z-10 px-2">
                    Or continue with
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <Button variant="outline" type="button" className="w-full">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                      <path
                        d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09zM15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.688 3.559-1.701"
                        fill="currentColor"
                      />
                    </svg>
                    <span className="sr-only">Login with Apple</span>
                  </Button>
                  <Button variant="outline" type="button" className="w-full">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                      <path
                        d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"
                        fill="currentColor"
                      />
                    </svg>
                    <span className="sr-only">Login with Google</span>
                  </Button>
                  <Button variant="outline" type="button" className="w-full">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                      <path
                        d="M6.915 4.03c-1.968 0-3.683 1.28-4.871 3.113C.704 9.208 0 11.883 0 14.449c0 .706.07 1.369.21 1.973a6.624 6.624 0 0 0 .265.86 5.297 5.297 0 0 0 .371.761c.696 1.159 1.818 1.927 3.593 1.927 1.497 0 2.633-.671 3.965-2.444.76-1.012 1.144-1.626 2.663-4.32l.756-1.339.186-.325c.061.1.121.196.183.3l2.152 3.595c.724 1.21 1.665 2.556 2.47 3.314 1.046.987 1.992 1.22 3.06 1.22 1.075 0 1.876-.355 2.455-.843a3.743 3.743 0 0 0 .81-.973c.542-.939.861-2.127.861-3.745 0-2.72-.681-5.357-2.084-7.45-1.282-1.912-2.957-2.93-4.716-2.93-1.047 0-2.088.467-3.053 1.308-.652.57-1.257 1.29-1.82 2.05-.69-.875-1.335-1.547-1.958-2.056-1.182-.966-2.315-1.303-3.454-1.303zm10.16 2.053c1.147 0 2.188.758 2.992 1.999 1.132 1.748 1.647 4.195 1.647 6.4 0 1.548-.368 2.9-1.839 2.9-.58 0-1.027-.23-1.664-1.004-.496-.601-1.343-1.878-2.832-4.358l-.617-1.028a44.908 44.908 0 0 0-1.255-1.98c.07-.109.141-.224.211-.327 1.12-1.667 2.118-2.602 3.358-2.602zm-10.201.553c1.265 0 2.058.791 2.675 1.446.307.327.737.871 1.234 1.579l-1.02 1.566c-.757 1.163-1.882 3.017-2.837 4.338-1.191 1.649-1.81 1.817-2.486 1.817-.524 0-1.038-.237-1.383-.794-.263-.426-.464-1.13-.464-2.046 0-2.221.63-4.535 1.66-6.088.454-.687.964-1.226 1.533-1.533a2.264 2.264 0 0 1 1.088-.285z"
                        fill="currentColor"
                      />
                    </svg>
                    <span className="sr-only">Login with Meta</span>
                  </Button>
                </div>
                <div className="text-center flex flex-col justify-center">
                  <small className="font-semibold flex items-center justify-center gap-2">
                    <Image
                      src="/logo.png"
                      width={24}
                      height={24}
                      alt="Logo"
                      priority
                    />
                    JEM CDYN, Dev.
                  </small>
                  <a
                    href="https://jemcdyn.vercel.app/"
                    target="_blank"
                    className="text-[12px]"
                  >
                    https://jemcdyn.vercel.app/
                  </a>
                </div>
                <div className="text-center text-gray-700 text-xs">
                  Don&apos;t have an account?{" "}
                  <NProgressLink
                    href="/register"
                    className="underline underline-offset-4"
                  >
                    Sign up
                  </NProgressLink>
                </div>
              </div>
            </form>
            <div className="bg-white relative hidden md:block">
              <Image
                src="/chatbot.png"
                width={1000}
                height={1000}
                alt="Logo"
                priority
                draggable="false"
                className="absolute inset-0 h-full w-full p-15"
              />
            </div>
          </CardContent>
        </Card>
      </div>
      
    </div>
  );
}
