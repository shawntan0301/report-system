"use client";

// import { useRouter } from "next/navigation";
import { SiteHeader } from "~/components/site-header";
import { SidebarInset, SidebarProvider } from "~/components/ui/sidebar";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { api } from "~/trpc/react";

export default function Page() {
  // const router = useRouter();
  const { data: userRole } = api.user.getUserRole.useQuery(undefined, {
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });
  const role = userRole ?? "user";
  const { data: reports } = api.report.getAllReportsHeaders.useQuery(
    undefined,
    {
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
    },
  );

  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }
    >
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
              <div className="px-4 lg:px-6">
                <Table>
                  <TableCaption>A list of submitted reports</TableCaption>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[100px]">Report ID</TableHead>
                      <TableHead>Report Type</TableHead>
                      <TableHead>Target ID</TableHead>
                      <TableHead className="text-right">Reason</TableHead>
                      {role === "admin" && (
                        <TableHead className="text-right">
                          Submitted By
                        </TableHead>
                      )}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {reports?.map((report) => (
                      <TableRow key={report.id.toString()}>
                        <TableCell className="font-medium">
                          {report.id}
                        </TableCell>
                        <TableCell>{report.type}</TableCell>
                        <TableCell>{report.target_id}</TableCell>
                        <TableCell className="text-right">
                          {report.reason}
                        </TableCell>
                        {role === "admin" && (
                          <TableCell className="text-right">
                            {report.submitted_by}
                          </TableCell>
                        )}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
