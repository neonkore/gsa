/* Copyright (C) 2017-2018 Greenbone Networks GmbH
 *
 * SPDX-License-Identifier: GPL-2.0-or-later
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

import {longDate} from 'gmp/locale/date';

import {shorten} from 'gmp/utils/string';

import PropTypes from 'web/utils/proptypes';
import {na, renderComponent} from 'web/utils/render';

import {withEntityRow, RowDetailsToggle} from 'web/entities/row';

import SeverityBar from 'web/components/bar/severitybar';

import Comment from 'web/components/comment/comment';

import TableBody from 'web/components/table/body';
import TableRow from 'web/components/table/row';
import TableData from 'web/components/table/data';

const Row = ({
  entity,
  links = true,
  actions,
  onToggleDetailsClick,
  ...other
}) => {
  return (
    <TableBody>
      <TableRow>
        <TableData
          rowSpan="2"
        >
          <RowDetailsToggle
            name={entity.id}
            onClick={onToggleDetailsClick}
          >
            {entity.name}
          </RowDetailsToggle>
          <div>{shorten(entity.file, 45)}</div>
          <Comment text={entity.comment}/>
        </TableData>
        <TableData>
          {na(entity.version)}
        </TableData>
        <TableData>
          {na(entity.status)}
        </TableData>
        <TableData>
          {na(entity.class)}
        </TableData>
        <TableData>
          {longDate(entity.creationTime)}
        </TableData>
        <TableData>
          {longDate(entity.modificationTime)}
        </TableData>
        <TableData>
          {entity.cve_refs}
        </TableData>
        <TableData>
          <SeverityBar severity={entity.severity}/>
        </TableData>
        {renderComponent(actions, {...other, entity})}
      </TableRow>
      <TableRow>
        <TableData colSpan="8">
          {shorten(entity.title, 250)}
        </TableData>
      </TableRow>
    </TableBody>
  );
};

Row.propTypes = {
  actions: PropTypes.componentOrFalse,
  entity: PropTypes.model.isRequired,
  links: PropTypes.bool,
  onToggleDetailsClick: PropTypes.func.isRequired,
};

export default withEntityRow()(Row);

// vim: set ts=2 sw=2 tw=80:
