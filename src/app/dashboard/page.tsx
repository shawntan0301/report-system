"use client";

import { useState, useMemo } from "react";
import { SidebarProvider, SidebarInset } from "~/components/ui/sidebar";
import { SiteHeader } from "~/components/site-header";
import {
  Table,
  TableCaption,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "~/components/ui/table";
import { Button } from "~/components/ui/button";
import { type report } from "@prisma/client";
import Link from "next/link";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import SuperJSON from "superjson";

// const fetchReports = async () => {
//   const res = await fetch("/api/report");
//   if (!res.ok) {
//     throw new Error("Network response was not ok");
//   }
//   const resJson: Report[] = (await res.json()) as Report[];
//   return resJson;
// };

const fetchReports = async () => {
  const res = await fetch("/api/report");
  if (!res.ok) {
    throw new Error("Failed to fetch reports");
  }
  const json = await res.text();
  const parsedJSON: report[] = SuperJSON.parse(json);
  return parsedJSON;
};

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

export default function Page() {
  const router = useRouter();

  // const { data: user } = api.user.getUserRole.useQuery(undefined, {
  //   refetchOnWindowFocus: false,
  //   refetchOnReconnect: false,
  // });
  // const role = user?.role ?? "user";

  // const { data: reports } = api.report.getAllReportsHeaders.useQuery(
  //   undefined,
  //   {
  //     refetchOnWindowFocus: true,
  //     refetchOnReconnect: true,
  //     refetchOnMount: true,
  //   },
  // );

  const { data: user } = useQuery({
    queryKey: ["userRole"],
    queryFn: fetchUser,
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
    refetchOnMount: true,
  });

  const { data: reports } = useQuery({
    queryKey: ["reports"],
    queryFn: fetchReports,
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
    refetchOnMount: true,
  });

  console.log("Reports:", reports);
  console.log("User Role:", user);

  const role = user?.role ?? "user";

  const [typeFilter, setTypeFilter] = useState("all");
  const [resolutionFilter, setResolutionFilter] = useState("all");

  const filteredReports: report[] = useMemo(() => {
    if (!reports) return [];
    return reports.filter((report) => {
      const typeMatches = typeFilter === "all" || report.type === typeFilter;
      const resolutionMatches =
        resolutionFilter === "all" ||
        (resolutionFilter === "resolved"
          ? report.resolved_at !== null
          : report.resolved_at === null);
      return typeMatches && resolutionMatches;
    });
  }, [reports, typeFilter, resolutionFilter]);

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
                {/* Filtering Controls */}
                <div className="mb-4 flex gap-4">
                  <select
                    value={typeFilter}
                    onChange={(e) => {
                      const value = e.target.value;
                      setTypeFilter(value);
                      toast.success(
                        value === "all"
                          ? "Showing all types"
                          : `Filtering by type: ${value}`,
                      );
                    }}
                    className="rounded border p-2"
                  >
                    <option value="all">All Types</option>
                    <option value="review">Review</option>
                    <option value="user">User</option>
                    <option value="business">Business</option>
                    <option value="service">Service</option>
                    <option value="other">Other</option>
                  </select>
                  <select
                    value={resolutionFilter}
                    onChange={(e) => {
                      const value = e.target.value;
                      setResolutionFilter(value);
                      toast.success(
                        value === "all"
                          ? "Showing all statuses"
                          : `Filtering by status: ${value}`,
                      );
                    }}
                    className="rounded border p-2"
                  >
                    <option value="all">All Statuses</option>
                    <option value="resolved">Resolved</option>
                    <option value="unresolved">Unresolved</option>
                  </select>
                </div>
                <Table>
                  {filteredReports.length > 0 && (
                    <TableCaption>A list of submitted reports</TableCaption>
                  )}
                  {filteredReports.length === 0 && (
                    <TableCaption>
                      No reports found. You can submit a new report using the
                      button below.
                    </TableCaption>
                  )}
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[100px]"></TableHead>
                      <TableHead>Report Type</TableHead>
                      <TableHead>Target ID</TableHead>
                      <TableHead className="text-right">Reason</TableHead>
                      {role === "admin" && (
                        <TableHead className="text-right">
                          Submitted By
                        </TableHead>
                      )}
                      <TableHead className="text-right">Resolved By</TableHead>
                      <TableHead className="text-right">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredReports.map((report) => (
                      <TableRow key={report.id.toString()}>
                        <TableCell className="font-medium">
                          <Link href={`/view/${report.id}`}>
                            <Button asChild variant="outline" size="sm">
                              <span>View</span>
                            </Button>
                          </Link>
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
                        <TableCell className="text-right">
                          {report.resolved_by}
                        </TableCell>
                        <TableCell className="text-right">
                          {report.resolved_at ? (
                            <Button
                              size="sm"
                              className="bg-green-500 text-white hover:bg-green-600"
                            >
                              Resolved
                            </Button>
                          ) : (
                            <Button
                              size="sm"
                              className="bg-red-500 text-white hover:bg-red-600"
                            >
                              Unresolved
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                <Button onClick={() => router.push("/submit-report")}>
                  Submit New Report
                </Button>
              </div>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
