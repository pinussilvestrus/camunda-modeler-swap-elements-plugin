import {
  filter,
  forEach
} from 'min-dash';

class SwapElements {

  constructor(modeling) {
    this._filters = [];

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

  trigger(elements) {
    const swappableElements = this._filterElements(elements);

    // only allow to swap two elements
    if (swappableElements.length !== 2) {
      return;
    }

    const [ elementA, elementB ] = swappableElements;

    // (0) simple replacing does not work, sadly :-(
    // this._modeling.replaceShape(elementA, newShapeB);

    // (1) swap positions
    const deltaShapeA = {
      x: getMid(elementB).x - getMid(elementA).x,
      y: getMid(elementB).y - getMid(elementA).y,
    };

    const deltaShapeB = {
      x: getMid(elementA).x - getMid(elementB).x,
      y: getMid(elementA).y - getMid(elementB).y,
    };

    this._modeling.moveShape(elementA, deltaShapeA);
    this._modeling.moveShape(elementB, deltaShapeB);
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

SwapElements.$inject = [ 'modeling' ];

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