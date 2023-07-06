import { prisma } from "../db";
import { logger } from "../helpers/logger";

export default async function isAdmin(params: {
  email: string;
  userId: string;
  clearSessionsIfNotFound?: boolean;
}) {
  const { email, userId, clearSessionsIfNotFound = false } = params;
  const allowedAdmins = await prisma.allowedAdmin.findMany();
  const isAllowed = allowedAdmins.some((admin) => admin.email === email);

  if (!isAllowed && clearSessionsIfNotFound) {
    logger.info(
      `[isAdmin] [clearSessionsIfNotFound=true] Clearing sessions for user with email: ${email} and id: ${userId}. \n\nThis indicates the user was removed from the admin list while they had an active session.`
    );
    // Clear the user's session, because they are no longer an admin
    await prisma.session.deleteMany({
      where: {
        userId,
      },
    });
  }

  return isAllowed;
}
