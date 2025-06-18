"use client";

import { useSession } from "next-auth/react";
import { usePageTitle } from "@/components/page-title-context";
import { useEffect, useState } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { upload } from "@vercel/blob/client";
import { NProgressLink } from "@/components/ui/nprogress-link";

import { useQuery } from "@tanstack/react-query";
import { getGraphQLClient } from "@/lib/graphql-client";
import { gql } from "graphql-request";
import { User } from "@/types/user";
import Image from "next/image";
import { useRef } from "react";

import { SmartPagination } from "@/components/smart-pagination";

import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { Plus, Edit, Trash, Loader2, UploadCloud } from "lucide-react";
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

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

type CreateUserForm = {
  name: string;
  email: string;
  password: string;
};

type UpdateUserForm = {
  encryptedID: string;
  name: string;
  email: string;
};

type DeleteUserForm = {
  encryptedID: string;
};

export default function UsersPage() {
  const { data: session } = useSession();
  const { setTitle } = usePageTitle();

  useEffect(() => {
    setTitle("Users");
    return () => setTitle("");
  }, [setTitle]);

  const graphQLClient = getGraphQLClient(
    "/graphql/schema/admin",
    session?.token
  );

  const fetchUsers = async ({
    queryKey,
  }: {
    queryKey: [string, number, number];
  }) => {
    const [, limit, offset] = queryKey;

    const data = await graphQLClient.request<{
      getUsers: { users: User[]; totalCount: number };
    }>(
      gql`
        query ($limit: Int, $offset: Int) {
          getUsers(limit: $limit, offset: $offset) {
            users {
              encrypted_id
              name
              email
              photo
            }
            totalCount
          }
        }
      `,
      { limit, offset }
    );

    return data.getUsers;
  };

  const [page, setPage] = useState(1);
  const limit = 3;
  const offset = (page - 1) * limit;

  const { data, isPending, refetch } = useQuery({
    queryKey: ["users", limit, offset],
    queryFn: fetchUsers,
  });

  const totalCount = data?.totalCount ?? 0;
  const totalPages = Math.ceil(totalCount / limit);

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editUser, setEditUser] = useState<User | null>(null);
  const [deleteUser, setDeleteUser] = useState<User | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const uploadImage = async (file: File) => {
    const blob = await upload(file.name, file, {
      access: "public",
      handleUploadUrl: "/api/admin/upload",
    });
    return blob.url;
  };

  const {
    register: registerCreate,
    handleSubmit: handleCreateSubmit,
    reset: resetCreateForm,
    formState: { errors: createErrors, isSubmitting: isCreateProcessing },
  } = useForm<CreateUserForm>();

  const onCreateSubmit: SubmitHandler<CreateUserForm> = async (data) => {
    try {
      let imageUrl = "";
      if (selectedFile) {
        imageUrl = await uploadImage(selectedFile);
      }

      const mutation = gql`
        mutation (
          $name: String
          $email: String
          $password: String
          $photo: String
        ) {
          createUser(
            name: $name
            email: $email
            password: $password
            photo: $photo
          ) {
            name
            email
            password
            photo
          }
        }
      `;

      await graphQLClient.request(mutation, {
        name: data.name,
        email: data.email,
        password: data.password,
        photo: imageUrl,
      });

      resetCreateForm();
      setIsCreateOpen(false);
      setSelectedFile(null);
      refetch();

      toast("Created successfully", {
        description: "User has been created with avatar",
        position: "top-right",
        action: {
          label: "Close",
          onClick: () => {},
        },
      });
    } catch (error) {
      console.error("Create user failed", error);
    }
  };

  const {
    register: registerUpdate,
    handleSubmit: handleUpdateSubmit,
    reset: resetUpdateForm,
    setValue: setUpdateValue,
    formState: { errors: updateErrors, isSubmitting: isUpdateProcessing },
  } = useForm<UpdateUserForm>();

  useEffect(() => {
    if (editUser) {
      setUpdateValue("encryptedID", editUser.encrypted_id);
      setUpdateValue("name", editUser.name);
      setUpdateValue("email", editUser.email);
    } else {
      resetUpdateForm();
    }
  }, [editUser, setUpdateValue, resetUpdateForm]);

  const onUpdateSubmit: SubmitHandler<UpdateUserForm> = async (data) => {
    if (!editUser) return;
    try {
      const mutation = gql`
        mutation ($encrypted_id: String, $name: String, $email: String) {
          updateUser(encrypted_id: $encrypted_id, name: $name, email: $email) {
            encrypted_id
            name
            email
          }
        }
      `;

      await graphQLClient.request(mutation, {
        encrypted_id: data.encryptedID,
        name: data.name,
        email: data.email,
      });

      resetUpdateForm();
      setEditUser(null);
      refetch();

      toast("Updated successfully", {
        description: "User information has been updated",
        position: "top-right",
        action: {
          label: "Close",
          onClick: () => {},
        },
      });
    } catch (error) {
      console.error("Update user failed", error);
    }
  };

  const openEditDialog = (user: User) => {
    setEditUser(user);
  };

  const {
    handleSubmit: handleDeleteSubmit,
    reset: resetDeleteForm,
    setValue: setDeleteValue,
    formState: { isSubmitting: isDeleteProcessing },
  } = useForm<DeleteUserForm>();

  useEffect(() => {
    if (deleteUser) {
      setDeleteValue("encryptedID", deleteUser.encrypted_id);
    } else {
      resetDeleteForm();
    }
  }, [deleteUser, setDeleteValue, resetDeleteForm]);

  const onDeleteSubmit: SubmitHandler<DeleteUserForm> = async (data) => {
    if (!deleteUser) return;
    try {
      const mutation = gql`
        mutation ($encrypted_id: String) {
          deleteUser(encrypted_id: $encrypted_id) {
            encrypted_id
          }
        }
      `;

      await graphQLClient.request(mutation, {
        encrypted_id: data.encryptedID,
      });

      resetDeleteForm();
      setDeleteUser(null);
      refetch();

      toast("Deleted successfully", {
        description: "User information has been deleted",
        position: "top-right",
        action: {
          label: "Close",
          onClick: () => {},
        },
      });
    } catch (error) {
      console.error("Delete user failed", error);
    }
  };

  const openDeleteDialog = (user: User) => {
    setDeleteUser(user);
  };

  return (
    <section className="p-4">
      {/* Create User Dialog */}
      <Dialog
        open={isCreateOpen}
        onOpenChange={(open) => {
          setIsCreateOpen(open);
          if (!open) resetCreateForm();
        }}
      >
        <DialogContent className="sm:max-w-[425px] max-h-[150vh] overflow-y-auto">
          <form onSubmit={handleCreateSubmit(onCreateSubmit)}>
            <DialogHeader>
              <DialogTitle>Create User</DialogTitle>
              <DialogDescription>
                Fill in the details to create a new user.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 mt-4">
              {/* Avatar Upload */}
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
                  <span className="text-sm text-gray-600 text-wrap">
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

              <div className="grid gap-3">
                <Label htmlFor="create-name">Name</Label>
                <Input
                  id="create-name"
                  {...registerCreate("name", { required: "Name is required" })}
                />
                {createErrors.name && (
                  <p className="text-red-600 text-sm">
                    {createErrors.name.message}
                  </p>
                )}
              </div>
              <div className="grid gap-3">
                <Label htmlFor="create-email">Email</Label>
                <Input
                  id="create-email"
                  type="email"
                  {...registerCreate("email", {
                    required: "Email is required",
                    pattern: {
                      value: /^\S+@\S+$/i,
                      message: "Invalid email address",
                    },
                  })}
                />
                {createErrors.email && (
                  <p className="text-red-600 text-sm">
                    {createErrors.email.message}
                  </p>
                )}
              </div>
              <div className="grid gap-3">
                <Label htmlFor="create-password">Password</Label>
                <Input
                  id="create-password"
                  type="password"
                  {...registerCreate("password", {
                    required: "Password is required",
                  })}
                />
                {createErrors.password && (
                  <p className="text-red-600 text-sm">
                    {createErrors.password.message}
                  </p>
                )}
              </div>
            </div>

            <DialogFooter className="pt-4">
              <DialogClose asChild>
                <Button
                  variant="outline"
                  onClick={() => {
                    resetCreateForm();
                    setIsCreateOpen(false);
                  }}
                >
                  Cancel
                </Button>
              </DialogClose>
              <Button type="submit" disabled={isCreateProcessing}>
                {isCreateProcessing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  "Create"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Update User Dialog */}
      <Dialog
        open={!!editUser}
        onOpenChange={(open) => !open && setEditUser(null)}
      >
        <DialogContent className="sm:max-w-[425px] max-h-[150vh] overflow-y-auto">
          <form onSubmit={handleUpdateSubmit(onUpdateSubmit)}>
            <DialogHeader>
              <DialogTitle>Update User</DialogTitle>
              <DialogDescription>
                Update user details below. Click save when you are done.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 mt-4">
              <div className="grid gap-3">
                <Label htmlFor="update-name">Name</Label>
                <Input
                  id="update-name"
                  {...registerUpdate("name", { required: "Name is required" })}
                />
                {updateErrors.name && (
                  <p className="text-red-600 text-sm">
                    {updateErrors.name.message}
                  </p>
                )}
              </div>
              <div className="grid gap-3">
                <Label htmlFor="update-email">Email</Label>
                <Input
                  id="update-email"
                  type="email"
                  {...registerUpdate("email", {
                    required: "Email is required",
                    pattern: {
                      value: /^\S+@\S+$/i,
                      message: "Invalid email address",
                    },
                  })}
                />
                {updateErrors.email && (
                  <p className="text-red-600 text-sm">
                    {updateErrors.email.message}
                  </p>
                )}
              </div>
            </div>
            <DialogFooter className="pt-4">
              <DialogClose asChild>
                <Button
                  variant="outline"
                  onClick={() => {
                    resetUpdateForm();
                    setEditUser(null);
                  }}
                >
                  Cancel
                </Button>
              </DialogClose>
              <Button type="submit" disabled={isUpdateProcessing}>
                {isUpdateProcessing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save Changes"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog
        open={!!deleteUser}
        onOpenChange={(open) => !open && setDeleteUser(null)}
      >
        <DialogContent className="sm:max-w-[425px]">
          <form onSubmit={handleDeleteSubmit(onDeleteSubmit)}>
            <DialogHeader>
              <DialogTitle>Delete User</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete user? This process cannot be
                undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="pt-4">
              <DialogClose asChild>
                <Button
                  variant="outline"
                  onClick={() => {
                    resetDeleteForm();
                    setDeleteUser(null);
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

      {/* Header + Add Button */}
      <div className="flex items-center justify-between mb-4">
        <h6 className="font-bold">List of Users</h6>
        <Button
          className="text-xs"
          onClick={() => {
            resetCreateForm();
            setIsCreateOpen(true);
          }}
        >
          <Plus /> Add
        </Button>
      </div>

      {/* Users Table */}
      <div className="grid grid-cols-1">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[100px]">#</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isPending ? (
              <TableRow>
                <TableCell colSpan={4}>
                  <SkeletonLoader />
                </TableCell>
              </TableRow>
            ) : (
              data?.users?.map((user, index) => (
                <TableRow key={user.encrypted_id}>
                  <TableCell className="font-medium">{index + 1}</TableCell>
                  <TableCell>
                    <NProgressLink
                      href={`/admin/users/${encodeURIComponent(
                        user.encrypted_id
                      )}`}
                    >
                      <div className="flex items-center gap-2">
                        {user.photo ? (
                          <div className="w-10 h-10 relative">
                            <Image
                              src={user.photo}
                              alt={user.name}
                              width={100}
                              height={100}
                              className="rounded-full object-cover border w-10 h-10 relative"
                              draggable="false"
                              priority
                            />
                          </div>
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-[9px] text-gray-500">
                            No Photo
                          </div>
                        )}

                        {user.name}
                      </div>
                    </NProgressLink>
                  </TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell className="text-right space-x-0">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => openEditDialog(user)}
                    >
                      <Edit className="mr-1 w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-red-500"
                      onClick={() => openDeleteDialog(user)}
                    >
                      <Trash className="mr-1 w-4 h-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
        <SmartPagination
          currentPage={page}
          totalPages={totalPages}
          onPageChange={setPage}
        />
      </div>
    </section>
  );
}
