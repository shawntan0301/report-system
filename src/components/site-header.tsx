import { Separator } from "~/components/ui/separator";
import { SignOutButton } from "@clerk/nextjs";
import { Button } from "./ui/button";
import { MoveRight } from "lucide-react";

export function SiteHeader() {
  return (
    <header className="flex h-(--header-height) shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)">
      <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
        <Separator
          orientation="vertical"
          className="mx-2 data-[orientation=vertical]:h-4"
        />
        <h1 className="text-base font-medium">All Reports</h1>
        <div className="ml-auto flex items-center gap-2"></div>
        <div>
          <SignOutButton>
            <Button size="lg" className="gap-4">
              Sign Out <MoveRight className="h-4 w-4" />
            </Button>
          </SignOutButton>
        </div>
      </div>
    </header>
  );
}
