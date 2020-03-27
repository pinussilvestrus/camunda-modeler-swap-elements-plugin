import SwapElements from './SwapElements';

import BpmnSwapElements from './BpmnSwapElements';

export default {
  __init__: [ 'swapElements', 'bpmnSwapElements' ],
  swapElements: [ 'type', SwapElements ],
  bpmnSwapElements: [ 'type', BpmnSwapElements]
};
