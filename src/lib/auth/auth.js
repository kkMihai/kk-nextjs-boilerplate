import { getServerSession } from 'next-auth/next';
// eslint-disable-next-line import/extensions
import { authOptions } from '@/Auth/options.js';

/**
 * @private
 * @param destination
 * @returns {{redirect: {permanent: boolean, destination}}}
 */
const createRedirectResponse = (destination) => ({
  redirect: { destination, permanent: false },
});

/**
 * @param {import('next').GetServerSidePropsContext} context - The context object.
 * @returns {Promise<import("next-auth/next").getServerSession || {props: {}} || {redirect: {destination: string, permanent: boolean}}>} - GetServerSession response.
 * @throws {Error} - The error thrown.
 */
const Auth = async (context) => {
  const { req, res } = context;
  const session = await getServerSession(req, res, authOptions());
  const user = session?.user;
  const isAuthenticated = !!session;
  const isAdmin = user?.role === 'ADMIN';

  const isApiRoute = req.url?.startsWith('/api/') || !!res.socket;

  const createAuthCheck =
    (checkFn, unauthorizedRedirect, forbiddenRedirect) =>
    (handler) =>
    async (ctx) => {
      if (!checkFn()) {
        if (isApiRoute) {
          const statusCode = !isAuthenticated ? 401 : 403;
          const error = !isAuthenticated ? 'Unauthorized' : 'Forbidden';
          ctx.res.status(statusCode).json({ error });
          return { props: {} };
        }
        return createRedirectResponse(
          !isAuthenticated ? unauthorizedRedirect : forbiddenRedirect
        );
      }

      const result = await handler(ctx, { session, user, isAdmin });

      if (isApiRoute && !ctx.res.writableEnded) {
        ctx.res.end();
      }

      return result;
    };

  const requireAuth = createAuthCheck(
    () => isAuthenticated,
    authOptions().pages.signIn,
    authOptions().pages.signIn
  );

  const requireAdmin = createAuthCheck(
    () => isAuthenticated && isAdmin,
    authOptions().pages.signIn,
    authOptions().pages.notAdmin
  );

  const providers = authOptions()
    .providers.map((provider) => ({
      id: provider.id,
      name: provider.name,
    }))
    .filter((provider) => provider.id !== 'credentials');

  return {
    session,
    user,
    isAdmin,
    isAuthenticated,
    requireAuth,
    requireAdmin,
    providers,
  };
};

export default Auth;
