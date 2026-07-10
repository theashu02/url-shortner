import { Elysia } from 'elysia';

export const helloRoute = new Elysia()
  .get('/hello', () => 'Hello from Elysia!');
