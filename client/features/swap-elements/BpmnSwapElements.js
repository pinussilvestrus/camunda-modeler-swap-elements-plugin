import {
  filter,
  some
} from 'min-dash';

class BpmnSwapElements {
  constructor(swapElements) {

    // register filter for container elements
    // todo(pinussilvestrus): allow container elements to be swapped, if same type
    swapElements.registerFilter(elements => {
      return filter(elements, element => !isAny(element, [
        'bpmn:Process',
        'bpmn:Participant',
        'bpmn:SubProcess'
      ]));
    });
  }
}

BpmnSwapElements.$inject = ['swapElements'];

export default BpmnSwapElements;

// helpers //////////

function isAny(element, types) {
  return some(types, type => {
    return is(element, type);
  });
}

function is(element, type) {
  const bo = element.businessObject;

  return bo && (typeof bo.$instanceOf === 'function') && bo.$instanceOf(type);
}