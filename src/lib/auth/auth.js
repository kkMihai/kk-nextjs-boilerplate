import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/Auth/options.js';

/**
 * Auth class to handle authentication and authorization.
 */
class Auth {
  /**
   * Constructor to initialize the Auth class.
   * @param {Object} context - The context object containing req and res.
   */
  constructor(context) {
    this.context = context;
    this.session = null;
    this.user = null;
    this.providers = authOptions()
      .providers.map(({ id, name }) => ({ id, name }))
      .filter(({ id }) => id !== 'credentials');
  }

  /**
   * Initializes the Auth class by fetching the session and user data.
   * @returns {Promise<Auth>} - The initialized Auth instance.
   */
  async init() {
    const { req, res } = this.context;
    this.session = await getServerSession(req, res, authOptions());
    this.user = this.session?.user || null;
    return this;
  }

  /**
   * Checks if the user is authenticated.
   * @returns {boolean} - True if the user is authenticated, false otherwise.
   */
  get isAuthenticated() {
    return !!this.session;
  }

  /**
   * Checks if the user has an admin role.
   * @returns {boolean} - True if the user is an admin, false otherwise.
   */
  get isAdmin() {
    return this.user?.role === 'ADMIN';
  }

  /**
   * Checks if the current route is an API route.
   * @returns {boolean} - True if the current route is an API route, false otherwise.
   */
  get isApiRoute() {
    const { req } = this.context;
    return (
      req.url?.startsWith('/api/') ||
      (req.method && req.method.toLowerCase() === 'post')
    );
  }

  /**
   * Creates a redirect response object.
   * @param {string} destination - The destination URL for the redirect.
   * @returns {Object} - The redirect response object.
   */
  static createRedirectResponse(destination) {
    return { redirect: { destination, permanent: false } };
  }

  /**
   * Creates an authentication check function.
   * @param {Function} checkFn - The function to check authentication.
   * @param {string} unauthorizedRedirect - The URL to redirect if unauthorized.
   * @param {string} [forbiddenRedirect] - The URL to redirect if forbidden.
   * @returns {Function} - The authentication check function.
   */
  createAuthCheck(checkFn, unauthorizedRedirect, forbiddenRedirect) {
    return (handler) => async (context) => {
      const { res } = context;
      try {
        if (!checkFn()) {
          if (this.isApiRoute) {
            const statusCode = !this.isAuthenticated ? 401 : 403;
            const error = !this.isAuthenticated ? 'Unauthorized' : 'Forbidden';
            res.status(statusCode).json({ error });
            return { props: {} };
          }
          return Auth.createRedirectResponse(
            !this.isAuthenticated ? unauthorizedRedirect : forbiddenRedirect
          );
        }

        const authContext = {
          session: this.session,
          user: this.user,
          isAuthenticated: this.isAuthenticated,
          isAdmin: this.isAdmin,
        };

        const result = await handler(context, authContext);

        if (this.isApiRoute && !res.writableEnded) {
          res.end();
        }

        return result;
      } catch (error) {
        console.error('Error in createAuthCheck:', error);
        // Handle the error, e.g., return a default page or redirect
        return { props: {} };
      }
    };
  }

  /**
   * Getter for requireAuth, which creates an authentication check for authenticated users.
   * @returns {Function} - The authentication check function.
   */
  get requireAuth() {
    return this.createAuthCheck(
      () => this.isAuthenticated,
      authOptions().pages.signIn
    );
  }

  /**
   * Getter for requireAdmin, which creates an authentication check for admin users.
   * @returns {Function} - The authentication check function.
   */
  get requireAdmin() {
    return this.createAuthCheck(
      () => this.isAuthenticated && this.isAdmin,
      authOptions().pages.signIn,
      authOptions().pages.notAdmin
    );
  }
}

export default Auth;
