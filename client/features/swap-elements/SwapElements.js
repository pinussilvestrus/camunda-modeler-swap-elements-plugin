import {
  filter,
  forEach
} from 'min-dash';

import {
  copyUniqueConnections,
  copySharedConnections
} from '../../util';

class SwapElements {

  constructor(elementRegistry, modeling) {
    this._filters = [];

    this._elementRegistry = elementRegistry;
    this._modeling = modeling;

    // register filter for labels and connections
    this.registerFilter(elements => {
      return filter(elements, function(element) {
        return !(element.waypoints || element.labelTarget);
      });
    });
  }

  registerFilter(filterFn) {
    if (typeof filterFn !== 'function') {
      throw new Error('the filter has to be a function');
    }

    this._filters.push(filterFn);
  }

  canBeSwapped(elements) {
    const swappableElements = this._filterElements(elements);

    // only allow to swap two elements
    if (swappableElements.length !== 2) {
      return false;
    }

    return swappableElements;
  }

  trigger(elements) {
    const swappableElements = this.canBeSwapped(elements);

    if (!swappableElements) {
      return;
    }

    const [ elementA, elementB ] = swappableElements;

    // simple replacing does not work, sadly :-(
    // this._modeling.replaceShape(elementA, newShapeB);

    // (0) save and remove connections
    const connections = this._saveAndRemoveConnections(elementA, elementB);

    // (1) swap positions
    this._swapPositions(elementA, elementB);

    // (2) swap connected connections
    this._swapConnections(connections, elementA, elementB);

    // todo(pinussilvestrus): handle text annotations and external labels
  }

  _saveAndRemoveConnections(elementA, elementB) {
    const modeling = this._modeling;

    const {
      incoming: incomingA,
      outgoing: outgoingA
    } = elementA;

    const {
      incoming: incomingB,
      outgoing: outgoingB
    } = elementB;

    const saved = {
      incomingA: copyUniqueConnections(incomingA, elementA, elementB),
      outgoingA: copyUniqueConnections(outgoingA, elementA, elementB),
      incomingB: copyUniqueConnections(incomingB, elementA, elementB),
      outgoingB: copyUniqueConnections(outgoingB, elementA, elementB),
      shared: copySharedConnections([
        ...incomingA,
        ...outgoingA,
        ...incomingB,
        ...outgoingB
      ], elementA, elementB)
    };

    // temporaly remove connections to reduce reconnection noise
    modeling.removeElements([
      ...incomingA,
      ...outgoingA,
      ...incomingB,
      ...outgoingB
    ]);

    return saved;
  }

  _swapPositions(elementA, elementB) {
    const modeling = this._modeling;

    const deltaShapeA = {
      x: getMid(elementB).x - getMid(elementA).x,
      y: getMid(elementB).y - getMid(elementA).y,
    };

    const deltaShapeB = {
      x: getMid(elementA).x - getMid(elementB).x,
      y: getMid(elementA).y - getMid(elementB).y,
    };

    modeling.moveShape(elementA, deltaShapeA);
    modeling.moveShape(elementB, deltaShapeB);
  }

  _createConnection(source, target, connection) {
    const parent = this._elementRegistry.get(connection.parentId);
    delete connection.sourceId;
    delete connection.targetId;
    delete connection.parentId;

    this._modeling.createConnection(source, target, connection, parent);
  }

  _reconnectIncomingConnections(connections, target) {
    forEach(connections, connection => {
      const source = this._elementRegistry.get(connection.sourceId);

      this._createConnection(source, target, connection);
    });
  }

  _reconnectOutgoingConnections(connections, source) {
    forEach(connections, connection => {
      const target = this._elementRegistry.get(connection.targetId);

      this._createConnection(source, target, connection);
    });
  }

  _swapConnections(connections, elementA, elementB) {
    const {
      incomingA,
      outgoingA,
      incomingB,
      outgoingB,
      shared
    } = connections;

    // connections of element B -> change to element A
    this._reconnectIncomingConnections(incomingB, elementA);
    this._reconnectOutgoingConnections(outgoingB, elementA);

    // connections of element A -> change to element B
    this._reconnectIncomingConnections(incomingA, elementB);
    this._reconnectOutgoingConnections(outgoingA, elementB);

    // handle shared connections between A and B
    forEach(shared, connection => {
      const source = this._elementRegistry.get(connection.targetId);
      const target = this._elementRegistry.get(connection.sourceId);

      this._createConnection(source, target, connection);
    });
  }

  _filterElements(elements) {
    const filters = this._filters;

    let distributableElements = [].concat(elements);

    if (!filters.length) {
      return elements;
    }

    forEach(filters, fn => {
      distributableElements = fn(distributableElements);
    });

    return distributableElements;
  }

}

SwapElements.$inject = [ 'elementRegistry', 'modeling' ];

export default SwapElements;


// helpers //////////

function getMid(bounds) {
  return roundPoint({
    x: bounds.x + (bounds.width || 0) / 2,
    y: bounds.y + (bounds.height || 0) / 2
  });
}

function roundPoint(point) {
  return {
    x: Math.round(point.x),
    y: Math.round(point.y)
  };
}