
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
    var v = vector( x.length );
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
    var v = vector( x.length );
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
    var v = vector( x.length );
    for ( var i = 0 ; i < x.length ; i++ ) v[i] = floorTo( x[i], n );
    return v;
  }

  var exponent = Math.floor( Math.log10( Math.abs(x) ) );
  n = n - exponent - 1;
  return Math.floor( 10**n * x ) / 10**n;

}


