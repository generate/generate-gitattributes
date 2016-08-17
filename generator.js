'use strict';

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
    return app.src('templates/_gitattributes', { cwd: __dirname })
      .pipe(app.conflicts(app.cwd))
      .pipe(app.dest(function(file) {
        file.basename = '.gitattributes';
        return app.cwd;
      }))
  });
};

