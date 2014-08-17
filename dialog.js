!function (app, $) {

  'use strict';

  var _moduleName = 'Dialog Helper',

      // define defaults
      _defaults = {
        xhr: {},
        dialog: {
          backdrop: true,
          keyboard: true,
          show: false
        }
      },

      _callbacks = {
        beforeRequest: function(){},
        beforeRender: function(){},
        render: function(){}
      };

  app.debug( _moduleName+ ': Loading ...' );

  // Constructor
  function Dialog(){

    if ( !$ ) {
      throw new Error( _moduleName+ ': jQuery could be not detected' );
    };

    this.settings     = _defaults;  // set defaults
    this.callbacks    = _callbacks;
    this.actionList   = {};
    this.xhr          = new app.helpers.Xhr();
    this.html         = '';
    this.$dialog      = [];

    if ( arguments.length ){
      this.init( arguments[0] );
    };

  };

  Dialog.prototype = {

    // dialog.init( {xhr: {url: '/service/call/'}, dialog: {} } );
    init: function( options ){

      if ( options && !_.isObject(options) ) {
        throw new Error( _moduleName+ ': argument must be an object' );
      };

      $.extend( this.settings, options );
      this.xhr.configure( this.settings.xhr );

      return this;

    },

    configure: function( type, options ){

      if ( _.isObject(type) ){
        this.settings = type;
        return this;
      };

      switch ( type ) {

        case 'dialog':
          this.settings.dialog = options;
          break;

        case 'xhr':
          this.settings.xhr = options;
          break;

        default:
          break;

      };

      this.init();

      return this;

    },

    get: function(){

      var self = this,
          refresh = false;

      // eg dialog.get( '/url/to/service' );
      if ( _.isString(arguments[0]) ){
        this.configure( 'xhr', {url: arguments[0]} );
      };

      // eg dialog.get( '/url/to/service', {data: 'a=b'} );
      if ( _.isObject(arguments[1]) ) {
        this.configure( 'xhr', arguments[1] );
      };

      // eg dialog.get( '/url/to/service', function($dialog){ ... } );
      if ( _.isFunction(arguments[1]) ){
        this.callbacks.render = arguments[1];
      };

      // eg dialog.get( '/url/to/service', {data: 'a=b'} function($dialog){ ... } );
      if ( _.isFunction(arguments[2]) ){
        this.callbacks.render = arguments[2];
      };

      // define xhr success callback
      this.xhr.success(function( data, xhr ){

        self.html = data; // cache response
        self.render();    // kick-off render

      });

      if ( !this.html || refresh ){

        this.callbacks.beforeRequest.call( this, this.html );
        this.xhr.dispatch();
        return this;

      };

      this.render();
      return this;

    },

    render: function( html ){

      html = html || this.html;

      this.callbacks.beforeRender.call( this, html );

      // cache instance of bootstrap modal
      this.$dialog = $( html ).modal( this.settings.dialog );

      // prepend the dialog html to the body
      // best location to avoid z-index issues
      $( 'body' ).prepend( this.$dialog );

      // initialize actions
      this.initActions();

      // trigger the render callback and set
      // $dialog as 'this' within the callback
      this.callbacks.render.call( this, this.$dialog );

      return this;

    },

    on: function( hook, callback ){

      this.callbacks[hook] = callback;

    },

    actions: function( actions ){

      if ( !_.isObject(actions) ) {
        throw new Error( _moduleName+ ': argument must be an object' );
      };

      this.actionList = actions;

    },

    initActions: function( actions ){

      var self     = this,
          actions  = actions || this.actionList,
          triggers = '[data-action]';

      if ( !this.$dialog.length ){
        throw new Error( _moduleName+ ': the dialog does not exist in the DOM yet' );
      };

      this.$dialog.on('click', triggers, function(e){

        var $element = $(this),
            action   = $element.data( 'action' );

        e.preventDefault();

        if ( actions[action] ){
          actions[action].call( this, self.$dialog, $element, e );
        };

      });

      return this;

    }

  };

  // expose to the global app scope
  app.helpers.Dialog = Dialog;
  return Dialog;

}(window.app, jQuery);
