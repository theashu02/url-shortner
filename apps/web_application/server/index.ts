import { Elysia } from 'elysia';
import { helloRoute } from './routes/hello';
import { userRoute } from './routes/user';

const app = new Elysia({ prefix: '/api' })
  .use(helloRoute)
  .use(userRoute);

export type App = typeof app;
export { app };