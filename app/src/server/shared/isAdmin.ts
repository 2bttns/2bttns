import { logger } from "../../utils/logger";
import { prisma } from "../db";

/**
 * Returns whether the user is an admin or not.
 *
 * @param params.userId - ID of the user to check. This is the email if signing in via OAuth, or the username if signing in via credentials.
 * @param params.email - Email of the user to check. This is only used if signing in via OAuth.
 */
export default async function isAdmin(params: {
  userId: string;
  email?: string;
}) {
  const { email, userId } = params;

  const usingCredentials =
    !email &&
    (await prisma.adminCredential.findFirst({
      where: { username: userId },
      select: { username: true },
    }));

  if (usingCredentials) {
    logger.info(
      `[isAdmin] [usingCredentials=true] Found matching username admin credentials for user with userId: ${userId}. isAdmin will return true.`
    );
    return true;
  }

  if (!email) {
    logger.error(
      `[isAdmin] [email=undefined] User with userId: "${userId}" is not using credentials to sign in. Email is undefined. isAdmin will return false.`
    );
    return false;
  }

  const allowedOAuthAdmins = await prisma.adminOAuthAllowList.findMany();
  const isOAuthAdminAllowed = allowedOAuthAdmins.some(
    (admin) => admin.email === email
  );

  if (isOAuthAdminAllowed) {
    logger.info(
      `[isAdmin] [isOAuthAdminAllowed=true] User with email: "${email}" and userId: "${userId}" was found in the admin allow list. isAdmin will return true.`
    );
  }

  return isOAuthAdminAllowed;
}
