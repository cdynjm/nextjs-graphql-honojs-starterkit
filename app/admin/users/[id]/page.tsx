"use client";

import { usePageTitle } from "@/components/page-title-context";
import { use, useEffect, useState } from "react";
import Image from "next/image";
import { getGraphQLClient } from "@/lib/graphql-client";
import { gql } from "graphql-request";
import { User } from "@/types/user";
import { useSession } from "next-auth/react";
import { useQuery } from "@tanstack/react-query";
import { Post } from "@/types/post";
import {
  Card,
  CardContent,
  CardHeader,
  CardFooter,
} from "@/components/ui/card";
import { formatDate } from "@/lib/date-format";
import { SkeletonLoader } from "@/components/ui/skeleton-loader";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useForm, SubmitHandler } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Loader2, Trash } from "lucide-react";
import axios from "axios";
import { toast } from "sonner";

type DeletePostForm = {
  encrypted_id: string;
};

type UserInfoResult = {
  user: User;
  posts: Post[];
};

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
    setTitle("Profile");
    return () => setTitle("");
  }, [setTitle]);

  const graphQLClient = getGraphQLClient("/graphql/admin", session?.bearer);

  const endpoint = "/api/admin/users" as string;

  const fetchUserInfo = async (): Promise<UserInfoResult> => {
    const query = gql`
      query ($encrypted_id: String!) {
        getUserInfo(encrypted_id: $encrypted_id) {
          name
          email
          photo
          role
        }
        getUserPosts(encrypted_id: $encrypted_id) {
          encrypted_id
          status
          created_at
          author {
            email
            name
            photo
          }
        }
      }
    `;

    const response = await graphQLClient.request<{
      getUserInfo: User;
      getUserPosts: Post[];
    }>(query, {
      encrypted_id: encryptedID,
    });

    return {
      user: response.getUserInfo,
      posts: response.getUserPosts,
    };
  };

  const { data, isPending, refetch } = useQuery({
    queryKey: ["user-info", encryptedID],
    queryFn: fetchUserInfo,
    enabled: !!encryptedID,
  });

  const user = data?.user;
  const posts = data?.posts;

  const [deletePost, setDeletePost] = useState<Post | null>(null);

  const {
    handleSubmit: handleDeleteSubmit,
    reset: resetDeleteForm,
    setValue: setDeleteValue,
    formState: { isSubmitting: isDeleteProcessing },
  } = useForm<DeletePostForm>();

  useEffect(() => {
    if (deletePost) {
      setDeleteValue("encrypted_id", deletePost.encrypted_id ?? ("" as string));
    } else {
      resetDeleteForm();
    }
  }, [deletePost, setDeleteValue, resetDeleteForm]);

  const onDeleteSubmit: SubmitHandler<DeletePostForm> = async (data) => {
    if (!deletePost) return;
    try {
      const res = await axios.delete(endpoint, {
        data: {
          ...data,
          type: "post",
        },
        headers: {
          Authorization: `Bearer ${session?.bearer}`,
        },
      });

      resetDeleteForm();
      setDeletePost(null);
      refetch();

      toast("Deleted successfully", {
        description: res.data.message,
        position: "top-right",
        action: {
          label: "Close",
          onClick: () => {},
        },
      });
    } catch (error) {
      console.error("Delete post failed", error);
    }
  };

  const openDeleteDialog = (post: Post) => {
    setDeletePost(post);
  };

  return (
    <section className="p-4">
      <Dialog
        open={!!deletePost}
        onOpenChange={(open) => !open && setDeletePost(null)}
      >
        <DialogContent className="sm:max-w-[425px]">
          <form onSubmit={handleDeleteSubmit(onDeleteSubmit)}>
            <DialogHeader>
              <DialogTitle>Delete Post</DialogTitle>
              <DialogDescription>
                Are you sure you want to this post? This process cannot be
                undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="pt-4">
              <DialogClose asChild>
                <Button
                  variant="outline"
                  onClick={() => {
                    resetDeleteForm();
                    setDeletePost(null);
                  }}
                >
                  Cancel
                </Button>
              </DialogClose>
              <Button
                type="submit"
                variant="destructive"
                disabled={isDeleteProcessing}
              >
                {isDeleteProcessing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  "Delete"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
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

        {isPending ? (
          <div className="grid grid-cols-1 gap-4">
            {Array.from({ length: 3 }).map((_, index) => (
              <SkeletonLoader key={index} />
            ))}
          </div>
        ) : (
          <>
            <div className="w-full space-y-4">
              {posts?.length ? (
                <>
                  {posts?.map((pos, index) => (
                    <Card
                      key={index}
                      className="w-full border rounded-xl shadow-none"
                    >
                      <CardHeader className="flex flex-col items-start gap-1">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden">
                            {pos.author.photo ? (
                              <Image
                                src={pos.author.photo}
                                width={40}
                                height={40}
                                alt={pos.author.name}
                                className="object-cover w-full h-full"
                                priority
                                draggable="false"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-xs text-gray-500">
                                N/A
                              </div>
                            )}
                          </div>
                          <div>
                            <p className="font-medium">{pos.author.name}</p>
                            <p className="text-sm text-gray-500 text-[13px]">
                              {formatDate(pos.created_at ?? "")}
                            </p>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-gray-800 text-[13px]">
                          {pos.status}
                        </p>
                      </CardContent>
                      {pos.author.email === session?.user.email && (
                      <CardFooter>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-red-500 text-xs ml-[-10px] hover:bg-transparent"
                          onClick={() => openDeleteDialog(pos)}
                        >
                          <Trash /> Delete
                        </Button>
                      </CardFooter>
                      )}
                    </Card>
                  ))}
                </>
              ) : (
                <Card className="shadow-none">
                  <CardContent className="text-center">
                    <p className="text-gray-500 text-[13px]">
                      No posts available.
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </>
        )}
      </div>
    </section>
  );
}
