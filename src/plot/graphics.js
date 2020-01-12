
// return arrays of objects for all graphics
// face indices always counter-clockwise for consistency


function arrow( begin, end, options={} ) {

  if ( !( 'color' in options ) ) options.color = defaultPlotColor;
  if ( !( 'opacity' in options ) ) options.opacity = 1;

  if ( begin.length === 2 ) {

    options.fill = true;

    var t = normalize( [ end[0]-begin[0], end[1]-begin[1] ] );
    var n = [ t[1], -t[0] ];
    var d = normalize( [ n[0]-t[0], n[1]-t[1] ] );

    var size = .05 * ( options.size ? options.size : 1 );
    var p1 = [ end[0]+size*d[0], end[1]+size*d[1] ];
    var p2 = [ p1[0]-Math.sqrt(2)*size*n[0], p1[1]-Math.sqrt(2)*size*n[1] ];

    return [ { points: [ begin, end, p1, p2, end ], options: options, type: 'line' } ];

  } else {

    var h = Math.sqrt( (end[0]-begin[0])**2 + (end[1]-begin[1])**2 + (end[2]-begin[2])**2 ) / 2;
    var size = .1 * ( options.size ? options.size : 1 );

    var center = [ (end[0]+begin[0])/2, (end[1]+begin[1])/2, (end[2]+begin[2])/2 ];
    var axis = normalize( [ end[0]-begin[0], end[1]-begin[1], end[2]-begin[2] ] );

    options.center = center;
    options.axis = axis;
    var body = cylinder( size/3, 2*h, options )[0];

    var center2 = [ center[0] + h*axis[0], center[1] + h*axis[1], center[2] + h*axis[2] ];

    options.center = center2;
    var head = cone( size, size, options )[0];

    return [ body, head ];

  }

}


function text( string, point, options={} ) {

  if ( !( 'color' in options ) ) options.color = 'black';
  if ( !( 'fontSize' in options ) ) options.fontSize = 14;

  return [ { text: string, point: point, options: options, type: 'text' } ];

}


function point( point, options={} ) {

  if ( !( 'color' in options ) ) options.color = defaultPlotColor;
  if ( !( 'opacity' in options ) ) options.opacity = 1;
  if ( !( 'size' in options ) ) options.size = 1;

  return [ { point: point, options: options, type: 'point' } ];

}


function line( points, options={} ) {

  if ( !( 'color' in options ) ) options.color = defaultPlotColor;
  if ( !( 'opacity' in options ) ) options.opacity = 1;

  if ( 'radius' in options ) {

    var segments = [];

    if ( options.endcaps ) {
      options.center = points[0];
      segments.push( sphere( options.radius, options )[0] );
    }

    for ( var i = 1 ; i < points.length ; i++ ) {

      var a = points[i-1];
      var b = points[i];

      var height = Math.sqrt( (b[0]-a[0])**2 + (b[1]-a[1])**2 + (b[2]-a[2])**2 );

      options.axis = [ b[0]-a[0], b[1]-a[1], b[2]-a[2] ];
      options.center = [ (a[0]+b[0])/2, (a[1]+b[1])/2, (a[2]+b[2])/2 ];

      segments.push( cylinder( options.radius, height, options )[0] );

      if ( options.endcaps ) {
        options.center = b;
        segments.push( sphere( options.radius, options )[0] );
      }

    }

    return segments;

  }

  else {

    if ( !( 'linewidth' in options ) ) options.linewidth = 1;

    return [ { points: points, options: options, type: 'line' } ];

  }

}


// simple 3D objects

function box( width, depth, height, options={} ) {

  if ( !( 'color' in options ) ) options.color = defaultPlotColor;
  if ( !( 'opacity' in options ) ) options.opacity = 1;

  var x = width / 2;
  var y = depth / 2;
  var z = height / 2;

  var vertices = [ [x,y,z], [-x,y,z], [-x,-y,z], [x,-y,z],
                   [x,y,-z], [-x,y,-z], [-x,-y,-z], [x,-y,-z] ];

  var faces = [ [0,1,2,3], [4,7,6,5], [0,4,5,1], [2,6,7,3],
                [0,3,7,4], [1,5,6,2] ];

  if ( 'axis' in options ) rotateFromZAxis( vertices, options.axis );

  if ( 'center' in options ) translate( vertices, options.center );

  return [ { vertices: vertices, faces: faces, options: options, type: 'surface' } ];

}

