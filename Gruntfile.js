// Gruntfile.js
// Configuration file for compiling files with Grunt and Webpack
//
// Usage: 'grunt' command will compile and minify all *.js
//   and *.jsx files in ./react (not subdirectories) and put these in ./public/build
//
// 'grunt watch' can be used for development, this will wait
//    and automatically recompile any changed files

module.exports = function(grunt) {
  // use webpack to compile & minify
  const webpack = require('webpack');

  // use plugin to set env variables
  const InlineEnviromentVariablesPlugin = require('inline-environment-variables-webpack-plugin');

  // Directory where *.js and *.jsx files will be compiled from, to be placed in ./public/build
  const directory = 'react';
  // vendors to be compiled to a single file which can be shared between pages (vendors.min.js)
  const entry = { vendors: ['react', 'react-bootstrap'] };
  // go through files in this directory and add them to target entry
  const files = grunt.file.expand({ cwd: directory }, '*.js', '*.jsx');
  for (let i = 0; i < files.length; i++) {
    const filename = files[i].replace(/.js[x]?/g, '.min.js').toLowerCase();
    entry[filename] = `./${directory}/${files[i]}`;
  }

  // Creates a special Commons bundle that our application can require from
  const commonPlugin = new webpack.optimize.CommonsChunkPlugin(
    'vendors',
    'vendors.js'
  );
  // We need to uglify that code on deploy
  const uglifyPlugin = new webpack.optimize.UglifyJsPlugin();
  // Use plugin to set process.env variables
  const envVariablesPlugin = new InlineEnviromentVariablesPlugin({
    NODE_ENV: process.env.NODE_ENV,
  });

  // The module options takes loaders, in this case transforming JSX to normal javascript
  const module = {
    loaders: [
      {
        test: /\.js[x]?$/,
        loader: 'babel',
        exclude: /node_modules/,
        query: {
          presets: ['es2015', 'react'],
        },
      },
      {
        test: /\.scss$/,
        loaders: ['style-loader', 'css-loader', 'sass-loader'],
      },
      {
        test: /\.css$/,
        loaders: ['style-loader', 'css-loader'],
      },
      {
        test: /\.json$/,
        loader: 'json',
      },
    ],
  };

  grunt.initConfig({
    webpack: {
      build: {
        entry,
        plugins: [commonPlugin, uglifyPlugin, envVariablesPlugin],
        stats: {
          timings: true,
        },
        output: {
          filename: '[name]',
          path: './public/build',
        },
        module,
      },
    },
  });

  /** *** Set up Grunt tasks (for the command line interface 'grunt-cli') **** */

  grunt.loadNpmTasks('grunt-webpack');
  // build all files in ./react
  grunt.registerTask('build', ['webpack:build']);

  // 'watch' task (keep alive)
  grunt.registerTask('watch', 'Build all files on change', () => {
    grunt.config.set('webpack.build.keepalive', true);
    grunt.config.set('webpack.build.watch', true);
    grunt.task.run(['webpack:build']);
  });

  // default ('grunt')
  grunt.registerTask('default', ['build']);
};
