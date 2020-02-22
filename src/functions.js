
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
  for ( var i = 0 ; i < points - 1 ; i++ ) result.push( a + i * step );
  result.push( b );

  return result;

}

function lerp( a, b ) {

  return function( x ) { return a[1] + ( x - a[0] ) * ( b[1] - a[1] ) / ( b[0] - a[0] ) };

}

// rounding functions

function roundTo( x, n, significant=true ) {

  if ( x === 0 ) return x;

  if ( Array.isArray(x) ) {
    var v = [];
    for ( var i = 0 ; i < x.length ; i++ ) v[i] = roundTo( x[i], n, significant );
    return v;
  }

  if ( significant ) {
    var exponent = Math.floor( Math.log10( Math.abs(x) ) );
    n = n - exponent - 1;
  }

  return Math.round( 10**n * x ) / 10**n;

}

function ceilTo( x, n, significant=true ) {

  if ( x === 0 ) return x;

  if ( Array.isArray(x) ) {
    var v = [];
    for ( var i = 0 ; i < x.length ; i++ ) v[i] = ceilTo( x[i], n, significant );
    return v;
  }

  if ( significant ) {
    var exponent = Math.floor( Math.log10( Math.abs(x) ) );
    n = n - exponent - 1;
  }

  return Math.ceil( 10**n * x ) / 10**n;

}

function floorTo( x, n, significant=true ) {

  if ( x === 0 ) return x;

  if ( Array.isArray(x) ) {
    var v = [];
    for ( var i = 0 ; i < x.length ; i++ ) v[i] = floorTo( x[i], n, significant );
    return v;
  }

  if ( significant ) {
    var exponent = Math.floor( Math.log10( Math.abs(x) ) );
    n = n - exponent - 1;
  }

  return Math.floor( 10**n * x ) / 10**n;

}

// transformation functions

function normalize( vector ) {

  var len = Math.hypot.apply( null, vector );
  for ( var i = 0 ; i < vector.length ; i++ ) vector[i] /= len;
  return vector;

}

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

      var norm = Math.hypot.apply( null, vector );
      if ( norm === 0 ) break;
      if ( norm !== 1 )
        for ( var i = 0 ; i < 3 ; i++ ) vector[i] /= norm;

      var n1 = vector[0];
      var n2 = vector[1];
      var n3 = vector[2];
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

      break;

    default:

      throw Error( 'Unsupported rotation dimension' );

    }

}

function rotateFromZAxis( points, vector ) {

  var angle = Math.acos( vector[2] / Math.hypot.apply( null, vector ) );

  rotate( points, angle, [ -vector[1], vector[0], 0 ] );

}

// presentation functions

function getCompleteCode() {

  var cell = document.getElementsByClassName( 'mathcell' )[0]

  var copy = cell.cloneNode( false );
  copy.removeAttribute( 'id' );
  copy.appendChild( cell.children[0] );

  var s = copy.outerHTML.replace( '<script>', '\n<script>' ).replace( '</div>', '\n</div>' );
  document.getElementById( 'codeDisplay' ).innerText = s;

}

function hueToColor( h ) {

  h = ( h % 1 + 1 ) % 1; // restrict to [0,1]

  function hue2rgb( p, q, t ) {

    if ( t < 0 ) t += 1;
    if ( t > 1 ) t -= 1;
    if ( t < 1/6 ) return p + ( q - p ) * 6 * t;
    if ( t < 1/2 ) return q;
    if ( t < 2/3 ) return p + ( q - p ) * 6 * ( 2/3 - t );
    return p;

  }

  var r = hue2rgb( 0, 1, h + 1/3 );
  var g = hue2rgb( 0, 1, h );
  var b = hue2rgb( 0, 1, h - 1/3 );

  return { r: r, g: g, b: b };

}

function colorToHexString( color ) {

  var hex = ( color.r * 255 ) << 16 ^ ( color.g * 255 ) << 8 ^ ( color.b * 255 ) << 0;

  return '#' + ( '000000' + hex.toString(16) ).slice(-6);


}

function colormap( name, reversed=false ) {

  function piecewise( pieces ) { 

    return function( x ) {

      for ( var i = 0 ; i < pieces.length ; i++ ) {
        var domain = pieces[i][1];
        if ( x >= domain[0] && x <= domain[1] ) return pieces[i][0](x);
      }

      return 0;

    }

  }

  var r = piecewise( colormaps[name].r );
  var g = piecewise( colormaps[name].g );
  var b = piecewise( colormaps[name].b );

  if ( reversed )
    return function(x) { return { r: r(1-x), g: g(1-x), b: b(1-x) }; };

  return function(x) { return { r: r(x), g: g(x), b: b(x) }; };

}

