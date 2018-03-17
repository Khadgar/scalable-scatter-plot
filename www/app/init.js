define([
    'jquery',
    './chart',
    'json!../../data/data.json'
], function($, Chart, data) {
    var nationalContent = $(".eaLanding-indexContainer-Dashboards-txt");
    return {
        start: function() {
            $(document).ready(function() {
                Chart.createChart(data);
            }.bind(this));
        }
    };
});