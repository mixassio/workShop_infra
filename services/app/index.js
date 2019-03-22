// @flow

import '@babel/polyfill';

import path from 'path';
import _ from 'lodash';
import Koa from 'koa';
import serve from 'koa-static';
import Pug from 'koa-pug';
import koaLogger from 'koa-logger';
import Router from 'koa-router';
import bodyParser from 'koa-bodyparser';
import methodOverride from 'koa-methodoverride';
import session from 'koa-generic-session';
import flash from 'koa-flash-simple';
import favicon from 'koa-favicon';

import Rollbar from 'rollbar';
import container from './container';
import addRoutes from './routes';

export default () => {
  const app = new Koa();

  const { logger } = container;
  const rollbar = new Rollbar({
    accessToken: process.env.ROLLBAR_ACCESS_TOKEN,
    captureUncaught: true,
    captureUnhandledRejections: true,
  });

  const date = new Date();
  logger(`Application start at ${date.toString()}`);

  app.use(async (ctx, next) => {
    try {
      await next();
    } catch (err) {
      logger(err);
      rollbar.error(err, ctx.request);
    }
  });

  // app.keys = [process.env.SESSION_SECRET];
  app.keys = ['im a newer secret', 'i like turtle'];
  app.use(session(app));
  app.use(flash());
  app.use(async (ctx, next) => {
    ctx.state = {
      flash: ctx.flash,
      isSignedIn: () => ctx.session.userId !== undefined,
    };
    await next();
  });
  app.use(bodyParser());
  app.use(methodOverride((req) => {
    if (req.body && typeof req.body === 'object' && '_method' in req.body) {
      logger('change method - req.body', req.body);
      return req.body._method; // eslint-disable-line
    }
    return null;
  }));
  app.use(favicon());
  app.use(serve(path.join(__dirname, 'public')));
  app.use(koaLogger());
  const router = new Router();
  addRoutes(router, container);
  app.use(router.allowedMethods());
  app.use(router.routes());

  const pug = new Pug({
    viewPath: path.join(__dirname, 'views'),
    noCache: container.env === 'development',
    debug: true,
    pretty: true,
    compileDebug: true,
    locals: [],
    basedir: path.join(__dirname, 'views'),
    helperPath: [
      { _ },
      { urlFor: (...args) => router.url(...args) },
    ],
  });
  pug.use(app);

  return app;
};
