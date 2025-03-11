import express from 'express';
import path from 'path';
import bodyParser from 'body-parser';
import passport from 'passport';
import flash from 'connect-flash';
import session from 'express-session';
import { connect } from './connector/mongodb';
import http from 'http';
import { MongoOption } from './types/internalType';
import ENV_PROP from './config/config';
import cors from 'cors';
import { datacheck } from './helper/initialdata';
import allRouter from './helper/routesHelper';

const app = express();
const server = http.createServer(app);

const options: MongoOption = {
  maxPoolSize: Number(ENV_PROP.DB_POOL_SIZE), // Concurrent connections
  useNewUrlParser: true,
  useUnifiedTopology: true,
};
async function startServer(): Promise<void> {
  await connect(ENV_PROP.DB_URL, ENV_PROP.DB, options, (err?: Error): void => {
    if (err !== undefined) {
      throw new Error(`${err}`);
    } else {
      app.use(cors());
      process.env.UV_THREADPOOL_SIZE = '256';
      process.on('warning', (e) => {
        console.warn(e.stack);
      });
      app.use(
        '/logs/error.log',
        express.static(path.join(__dirname, '/logs/error.log'), {
          maxAge: 100 * 10000,
        })
      );
      app.use(
        bodyParser.urlencoded({
          extended: true,
          limit: ENV_PROP.MAX_SIZE,
          parameterLimit: Number(ENV_PROP.MAX_PARAM),
        })
      );
      app.use(bodyParser.json({ limit: ENV_PROP.MAX_SIZE }));
      app.use(
        session({
          secret: ENV_PROP.SESSION_SECRET,
          cookie: { maxAge: Number(ENV_PROP.SESSION_EXPIRES), secure: false },
          resave: true,
          saveUninitialized: true,
          name: ENV_PROP.SESSION_NAME,
        })
      );
      app.use(flash());
      app.use(passport.initialize());
      app.use(passport.session());
      app.get('/', (req, res) => {
        res.send('Hi, Deepkore');
      });
      app.use(allRouter);
      try {
        server.listen(ENV_PROP.PORT, () => {
          console.log(
            process.env.NODE_ENV,
            'server runing in port',
            ENV_PROP.PORT
          );
        });
      } catch (ex: any) {
        throw new Error(ex);
      }
    }
  });
}

startServer()
  .then(async () => {
    await datacheck();
  })
  .catch((e) => {
    console.error('Error in running server', e);
  });
