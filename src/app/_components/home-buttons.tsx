"use client";

import { Button } from "~/components/ui/button";
import { MoveRight } from "lucide-react";
import { SignInButton, SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import { useRouter } from "next/navigation";

export default function HomeButtons() {
  const router = useRouter();

  return (
    <div className="flex flex-row gap-3">
      <SignedOut>
        <SignInButton>
          <Button size="lg" className="gap-4">
            Sign up here <MoveRight className="h-4 w-4" />
          </Button>
        </SignInButton>
      </SignedOut>
      <SignedIn>
        <Button
          size="lg"
          className="gap-4"
          onClick={() => router.push("/submit-report")}
        >
          Submit Report <MoveRight className="h-4 w-4" />
        </Button>
      </SignedIn>
    </div>
  );
}
