"use client";

import { useEffect } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { useSession, getSession } from "next-auth/react";

import { usePageTitle } from "@/components/page-title-context";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import axios from "axios";

type UpdateUserForm = {
  encrypted_id: string;
  name: string;
  email: string;
  password: string;
};

export default function ProfilePage() {
  const { data: session } = useSession();
  const { setTitle } = usePageTitle();

  useEffect(() => {
    setTitle("Profile");
    return () => setTitle("");
  }, [setTitle]);

  const endpoint = "/api/admin/profile" as string;

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<UpdateUserForm>();

  useEffect(() => {
    setValue("encrypted_id", session?.user.id ?? "");
    setValue("name", session?.user.name ?? "");
    setValue("email", session?.user.email ?? "");
  }, [setValue, session]);

  const onUpdateSubmit: SubmitHandler<UpdateUserForm> = async (data) => {
    try {
      const res = await axios.put(
        endpoint,
        {
          ...data
        },
        {
          headers: {
            Authorization: `Bearer ${session?.bearer}`,
          },
        }
      );

      await getSession();

      toast("Updated successfully", {
        description: res.data.message,
        position: "top-right",
        action: {
          label: "Close",
          onClick: () => {},
        },
      });

      // Reload the page after 2 seconds
      setTimeout(() => {
        window.location.reload();
      }, 2000);
    } catch (error) {
      console.error("Update user failed", error);
    }
  };

  return (
    <section className="p-4 mt-8 max-w-xl mx-auto">
      <div className="mb-6">
        <h2 className="text-xl font-bold">Profile Settings</h2>
        <p className="text-sm text-gray-500">
          Update your account information.
        </p>
      </div>

      <form onSubmit={handleSubmit(onUpdateSubmit)} className="space-y-4">
        <input type="hidden" {...register("encrypted_id")} />

        <div>
          <Label htmlFor="name" className="mb-2">
            Name
          </Label>
          <Input
            id="name"
            className="mb-2"
            {...register("name", { required: "Name is required" })}
            placeholder="Enter your name"
          />
          {errors.name && (
            <p className="text-red-600 text-sm">{errors.name.message}</p>
          )}
        </div>

        <div>
          <Label htmlFor="email" className="mb-2">
            Email
          </Label>
          <Input
            id="email"
            type="email"
            className="mb-2"
            {...register("email", { required: "Email is required" })}
            placeholder="Enter your email"
          />
          {errors.email && (
            <p className="text-red-600 text-sm">{errors.email.message}</p>
          )}
        </div>

        <div>
          <Label htmlFor="password" className="mb-2">
            Password
          </Label>
          <Input
            id="password"
            className="mb-2"
            type="password"
            {...register("password")}
            placeholder="Enter new password"
          />
        </div>

        <div className="pt-2">
          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </form>
    </section>
  );
}
