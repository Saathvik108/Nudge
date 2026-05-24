import { prisma } from "./db";

// In a real app this would read the session. For the demo we have one user.
export const getCurrentUser = async () => {
  const user = await prisma.user.findFirst({
    orderBy: { createdAt: "asc" },
  });
  if (!user) throw new Error("No user seeded. Run `npm run db:reset`.");
  return user;
};

export const getCurrentUserId = async () => {
  const u = await getCurrentUser();
  return u.id;
};
