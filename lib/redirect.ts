import { useRouter } from "next/navigation";

type Router = ReturnType<typeof useRouter>;

export function redirectUserByRole(role: number | undefined, router: Router) {
  switch (role) {
    case 1:
      router.push("/admin/dashboard");
      break;
    case 2:
      router.push("/user/dashboard");
      break;
    default:
      router.push("/");
      break;
  }
}