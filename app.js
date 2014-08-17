!function(global, $) {

  'use strict';

  // constructor
  function app( options ) {

    // merge options with defaults
    var settings = $.extend( global.settings, options );

    this.debugMode = settings.config.debugMode;
    this.config    = settings.config;
    this.constants = settings.constants;
    this.messages  = settings.messages;

    // store for application js
    this.helpers = {};
    this.modules = {};

    this.ready = false;
    
    // output notice to console if we're in debug mode
    this.debug( this.messages.system.inDebugMode );
    //this.init();

    return this;

  };

  app.prototype = {

    init: function( fn ){
      
      // execute callback
      var init = fn.call( this );
      
      if ( !init ) {
        throw new Error ( 'App init routine failed' );
      };

      this.ready = true;
      return this;
      
    },

    /**
     * Print to console if we're in debug mode
     *
     * eg.
     *   app.log( object );
     *   app.debug( 'debug this', object );
     *
     */
    console: function( type, data ) {

      if( !this.debugMode || !window.console )
        return;

      var type = console[type] ? type : 'log',

          // Use Array.prototype.slice.call() to transform "array-like" object to a new array
          // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/slice#Array-like
          data = ( data.length > 1 ) ? Array.prototype.slice.call(data) : data[0];

      console[ type ]( data );

    },

    log: function() {
      this.console( 'log', arguments );
    },

    debug: function() {
      this.console( 'debug', arguments );
    },

    /**
     * Dump app data to console
     */
    dump: function() {
      this.log( this );
    }

  };

  // export instance to 'app' namespace;
  global.app = global.app || new app();
  
}( window, jQuery || null );