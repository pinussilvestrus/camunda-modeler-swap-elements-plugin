/* eslint-disable no-unused-vars*/
import React, { PureComponent, Fragment } from 'camunda-modeler-plugin-helpers/react';

import { Fill } from 'camunda-modeler-plugin-helpers/components';

import SwapElements from './features/swap-elements';

import ExchangeSvg from '../resources/exchange.svg';


/**
 * An extension that adds a toolbar extension to swap two elements
 */
export default class SwapElementsPlugin extends PureComponent {

  state = {
    activeTab: null,
    activeModeler: null,
    disabled: true,
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

      const eventBus = modeler.get('eventBus');

      eventBus.on('selection.changed', this.handleSelectionChange);
    });
  }

  handleSelectionChange = (context) => {
    const {
      newSelection: selectedElements
    } = context;

    const {
      activeTab
    } = this.state;

    const modeler = this.getModeler(activeTab);

    const swapElements = modeler.get('swapElements');

    const canBeSwapped = swapElements.canBeSwapped(selectedElements);

    this.setState({
      disabled: !canBeSwapped
    });
  }

  swapSelectedElements = () => {
    const {
      activeTab,
      disabled
    } = this.state;

    if (disabled) {
      return;
    }

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
    const {
      disabled
    } = this.state;

    return <Fragment>
      <Fill slot="toolbar" group="9_swapElements">
        <ExchangeSvg
          className={ 'swap-elements-icon ' + (disabled ? 'disabled' : '') }
          onClick={ this.swapSelectedElements } />
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
