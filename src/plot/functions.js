
// return arrays of objects for all plots


function plot( f, xRange, options={} ) {

  if ( xRange.length < 3 ) xRange[2] = 200;

  var color = 'color' in options ? options.color : defaultPlotColor;

  var points = [];
  linspace( xRange[0], xRange[1], xRange[2] ).forEach(
    x => points.push( [ x, f(x) ] )
  );

  return [ { points: points, color: color, type: 'line' } ];

}


function listPlot( points, options={} ) {

  var color = 'color' in options ? options.color : defaultPlotColor;

  return [ { points: points, color: color, type: 'line' } ];

}


function parametric( vector, xRange, yRange, options={} ) {

  if ( xRange.length < 3 ) xRange[2] = 50;
  if ( yRange.length < 3 ) yRange[2] = 50;

  var color = 'color' in options ? options.color : defaultPlotColor;
  var opacity = 'opacity' in options ? options.opacity : 1;

  var slices = xRange[2];
  var stacks = yRange[2];

  var xStep = ( xRange[1] - xRange[0] ) / slices;
  var yStep = ( yRange[1] - yRange[0] ) / stacks;

  var vertices = [];
  for ( var i = 0 ; i <= stacks ; i++ ) {
    var y = yRange[0] + i * yStep;
    for ( var j = 0 ; j <= slices ; j++ ) {
      var x = xRange[0] + j * xStep;
      vertices.push( vector(x,y) );
    }
  }

  var faces = [];
  var count = slices + 1;
  for ( var i = 0 ; i < stacks ; i++ ) {
    for ( var j = 0 ; j < slices ; j++ ) {
      faces.push( [j+count*i, j+count*i+1, j+count*(i+1)+1, j+count*(i+1)] );
    }
  }

  return [ { vertices: vertices, faces: faces, color: color, opacity: opacity,
             type: 'surface' } ];

}


function wireframe( vector, xRange, yRange, options={} ) {

  if ( xRange.length < 3 ) xRange[2] = 50;
  if ( yRange.length < 3 ) yRange[2] = 50;

  var color = 'color' in options ? options.color : defaultPlotColor;
  var opacity = 'opacity' in options ? options.opacity : 1;

  var slices = xRange[2];
  var stacks = yRange[2];

  var xStep = ( xRange[1] - xRange[0] ) / slices;
  var yStep = ( yRange[1] - yRange[0] ) / stacks;

  var lines = [];

  for ( var i = 0 ; i <= slices ; i++ ) {
    var x = xRange[0] + i * xStep;
    var points = [];
    for ( var j = 0 ; j <= stacks ; j++ ) {
      var y = yRange[0] + j * yStep;
      points.push( vector(x,y) );
    }
    line( points, options ).forEach( l => lines.push( l ) );
  }

  for ( var i = 0 ; i <= stacks ; i++ ) {
    var y = yRange[0] + i * yStep;
    var points = [];
    for ( var j = 0 ; j <= slices ; j++ ) {
      var x = xRange[0] + j * xStep;
      points.push( vector(x,y) );
    }
    line( points, options ).forEach( l => lines.push( l ) );
  }

  return lines;

}

