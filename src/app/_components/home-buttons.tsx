"use client";

import { Button } from "~/components/ui/button";
import { MoveRight } from "lucide-react";
import { SignInButton, SignedIn, SignedOut } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useQuery } from "@tanstack/react-query";

export default function HomeButtons() {
  const router = useRouter();
  const fetchUser = async () => {
    const res = await fetch("/api/user");
    if (!res.ok) {
      throw new Error("Failed to fetch user role");
    }
    const resJson: { role: "admin" | "user" } = (await res.json()) as {
      role: "admin" | "user";
    };
    return resJson;
  };

  const { data: user } = useQuery({
    queryKey: ["userRole"],
    queryFn: fetchUser,
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
    refetchOnMount: true,
  });

  return (
    <div className="flex flex-row gap-3">
      {/* {user.isError() && ( */}
      <SignedOut>
        <SignInButton>
          <Button size="lg" className="gap-4">
            Sign up here <MoveRight className="h-4 w-4" />
          </Button>
        </SignInButton>
      </SignedOut>
      {/* )} */}
      <SignedIn>
        {user?.role === "admin" && (
          <>
            <Button
              size="lg"
              className="gap-4"
              onClick={() => {
                toast.success("Navigating to Admin Dashboard");
                router.push("/dashboard");
              }}
            >
              Admin Dashboard <MoveRight className="h-4 w-4" />
            </Button>
            <Button
              size="lg"
              className="gap-4"
              onClick={() => {
                toast.success("Navigating to Submit Report");
                router.push("/submit-report");
              }}
            >
              Submit Report <MoveRight className="h-4 w-4" />
            </Button>
          </>
        )}
        {user?.role === "user" && (
          <>
            <Button
              size="lg"
              className="gap-4"
              onClick={() => {
                toast.success("Navigating to User Dashboard");
                router.push("/dashboard");
              }}
            >
              User Dashboard <MoveRight className="h-4 w-4" />
            </Button>
            <Button
              size="lg"
              className="gap-4"
              onClick={() => {
                toast.success("Navigating to Submit Report");
                router.push("/submit-report");
              }}
            >
              Submit Report <MoveRight className="h-4 w-4" />
            </Button>
          </>
        )}
      </SignedIn>
    </div>
  );
}
