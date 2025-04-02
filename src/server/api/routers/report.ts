import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { ReportType, UserRole } from "@prisma/client";
// import { Target } from "lucide-react";
// import { resolve } from "path";

const reportType = Object.keys(ReportType) as [keyof typeof ReportType];

export const reportRouter = createTRPCRouter({
  createReport: protectedProcedure
    .input(
      z.object({
        reportType: z.enum(reportType),
        targetId: z.bigint(),
        reason: z.string().min(3, "Reason is too short"),
        description: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { reportType, targetId, reason, description } = input;

      // Check if the report is already reported
      const existingReport = await ctx.db.report.findFirst({
        where: {
          target_id: targetId,
        },
      });

      if (existingReport) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "You have already created a report with this target ID",
        });
      }

      // Create the report
      const report = await ctx.db.report.create({
        data: {
          type: reportType,
          target_id: targetId,
          reason,
          description,
          submitted_by: BigInt(ctx.session.userId),
          created_at: new Date(),
        },
      });

      return report;
    }),

  updateReport: protectedProcedure
    .input(
      z.object({
        id: z.bigint(),
        reason: z.string().optional(),
        description: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { id, reason, description } = input;

      // Check if the report exists
      const report = await ctx.db.report.findUnique({
        where: { id },
      });

      if (!report) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Report not found",
        });
      }

      // Update the report
      const updatedReport = await ctx.db.report.update({
        where: { id },
        data: { reason, description },
      });

      return updatedReport;
    }),

  deleteReport: protectedProcedure
    .input(
      z.object({
        id: z.bigint(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const deletedReport = await ctx.db.report.delete({
        where: { id: input.id },
      });
      return deletedReport;
    }),

  getAllReportsHeaders: protectedProcedure.query(async ({ ctx }) => {
    console.log("User ID:", ctx.session.userId);
    const userId = BigInt(ctx.session.userId);

    const userRole = await ctx.db.user.findUnique({
      where: { id: userId },
      select: { role: true },
    });

    if (!userRole) {
      // If userRole is not found, throw an error.
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "User not found or not authorized.",
      });
    }

    if (userRole?.role == UserRole.admin) {
      return await ctx.db.report.findMany({
        select: {
          id: true,
          type: true,
          target_id: true,
          reason: true,
          submitted_by: true,
          created_at: true,
        },
      });
    } else {
      return await ctx.db.report.findMany({
        where: { submitted_by: userId },
        select: {
          id: true,
          type: true,
          target_id: true,
          reason: true,
          submitted_by: true,
          created_at: true,
        },
      });
    }
  }),

  resolveReport: protectedProcedure
    .input(
      z.object({
        id: z.bigint(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return await ctx.db.report.update({
        where: { id: input.id },
        data: {
          resolved_at: new Date(),
          resolved_by: BigInt(ctx.session.userId),
        },
      });
    }),
});
