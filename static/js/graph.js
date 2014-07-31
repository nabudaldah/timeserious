//drawGraph('test');
function showDetails(timeseries) {
  
  //if ($('#graph').highcharts() != undefined) {
  //  $('#graph').highcharts().showLoading();
  //}
  
  //$('#graph').show();

  $('#closeGraph').show();
  
  //graph('graph', timeseries);

  $('#dygraph').show();
  dygraph('dygraph', timeseries);

};

function hideDetails(){
  $('#graph').hide();
  $('#dygraph').hide();
  $('#closeGraph').hide();
  $('#graph').highcharts().destroy();  
}

//drawGraph('test');
function graph(graph, timeseries) {
  
  var chart = $('#' + graph);
  
  if (chart.highcharts() != undefined) {
    chart.highcharts().showLoading();
  }
  
  $.ajax({
    url: "/timeseries/" + timeseries,
    type: "GET",
    dataType: "json",
    error: function(data, status, error){
      console.log('abort...');
    },
    success: function(data, status, error){
      chart.highcharts({
        chart: {zoomType: 'x'},
        credits: { enabled: false },
        legend: { enabled: false },
        title: { text: null },
        plotOptions: { line: { lineWidth: 1, animation: false, marker: { enabled: false }, shadow: false, states: { hover: { lineWidth: 1 }}},
        series: { pointStart: Date.UTC(2014, 0, 1), pointInterval: 24 * 3600 * 1000 / 24 / 4 }, dataGrouping: {enabled: false} },
        xAxis: { type: 'datetime', tickLength: 0, minorTickLength: 0, minorGridLineWidth: 0, gridLineWidth: 0, labels: {enabled: false }, lineWidth: 0 },
        yAxis: { title: { text: null }, gridLineWidth: 0, labels: {enabled: false }, lineWidth: 0 },
        series: [{ data: data[0].data, enableMouseTracking: true }]
      });
      chart.highcharts().hideLoading();
    }
  });
};


//var dygraphPlot = function(element, timeseries, start){

var dygraph = function(targetId, timeseries){
    
  $.ajax({
    url: "/timeseries/" + timeseries,
    type: "GET",
    dataType: "json",
    error: function(data, status, error){
      console.log('abort...');
    },
    success: function(data, status, error){


      var element = document.getElementById(targetId);
      var dataArray = data[0].data;
      
      var duration = moment.duration({ minutes: 15 });

      var dygraphData = [];
      var time = moment('2014-01-01');
      
      for(var t = 0; t < dataArray.length; t++){
        var timestamp = new Date(time.toDate());
        var datapoint = [timestamp, dataArray[t]];
        dygraphData.push(datapoint);
        time = time.add(duration);
      }
      
      var timeseriesName = data[0]._id;
      
      var chart = new Dygraph(element, dygraphData, {
        drawYAxis: false,
        drawXAxis: false,
        labels: [ "timestampLabel", timeseriesName ],
        drawGrid: false,
        colors: ['grey'],
        strokeWidth: 1,
        highlightCircleSize: 5,        
        labelsDiv: document.getElementById('dygraphLegend'),
        labelsSeparateLines: true,
        highlightCallback: function(e, x, pts, row) {
          $('#dygraphLegend').css({
            left:  e.pageX + 15,
            top:   e.pageY + 15
          });
        }
      });
      
    }
  });  
}
