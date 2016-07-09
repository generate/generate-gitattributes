'use strict';

var path = require('path');
var isValid = require('is-valid-app');

module.exports = function(app) {
  // return if the generator is already registered
  if (!isValid(app, 'generate-gitattributes')) return;

  /**
   * Generates a `.gitattributes` file to the current working directory. The
   * built-in template can be [overridden](#customization).
   *
   * ```sh
   * $ gen gitattributes
   * ```
   * @name gitattributes
   * @api public
   */

  app.task('default', ['gitattributes']);
  app.task('gitattributes', function(cb) {
    var cwd = app.dir || path.resolve(__dirname, 'templates');
    return app.src('_gitattributes', {cwd: cwd})
      .pipe(app.conflicts(app.cwd))
      .pipe(app.dest(app.cwd));
  });
};

