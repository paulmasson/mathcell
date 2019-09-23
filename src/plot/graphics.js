
// return arrays of objects for all graphics
// face indices always counter-clockwise for consistency


function arrow( begin, end, options={} ) {

  if ( !( 'color' in options ) ) options.color = defaultPlotColor;

  // assume 2D for now
  var t = normalize( [ end[0]-begin[0], end[1]-begin[1] ] );
  var n = [ t[1], -t[0] ];
  var d = normalize( [ n[0]-t[0], n[1]-t[1] ] );

  size = .05;
  var p1 = [ end[0]+size*d[0], end[1]+size*d[1] ];
  var p2 = [ p1[0]-Math.sqrt(2)*size*n[0], p1[1]-Math.sqrt(2)*size*n[1] ];

  return [ { points: [ begin, end, p1, p2, end ], options: options, type: 'line' } ];

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

    for ( var j = 0 ; j <= steps ; j++ ) {

      var b = 2 * Math.PI * j / steps;

      vertices.push( [ r * Math.sin(a) * Math.cos(b),
                       r * Math.sin(a) * Math.sin(b),
                       r * Math.cos(a) ] );

    }

  }

  for ( var i = 2 ; i < steps + 2 ; i++ )
    faces.push( [ 0, i, i+1 ] ); // top

  for ( var i = 1 ; i < steps - 1 ; i++ ) {

    var k = ( i - 1 ) * ( steps + 1 ) + 2;

    for ( var j = 0 ; j < steps ; j++ )

      faces.push( [ k+j, k+j + steps+1, k+j+1 + steps+1, k+j+1 ] );

  }

  for ( var i = vertices.length - steps - 1 ; i < vertices.length - 1 ; i++ )
    faces.push( [ 1, i+1, i ] ); // bottom

  if ( 'center' in options ) translate( vertices, options.center );

  return [ { vertices: vertices, faces: faces, options: options, type: 'surface' } ];

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

  for ( var i = 0 ; i <= steps ; i++ ) {

    var a = 2 * Math.PI * i / steps;

    vertices.push( [ r * Math.cos(a), r * Math.sin(a), h ],
                   [ r * Math.cos(a), r * Math.sin(a), -h ] );

  }

  if ( !options.openEnded )
   for ( var i = 2 ; i < vertices.length - 3 ; i += 2 )
     faces.push( [ 0, i, i+2 ] );

  for ( var i = 2 ; i < vertices.length - 3 ; i += 2 )
    faces.push( [ i, i+1, i+3, i+2 ] );

  if ( !options.openEnded )
   for ( var i = 2 ; i < vertices.length - 3 ; i += 2 )
     faces.push( [ 1, i+3, i+1 ] );

  if ( 'axis' in options ) {

    var v = options.axis;
    var angle = Math.acos( v[2] / Math.sqrt( v[0]*v[0] + v[1]*v[1] + v[2]*v[2] ) );

    rotate( vertices, angle, [ -v[1], v[0], 0 ] );

  }

  if ( 'center' in options ) translate( vertices, options.center );

  return [ { vertices: vertices, faces: faces, options: options, type: 'surface' } ];

}

