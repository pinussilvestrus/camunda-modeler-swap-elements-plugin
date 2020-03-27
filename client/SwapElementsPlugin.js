/* eslint-disable no-unused-vars*/
import React, { PureComponent, Fragment } from 'camunda-modeler-plugin-helpers/react';

import { Fill } from 'camunda-modeler-plugin-helpers/components';

import SwapElements from './features/swap-elements';


/**
 * An extension that adds a toolbar extension to swap two elements
 */
export default class SwapElementsPlugin extends PureComponent {

  state = {
    activeTab: null,
    activeModeler: null,
    modelers: []
  }

  constructor(props) {

    super(props);

    const {
      subscribe
    } = props;

    subscribe('bpmn.modeler.configure', (event) => {
      const {
        middlewares
      } = event;

      middlewares.push(addModule(SwapElements));
    });

    subscribe('app.activeTabChanged', (event) => {
      const {
        activeTab
      } = event;

      this.setState({
        activeTab
      });
    });

    subscribe('bpmn.modeler.created', (event) => {
      const {
        tab,
        modeler
      } = event;

      this.setState({
        modelers: {
          ...this.state.modelers,
          [tab.id]: modeler
        }
      });
    });
  }

  swapSelectedElements = () => {
    const {
      activeTab
    } = this.state;

    const modeler = this.getModeler(activeTab);

    const swapElements = modeler.get('swapElements');

    const selection = modeler.get('selection');

    const currentSelection = selection.get();

    swapElements.trigger(currentSelection);
  }

  getModeler(tab) {
    const {
      modelers
    } = this.state;

    return modelers[tab.id];
  }

  render() {
    return <Fragment>
      <Fill slot="toolbar" group="9_swapElements">
        <button type="button" onClick={ this.swapSelectedElements }>
          Swap elements
        </button>
      </Fill>
    </Fragment>;
  }
}


// helpers //////////////

function log(...args) {
  console.log('[SwapElementsPlugin]', ...args);
}

/**
 * Returns a bpmn.modeler.configure middleware
 * that adds the specific module.
 *
 * @param {didi.Module} extensionModule
 *
 * @return {Function}
 */
function addModule(extensionModule) {

  return (config) => {

    const additionalModules = config.additionalModules || [];

    return {
      ...config,
      additionalModules: [
        ...additionalModules,
        extensionModule
      ]
    };
  };
}
