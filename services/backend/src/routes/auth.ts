import { createRoute, z } from '@hono/zod-openapi';
import { createDb } from '../db/client';
import type { AppEnv } from '../env';
import { getUserFromToken, loginUser, registerUser } from '../services/auth-service';
import type { OpenAPIHono } from '@hono/zod-openapi';

const authUserSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  email: z.string().email()
});

const authResponseSchema = z.object({
  user: authUserSchema,
  token: z.string()
});

const errorResponseSchema = z.object({
  error: z.object({
    code: z.string(),
    message: z.string()
  })
});

const registerBodySchema = z.object({
  name: z.string().min(2).max(120),
  email: z.string().email(),
  password: z.string().min(8).max(128)
});

const loginBodySchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).max(128)
});

const registerRoute = createRoute({
  method: 'post',
  path: '/auth/register',
  operationId: 'registerUser',
  request: {
    body: {
      content: {
        'application/json': {
          schema: registerBodySchema
        }
      }
    }
  },
  responses: {
    201: {
      description: 'Registered user',
      content: { 'application/json': { schema: authResponseSchema } }
    },
    409: {
      description: 'Email already exists',
      content: { 'application/json': { schema: errorResponseSchema } }
    }
  }
});

const loginRoute = createRoute({
  method: 'post',
  path: '/auth/login',
  operationId: 'loginUser',
  request: {
    body: {
      content: {
        'application/json': {
          schema: loginBodySchema
        }
      }
    }
  },
  responses: {
    200: {
      description: 'Logged in user',
      content: { 'application/json': { schema: authResponseSchema } }
    },
    401: {
      description: 'Invalid credentials',
      content: { 'application/json': { schema: errorResponseSchema } }
    }
  }
});

const meRoute = createRoute({
  method: 'get',
  path: '/auth/me',
  operationId: 'getCurrentUser',
  responses: {
    200: {
      description: 'Current user',
      content: { 'application/json': { schema: z.object({ user: authUserSchema }) } }
    },
    401: {
      description: 'Unauthorized',
      content: { 'application/json': { schema: errorResponseSchema } }
    }
  }
});

const logoutRoute = createRoute({
  method: 'post',
  path: '/auth/logout',
  operationId: 'logoutUser',
  responses: {
    200: {
      description: 'Logged out',
      content: { 'application/json': { schema: z.object({ ok: z.literal(true) }) } }
    }
  }
});

/**
 * Description: Implements registerAuthRoutes.
 * Parameters: See the TypeScript signature for accepted inputs.
 * Returns: See the TypeScript return type for output details.
 */
export function registerAuthRoutes(app: OpenAPIHono<AppEnv>) {
  app.openapi(registerRoute, async (c) => {
    const db = createDb(c.env.DATABASE_URL);
    const body = c.req.valid('json');

    try {
      const result = await registerUser(db, c.env.AUTH_SECRET, body);
      return c.json(result, 201);
    } catch (error) {
      if (error instanceof Error && error.message === 'EMAIL_ALREADY_REGISTERED') {
        return c.json({ error: { code: 'EMAIL_ALREADY_REGISTERED', message: 'Email is already registered.' } }, 409);
      }
      throw error;
    }
  });

  app.openapi(loginRoute, async (c) => {
    const db = createDb(c.env.DATABASE_URL);
    const body = c.req.valid('json');

    try {
      return c.json(await loginUser(db, c.env.AUTH_SECRET, body), 200 as const);
    } catch (error) {
      if (error instanceof Error && error.message === 'INVALID_CREDENTIALS') {
        return c.json({ error: { code: 'INVALID_CREDENTIALS', message: 'Invalid email or password.' } }, 401);
      }
      throw error;
    }
  });

  app.openapi(meRoute, async (c) => {
    const authorization = c.req.header('Authorization');
    const token = authorization?.startsWith('Bearer ') ? authorization.slice('Bearer '.length) : '';
    const db = createDb(c.env.DATABASE_URL);
    const user = token ? await getUserFromToken(db, token, c.env.AUTH_SECRET) : null;

    if (!user) {
      return c.json({ error: { code: 'UNAUTHORIZED', message: 'Authentication is required.' } }, 401);
    }

    return c.json({ user }, 200 as const);
  });

  app.openapi(logoutRoute, (c) => c.json({ ok: true }, 200 as const));
}
