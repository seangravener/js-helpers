!function ( app, $ ) {

  'use strict';

  var _moduleName = 'Notify Helper',

      _defaults = {
        $template: '#notify-template',
        $wrapper: '#notify-wrapper',
        $element: [],
        position: '',
        autoHide: true,
        autoHideDelay: 5000,
        hideTrigger: '[data-action=close]',
      },

      // store for message history
      _history = [],
      
      // aliases
      util = app.helpers.util;

  app.debug( _moduleName+ ': Loading ...' );

  // Constructor
  function Notify(){

    if ( !$ ) {
      throw new Error( _moduleName+ ': jQuery could be not detected' );
    };

    var self = ( this instanceof Notify ? this : _createInstance() );

    self.config = _defaults;
    _init( arguments, self );

    return self;

  };

  function _createInstance(){

    app.debug( _moduleName+ ': Creating instance ...' );
    return new Notify();

  };

  function _paramsToData( params ){

    var data = params[ 0 ];

    // if the first param is a string,
    // transform all params into an object literal.
    if ( _.isString(params[0]) ) {

      // type, title, and a message
      data = {
        type: params[ 0 ],
        title: params[ 1 ],
        message: params[ 2 ],
      };

      // no title, just a message
      if ( !params[2] ) {
        data.title   = '';
        data.message = params[1];
      };

    };

    return data;

  };

  function _init( params, self ){

    var data;

    // setup instance with defaults
    self.configure();

    // stop here if no params are passed; nothing to do.
    if ( !params.length ){
      return;
    };

    data = _paramsToData( params );
    self.render( data );

  };

  Notify.prototype = {

    display: function(){

      _init( arguments, this );

    },

    // ineffecient!
    // @todo fix
    configure: function( options ){

      var options  = options || {},
          elements = [ '$template', '$wrapper' ],
          total    = elements.length,
          i, element;

      // ensure DOM elements are jQuery objects
      for ( i = 0; total > i; i++ ){

        element = elements[ i ];

        if ( element in options ){
          //app.debug( _moduleName+ ': jq' );
          options[ element ] = util.jqCheck( options[element] );
        }
        else {
          //app.debug( _moduleName+ ': Querying the DOM for selector: ', _defaults[element] );
          options[ element ] = $( _defaults[element] );
        };

        if ( options[ element ].length === 0 ){
          throw new Error( _moduleName+ ': Selector for '+ element+ ' was not found in the document' );
        };

      };

      $.extend( this.config, options );

      return this;

    },

    insert: function( html, $wrapper ){

      var $wrapper = $wrapper || this.config.$wrapper;
      $wrapper.append( html );
     
    },

    render: function( data, $template ){

      if ( !data || !_.isObject(data) ) {
        throw new Error( _moduleName+ ': First argument must be an object' );
      };

      var $template = $template || this.config.$template,

          // clone template and store source template html
          source    = $template.clone().html(),

          // compile source template html into a function that accepts data
          compile   = _.template( source ),

          // render final html
          html      = compile( data );

      this.insert( html );

      //_history.push( html );

      return html;

    }

  };

  // expose to the global app scope
  app.helpers.Notify = Notify;
  
  return Notify;

}( window.app, jQuery );
