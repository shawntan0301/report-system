import { z } from "zod";
import { TRPCError } from "@trpc/server";
import {
  createTRPCRouter,
  publicProcedure,
  protectedProcedure,
} from "~/server/api/trpc";
import { UserRole } from "@prisma/client";

const userRole = Object.keys(UserRole) as [keyof typeof UserRole];

export const userRouter = createTRPCRouter({
  createUser: publicProcedure
    .input(
      z.object({
        clerkId: z.string(),
        email: z.string(),
        name: z.string().optional(),
        role: z.enum(userRole),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const user = await ctx.db.user.create({
        data: {
          clerk_id: input.clerkId,
          email: input.email,
          name: input.name,
          role: input.role,
          created_at: new Date(),
        },
      });

      return user;
    }),

  deleteUser: protectedProcedure
    .input(
      z.object({
        id: z.number(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const user = await ctx.db.user.findUnique({ where: { id: input.id } });

      if (!user)
        throw new TRPCError({ code: "NOT_FOUND", message: "User not found" });
      if (input.id != Number(ctx.session.userId))
        throw new TRPCError({ code: "NOT_FOUND", message: "User not found" });

      return await ctx.db.user.delete({ where: { id: input.id } });
    }),

  getUserRole: protectedProcedure.query(async ({ ctx }) => {
    const user = await ctx.db.user.findUnique({
      where: { id: Number(ctx.session.userId) },
      select: { role: true },
    });

    if (!user) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "User not found",
      });
    }
    return user.role;
  }),
});
