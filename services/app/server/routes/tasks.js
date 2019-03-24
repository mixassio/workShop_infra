import buildFormObj from '../lib/formObjectBuilder';
import {
  Task, TaskStatus, User, Tag,
} from '../models';
import { builderSelect, createList, getTagsByNames } from '../lib/forRouter';

export default (router, { logger }) => {
  router
    .get('tasks', '/tasks', async (ctx) => {
      const { query } = ctx.request;
      const select = builderSelect(query);
      const tasks = await Task.findAll({ ...select });
      const { userId } = ctx.session;
      logger('userLoginID', userId);
      const f = buildFormObj({
        taskStatusId: query.taskStatusId || 0,
        assignedToId: query.assignedToId || 0,
        tagId: query.tagId || 0,
      }, {}, true);
      const statusList = createList.status(await TaskStatus.findAll());
      const userList = createList.user(await User.findAll());
      const tagList = createList.tag(await Tag.findAll());
      const myList = (userId)
        ? createList.myList(await User.findOne({ where: { id: userId } }))
        : [];
      ctx.render('tasks', {
        f,
        tasks,
        userId,
        myList,
        statusList,
        userList,
        tagList,
      });
    })
    .post('tasks', '/tasks', async (ctx) => {
      const { form } = ctx.request.body;
      form.creatorId = ctx.session.userId;
      const { tagsName } = form;
      const tags = await getTagsByNames(tagsName.split(',').map(v => v.trim()).filter(v => v));
      const task = await Task.build(form);
      try {
        await task.save();
        logger('task is saved');
        await task.setTags(tags);
        logger('tags is added');
        ctx.flash.set('Task has been created');
        ctx.redirect(router.url('tasks'));
      } catch (e) {
        logger(e);
        ctx.render('tasks/new', { f: buildFormObj(task, e) });
      }
    })
    .patch('taskPatch', '/tasks/:id', async (ctx) => {
      const { form } = ctx.request.body;
      const { id } = ctx.params;
      logger(form);
      const task = await Task.findOne({ where: { id } });
      logger('update task:', task.name);
      const { tagsName } = form;
      const tags = await getTagsByNames(tagsName.split(',').map(v => v.trim()).filter(v => v));
      try {
        await task.update(form);
        await task.setTags(tags);
        ctx.flash.set('Task has been updated');
        ctx.redirect(router.url('tasks'));
      } catch (e) {
        ctx.render('tasks/edit', { task, f: buildFormObj(task, e) });
      }
    })
    .get('newTask', '/tasks/new', async (ctx) => {
      if (!ctx.state.isSignedIn()) {
        ctx.flash.set('Only reg user can create tasks');
        ctx.redirect(router.url('newSession'));
      }
      const task = Task.build();
      task.taskStatusId = 1;
      task.assignedToId = ctx.session.userId;
      const userList = createList.user(await User.findAll());
      const statusList = createList.status(await TaskStatus.findAll());
      ctx.render('tasks/new', { f: buildFormObj(task), statusList, userList });
    })
    .delete('taskDelete', '/tasks/:id', async (ctx) => {
      logger(ctx.params);
      const { id } = ctx.params;
      const task = await Task.findOne({ where: { id } });
      await Task.destroy({ where: { id } });
      logger('deleting user', task.id);
      ctx.redirect(router.url('tasks'));
      ctx.flash.set('Task has been deleted');
    })
    .get('taskShow', '/tasks/:id', async (ctx) => {
      logger(ctx.params);
      const { id } = ctx.params;
      const task = await Task.findOne({ where: { id }, include: ['taskStatus', 'creator', 'assignedTo', 'Tags'] });
      ctx.render('tasks/show', { task });
    })
    .get('taskUpdate', '/tasks/:id/edit', async (ctx) => {
      if (!ctx.state.isSignedIn()) {
        ctx.flash.set('Only reg user can update tasks');
        ctx.redirect(router.url('newSession'));
      }
      const { id } = ctx.params;
      const userList = createList.user(await User.findAll());
      const statusList = createList.status(await TaskStatus.findAll());
      const task = await Task.findOne({ where: { id }, include: ['taskStatus', 'creator', 'assignedTo', 'Tags'] });
      task.tagsName = task.Tags.map(el => el.name).join(', ');
      ctx.render('tasks/edit', {
        task, f: buildFormObj(task), statusList, userList,
      });
    });
};
