import { PureComponent } from 'camunda-modeler-plugin-helpers/react';

import SwapElements from './features/swap-elements';


/**
 * An extension that adds a toolbar extension to swap two elements
 */
export default class SwapElementsPlugin extends PureComponent {

  constructor(props) {

    super(props);

    const {
      subscribe
    } = props;

    subscribe('bpmn.modeler.configure', (event) => {

      const {
        tab,
        middlewares
      } = event;

      log('Creating editor for tab', tab);

      middlewares.push(addModule(SwapElements));
    });


    subscribe('bpmn.modeler.created', (event) => {

      const {
        tab,
        modeler,
      } = event;

      log('Modeler created for tab', tab, modeler);

    });

  }

  render() {
    return null;
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
