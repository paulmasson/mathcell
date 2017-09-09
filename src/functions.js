
function minMax( d, index ) {

  var min = Number.MAX_VALUE;
  var max = -Number.MAX_VALUE;

  for ( var i = 0 ; i < d.length ; i++ ) {
    if ( d[i][index] < min ) min = d[i][index];
    if ( d[i][index] > max ) max = d[i][index];
  }

  return { min: min, max: max };

}


function linspace( a, b, points ) {

  var result = [];
  var step = ( b - a ) / ( points - 1 );
  for ( var x = a ; x < b ; x += step ) result.push( x );
  result.push( b );

  return result;

}

// rounding functions

function roundTo( x, n ) {

  if ( x === 0 ) return x;

  if ( Array.isArray(x) ) {
    var v = [];
    for ( var i = 0 ; i < x.length ; i++ ) v[i] = roundTo( x[i], n );
    return v;
  }

  var exponent = Math.floor( Math.log10( Math.abs(x) ) );
  n = n - exponent - 1;
  return Math.round( 10**n * x ) / 10**n;

}

function ceilTo( x, n ) {

  if ( x === 0 ) return x;

  if ( Array.isArray(x) ) {
    var v = [];
    for ( var i = 0 ; i < x.length ; i++ ) v[i] = ceilTo( x[i], n );
    return v;
  }

  var exponent = Math.floor( Math.log10( Math.abs(x) ) );
  n = n - exponent - 1;
  return Math.ceil( 10**n * x ) / 10**n;

}

function floorTo( x, n ) {

  if ( x === 0 ) return x;

  if ( Array.isArray(x) ) {
    var v = [];
    for ( var i = 0 ; i < x.length ; i++ ) v[i] = floorTo( x[i], n );
    return v;
  }

  var exponent = Math.floor( Math.log10( Math.abs(x) ) );
  n = n - exponent - 1;
  return Math.floor( 10**n * x ) / 10**n;

}

// transformation functions

function translate( points, vector ) {

  for ( var i = 0 ; i < points.length ; i++ )
    for ( var j = 0 ; j < vector.length ; j++ )
      points[i][j] += vector[j];

  return points;

}

function rotate( points, angle=0, vector=[0,0,1] ) {

  var dimension = points[0].length;

  switch( dimension ) {

    case 2:

      for ( var i = 0 ; i < points.length ; i++ ) {

        var v = points[i];

        var x = v[0]*Math.cos(angle) - v[1]*Math.sin(angle);
        var y = v[0]*Math.sin(angle) + v[1]*Math.cos(angle);

        points[i] = [ x, y ];

      }

      break;

    case 3:

      var n = vector;
      var norm = n[0]*n[0] + n[1]*n[1] + n[2]*n[2];
      if ( norm !== 1 )
        for ( var i = 0 ; i < 3 ; i++ ) n[i] /= Math.sqrt(norm);

      var n1 = n[0];
      var n2 = n[1];
      var n3 = n[2];
      var c = Math.cos(angle);
      var s = Math.sin(angle);

      // Rodrigues in matrix form
      var M = [ [ c + (1-c)*n1**2, -s*n3 + (1-c)*n1*n2, s*n2 + (1-c)*n1*n3 ],
                [ s*n3 + (1-c)*n1*n2, c + (1-c)*n2**2, -s*n1 + (1-c)*n2*n3 ],
                [ -s*n2 + (1-c)*n1*n3, s*n1 + (1-c)*n2*n3, c + (1-c)*n3**2 ] ];

      for ( var i = 0 ; i < points.length ; i++ ) {

        var v = points[i];
        var x = 0, y = 0, z = 0;

        for ( var j = 0 ; j < v.length ; j++ ) {
          x += M[0][j]*v[j];
          y += M[1][j]*v[j];
          z += M[2][j]*v[j];
        }

        points[i] = [ x, y, z ];

      }

      break

    default:

      throw 'Unsupported rotation dimension';

    }

}

