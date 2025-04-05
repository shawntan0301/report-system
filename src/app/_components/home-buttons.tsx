"use client";

import { Button } from "~/components/ui/button";
import { MoveRight } from "lucide-react";
import { SignInButton, SignedIn, SignedOut } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { api } from "~/trpc/react";
import { toast } from "sonner";

export default function HomeButtons() {
  const router = useRouter();
  const user = api.user.getUserRole.useQuery(undefined, {
    refetchOnWindowFocus: false,
    refetchOnMount: false,
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
        {user.data?.role === "admin" && (
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
        {user.data?.role === "user" && (
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
