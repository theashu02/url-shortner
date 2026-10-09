import { Elysia } from 'elysia';
import { helloRoute } from './routes/hello';
import { userRoute } from './routes/user';
import { urlRoute } from './routes/url';
import { analyticsRoute } from './routes/analytics';
import { deviceRoute } from './routes/device';

const app = new Elysia({ prefix: '/api' })
  .use(helloRoute)
  .use(userRoute)
  .use(urlRoute)
  .use(analyticsRoute)
  .use(deviceRoute);

export type App = typeof app;
export { app };