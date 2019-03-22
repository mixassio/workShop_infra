export default (router, { logger }) => {
  router.get('root', '/', (ctx) => {
    logger(`welcome-page for user = ${ctx.session.userId}`);
    ctx.render('welcome/index');
  });
};
