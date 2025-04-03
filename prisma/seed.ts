import { db } from "~/server/db";

await db.user.createMany({
  data: [
    {
      email: "admin@servihub.com",
      role: "admin",
      name: "Admin User",
      clerk_id: "123",
    },
    { email: "user1@servihub.com", name: "User One", clerk_id: "124" },
  ],
});

await db.report.create({
  data: {
    type: "review",
    target_id: 101,
    reason: "Spam content",
    submitted_by: 2,
  },
});
