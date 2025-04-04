"use client";

import { useParams } from "next/navigation";
import { api } from "~/trpc/react";
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

export default function View() {
  const params = useParams();
  // Assuming your dynamic route folder is [view] and contains the reportId
  const { view } = params as { view: string };
  const reportId = BigInt(view);

  // Fetch report details
  const {
    data: report,
    isLoading,
    error,
  } = api.report.getReportById.useQuery({
    id: reportId,
  });

  // Fetch the current user's role
  const {
    data: user,
    isLoading: roleLoading,
    error: roleError,
  } = api.user.getUserRole.useQuery();

  // Mutation for resolving the report
  const resolveReportMutation = api.report.resolveReport.useMutation();

  if (isLoading || roleLoading) return <p>Loading...</p>;
  if (error || !report || roleError || !user)
    return <p>Error loading report.</p>;
  const handleResolve = () => {
    resolveReportMutation.mutate({ id: reportId });
  };

  return (
    <div className="p-4">
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
            onClick={handleResolve}
            size="sm"
            className="bg-blue-500 text-white hover:bg-blue-600"
          >
            Resolve Report
          </Button>
        </div>
      )}
    </div>
  );
}
