"use client";

import { useEffect } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { useSession, getSession } from "next-auth/react";

import { usePageTitle } from "@/components/page-title-context";
import { getGraphQLClient } from "@/lib/graphql-client";
import { gql } from "graphql-request";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

type UpdateUserForm = {
  encryptedID: string;
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

  const graphQLClient = getGraphQLClient(
    "/graphql/schema/admin/",
    session?.token
  );

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<UpdateUserForm>();

  useEffect(() => {
    setValue("encryptedID", session?.user.id ?? "");
    setValue("name", session?.user.name ?? "");
    setValue("email", session?.user.email ?? "");
  }, [setValue, session]);

  const onUpdateSubmit: SubmitHandler<UpdateUserForm> = async (data) => {
    try {
      const mutation = gql`
        mutation (
          $encrypted_id: String
          $name: String!
          $email: String!
          $password: String
        ) {
          updateProfile(
            encrypted_id: $encrypted_id
            name: $name
            email: $email
            password: $password
          ) {
            encrypted_id
            name
            email
            password
          }
        }
      `;

      await graphQLClient.request(mutation, {
        encrypted_id: data.encryptedID,
        name: data.name,
        email: data.email,
        password: data.password || undefined,
      });

      await getSession();

      toast("Updated successfully", {
        description:
          "User information has been updated. The page will reload to refresh your session.",
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
        <input type="hidden" {...register("encryptedID")} />

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
