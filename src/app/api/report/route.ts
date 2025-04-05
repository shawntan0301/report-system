import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "~/server/db";
import { z } from "zod";
import { ReportType, UserRole } from "@prisma/client";
import SuperJSON from "superjson";

const createReportSchema = z.object({
  reportType: z.enum(Object.keys(ReportType) as [keyof typeof ReportType]),
  targetId: z.preprocess(
    (val) => {
      if (typeof val === "string" && val.trim() !== "") {
        try {
          return BigInt(val);
        } catch {
          return val;
        }
      }
      return val;
    },
    z.bigint({ invalid_type_error: "Target ID must be a valid number" }),
  ),
  reason: z.string().min(3, "Reason is too short"),
  description: z.string().optional(),
});

const resolveReportSchema = z.object({
  id: z.string(),
});

async function getUserByClerkId(clerkId: string) {
  return await db.user.findUnique({
    where: { clerk_id: clerkId },
    select: { id: true, role: true },
  });
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const idParam = searchParams.get("id");

  // Authenticate request
  const session = await auth();
  if (!session.userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await getUserByClerkId(session.userId);
  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 401 });
  }

  try {
    if (idParam) {
      const report = await db.report.findUnique({
        where: { id: BigInt(idParam) },
        // select: {
        //   id: true,
        //   type: true,
        //   target_id: true,
        //   reason: true,
        //   description: true,
        //   submitted_by: true,
        //   resolved_by: true,
        //   resolved_at: true,
        //   created_at: true,
        // },
      });
      if (!report) {
        return NextResponse.json(
          { error: "Report not found" },
          { status: 404 },
        );
      }

      const serialized = SuperJSON.stringify(report);
      return new NextResponse(serialized, {
        headers: { "Content-Type": "application/json" },
      });
    } else {
      let reports;
      if (user.role === UserRole.admin) {
        reports = await db.report.findMany({
          select: {
            id: true,
            type: true,
            target_id: true,
            reason: true,
            submitted_by: true,
            created_at: true,
            resolved_at: true,
            resolved_by: true,
          },
        });
      } else {
        reports = await db.report.findMany({
          where: { submitted_by: user.id },
          select: {
            id: true,
            type: true,
            target_id: true,
            reason: true,
            submitted_by: true,
            created_at: true,
            resolved_at: true,
            resolved_by: true,
          },
        });
      }
      const serialized = SuperJSON.stringify(reports);
      return new NextResponse(serialized, {
        headers: { "Content-Type": "application/json" },
      });
    }
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : "An unknown error occurred";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
export async function POST(request: Request) {
  try {
    const session = await auth();

    if (!session.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.text();
    const parsedBody = SuperJSON.parse(body);

    const parsed = createReportSchema.parse(parsedBody);

    console.log("Parsed data:", parsed);

    const existingReports = await db.$queryRaw`
      SELECT r.*
      FROM "report" r
      WHERE r."submitted_by" = (
        SELECT u."id" FROM "user" u WHERE u."clerk_id" = ${session.userId}
      )
      AND r."target_id" = ${parsed.targetId}
    `;

    console.log("Existing reports:", existingReports);

    if (Array.isArray(existingReports) && existingReports.length > 0) {
      return NextResponse.json(
        { error: "You have already created a report with this target ID" },
        { status: 409 },
      );
    }

    console.log("We are here!");

    const user = await getUserByClerkId(session.userId);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 401 });
    }

    const report = await db.report.create({
      data: {
        type: parsed.reportType,
        target_id: parsed.targetId,
        reason: parsed.reason,
        description: parsed.description,
        submitted_by: user.id,
        created_at: new Date(),
      },
    });

    console.log("Created report:", report);

    const serialized = SuperJSON.stringify(report);
    return new NextResponse(serialized, {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : "An unknown error occurred";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const session = await auth();
    if (!session.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const body = (await request.json()) as { id: string };
    const parsed = resolveReportSchema.parse(body);

    const user = await db.user.findUnique({
      where: { clerk_id: session.userId },
      select: { id: true },
    });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const updatedReport = await db.report.update({
      where: { id: BigInt(parsed.id) },
      data: {
        resolved_at: new Date(),
        resolved_by: user.id,
      },
    });
    return NextResponse.json(updatedReport, { status: 200 });
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : "An unknown error occurred";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
