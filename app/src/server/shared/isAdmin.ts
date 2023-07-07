import { logger } from "../../utils/logger";
import { prisma } from "../db";

export default async function isAdmin(params: {
  userId: string;
  email?: string;
  clearSessionsIfNotFound?: boolean;
}) {
  const { email, userId, clearSessionsIfNotFound = false } = params;

  const usingCredentials =
    !email &&
    (await prisma.adminCredential.findFirst({ where: { username: userId } }));

  if (usingCredentials) {
    logger.info(
      `[isAdmin] [usingCredentials=true] User with userId: ${userId} is using credentials to sign in. Skipping OAuth admin allow list check.`
    );
    return true;
  }

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
