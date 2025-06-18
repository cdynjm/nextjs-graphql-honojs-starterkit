"use client";

import { useSession, signOut } from "next-auth/react";
import { useQuery } from "@tanstack/react-query";
import { getGraphQLClient } from "@/lib/graphql-client";
import { User } from "@/types/user";
import { Button } from "@/components/ui/button";

export default function DashboardPage() {
  const { data: session } = useSession();

  const graphQLClient = getGraphQLClient("/api/user/graphql", session?.token);

  const fetchUsers = async (): Promise<User[]> => {
    const data = await graphQLClient.request<{ users: User[] }>(`
      query {
        users {
          encrypted_id
          name
          email
        }
      }
    `);
    return data.users;
  };

  const { data: users, isLoading, isError, error } = useQuery({
    queryKey: ["users"],
    queryFn: fetchUsers,
  });

  return (
    <section className="p-4">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Welcome to User Dashboard</h1>
        <Button
          onClick={(e) => {
            e.preventDefault();
            signOut({ callbackUrl: "/" });
          }}
          className="text-white"
          variant="destructive"
        >
          Logout
        </Button>
      </div>
      <p>User ID: {session?.user.id}</p>
      <p>Name: {session?.user.name}</p>
      <p>Role: {session?.user.role}</p>
      <p>Created At: {session?.user.created_at}</p>
      <p>Email: {session?.user.email}</p>

      <h2 className="mt-6 text-xl font-semibold">All Users</h2>

      {isLoading && <p>Loading users...</p>}
      {isError && <p className="text-red-500">Error: {(error as Error).message}</p>}

      <ul className="mt-2">
        {users?.map((user) => (
          <li  key={user.encrypted_id} className="border-b py-2">
            {user.name} - {user.email}
          </li>
        ))}
      </ul>
    </section>
  );
}