function sphere( radius, options={} ) {

  if ( !( 'color' in options ) ) options.color = defaultPlotColor;
  if ( !( 'opacity' in options ) ) options.opacity = 1;

  var steps = 'steps' in options ? options.steps : 20;
  var r = radius;

  var vertices = [ [ 0, 0, r ], [ 0, 0, -r ] ];
  var faces = [];

  for ( var i = 1 ; i < steps ; i++ ) {

    var a = Math.PI * i / steps;

    for ( var j = 0 ; j < steps ; j++ ) {

      var b = 2 * Math.PI * j / steps;

      vertices.push( [ r * Math.sin(a) * Math.cos(b),
                       r * Math.sin(a) * Math.sin(b),
                       r * Math.cos(a) ] );

    }

  }

  for ( var i = 2 ; i < steps + 1 ; i++ )
    faces.push( [ 0, i, i+1 ] ); // top

  faces.push( [ 0, steps + 1, 2 ] ); // avoid seam

  for ( var i = 1 ; i < steps - 1 ; i++ ) {

    var k = ( i - 1 ) * steps + 2;

    for ( var j = 0 ; j < steps - 1 ; j++ )

      faces.push( [ k+j, k+j + steps, k+j+1 + steps, k+j+1 ] );

    faces.push( [ k + steps - 1, k + 2*steps - 1, k + steps, k ] ); // avoid seam

  }

  for ( var i = vertices.length - steps ; i < vertices.length - 1 ; i++ )
    faces.push( [ 1, i+1, i ] ); // bottom

  faces.push( [ 1, vertices.length - steps, vertices.length - 1 ] ); // avoid seam

  if ( 'center' in options ) translate( vertices, options.center );

  return [ { vertices: vertices, faces: faces, options: options, type: 'surface' } ];

}

function ellipsoid( a, b, c, options={} ) {

  if ( !( 'color' in options ) ) options.color = defaultPlotColor;
  if ( !( 'opacity' in options ) ) options.opacity = 1;

  var e = sphere( 1, { steps: options.steps ? options.steps : 20 } )[0];

  e.vertices.forEach( v => { v[0] *= a; v[1] *= b; v[2] *= c; } );

  if ( 'axis' in options ) rotateFromZAxis( e.vertices, options.axis );

  if ( 'center' in options ) translate( e.vertices, options.center );

  return [ { vertices: e.vertices, faces: e.faces, options: options, type: 'surface' } ];

}

function cylinder( radius, height, options={} ) {

  if ( !( 'color' in options ) ) options.color = defaultPlotColor;
  if ( !( 'opacity' in options ) ) options.opacity = 1;

  if ( options.endcaps ) options.openEnded = true;

  var steps = 'steps' in options ? options.steps : 20;
  var r = radius;
  var h = height / 2;

  var vertices = [ [ 0, 0, h ], [ 0, 0, -h ] ];
  var faces = [];

  for ( var i = 0 ; i < steps ; i++ ) {

    var a = 2 * Math.PI * i / steps;

    vertices.push( [ r * Math.cos(a), r * Math.sin(a), h ],
                   [ r * Math.cos(a), r * Math.sin(a), -h ] );

  }

  if ( !options.openEnded ) {

   for ( var i = 2 ; i < vertices.length - 3 ; i += 2 )
     faces.push( [ 0, i, i+2 ] );

   faces.push( [ 0, vertices.length - 2, 2 ] ); // avoid seam

  }

  for ( var i = 2 ; i < vertices.length - 3 ; i += 2 )
    faces.push( [ i, i+1, i+3, i+2 ] );

  faces.push( [ vertices.length - 2, vertices.length - 1, 3, 2 ] ); // avoid seam

  if ( !options.openEnded ) {

   for ( var i = 2 ; i < vertices.length - 3 ; i += 2 )
     faces.push( [ 1, i+3, i+1 ] );

   faces.push( [ 1, 3, vertices.length - 1 ] ); // avoid seam

  }

  if ( 'axis' in options ) rotateFromZAxis( vertices, options.axis );

  if ( 'center' in options ) translate( vertices, options.center );

  return [ { vertices: vertices, faces: faces, options: options, type: 'surface' } ];

}

function cone( radius, height, options={} ) {

  if ( !( 'color' in options ) ) options.color = defaultPlotColor;
  if ( !( 'opacity' in options ) ) options.opacity = 1;

  var steps = 'steps' in options ? options.steps : 20;
  var r = radius;
  var h = height / 2;

  var vertices = [ [ 0, 0, -h ], [ 0, 0, h ] ];
  var faces = [];

  for ( var i = 0 ; i < steps ; i++ ) {

    var a = 2 * Math.PI * i / steps;

    vertices.push( [ r * Math.cos(a), r * Math.sin(a), -h ] );

  }

  for ( var i = 2 ; i < vertices.length - 1 ; i++ )
    faces.push( [ 0, i, i+1 ], [ 1, i, i+1 ] );

  faces.push( [ 0, vertices.length - 1, 2 ], [ 1, vertices.length - 1, 2 ] ); // avoid seam

  if ( 'axis' in options ) rotateFromZAxis( vertices, options.axis );

  if ( 'center' in options ) translate( vertices, options.center );

  return [ { vertices: vertices, faces: faces, options: options, type: 'surface' } ];

}

