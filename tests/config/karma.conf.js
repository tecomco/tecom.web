module.exports = function (config) {
    config.set({

        basePath: '../../',

        frameworks: ['jasmine'],

        plugins: [
            'karma-jasmine',
            'karma-chrome-launcher',
        ],
        files: [
            'node_modules/jasmine-core/lib/jasmine-core/jasmine.js',
            'node_modules/sinon/pkg/sinon.js',
            'static/lib/jquery/dist/jquery.js',
            'static/lib/angular/angular.js',
            'node_modules/angular-mocks/angular-mocks.js',
            'static/lib/angular-ui-router/release/angular-ui-router.js',
            'app/app.module.js',
            'app/app.routes.js',
            'app/components/messenger/**/*.js',
            'tests/unit/messenger/**/*.js',
        ],

        exclude: [],

        preprocessors: {},

        reporters: ['progress'],

        port: 9876,

        colors: true,

        logLevel: config.LOG_INFO,

        autoWatch: true,

        browsers: ['Chrome'],

        singleRun: false,

        concurrency: Infinity
    })
}
