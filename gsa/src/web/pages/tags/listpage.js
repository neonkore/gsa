/* Greenbone Security Assistant
 *
 * Authors:
 * Björn Ricks <bjoern.ricks@greenbone.net>
 *
 * Copyright:
 * Copyright (C) 2017 - 2018 Greenbone Networks GmbH
 *
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU General Public License
 * as published by the Free Software Foundation; either version 2
 * of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program; if not, write to the Free Software
 * Foundation, Inc., 51 Franklin St, Fifth Floor, Boston, MA 02110-1301 USA.
 */
import React from 'react';

import _ from 'gmp/locale';

import {TAGS_FILTER_FILTER} from 'gmp/models/filter';

import PropTypes from 'web/utils/proptypes';
import withCapabilties from 'web/utils/withCapabilities';

import EntitiesPage from 'web/entities/page';
import withEntitiesContainer from 'web/entities/withEntitiesContainer2';

import ManualIcon from 'web/components/icon/manualicon';
import NewIcon from 'web/components/icon/newicon';

import IconDivider from 'web/components/layout/icondivider';

import {createFilterDialog} from 'web/components/powerfilter/dialog';

import {
  loadEntities,
  selector as entitiesSelector,
} from 'web/store/entities/tags';

import TagComponent from './component';
import TagsTable from './table';

export const SORT_FIELDS = [
  ['name', _('Name'), '30%'],
  ['value', _('Value'), '30%'],
  ['active', _('Active'), '8%'],
  ['resource_type', _('Resource Type'), '8%'],
  ['modified', _('Modified'), '8%'],
];

const ToolBarIcons = withCapabilties(({
  capabilities,
  onTagCreateClick,
}) => (
  <IconDivider>
    <ManualIcon
      page="gui_introduction"
      anchor="tags"
      title={_('Help: Tags')}
    />
    {capabilities.mayCreate('tag') &&
      <NewIcon
        title={_('New Tag')}
        onClick={onTagCreateClick}
      />
    }
  </IconDivider>
));

ToolBarIcons.propTypes = {
  onTagCreateClick: PropTypes.func.isRequired,
};

const TagsFilterDialog = createFilterDialog({
  sortFields: SORT_FIELDS,
});

const TagsPage = ({
  onChanged,
  onDownloaded,
  onError,
  ...props
}) => (
  <TagComponent
    onCreated={onChanged}
    onSaved={onChanged}
    onCloned={onChanged}
    onCloneError={onError}
    onDeleted={onChanged}
    onDeleteError={onError}
    onDownloaded={onDownloaded}
    onDownloadError={onError}
    onDisableError={onError}
    onDisabled={onChanged}
    onEnableError={onError}
    onEnabled={onChanged}
  >{({
    clone,
    create,
    delete: delete_func,
    download,
    edit,
    save,
    enable,
    disable,
  }) => (
    <EntitiesPage
      {...props}
      filterEditDialog={TagsFilterDialog}
      filterFilter={TAGS_FILTER_FILTER}
      sectionIcon="tag.svg"
      table={TagsTable}
      tags={false}
      title={_('Tags')}
      toolBarIcons={ToolBarIcons}
      onChanged={onChanged}
      onDownloaded={onDownloaded}
      onError={onError}
      onTagCloneClick={clone}
      onTagCreateClick={create}
      onTagDeleteClick={delete_func}
      onTagDownloadClick={download}
      onTagEditClick={edit}
      onTagSaveClick={save}
      onTagEnableClick={enable}
      onTagDisableClick={disable}
    />
  )}
  </TagComponent>
);

TagsPage.propTypes = {
  onChanged: PropTypes.func.isRequired,
  onDownloaded: PropTypes.func.isRequired,
  onError: PropTypes.func.isRequired,
};

export default withEntitiesContainer('tag', {
  entitiesSelector,
  loadEntities,
})(TagsPage);

// vim: set ts=2 sw=2 tw=80:
