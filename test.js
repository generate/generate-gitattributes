'use strict';

require('mocha');
var fs = require('fs');
var path = require('path');
var assert = require('assert');
var generate = require('generate');
var npm = require('npm-install-global');
var del = require('delete');
var generator = require('./');
var app;

var cwd = path.resolve.bind(path, __dirname, 'actual');

function exists(name, cb) {
  return function(err) {
    if (err) return cb(err);
    var filepath = cwd(name);
    fs.stat(filepath, function(err, stat) {
      if (err) return cb(err);
      assert(stat);
      del(path.dirname(filepath), cb);
    });
  };
}

describe('generate-gitattributes', function() {
  if (!process.env.CI && !process.env.TRAVIS) {
    before(function(cb) {
      npm.maybeInstall('generate', cb);
    });
  }

  beforeEach(function() {
    app = generate({silent: true});
    app.option('dest', cwd());
  });

  describe('plugin', function() {
    it('should only register the plugin once', function(cb) {
      var count = 0;
      app.on('plugin', function(name) {
        if (name === 'generate-gitattributes') {
          count++;
        }
      });
      app.use(generator);
      app.use(generator);
      app.use(generator);
      assert.equal(count, 1);
      cb();
    });

    it('should extend tasks onto the instance', function() {
      app.use(generator);
      assert(app.tasks.hasOwnProperty('default'));
      assert(app.tasks.hasOwnProperty('gitattributes'));
    });

    it('should run the `default` task with .build', function(cb) {
      app.use(generator);
      app.build('default', exists('.gitattributes', cb));
    });

    it('should run the `default` task with .generate', function(cb) {
      app.use(generator);
      app.generate('default', exists('.gitattributes', cb));
    });

    it('should run the `gitattributes` task with .build', function(cb) {
      app.use(generator);
      app.build('gitattributes', exists('.gitattributes', cb));
    });

    it('should run the `gitattributes` task with .generate', function(cb) {
      app.use(generator);
      app.generate('gitattributes', exists('.gitattributes', cb));
    });
  });

  if (!process.env.CI && !process.env.TRAVIS) {
    describe('generator (CLI)', function() {
      it('should run the default task using the `generate-gitattributes` name', function(cb) {
        app.use(generator);
        app.generate('generate-gitattributes', exists('.gitattributes', cb));
      });

      it('should run the default task using the `gitattributes` generator alias', function(cb) {
        app.use(generator);
        app.generate('gitattributes', exists('.gitattributes', cb));
      });
    });
  }

  describe('generator (API)', function() {
    it('should run the default task on the generator', function(cb) {
      app.register('gitattributes', generator);
      app.generate('gitattributes', exists('.gitattributes', cb));
    });

    it('should run the `gitattributes` task', function(cb) {
      app.register('gitattributes', generator);
      app.generate('gitattributes:gitattributes', exists('.gitattributes', cb));
    });

    it('should run the `default` task when defined explicitly', function(cb) {
      app.register('gitattributes', generator);
      app.generate('gitattributes:default', exists('.gitattributes', cb));
    });
  });

  describe('sub-generator', function() {
    it('should work as a sub-generator', function(cb) {
      app.register('foo', function(foo) {
        foo.register('gitattributes', generator);
      });
      app.generate('foo.gitattributes', exists('.gitattributes', cb));
    });

    it('should run the `default` task by default', function(cb) {
      app.register('foo', function(foo) {
        foo.register('gitattributes', generator);
      });
      app.generate('foo.gitattributes', exists('.gitattributes', cb));
    });

    it('should run the `gitattributes:default` task when defined explicitly', function(cb) {
      app.register('foo', function(foo) {
        foo.register('gitattributes', generator);
      });
      app.generate('foo.gitattributes:default', exists('.gitattributes', cb));
    });

    it('should run the `gitattributes:gitattributes` task', function(cb) {
      app.register('foo', function(foo) {
        foo.register('gitattributes', generator);
      });
      app.generate('foo.gitattributes:gitattributes', exists('.gitattributes', cb));
    });

    it('should work with nested sub-generators', function(cb) {
      app
        .register('foo', generator)
        .register('bar', generator)
        .register('baz', generator)

      app.generate('foo.bar.baz', exists('.gitattributes', cb));
    });
  });
});
