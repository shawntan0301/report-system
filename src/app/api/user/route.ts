import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "~/server/db";
import { z } from "zod";
import { UserRole } from "@prisma/client";

const userRoleSchema = z.enum(Object.keys(UserRole) as [keyof typeof UserRole]);

const createUserSchema = z.object({
  clerkId: z.string(),
  email: z.string(),
  name: z.string().optional(),
  role: userRoleSchema,
});

const deleteUserSchema = z.object({
  id: z.number(),
});

export async function GET(request: Request) {
  try {
    const session = await auth();
    if (!session.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const user = await db.user.findUnique({
      where: { clerk_id: session.userId },
      select: { role: true },
    });

    console.log("User role from route:", user?.role);

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    return NextResponse.json({ role: user.role });
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as z.infer<typeof createUserSchema>;
    const parsed = createUserSchema.parse(body);

    const user = await db.user.create({
      data: {
        clerk_id: parsed.clerkId,
        email: parsed.email,
        name: parsed.name,
        role: parsed.role,
        created_at: new Date(),
      },
    });
    return NextResponse.json(user, { status: 201 });
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await auth();
    if (!session.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const { searchParams } = new URL(request.url);
    const idParam = searchParams.get("id");
    if (!idParam) {
      return NextResponse.json(
        { error: "Missing id parameter" },
        { status: 400 },
      );
    }
    const parsed = deleteUserSchema.parse({ id: Number(idParam) });
    const user = await db.user.findUnique({ where: { id: parsed.id } });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    if (user.clerk_id !== session.userId) {
      return NextResponse.json(
        { error: "Not authorized to delete this user" },
        { status: 403 },
      );
    }
    const deletedUser = await db.user.delete({ where: { id: parsed.id } });
    return NextResponse.json(deletedUser, { status: 200 });
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
