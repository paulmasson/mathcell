
// return arrays of objects for all plots


function plot( f, xRange, options={} ) {

  if ( xRange.length < 3 ) xRange[2] = 200;

  if ( !( 'color' in options ) ) options.color = defaultPlotColor;
  if ( !( 'opacity' in options ) ) options.opacity = 1;

  var points = [];
  linspace( xRange[0], xRange[1], xRange[2] ).forEach(
    x => points.push( [ x, f(x) ] )
  );

  return [ { points: points, options: options, type: 'line' } ];

}


function listPlot( points, options={} ) {

  if ( Array.isArray( arguments[1] ) ) {

    // working copy of points
    points = JSON.parse( JSON.stringify( points ) );

    // assume arrays of same lengths and depths
    var dim = arguments[0][0].length - 1;

    for ( var i = 1 ; i < arguments.length ; i++ )
      if ( Array.isArray( arguments[i] ) )
        for ( var j = 0 ; j < arguments[0].length ; j++ )
          // only add last coordinates together
          points[j][dim] += arguments[i][j][dim];

    if ( !Array.isArray( arguments[ arguments.length - 1 ] ) )
      options = arguments[ arguments.length - 1 ];
    else options = {};

  }

  if ( !( 'color' in options ) ) options.color = defaultPlotColor;
  if ( !( 'opacity' in options ) ) options.opacity = 1;

  return [ { points: points, options: options, type: 'line' } ];

}

function polarPlot( f, aRange, options={} ) {

  if ( aRange.length < 3 ) aRange[2] = 200;

  return parametric( a => [ f(a)*Math.cos(a), f(a)*Math.sin(a) ], aRange, options );

}


function parametric( vector, xRange, yRange, options={} ) {

  if ( !( 'color' in options ) ) options.color = defaultPlotColor;
  if ( !( 'opacity' in options ) ) options.opacity = 1;
  if ( !( 'material' in options ) ) options.material = 'phong';

  var slices = xRange.length < 3 ? 50 : xRange[2];
  var xStep = ( xRange[1] - xRange[0] ) / slices;

  if ( !Array.isArray( yRange ) ) {

    var points = [];
    for ( var i = 0 ; i <= slices ; i++ ) {
      var x = xRange[0] + i * xStep;
      points.push( vector(x) );
    }

    return line( points, yRange );

  }

  var stacks = yRange.length < 3 ? 50 : yRange[2];
  var yStep = ( yRange[1] - yRange[0] ) / stacks;

  var vertices = [];
  if ( 'colormap' in options ) options.colors = [];

  for ( var i = 0 ; i <= stacks ; i++ ) {
    var y = yRange[0] + i * yStep;
    for ( var j = 0 ; j <= slices ; j++ ) {
      var x = xRange[0] + j * xStep;
      var v = vector(x,y);

      if ( 'complexFunction' in options )
        switch( options.complexFunction ) {
          case 're':
            vertices.push( [ v[0], v[1], v[2].re ] );
            break;
          case 'im':
            vertices.push( [ v[0], v[1], v[2].im ] );
            break;
          case 'abs':
            vertices.push( [ v[0], v[1], Math.sqrt( v[2].re**2 + v[2].im**2 ) ] );
            break;
          default:
            throw Error( 'Unsupported complex function case' );
        }
      else vertices.push( v );

      if ( 'colormap' in options )
        if ( options.colormap === 'complexArgument' ) {
          var p = Math.atan2( v[2].im, v[2].re ) / Math.PI / 2;
          if ( p < 0 ) p += 1;
          options.colors.push( p );
        }
      else {
        var p = ( options.colormap(x,y) % 1 + 1 ) % 1;
        options.colors.push( p );
      }
    }
  }

  var faces = [];
  var count = slices + 1;
  for ( var i = 0 ; i < stacks ; i++ ) {
    for ( var j = 0 ; j < slices ; j++ ) {
      faces.push( [j+count*i, j+count*i+1, j+count*(i+1)+1, j+count*(i+1)] );
    }
  }

  return [ { vertices: vertices, faces: faces, options: options, type: 'surface' } ];

}


function wireframe( vector, xRange, yRange, options={} ) {

  if ( !options.openEnded ) options.openEnded = true;

  var slices = xRange.length < 3 ? 50 : xRange[2];
  var xStep = ( xRange[1] - xRange[0] ) / slices;

  var stacks = yRange.length < 3 ? 50 : yRange[2];
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


function surfaceFromLines( lines, options={} ) {

  if ( !( 'color' in options ) ) options.color = defaultPlotColor;
  if ( !( 'opacity' in options ) ) options.opacity = 1;
  if ( !( 'material' in options ) ) options.material = 'phong';

  var vertices = [], faces = [];

  vertices = vertices.concat( lines[0] );
  var l = vertices.length;

  for ( var i = 1 ; i < lines.length ; i++ ) {

    vertices = vertices.concat( lines[i] );

    for ( var j = 0 ; j < l - 1 ; j++ )
      faces.push( [ (i-1)*l + j, (i-1)*l + j + 1, i*l + j + 1, i*l + j ] ); 

  }

  return [ { vertices: vertices, faces: faces, options: options, type: 'surface' } ];

}

