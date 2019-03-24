import buildFormObj from '../lib/formObjectBuilder';
import { TaskStatus } from '../models';

export default (router, { logger }) => {
  router
    .get('taskStatuses', '/taskStatuses', async (ctx) => {
      const taskStatuses = await TaskStatus.findAll();
      ctx.render('taskStatuses', { taskStatuses });
    })
    .post('taskStatuses', '/taskStatuses', async (ctx) => {
      const { form } = ctx.request.body;
      const taskStatus = TaskStatus.build(form);
      try {
        await taskStatus.save();
        ctx.flash.set('Status task has been created');
        logger('New status task has been created');
        ctx.redirect(router.url('taskStatuses'));
      } catch (e) {
        ctx.render('taskStatuses/new', { f: buildFormObj(taskStatus, e) });
      }
    })
    .get('newtaskStatus', '/taskStatuses/new', (ctx) => {
      const taskStatus = TaskStatus.build();
      ctx.render('taskStatuses/new', { f: buildFormObj(taskStatus) });
    })
    .patch('taskStatuses', '/taskStatuses/:id/edit', async (ctx) => {
      const { form } = ctx.request.body;
      const { id } = ctx.params;
      const taskStatus = await TaskStatus.findOne({ where: { id } });
      try {
        await taskStatus.update(form);
        ctx.flash.set('TaskStatus has been updated');
        ctx.redirect(router.url('taskStatuses'));
      } catch (e) {
        logger('Errors update taskStatus');
        ctx.render('taskStatuses/edit', { taskStatus, f: buildFormObj(taskStatus, e) });
      }
    })
    .get('taskStatusUpdate', '/taskStatuses/:id/edit', async (ctx) => {
      const { id } = ctx.params;
      const taskStatus = await TaskStatus.findOne({ where: { id } });
      ctx.render('taskStatuses/edit', { taskStatus, f: buildFormObj(taskStatus) });
    })
    .delete('taskStatusDelete', '/taskStatuses/:id', async (ctx) => {
      logger(ctx.params);
      const { id } = ctx.params;
      const taskStatus = await TaskStatus.findOne({ where: { id } });
      await TaskStatus.destroy({ where: { id } });
      logger('deleting user', taskStatus.id);
      ctx.redirect(router.url('taskStatuses'));
      ctx.flash.set(`TaskStatus "${taskStatus.name}" has been deleted`);
    });
};
