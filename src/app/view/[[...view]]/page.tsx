"use client";

import { useParams, useRouter } from "next/navigation";
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
import { toast } from "sonner";
import type { report, user } from "@prisma/client";
import SuperJSON from "superjson";
import { useMutation, useQuery } from "@tanstack/react-query";

const fetchReport = async (id: string) => {
  const res = await fetch(`/api/report?id=${id}`);
  if (!res.ok) {
    throw new Error("Failed to fetch report");
  }

  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const resJson = await res.json();
  // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
  const parsedJSON: report = SuperJSON.deserialize(resJson);
  return parsedJSON;
};

const fetchUser = async () => {
  const res = await fetch("/api/user");
  if (!res.ok) {
    throw new Error("Failed to fetch user");
  }

  const parsedJSON = (await res.json()) as user;
  return parsedJSON;
};

const resolveReport = async (id: string) => {
  try {
    const res = await fetch("/api/report", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });

    const resText = await res.text();
    if (!resText.trim()) {
      return {};
    }
    return SuperJSON.parse(resText);
  } catch (error) {
    console.error("Error resolving report:", error);
    throw new Error("Failed to resolve report");
  }
};

export default function View() {
  const { view } = useParams();
  const reportId = Array.isArray(view) ? view[0] : view;
  const router = useRouter();

  // // Fetch report details
  // const {
  //   data: report,
  //   isLoading,
  //   error,
  // } = api.report.getReportById.useQuery(
  //   reportId ? { id: reportId } : skipToken,
  //   {
  //     refetchOnWindowFocus: false,
  //     refetchOnMount: false,
  //     enabled: !!reportId,
  //   },
  // );

  // // Fetch the current user's role
  // const {
  //   data: user,
  //   isLoading: roleLoading,
  //   error: roleError,
  // } = api.user.getUserRole.useQuery(undefined, {
  //   refetchOnWindowFocus: false,
  //   refetchOnReconnect: false,
  // });

  // // Mutation for resolving the report
  // const resolveReportMutation = api.report.resolveReport.useMutation({
  //   onSuccess: () => {
  //     toast.success("Report resolved successfully");
  //   },
  //   onError: (error) => {
  //     toast.error(`Error resolving report: ${error.message}`);
  //   },
  // });

  const {
    data: report,
    isLoading: reportLoading,
    error: reportError,
  } = useQuery({
    queryKey: ["report", reportId],
    queryFn: () => fetchReport(reportId ?? ""),
    enabled: !!reportId,
  });

  const {
    data: user,
    isLoading: userLoading,
    error: userError,
  } = useQuery({
    queryKey: ["user"],
    queryFn: fetchUser,
  });

  const resolveMutation = useMutation({
    mutationFn: () => resolveReport(reportId ?? ""),
    onSuccess: () => {
      console.log("Report resolved successfully");
      toast.success("Report resolved successfully");
      setTimeout(() => router.push("/dashboard"), 100);
    },
    onError: (error: unknown) => {
      toast.error(`Error resolving report: ${(error as Error).message}`);
    },
  });

  const handleResolve = () => {
    if (reportId) {
      resolveMutation.mutate();
    }
  };

  if (reportLoading || userLoading) return <p>Loading...</p>;
  if (reportError || !report) return <p>Error loading report.</p>;
  if (userError || !user) return <p>Error loading user.</p>;

  // const handleResolve = () => {
  //   if (reportId) {
  //     resolveReportMutation.mutate({ id: reportId });
  //   }
  // };

  return (
    <div className="mx-auto w-[60%] p-4 py-20">
      <h1 className="mb-4 text-2xl font-bold">Report Details</h1>
      <Table>
        <TableCaption>Details for Report ID: {report.id}</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>Field</TableHead>
            <TableHead>Value</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow>
            <TableCell>Report ID</TableCell>
            <TableCell>{report.id}</TableCell>
          </TableRow>
          <TableRow>
            <TableCell>Report Type</TableCell>
            <TableCell>{report.type}</TableCell>
          </TableRow>
          <TableRow>
            <TableCell>Target ID</TableCell>
            <TableCell>{report.target_id}</TableCell>
          </TableRow>
          <TableRow>
            <TableCell>Reason</TableCell>
            <TableCell>{report.reason}</TableCell>
          </TableRow>
          <TableRow>
            <TableCell>Description</TableCell>
            <TableCell>{report.description ?? "N/A"}</TableCell>
          </TableRow>
          <TableRow>
            <TableCell>Submitted By</TableCell>
            <TableCell>{report.submitted_by}</TableCell>
          </TableRow>
          <TableRow>
            <TableCell>Created At</TableCell>
            <TableCell>
              {new Date(report.created_at).toLocaleString()}
            </TableCell>
          </TableRow>
          {report.resolved_at && (
            <TableRow>
              <TableCell>Resolved At</TableCell>
              <TableCell>
                {new Date(report.resolved_at).toLocaleString()}
              </TableCell>
            </TableRow>
          )}
          {report.resolved_by && (
            <TableRow>
              <TableCell>Resolved By</TableCell>
              <TableCell>{report.resolved_by}</TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
      {/* Render the "Resolve Report" button only for admin users and when the report is not already resolved */}
      {user.role == "admin" && !report.resolved_at && (
        <div className="mt-4">
          <Button
            onClick={() => {
              handleResolve();
              setTimeout(() => {
                router.push("/dashboard");
              }, 100);
            }}
            size="sm"
            className="bg-green-500 text-white hover:bg-green-600"
          >
            Resolve Report
          </Button>
        </div>
      )}
      <Button onClick={() => router.back()} className="mt-4">
        Back to Dashboard
      </Button>
    </div>
  );
}
