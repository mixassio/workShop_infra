import _ from 'lodash';
import { Tag } from '../models';


export const getTagsByNames = tagsNames => Promise.all(tagsNames
  .map(name => Tag.findOne({ where: { name } })))
  .then((results) => {
    const foundTags = results.filter(v => v);
    const foundTagsNames = foundTags.map(tag => tag.name);
    return Promise.all(_.difference(tagsNames, foundTagsNames)
      .map(name => Tag.build({ name }).save()))
      .then(createdTags => [...foundTags, ...createdTags]);
  });
export const createList = {
  status: statuses => [
    { id: 0, name: 'All' },
    ...statuses.map(el => ({ id: el.id, name: el.name })),
  ],
  tag: tags => [
    { id: 0, name: 'All' },
    ...tags.map(el => ({ id: el.id, name: el.name })),
  ],
  user: users => [
    { id: 0, name: 'All' },
    ...users.map(el => ({ id: el.id, name: el.fullName })),
  ],
  myList: user => [
    { id: 0, name: 'All' },
    { id: user.id, name: user.fullName },
  ],
};
export const builderSelect = (query) => {
  const whereSelect = _.keys(query).reduce((acc, el) => {
    if (el === 'tagId') {
      return { ...acc };
    }
    if (query[el] !== '0') {
      return { ...acc, [el]: query[el] };
    }
    return { ...acc };
  }, {});
  if (query.tagId && query.tagId !== '0') {
    return {
      include: [
        {
          model: Tag,
          where: {
            id: query.tagId,
          },
        },
        'taskStatus', 'creator', 'assignedTo',
      ],
      where: { ...whereSelect },
    };
  }
  return {
    include: ['taskStatus', 'creator', 'assignedTo'],
    where: { ...whereSelect },
  };
};
