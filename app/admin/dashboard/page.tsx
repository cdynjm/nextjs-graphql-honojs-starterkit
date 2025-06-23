"use client";

import { usePageTitle } from "@/components/page-title-context";
import { useEffect, useState } from "react";
// import { Users, Folder, FileText } from "lucide-react";
import { useForm, SubmitHandler } from "react-hook-form";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Loader2, Trash } from "lucide-react";
import axios from "axios";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { useQuery } from "@tanstack/react-query";
import { getGraphQLClient } from "@/lib/graphql-client";
import { gql } from "graphql-request";
import { Post } from "@/types/post";
import {
  Card,
  CardContent,
  CardHeader,
  CardFooter,
} from "@/components/ui/card";
import Image from "next/image";
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

type CreatePostForm = {
  encrypted_id: string;
  status: string;
};

type DeletePostForm = {
  encrypted_id: string;
};

export default function DashboardPage() {
  const { setTitle } = usePageTitle();
  const { data: session } = useSession();
  useEffect(() => {
    setTitle("Dashboard");
    return () => setTitle("");
  }, [setTitle]);

  const graphQLClient = getGraphQLClient("/graphql/admin", session?.token);

  const endpoint = "/api/admin/dashboard" as string;

  const {
    register: registerPost,
    handleSubmit: handlePostSubmit,
    setValue: setPostValue,
    formState: { errors: postErrors, isSubmitting: isPostSubmitting },
  } = useForm<CreatePostForm>();

  useEffect(() => {
    setPostValue("encrypted_id", session?.user.id ?? "");
  }, [setPostValue, session]);

  const fetchPosts = async (): Promise<Post[]> => {
    const query = gql`
      query {
        getPosts {
          encrypted_id
          status
          author {
            name
            email
            photo
          }
          created_at
        }
      }
    `;

    const response = await graphQLClient.request<{ getPosts: Post[] }>(query);

    return response.getPosts;
  };

  const {
    data: posts,
    refetch,
    isPending,
  } = useQuery({
    queryKey: ["posts"],
    queryFn: fetchPosts,
  });

  const onPostSubmit: SubmitHandler<CreatePostForm> = async (data) => {
    try {
      const res = await axios.post(
        endpoint,
        {
          ...data,
        },
        {
          headers: {
            Authorization: `Bearer ${session?.bearer}`,
          },
        }
      );

      refetch();

      toast("Status posted successfully", {
        description: res.data.message,
        position: "top-right",
        action: {
          label: "Close",
          onClick: () => {},
        },
      });
    } catch (error) {
      let message = "Something went wrong";
      if (axios.isAxiosError(error)) {
        message = error.response?.data?.error;
      }
      toast("Error occurred", {
        description: message,
        position: "top-right",
        action: {
          label: "Close",
          onClick: () => {},
        },
      });
    }
  };

  const [deletePost, setDeletePost] = useState<Post | null>(null);
  
  const {
    handleSubmit: handleDeleteSubmit,
    reset: resetDeleteForm,
    setValue: setDeleteValue,
    formState: { isSubmitting: isDeleteProcessing },
  } = useForm<DeletePostForm>();

  useEffect(() => {
    if (deletePost) {
      setDeleteValue("encrypted_id", deletePost.encrypted_id ?? "" as string);
    } else {
      resetDeleteForm();
    }
  }, [deletePost, setDeleteValue, resetDeleteForm]);

  const onDeleteSubmit: SubmitHandler<DeletePostForm> = async (data) => {
      if (!deletePost) return;
      try {
        const res = await axios.delete(endpoint, {
          data: {
            ...data
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

  /*  const stats = [
    {
      title: "Sample Card 1",
      value: 1,
      bg: "bg-green-50",
      icon: <Users className="w-5 h-5 text-gray-500" />,
    },
    {
      title: "Sample Card 2",
      value: 4,
      bg: "bg-blue-50",
      icon: <Folder className="w-5 h-5 text-gray-500" />,
    },
    {
      title: "Sample Card 3",
      value: 0,
      bg: "bg-red-50",
      icon: <FileText className="w-5 h-5 text-gray-500" />,
    },
    {
      title: "Sample Card 4",
      value: 2,
      bg: "bg-yellow-50",
      icon: <Users className="w-5 h-5 text-gray-500" />,
    },
  ]; */

  return (
    <section className="p-4">
      {/**
       
       <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
        {stats.map((item, index) => (
          <div
            key={index}
            className="border rounded-xl overflow-hidden bg-white"
          >
            <div
              className={`flex justify-between items-center px-4 py-2 ${item.bg}`}
            >
              <h3 className="text-sm font-semibold text-gray-700">
                {item.title}
              </h3>
              {item.icon}
            </div>
            <div className="p-4">
              <p className="text-3xl font-bold">{item.value}</p>
            </div>
          </div>
        ))}
      </div>
       */}

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

      <div className="grid grid-cols-1 gap-4 justify-center mx-0 lg:mx-50">
        <form onSubmit={handlePostSubmit(onPostSubmit)}>
          <div className="flex-cols items-center gap-2">
            <div className="w-full mb-4">
              <Textarea
                id="create-post"
                {...registerPost("status", { required: "Status is required" })}
                placeholder="What's on your mind?"
                className="mb-2"
              />
              {postErrors.status && (
                <p className="text-red-600 text-sm">
                  {postErrors.status.message}
                </p>
              )}
            </div>
            <Button type="submit" disabled={isPostSubmitting}>
              {isPostSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Posting
                </>
              ) : (
                "Post"
              )}
            </Button>
          </div>
        </form>

        {isPending ? (
          <div className="grid grid-cols-1 gap-4">
            {Array.from({ length: 3 }).map((_, index) => (
              <SkeletonLoader key={index} />
            ))}
          </div>
        ) : (
          <>
            <div className="w-full space-y-4">
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
                    <p className="text-gray-800 text-[13px]">{pos.status}</p>
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
            </div>
          </>
        )}
      </div>
    </section>
  );
}
