import express, { Request, Response } from 'express';
import bodyParser from 'body-parser';
import session from 'express-session';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import { MikroORM, RequestContext } from '@mikro-orm/sqlite';
import { initORM } from './db.js';
import initializeRouter from './routes/combinedRoutes.js';

export async function bootstrap(port = 5000) {
  const db = await initORM();
  const app = express();

  // Register middleware
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: true }));

  app.use(cors({
    credentials: true,
    origin: ['https://flextrack.glitch.me', 'http://localhost:3000']
  }));

  app.use(cookieParser('v6h23871rvh78123r801t71trv7'));
  app.use(
    session({
      secret: 'v6h23871rvh78123r801t71trv7',
      resave: false,
      saveUninitialized: false,
      cookie: {
        httpOnly: false,
        maxAge: 1000 * 30 * 24 * 60 * 60,
      },
    })
  );

  const logger = (req: Request, res: Response, next: () => void) => {
    console.log('url:', req.url);
    next();
  };

  app.use(logger);

  app.use((req, res, next) => {
    RequestContext.create(db.em, next);
  });

  process.on('exit', async function () {
    await db.orm.close();
  });

  const router = await initializeRouter();
  app.use('/api', router);

  const url = app.listen({ port });

  return { app, url };
}
