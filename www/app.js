// Lib folder is for the third parties.

// Configure loading modules from the lib directory,
// except for 'app' ones, which are in a sibling
// directory.
requirejs.config({
    baseUrl: 'lib',
    paths: {
        app: '../app',
        jquery: './jquery-3.2.1.min',
        fisheye: './fisheye',
        topojson: 'topojson.v1.min',
        d3: 'd3.v3.min',
        text: 'text',
        json: 'json'
    }
});

// All of application logic here.
requirejs(['app/main']);