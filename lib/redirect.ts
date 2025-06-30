import { useRouter } from "next/navigation";

type Router = ReturnType<typeof useRouter>;

export function redirectUserByRole(role: string | undefined, router: Router) {
  switch (role) {
    case "admin":
      router.push("/admin/dashboard");
      break;
    default:
      router.push("/");
      break;
  }
}