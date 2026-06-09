import { OpenAPIHono } from '@hono/zod-openapi';
import { cors } from 'hono/cors';
import type { AppEnv } from './env';
import { registerAuthRoutes } from './routes/auth';
import { registerCustomerRoutes } from './routes/customers';
import { registerMenuRoutes } from './routes/menu';
import { registerOrderRoutes } from './routes/orders';
import { registerSettingsRoutes } from './routes/settings';
import { registerSummaryRoutes } from './routes/summary';

/**
 * Description: Implements createApp.
 * Parameters: See the TypeScript signature for accepted inputs.
 * Returns: See the TypeScript return type for output details.
 */
export function createApp() {
  const app = new OpenAPIHono<AppEnv>();

  app.use('*', cors({ origin: '*', allowHeaders: ['Content-Type', 'Authorization'], allowMethods: ['GET', 'POST', 'PATCH', 'OPTIONS'] }));

  app.get('/health', (c) => c.json({ ok: true, service: 'ody-backend' }));

  registerAuthRoutes(app);
  registerSummaryRoutes(app);
  registerOrderRoutes(app);
  registerMenuRoutes(app);
  registerCustomerRoutes(app);
  registerSettingsRoutes(app);

  app.doc('/openapi.json', {
    openapi: '3.0.0',
    info: {
      title: 'Ody Restaurant Operations API',
      version: '0.1.0'
    }
  });

  return app;
}
