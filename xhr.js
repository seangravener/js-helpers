!function ( app, $ ) {

  'use strict';

  var _moduleName = 'Ajax Helper',
      
      _defaults = {
        crossDomain: false,
        async: true,
        data: {},
        type: 'GET',
        url: '/faux/api/success.json',
        contentType: 'application/json; charset=utf-8',
      },
      
      // aliases
      util = app.helpers.util,
      notify = app.notify,
      messages = app.messages.xhr;
    
  app.debug( _moduleName+ ': Loading ...' );

  // Constructor
  function Xhr(){

    if ( !$ ) {
      throw new Error( _moduleName+ ': jQuery could be not detected' );
    };

    /**
     * Local vars and constants
     */
    var self            = ( this instanceof Xhr ? this : new Xhr() ),
        startTime       = 0,
        endTime         = 0;

    self.jsend          = {};      // store for response
    self.status         = '';
    self.log            = {};      // store for log
    self.processing     = false;
    self.elapsedTime    = 0;

    // callbacks
    self.onSuccess      = $.noop;
    self.onError        = $.noop;
    self.onFail         = $.noop;
    self.onComplete     = $.noop;

    // default config
    self.config         = _defaults;
    self.config.error   = _httpError;

    self.config.beforeSend = function () {

      _trackRequest( 'start' );
      self.processing = true;

    };

    self.config.success = function( jsend, status, xhr ){

      _trackRequest( 'stop' );
      _validateResponse( jsend, status, xhr );
      _createResponse( jsend, xhr );
            
    };

    self.config.complete = function () {

      _trackRequest( 'stop' );
      self.processing = false;

      app.debug( '** REQUEST LOG **', self.log );

    };
        
    function _httpError( xhr, exception, error ){

      var msg = 'A HTTP error occurred. Status code: ' +xhr.status + ', Exception: ' +exception;

      // @todo map status codes eg. 404, 200, etc

      notify.display( 'error', msg );

      throw new Error( msg );

    };

    function _validateResponse( jsend, status, xhr ){

      if ( jsend && jsend.hasOwnProperty( 'status' ) ){
        return true;
      };

      throw new Error( 'Invalid jsend format: the body should always contain a status poperty' );

    };

    function _createResponse( jsend, xhr ){
      
      // cache response
      self.jsend  = jsend;
      self.status = jsend.status;

      // trigger matching callback
      switch ( jsend.status ) {

        case 'success':
          
          self.onSuccess.call( self, jsend.data, xhr );
          
          break;

        case 'fail':
          
          notify.display( messages.fail );
          
          // @todo scroll user to error

          self.onFail.call( self, jsend.data, xhr );

          break;

        case 'error':
          
          notify.display( messages.error( xhr.status ) );
          
          self.onError.call( self, jsend.data, xhr );
          
          break;

      };

      self.onComplete.call( self, jsend.data, xhr );

      self.log.jsend = jsend;

    };

    function _trackRequest( phase ) {

      switch ( phase ) {

        case 'start':
          startTime = new Date().getMilliseconds();
          break;

        case 'stop':
          endTime = new Date().getMilliseconds();
          self.log.elapsedTime = (endTime - startTime) + 'ms';
          break;

        default:
          throw new Error('_trackRequest only accepts a `start` or `stop` phase');

      };

    };

    function _init( options ){
      
      if ( _.isObject(options) ) {
        self.request( options );
      };

    };

    self.configure = function( options ){

      self.config = $.extend( true, {}, self.config, options );
      return self;

    };

    self.success = function( fn ) {

      self.onSuccess = fn;
      return self;

    };

    self.fail = function( fn ){
      
      self.onFail = fn;
      return self;

    };

    self.error = function( fn ){

      self.onError = fn;
      return self;

    };

    self.complete = function( fn ){

      self.onComplete = fn;
      return self;

    };

    self.dispatch = function(){

      self.request();
      return self;

    };

    self.request = function( options ){

      var config = self.config;

      if ( options ) {

        // map callbacks
        if ( 'success' in options ) {
          self.onSuccess = options.success;
        };

        if ( 'fail' in options ) {
          self.onFail = options.fail;
        };

        if ( 'error' in options ) {
          self.onError = options.error;
        };

        if ( 'complete' in options ) {
          self.onComplete = options.complete;
        };

        config = $.extend( true, {}, config, options );

        // reset to intermediate success and error handlers
        config.error   = _httpError;
        config.success = self.config.success;

      };

      // Always force JSON datatype
      config.dataType = 'json';

      // Initiate XHR
      $.ajax( config );

      self.log.requestConfig = config;

      return self;

    };

    self.get = function( url, data, success ){
      self.config.type = 'GET';
      self.config.data = data;
      self.config.url = url;
      self.onSuccess = success;
      self.request();
      return self;
    };

    self.post = function( url, data, success ){
      self.config.type = 'POST';
      self.config.url = url;
      self.config.data = data;
      self.onSuccess = success;
      self.request();
      return self;
    };

    // init
    _init( arguments[0] );

  };

  // expose to the global app scope
  app.helpers.Xhr = Xhr;

  return Xhr;

}( window.app, jQuery );
