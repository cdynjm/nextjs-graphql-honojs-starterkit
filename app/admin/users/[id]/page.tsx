"use client";

import { usePageTitle } from "@/components/page-title-context";
import { use, useEffect } from "react";
import Image from "next/image";
import { getGraphQLClient } from "@/lib/graphql-client";
import { gql } from "graphql-request";
import { User } from "@/types/user";
import { useSession } from "next-auth/react";
import { useQuery } from "@tanstack/react-query";
import { SkeletonLoader } from "@/components/ui/skeleton-loader";

export default function UserInfoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { data: session } = useSession();
  const { setTitle } = usePageTitle();

  const { id } = use(params);
  const encryptedID = decodeURIComponent(id);

  useEffect(() => {
    setTitle("Users Info");
    return () => setTitle("");
  }, [setTitle]);

  const graphQLClient = getGraphQLClient(
    "/graphql/schema/admin",
    session?.token
  );

  const fetchUserInfo = async (): Promise<User> => {
    const query = gql`
      query ($encrypted_id: String!) {
        getUserInfo(encrypted_id: $encrypted_id) {
          name
          email
          photo
          role
        }
      }
    `;

    const response = await graphQLClient.request<{ getUserInfo: User }>(query, {
      encrypted_id: encryptedID,
    });

    return response.getUserInfo;
  };

  const { data: user, isPending } = useQuery({
    queryKey: ["user-info", encryptedID],
    queryFn: fetchUserInfo,
    enabled: !!encryptedID,
  });

  return (
    <section className="p-4">
      <div className="grid grid-cols-1 gap-4">
        {isPending ? (
          <SkeletonLoader />
        ) : (
          <>
            <div className="bg-white rounded-xl p-6 flex items-center gap-6">
              <div className="w-24 h-24 relative">
                {user?.photo ? (
                  <Image
                    src={user?.photo || ""}
                    alt={user?.name || ""}
                    width={100}
                    height={100}
                    className="rounded-full object-cover border w-24 h-24 relative"
                    draggable="false"
                    priority
                  />
                ) : (
                  <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center text-[13px] text-gray-500">
                    No Photo
                  </div>
                )}
              </div>

              <div className="flex-1">
                <h2 className="text-2xl font-semibold text-gray-800">
                  {user?.name}
                </h2>
                <p className="text-gray-600 text-sm">{user?.email}</p>
                <span className="inline-block mt-2 px-3 py-1 text-sm rounded-full bg-blue-100 text-blue-700 capitalize">
                  {user?.role === 1 ? (
                    <div>Administrator</div>
                  ) : (
                    <div>User</div>
                  )}
                </span>
              </div>
            </div>
          </>
        )}
      </div>
    </section>
  );
}
