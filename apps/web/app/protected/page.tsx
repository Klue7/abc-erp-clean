// Server component (default in app router)
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export default async function ProtectedPage() {
  const user = await currentUser();

  if (!user) {
    redirect("/sign-in?redirect_url=/protected");
  }

  return <div>Welcome! 🎉 Your user ID is: {user.id}</div>;
}
