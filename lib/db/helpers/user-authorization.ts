import { getServerSession } from "next-auth";
import { checkRoleAuthorization } from "@/lib/db/helpers/role-authorization";
import { authOptions } from "@/lib/auth";

/**
 * Checks whether the current user is authenticated
 * and authorized for the given permission.
 * 
 * @param requiredPermission Permission name to check (e.g. "get_post")
 * @returns The session object if authorized, throws error otherwise.
 */
export async function checkUserAuthorization(requiredPermission: string) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.role) {
    throw new Error("Not authenticated");
  }

  const allowed = await checkRoleAuthorization(
    session.user.role,
    requiredPermission
  );

  if (!allowed) {
    throw new Error("Forbidden");
  }

  return session;
}
