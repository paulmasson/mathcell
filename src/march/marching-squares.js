
function isoline( f, xRange, yRange, options={} ) {

  if ( xRange.length < 3 ) xRange[2] = 100;
  if ( yRange.length < 3 ) yRange[2] = 100;

  if ( !( 'color' in options ) ) options.color = defaultPlotColor;
  if ( !( 'opacity' in options ) ) options.opacity = 1;

  var level = 'level' in options ? options.level : 0;

  var xStep = ( xRange[1] - xRange[0] ) / ( xRange[2] - 1 );
  var yStep = ( yRange[1] - yRange[0] ) / ( yRange[2] - 1 );

  var d = []; // value data

  for ( var i = 0 ; i < xRange[2] ; i++ ) {
    d[i] = [];
    var x = xRange[0] + i * xStep;
    for ( var j = 0 ; j < yRange[2] ; j++ ) {
      var y = yRange[0] + j * yStep;
      d[i][j] = [ x, y, f(x,y) ];
    }
  }

  function lerp( u1, u2 ) {

    var m = ( level - u1[2] ) / ( u2[2] - u1[2] );

    var x = u1[0] + m * ( u2[0] - u1[0] );
    var y = u1[1] + m * ( u2[1] - u1[1] );

    return [ x, y ];

  }

  var segments = [];

  for ( var i = 0 ; i < d.length - 1 ; i++ ) {
    for ( var j = 0 ; j < d[i].length - 1 ; j++ ) {

      var v0 = d[i][j];
      var v1 = d[i+1][j];
      var v2 = d[i+1][j+1];
      var v3 = d[i][j+1];

      var index = 0;

      if ( v0[2] < level ) index += 1;
      if ( v1[2] < level ) index += 2;
      if ( v2[2] < level ) index += 4;
      if ( v3[2] < level ) index += 8;

      // keep corners below level to left of segments for consistency
      // segments can be determined using lookup tables as
      //   for marching cubes but code would be about same size

      var points = [], points2 = [];

      switch( index ) {

        case 0:
        case 15:

          continue;

        case 1:

          points = [ lerp( v0, v1 ), lerp( v3, v0 ) ];
          break;

        case 2:

          points = [ lerp( v1, v2 ), lerp( v0, v1 ) ];
          break;

        case 3:

          points = [ lerp( v1, v2 ), lerp( v3, v0 ) ];
          break;

        case 4:

          points = [ lerp( v2, v3 ), lerp( v1, v2 ) ];
          break;

        case 5:

          points = [ lerp( v2, v3 ), lerp( v3, v0 ) ];
          points2 = [ lerp( v0, v1 ), lerp( v1, v2 ) ];
          break;

        case 6:

          points = [ lerp( v2, v3 ), lerp( v0, v1 ) ];
          break;

        case 7:

          points = [ lerp( v2, v3 ), lerp( v3, v0 ) ];
          break;

        case 8:

          points = [ lerp( v3, v0 ), lerp( v2, v3 ) ];
          break;

        case 9:

          points = [ lerp( v0, v1 ), lerp( v2, v3 ) ];
          break;

        case 10:

          points = [ lerp( v3, v0 ), lerp( v0, v1 ) ];
          points2 = [ lerp( v1, v2 ), lerp( v2, v3 ) ];
          break;

        case 11:

          points = [ lerp( v1, v2 ), lerp( v2, v3 ) ];
          break;

        case 12:

          points = [ lerp( v3, v0 ), lerp( v1, v2 ) ];
          break;

        case 13:

          points = [ lerp( v0, v1 ), lerp( v1, v2 ) ];
          break;

        case 14:

          points = [ lerp( v3, v0 ), lerp( v0, v1 ) ];

      }

      segments.push( { points: points, options: options, type: 'line' } );

      if ( points2.length > 0 )
        segments.push( { points: points2, options: options, type: 'line' } );

    }
  }

  return segments;

}


