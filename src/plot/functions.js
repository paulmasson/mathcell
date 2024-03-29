
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

  var test = Math.random();

  var slices = xRange.length < 3 ? 50 : xRange[2];
  var xStep = ( xRange[1] - xRange[0] ) / slices;

  if ( !Array.isArray( yRange ) ) {

    if ( !Array.isArray( vector(test) ) ) {
      var f = vector;
      vector = x => [ x, f(x) ];
    }

    var points = [];
    for ( var i = 0 ; i <= slices ; i++ ) {
      var x = xRange[0] + i * xStep;
      points.push( vector(x) );
    }

    return line( points, yRange );

  }

  if ( !( 'color' in options ) ) options.color = defaultPlotColor;
  if ( !( 'opacity' in options ) ) options.opacity = 1;
  if ( !( 'material' in options ) ) options.material = 'phong';

  var stacks = yRange.length < 3 ? 50 : yRange[2];
  var yStep = ( yRange[1] - yRange[0] ) / stacks;

  if ( !Array.isArray( vector(test,test) ) ) {
    var f = vector;
    vector = (x,y) => [ x, y, f(x,y) ];
  }

  var vertices = [];
  if ( 'colormap' in options ) options.colors = [];

  for ( var i = 0 ; i <= stacks ; i++ ) {
    var y = yRange[0] + i * yStep;
    for ( var j = 0 ; j <= slices ; j++ ) {
      var x = xRange[0] + j * xStep;
      var v = vector(x,y);

      if ( 'complexFunction' in options ) {
        if ( !( typeof v[2] === 'object' && 're' in v[2] ) ) // from Math
          v[2] = { re: v[2], im: 0 };
        switch( options.complexFunction ) {
          case 're':
            vertices.push( [ v[0], v[1], v[2].re ] );
            break;
          case 'im':
            vertices.push( [ v[0], v[1], v[2].im ] );
            break;
          case 'abs':
            vertices.push( [ v[0], v[1], Math.hypot( v[2].re, v[2].im ) ] );
            break;
          default:
            throw Error( 'Unsupported complex function case' );
        }
      } else vertices.push( v );

      if ( 'colormap' in options ) {
        if ( options.colormap === 'complexArgument' )
          options.colors.push( colorFromArg( v[2] ) );
        if ( typeof( options.colormap ) === 'function' )
          options.colors.push( options.colormap(x,y) );
      }
    }
  }

  var faces = [], unused = [];
  var count = slices + 1;
  for ( var i = 0 ; i < stacks ; i++ )
    for ( var j = 0 ; j < slices ; j++ ) {

      var f = [j+count*i, j+count*i+1, j+count*(i+1)+1, j+count*(i+1)];

      if ( options.maxFaceSlope ) {
        var m = options.maxFaceSlope;
        if ( Math.abs( ( vertices[f[0]][2] - vertices[f[1]][2] ) / xStep ) > m ||
             Math.abs( ( vertices[f[1]][2] - vertices[f[2]][2] ) / yStep ) > m ||
             Math.abs( ( vertices[f[2]][2] - vertices[f[3]][2] ) / xStep ) > m ||
             Math.abs( ( vertices[f[3]][2] - vertices[f[0]][2] ) / yStep ) > m   ) {
          f.forEach( index => {
            if ( !unused.includes( index ) ) unused.push( index );
          } );
          continue;
        }
      }

      faces.push( f );

    }

  if ( unused.length > 0 ) {

    // set unused vertices to dummy value, Set is unique values
    var faceSet = new Set( faces.flat() );
    var dummy = vertices[ faceSet.values().next().value ][2];

    unused.forEach( index => {
      if ( !faceSet.has( index ) ) vertices[index][2] = dummy;
    } );

  }

  return [ { vertices: vertices, faces: faces, options: options, type: 'surface' } ];

}


