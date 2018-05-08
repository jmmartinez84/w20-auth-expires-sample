/* globals module: true */
var authRequest = require('grunt-connect-http-auth/lib/utils').authRequest;
var serveStatic = require('serve-static');
module.exports = function (grunt) {
    'use strict';

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        jshint: {
            auth_expires_example: {
                src: ['auth-expires-example/modules/**/*.js']
            }
        },
        connect: {
            server: {
                options: {
                    port: 9001,
                    base: '.',
                    keepalive: true,
                    debug: true
                }
            },
            auth:{
                authRealm : "Private server",
                authList : ['foo:bar']
            },
            livereload: {
                options: {
                    middleware: function (connect, options, middlewares) {
                        var modRewrite = require('connect-modrewrite');
                        return [
                            authRequest,
                            function(req, res, next) {
                                if (req.url !== '/security/login'){
                                    return next();
                                }else{
                                    res.end('{"id":"foo","type":"user","principals":{"firstName":"Foo","lastName":"user","fullName":"Foo user","locale":"en-US","userId":"foo"},"roles":[],"permissions":[]}');
                                }
                            },
                            modRewrite(['^[^\\.]*$ /index.html [L]']),
                            serveStatic('.'),
                            connect().use(
                                '/node_modules',
                                serveStatic('./node_modules')
                            )
                        ];
                    },
                    port: 9001,
                    keepalive: true,
                    debug: true,
                    base:'.'
                }
            }
        }
    });
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-connect-http-auth');
    grunt.loadNpmTasks('grunt-contrib-connect');

    grunt.registerTask('default', ['jshint', 'connect']);
    grunt.registerTask('server', function (target) {
        grunt.task.run([
            'configureHttpAuth',
            'connect:livereload'
        ]);
    });
};