function isoband( f, xRange, yRange, options={} ) {

  if ( xRange.length < 3 ) xRange[2] = 75;
  if ( yRange.length < 3 ) yRange[2] = 75;

  if ( !( 'color' in options ) ) options.color = defaultPlotColor;
  if ( !( 'opacity' in options ) ) options.opacity = 1;

  var level = 'level' in options ? options.level : 0;

  var xStep = ( xRange[1] - xRange[0] ) / ( xRange[2] - 1 );
  var yStep = ( yRange[1] - yRange[0] ) / ( yRange[2] - 1 );

  var d = []; // value data

  for ( var i = 0 ; i < xRange[2] ; i++ ) {
    d[i] = [];
    var x = xRange[0] + i * xStep;
    for ( var j = 0 ; j < yRange[2] ; j++ ) {
      var y = yRange[0] + j * yStep;
      d[i][j] = [ x, y, f(x,y) ];
    }
  }

  function lerp( u1, u2 ) {

    var m = ( level - u1[2] ) / ( u2[2] - u1[2] );

    var x = u1[0] + m * ( u2[0] - u1[0] );
    var y = u1[1] + m * ( u2[1] - u1[1] );

    return [ x, y ];

  }

  var segments = [];

  for ( var i = 0 ; i < d.length - 1 ; i++ ) {
    for ( var j = 0 ; j < d[i].length - 1 ; j++ ) {

      var v0 = d[i][j];
      var v1 = d[i+1][j];
      var v2 = d[i+1][j+1];
      var v3 = d[i][j+1];

      var index = 0;

      if ( v0[2] < level ) index += 1;
      if ( v1[2] < level ) index += 2;
      if ( v2[2] < level ) index += 4;
      if ( v3[2] < level ) index += 8;

      // keep corners below level to left of segments for consistency

      var points = [];

      switch( index ) {

        case 0:

          continue;

        case 1:

          points = [ lerp( v0, v1 ), lerp( v3, v0 ), v0 ];
          break;

        case 2:

          points = [ lerp( v1, v2 ), lerp( v0, v1 ), v1 ];
          break;

        case 3:

          points = [ lerp( v1, v2 ), lerp( v3, v0 ), v0, v1 ];
          break;

        case 4:

          points = [ lerp( v2, v3 ), lerp( v1, v2 ), v2 ];
          break;

        case 5:

          points = [ lerp( v2, v3 ), lerp( v3, v0 ), v0,
                     lerp( v0, v1 ), lerp( v1, v2 ), v2 ];
          break;

        case 6:

          points = [ lerp( v2, v3 ), lerp( v0, v1 ), v1, v2 ];
          break;

        case 7:

          points = [ lerp( v2, v3 ), lerp( v3, v0 ), v0, v1, v2 ];
          break;

        case 8:

          points = [ lerp( v3, v0 ), lerp( v2, v3 ), v3 ];
          break;

        case 9:

          points = [ lerp( v0, v1 ), lerp( v2, v3 ), v3, v0 ];
          break;

        case 10:

          points = [ lerp( v3, v0 ), lerp( v0, v1 ), v1,
                     lerp( v1, v2 ), lerp( v2, v3 ), v3 ];
          break;

        case 11:

          points = [ lerp( v1, v2 ), lerp( v2, v3 ), v3, v0, v1 ];
          break;

        case 12:

          points = [ lerp( v3, v0 ), lerp( v1, v2 ), v2, v3 ];
          break;

        case 13:

          points = [ lerp( v0, v1 ), lerp( v1, v2 ), v2, v3, v0 ];
          break;

        case 14:

          points = [ lerp( v3, v0 ), lerp( v0, v1 ), v1, v2, v3 ];
          break;

        case 15:

          points = [ v0, v1, v2, v3 ];

      }

      options.fill = true;

      segments.push( { points: points, options: options, type: 'line' } );

    }
  }

  return segments;

}

