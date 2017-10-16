
// return arrays of objects for all plots


function plot( f, xRange, color='blue' ) {

  if ( xRange.length < 3 ) xRange[2] = 200;

  var points = [];
  linspace( xRange[0], xRange[1], xRange[2] ).forEach(
    x => points.push( [ x, f(x) ] )
  );

  return [ { points: points, color: color, type: 'line' } ];

}


function listPlot( points, color='blue' ) {

    return [ { points: points, color: color, type: 'line' } ];

}


function parametric( vector, xRange, yRange, color='blue', opacity=1 ) {

  if ( xRange.length < 3 ) xRange[2] = 50;
  if ( yRange.length < 3 ) yRange[2] = 50;

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

