import { Elysia } from 'elysia';
import { helloRoute } from './routes/hello';

const app = new Elysia({ prefix: '/api' })
  .use(helloRoute);

export type App = typeof app;
export { app };