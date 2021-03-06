/*global module:false*/
module.exports = function(grunt) {
    // Project configuration.
    grunt.initConfig({
        // Metadata.
        pkg: grunt.file.readJSON('package.json'),
        banner: '/*! <%= pkg.title || pkg.name %> - v<%= pkg.version %> - ' +
                '<%= grunt.template.today("yyyy-mm-dd") %>\n' +
                '<%= pkg.homepage ? "* " + pkg.homepage + "\\n" : "" %>' +
                '* Copyright (c) <%= grunt.template.today("yyyy") %> <%= pkg.author.name %>;' +
                '*/\n',
        // Task configuration.
        clean: {
            options: {
              'force': true
            },
            build: ["dist/*", "public_html/*"],
            test_cleanup: [
                "coverage/*", 
                "test/test_downloads/*",
                "../common/coverage/*", 
                "../common/test/test_downloads/*", 
                "../common/test/firefox_profile/"
            ],
        },
        concat: {
            options: {
                stripBanners: true
            },
            no_coverage_js: {
                src: [
                    'lib/sjcl.js',
                    'lib/Blob.js',
                    'lib/FileSaver.js',
                    'lib/es6-promise.js',
                    'lib/encoding-indexes.js',
                    'lib/encoding.js',
                    'lib/webcrypto-shim.js',
                    '../common/src/constants.js',
                    '../common/src/common.js',
                    'src/constants.js',
                    'src/app.js'
                ],
                dest: 'dist/<%= pkg.name %>.js'
            },
            coverage_js: {
                src: [
                    'lib/sjcl.js',
                    'lib/Blob.js',
                    'lib/FileSaver.js',
                    'lib/es6-promise.js',
                    'lib/encoding-indexes.js',
                    'lib/encoding.js',
                    'lib/webcrypto-shim.js',
                    '../common/coverage/_constants.js',
                    '../common/coverage/_common.js',
                    'coverage/_constants.js',
                    'coverage/_app.js'
                ],
                dest: 'dist/<%= pkg.name %>.js'
            },
            css: {
                src: [
                    '../common/src/css/bootstrap.css',
                    '../common/src/css/bootstrap-theme.css',
                    '../common/src/css/app.css'
                ],
                dest: 'dist/<%= pkg.name %>.css'
            }
        },
        uglify: {
            dist: {
                src: '<%= concat.no_coverage_js.dest %>',
                dest: 'dist/<%= pkg.name %>.min.js'
            },
            coverage: {
                src: '<%= concat.coverage_js.dest %>',
                dest: 'dist/<%= pkg.name %>.min.js'
            }
        },
        htmlmin: {
            dist: {
                options: {
                    removeComments: true,
                    removeCommentsFromCDATA: true,
                    removeCDATASectionsFromCDATA: true,
                    collapseWhitespace: true,
                    conservativeCollapse: true,
                    collapseBooleanAttributes: false,
                    removeAttributeQuotes: false,
                    removeRedundantAttributes: true,
                    useShortDoctype: true,
                    removeEmptyAttributes: true,
                    removeOptionalTags: true,
                    removeEmptyElements: false,
                    keepClosingSlash: false
                },
                files: {
                    'public_html/index.html': 'dist/<%= pkg.name %>_built.html'
                }
            }
        },
        i18n: {
            default: {
                src: ['public_html/index.html'],
                options: {
                    locales: 'locales/*.json',
                    base: 'public_html/',
                    output: 'public_html/',
                    format: 'default'
                }
            }
        },
        connect: {
            server: {
                options: {
                    keepalive: false,
                    port: 8001
                }
            }
        },
        uncss: {
            dist: {
                files: {
                    'dist/<%= pkg.name %>.un.css': ['src/app.html']
                }
            },
            options: {
                ignore: [
                    '.has-error .help-block',
                    '.has-error .form-control',
                    '.has-error .form-control:focus',
                    '.has-error .control-label',
                    '.has-error .input-group-addon',
                    '.has-warning .help-block',
                    '.has-warning .form-control',
                    '.has-warning .form-control:focus',
                    '.has-warning .control-label',
                    '.has-warning .input-group-addon',
                    '.has-success .help-block',
                    '.has-success .form-control',
                    '.has-success .form-control:focus',
                    '.has-success .control-label',
                    '.has-success .input-group-addon',
                    '.red'

                ]
            }
        },
        imageEmbed: {
            dist: {
                src: [ "dist/<%= pkg.name %>.un.css" ],
                dest: "dist/<%= pkg.name %>.base64.css",
                options: {
                    deleteAfterEncoding : false
                }
            }
        },
        cssmin: {
            minify: {
                expand: true,
                src: ['dist/<%= pkg.name %>.base64.css'],
                dest: '',
                ext: '.min.css'
            }
        },
        replace: {
            dist: {
                src: ['src/app.html'], // source files array (supports minimatch)
                dest: 'dist/<%= pkg.name %>.html', // destination directory or file
                options: {processTemplates: false},
                replacements: [{
                        from: '<link rel="stylesheet" href="../dist/<%= pkg.name %>.css"/>', // string replacement
                        to: '<style>{{= css }}</style>'
                    }]
            }
        },
        watch: {
            scripts: {
                files: ['src/*', 'test/*', 'Gruntfile.js', 'locales/*', '../common/**'],
                tasks: ['debug'],
                options: {
                    spawn: true
                }
            }
        },
        mochaTest: {
            test: {
              options: {
                reporter: 'spec',   
                require: [
                   function(){ 
                        testVars = require('./test/mocha_test_vars.js');
                        getCoverage = false;
                   },                                                        
                ]
              },
              src: ['test/mocha_tests.js','../common/test/mocha_common_tests.js']
            }, 
            testWithCoverage: {
              options: {
                reporter: 'spec',   
                require: [
                   function(){ 
                        testVars = require('./test/mocha_test_vars.js');
                        getCoverage = true;
                   },                                                        
                ]
              },
              src: ['test/mocha_tests.js','../common/test/mocha_common_tests.js']
            },
            manualCoverage: {
              options: {
                reporter: 'spec',   
                require: [
                   function(){ 
                        testVars = require('./test/mocha_test_vars.js');
                   },                                                        
                ]
              },
              src: ['../common/test/manual_coverage.js']
            }
        },  
        express: {
            options: {
              // Override defaults here
              port: 8888,
            },
            dev: {
              options: {
                script: '../common/coverage_server.js'
              }
            },           
        },  
        curl: {
            'coverage-download': {
              src: 'http://localhost:8888/coverage/download',
              dest: 'coverage/coverage_data.zip'
            },
        },
  	shell: {      
            instrumentScripts: {
                command: [
                    'mkdir -p coverage',
                    'cd src/',                    
                    'istanbul instrument app.js --output ../coverage/_app.js --embed-source true',
                    'istanbul instrument constants.js --output ../coverage/_constants.js --embed-source true',
                    'cd ../../common/',
                    'mkdir -p coverage',
                    'cd src',
                    'istanbul instrument common.js --output ../coverage/_common.js --embed-source true',
                    'istanbul instrument constants.js --output ../coverage/_constants.js --embed-source true'                     
                ].join('&&')
	    },
            extractFirefoxProfile: {
                command: [
                    'cd ../common/test/',                    
                    'unzip -o firefox_profile.zip', 
                ].join('&&')
	    }, 
            extractReport: {
                command: [
                    'cd coverage/',    
                    'unzip -o coverage_data.zip -d report/', 
                    'rm coverage_data.zip',
                    'sensible-browser report/lcov-report/index.html'
                ].join('&&')
	    }
        }
    });

    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-htmlmin');
    grunt.loadNpmTasks('grunt-contrib-cssmin');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-connect');    
    grunt.loadNpmTasks('grunt-uncss');
    grunt.loadNpmTasks('grunt-text-replace');
    grunt.loadNpmTasks('grunt-i18n');
    grunt.loadNpmTasks('grunt-image-embed-src');
    grunt.loadNpmTasks('grunt-mocha-test');
    grunt.loadNpmTasks('grunt-express-server');
    grunt.loadNpmTasks('grunt-curl');
    grunt.loadNpmTasks('grunt-shell');   

    grunt.template.addDelimiters("curly", "{{", "}}");

    grunt.registerTask('buildhtml', 'Builds the app html.', function() {
        var css = grunt.file.read('dist/whispernote.min.css');
        var js = grunt.file.read('dist/whispernote.min.js');
        var html = grunt.file.read('dist/whispernote.html');
        var obj = {css: css, js: js};

        var processedTemplate = grunt.template.process(html, {data: obj, delimiters: "curly"});
        grunt.file.write('dist/whispernote_built.html', processedTemplate);
    });

    grunt.registerTask('builddebug', 'Builds the debuggable app html.', function() {
        var css = grunt.file.read('dist/whispernote.min.css');
        var js = grunt.file.read('dist/whispernote.js');
        var html = grunt.file.read('dist/whispernote.html');
        var obj = {css: css, js: js};

        var processedTemplate = grunt.template.process(html, {data: obj, delimiters: "curly"});
        grunt.file.write('public_html/index.html', processedTemplate);
    });

    // Default task.
    grunt.registerTask('default', ['clean', 'concat:no_coverage_js', 'concat:css', 'uglify:dist', 'uncss', 'imageEmbed', 'cssmin', 'replace', 'buildhtml', 'htmlmin', 'i18n', 'connect', 'shell:extractFirefoxProfile', 'mochaTest:test', 'clean:test_cleanup']);
    grunt.registerTask('coverage', ['clean', 'shell:instrumentScripts','concat:coverage_js', 'concat:css', 'uglify:coverage', 'uncss', 'imageEmbed', 'cssmin', 'replace', 'buildhtml', 'htmlmin', 'i18n', 'connect', 'express:dev', 'shell:extractFirefoxProfile', 'mochaTest:testWithCoverage', 'clean:test_cleanup', 'curl:coverage-download', 'shell:extractReport']);
    grunt.registerTask('manualcoverage', ['clean', 'shell:instrumentScripts', 'concat:coverage_js', 'concat:css', 'uglify:coverage', 'uncss', 'imageEmbed', 'cssmin', 'replace', 'buildhtml', 'htmlmin', 'i18n', 'connect','express:dev', 'shell:extractFirefoxProfile','mochaTest:manualCoverage', 'clean:test_cleanup', 'curl:coverage-download', 'shell:extractReport']);
    grunt.registerTask('dualcoverage', ['clean', 'shell:instrumentScripts', 'concat:coverage_js', 'concat:css', 'uglify:coverage', 'uncss', 'imageEmbed', 'cssmin', 'replace', 'buildhtml', 'htmlmin', 'i18n', 'connect','express:dev', 'shell:extractFirefoxProfile', 'mochaTest:testWithCoverage','mochaTest:manualCoverage', 'clean:test_cleanup', 'curl:coverage-download', 'shell:extractReport']);
    grunt.registerTask('debug', ['clean', 'concat:no_coverage_js', 'concat:css', 'uncss', 'imageEmbed', 'replace', 'cssmin', 'builddebug', 'i18n', 'connect', 'shell:extractFirefoxProfile','mochaTest:test', 'clean:test_cleanup']);
    grunt.registerTask('notest', ['clean', 'concat:no_coverage_js', 'concat:css', 'uglify:dist', 'uncss', 'imageEmbed', 'cssmin', 'replace', 'buildhtml', 'htmlmin', 'i18n', 'connect']);
};