function wireframe( vector, xRange, yRange, options={} ) {

  if ( !options.openEnded ) options.openEnded = true;

  var test = Math.random();

  var slices = xRange.length < 3 ? 50 : xRange[2];
  var xStep = ( xRange[1] - xRange[0] ) / slices;

  var stacks = yRange.length < 3 ? 50 : yRange[2];
  var yStep = ( yRange[1] - yRange[0] ) / stacks;

  if ( !Array.isArray( vector(test,test) ) ) {
    var f = vector;
    vector = (x,y) => [ x, y, f(x,y) ];
  }

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

  if ( !lines.every( e => e.length === lines[0].length ) )
    throw Error( 'All lines must be of equal length' );

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

function diskFromLines( lines, options={} ) {

  if ( !( 'color' in options ) ) options.color = defaultPlotColor;
  if ( !( 'opacity' in options ) ) options.opacity = 1;
  if ( !( 'material' in options ) ) options.material = 'phong';

  if ( !lines.every( e => e.length === lines[0].length ) )
    throw Error( 'All lines must be of equal length' );

  var vertices = [], faces = [];

  vertices = vertices.concat( lines[0] );
  var l = vertices.length - 1;

  for ( var i = 1 ; i < lines.length ; i++ ) {

    // assume same initial point
    vertices = vertices.concat( lines[i].slice(1) );

    faces.push( [ 0, (i-1)*l + 1, i*l + 1 ] );

    for ( var j = 1 ; j < l ; j++ )
      faces.push( [ (i-1)*l + j, (i-1)*l + j + 1, i*l + j + 1, i*l + j ] ); 

  }

  // final seam
  faces.push( [ 0, (i-1)*l + 1, 1 ] );

  for ( var j = 1 ; j < l ; j++ )
    faces.push( [ (i-1)*l + j, (i-1)*l + j + 1, j + 1, j ] ); 

  return [ { vertices: vertices, faces: faces, options: options, type: 'surface' } ];

}


function slopeField( f, xRange, yRange, zRange, options={} ) {

  if ( xRange.length < 3 ) xRange[2] = 20;
  if ( yRange.length < 3 ) yRange[2] = 20;

  var xStep = ( xRange[1] - xRange[0] ) / xRange[2];
  var yStep = ( yRange[1] - yRange[0] ) / yRange[2];

  var field = [], points = [];

  function scale( v, s ) {
    for ( var i = 0 ; i < v.length ; i++ ) v[i] *= s;
    return v;
  }

  if ( !Array.isArray( zRange ) ) {

    var size = .25 * Math.min( xStep, yStep );

    for ( var i = 0 ; i <= xRange[2] ; i++ ) {
      var x = xRange[0] + i * xStep;
      for ( var j = 0 ; j <= yRange[2] ; j++ ) {
        var y = yRange[0] + j * yStep;
        var v = scale( normalize( [ 1, f(x,y) ] ), size );
        field.push( line( translate( [ [-v[0],-v[1]], [v[0],v[1]] ], [x,y] ), zRange )[0] );
      }
    }

    return field;

  }

  if ( zRange.length < 3 ) zRange[2] = 20;

  var zStep = ( zRange[1] - zRange[0] ) / zRange[2];

  var size = .25 * Math.min( xStep, yStep, zStep );

  for ( var i = 0 ; i <= xRange[2] ; i++ ) {
    var x = xRange[0] + i * xStep;
    for ( var j = 0 ; j <= yRange[2] ; j++ ) {
      var y = yRange[0] + j * yStep;
      for ( var k = 0 ; k <= zRange[2] ; k++ ) {
        var z = zRange[0] + k * zStep;
        var v = scale( normalize( [ 1, f(x,y,z)[0], f(x,y,z)[1] ] ), size );
        v = translate( [ [-v[0],-v[1],-v[2]], [v[0],v[1],v[2]] ], [x,y,z] );
        points.push( v[0], v[1] );
      }
    }
  }

  options.useLineSegments = true;

  return line( points, options );

}

