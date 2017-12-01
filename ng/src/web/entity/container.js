/* Greenbone Security Assistant
 *
 * Authors:
 * Björn Ricks <bjoern.ricks@greenbone.net>
 *
 * Copyright:
 * Copyright (C) 2017 Greenbone Networks GmbH
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

import logger from 'gmp/log.js';

import Promise from 'gmp/promise.js';

import {is_defined} from 'gmp/utils.js';

import compose from '../utils/compose.js';
import PropTypes from '../utils/proptypes.js';
import withGmp from '../utils/withGmp.js';

import withDownload from '../components/form/withDownload.js';

import withDialogNotification from '../components/notification/withDialogNotifiaction.js'; // eslint-disable-line max-len

import TagsHandler from './tagshandler.js';

const log = logger.getLogger('web.entity.container');

export const loader = (type, filter_func, name = type) => function(id) {
  const {gmp} = this.props;

  log.debug('Loading', name, 'for entity', id);

  return gmp[type].getAll({
    filter: filter_func(id),
  }).then(entities => {

    log.debug('Loaded', name, entities);

    this.setState({[name]: entities});

    const meta = entities.getMeta();

    if (meta.fromcache && meta.dirty) {
      log.debug('Forcing reload of', name, meta.dirty);
      return true;
    }

    return false;
  }).catch(err => {
    // call handleError before setting state. setting state may hide the root
    // error
    const rej = this.handleError(err);
    this.setState({[name]: undefined});
    return rej;
  });
};

// load permissions assigned to the entity as resource
export const permissions_resource_loader = loader('permissions',
  id => 'resource_uuid=' + id);

// load permissions assigned for the entity as subject or resource but not
// permissions with empty resources
export const permissions_subject_loader = loader('permissions',
  id => 'subject_uuid=' + id + ' and not resource_uuid=""' +
  ' or resource_uuid=' + id);

class EntityContainer extends React.Component {

  constructor(...args) {
    super(...args);

    const {name} = this.props;
    const {gmp} = this.props;

    this.name = name;

    this.entity_command = gmp[name];

    this.state = {
      loading: true,
    };

    this.reload = this.reload.bind(this);

    this.handleChanged = this.handleChanged.bind(this);
    this.handleError = this.handleError.bind(this);
    this.handleTimer = this.handleTimer.bind(this);
  }

  componentDidMount() {
    const {id} = this.props.params;
    this.load(id);
  }

  componentWillUnmount() {
    this.clearTimer();
  }

  componentWillReceiveProps(next) {
    const {id} = this.props.params;
    if (id !== next.params.id) {
      this.load(next.params.id);
    }
  }

  load(id) {
    const {loaders} = this.props;

    const all_loaders = [this.loadEntity];

    if (is_defined(loaders)) {
      all_loaders.push(...this.props.loaders);
    }

    const promises = all_loaders.map(loader_func => loader_func.call(this, id));

    this.setState({loading: true});

    this.clearTimer(); // remove possible running timer

    Promise.all(promises)
      .then(values => values.reduce((sum, cur) => sum || cur, false))
      .then(refresh => this.startTimer(refresh ? 1 : undefined))
      .catch(err => {
        log.error('Error while loading data', err);
        this.setState({loading: false});
      });
  }

  reload() {
    const {id} = this.props.params;
    this.load(id);
  }

  loadEntity(id) {
    log.debug('Loading entity', id);

    return this.entity_command.get({id}).then(response => {

      const {data: entity, meta} = response;

      log.debug('Loaded entity', entity);

      this.setState({entity, loading: false});

      if (meta.fromcache && meta.dirty) {
        log.debug('Forcing reload of entity', meta.dirty);
        return true;
      }
      return false;
    })
    .catch(err => {
      this.handleError(err);
      this.setState({entity: undefined});
      return Promise.reject(err);
    });
  }

  handleChanged() {
    this.reload();
  }

  getRefreshInterval() {
    const {gmp} = this.props;
    return gmp.autorefresh;
  }

  startTimer(refresh) {
    refresh = is_defined(refresh) ? refresh : this.getRefreshInterval();

    if (refresh && refresh >= 0) {
      this.timer = window.setTimeout(this.handleTimer, refresh * 1000);
      log.debug('Started reload timer with id', this.timer, 'and interval',
        refresh);
    }
  }

  clearTimer() {
    if (is_defined(this.timer)) {
      log.debug('Clearing reload timer with id', this.timer);
      window.clearTimeout(this.timer);
    }
  }

  handleTimer() {
    log.debug('Timer', this.timer, 'finished. Reloading data.');

    this.timer = undefined;
    this.reload();
  }

  handleError(error) {
    const {showError} = this.props;
    log.error(error);
    showError(error);
  }

  render() {
    const {
      children,
      resourceType = this.name,
      onDownload,
    } = this.props;
    return (
      <TagsHandler
        onChanged={this.handleChanged}
        onError={this.handleError}
      >{({
          add,
          create,
          delete: delete_func,
          disable,
          edit,
          enable,
        }) => children({
            resourceType,
            entityCommand: this.entity_command,
            onChanged: this.handleChanged,
            onSuccess: this.handleChanged,
            onError: this.handleError,
            onDownloaded: onDownload,
            onTagAddClick: add,
            onTagCreateClick: create,
            onTagDeleteClick: delete_func,
            onTagDisableClick: disable,
            onTagEditClick: edit,
            onTagEnableClick: enable,
            ...this.state,
          })
        }
      </TagsHandler>
    );
  }
}

EntityContainer.propTypes = {
  children: PropTypes.func.isRequired,
  gmp: PropTypes.gmp.isRequired,
  loaders: PropTypes.array,
  name: PropTypes.string.isRequired,
  params: PropTypes.object.isRequired,
  resourceType: PropTypes.string,
  showError: PropTypes.func.isRequired,
  showSuccessMessage: PropTypes.func.isRequired,
  onDownload: PropTypes.func.isRequired,
};

export default compose(
  withGmp,
  withDialogNotification,
  withDownload,
)(EntityContainer);

// vim: set ts=2 sw=2 tw=80:
