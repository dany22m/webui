import { marker as T } from '@biesbjerg/ngx-translate-extract-marker';

export const groupListElements = {
  hierarchy: [T('Credentials'), T('Groups')],
  anchorRouterLink: ['/credentials', 'groups'],
  elements: {
    list: {
      anchor: 'credentials-groups',
    },
    add: {
      hierarchy: [T('Add')],
      anchor: 'add-group',
    },
  },
};
