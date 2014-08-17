!function( app, $ ) {

  'use strict';
  
  app.init(function(){
    
    // setup underscore's _.template method to use mustasche style tags
    _.templateSettings = {
      interpolate: /\{\{(.+?)\}\}/g
    };

    // export instance of Notify helper for global use
    this.notify = new this.helpers.Notify();
    
    // init is done
    return true;
  
  });
  
}( window.app, jQuery || null );