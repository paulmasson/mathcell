
function contour( f, xRange, yRange, level=0 ) {

  if ( xRange.length < 3 ) xRange[2] = 100;
  if ( yRange.length < 3 ) yRange[2] = 100;

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

      if ( v0[2] > level ) index += 1;
      if ( v1[2] > level ) index += 2;
      if ( v2[2] > level ) index += 4;
      if ( v3[2] > level ) index += 8;

      // keep corners above level to left of segments
      //   for possible future use
      // segments can be determined using lookup tables
      //   as for marching cubes but code would be about same size

      switch( index ) {

        case 0:
        case 15:

          break;

        case 1:

          segments.push( [ lerp( v0, v1 ), lerp( v3, v0 ) ] );
          break;

        case 2:

          segments.push( [ lerp( v1, v2 ), lerp( v0, v1 ) ] );
          break;

        case 3:

          segments.push( [ lerp( v1, v2 ), lerp( v3, v0 ) ] );
          break;

        case 4:

          segments.push( [ lerp( v2, v3 ), lerp( v1, v2 ) ] );
          break;

        case 5:

          segments.push( [ lerp( v2, v3 ), lerp( v3, v0 ) ] );
          segments.push( [ lerp( v0, v1 ), lerp( v1, v2 ) ] );
          break;

        case 6:

          segments.push( [ lerp( v2, v3 ), lerp( v0, v1 ) ] );
          break;

        case 7:

          segments.push( [ lerp( v2, v3 ), lerp( v3, v0 ) ] );
          break;

        case 8:

          segments.push( [ lerp( v3, v0 ), lerp( v2, v3 ) ] );
          break;

        case 9:

          segments.push( [ lerp( v0, v1 ), lerp( v2, v3 ) ] );
          break;

        case 10:

          segments.push( [ lerp( v3, v0 ), lerp( v0, v1 ) ] );
          segments.push( [ lerp( v1, v2 ), lerp( v2, v3 ) ] );
          break;

        case 11:

          segments.push( [ lerp( v1, v2 ), lerp( v2, v3 ) ] );
          break;

        case 12:

          segments.push( [ lerp( v3, v0 ), lerp( v1, v2 ) ] );
          break;

        case 13:

          segments.push( [ lerp( v0, v1 ), lerp( v1, v2 ) ] );
          break;

        case 14:

          segments.push( [ lerp( v3, v0 ), lerp( v0, v1 ) ] );

      }

    }
  }

  return segments;

}

