function SwapElements(eventBus) {

  eventBus.on('diagram.init', function() {
    console.log('[SwapElements]', 'initialized');
  });

}

SwapElements.$inject = [ 'eventBus' ];

module.exports = SwapElements;