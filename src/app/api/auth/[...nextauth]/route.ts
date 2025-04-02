import { handlers } from "@/server/auth";
export { auth as middleware } from "@/server/auth";

export const { GET, POST } = handlers;
