import { Elysia } from 'elysia';
import { helloRoute } from './routes/hello';
import { userRoute } from './routes/user';
import { urlRoute } from './routes/url';

const app = new Elysia({ prefix: '/api' })
  .use(helloRoute)
  .use(userRoute)
  .use(urlRoute);

export type App = typeof app;
export { app };