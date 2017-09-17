
// return arrays of objects for all graphics


function arrow( begin, end, color='blue' ) {

  // assume 2D for now
  var vector = [ end[0]-begin[0], end[1]-begin[1] ];

  function normalize( v ) {
    var len = Math.sqrt( v[0]*v[0] + v[1]*v[1] );
    return [ v[0]/len, v[1]/len ];
  }

  var t = normalize( vector );
  var n = [ t[1], -t[0] ];
  var d = normalize( [ n[0]-t[0], n[1]-t[1] ] );

  size = .05;
  var p1 = [ end[0]+size*d[0], end[1]+size*d[1] ];
  var p2 = [ p1[0]-Math.sqrt(2)*size*n[0], p1[1]-Math.sqrt(2)*size*n[1] ];

  return [ { points: [ begin, end, p1, p2, end ], color: color, type: 'line' } ];

}


function text( content, location, color='black', fontSize=14 ) {

    return [ { text: content, point: location, color: color,
               fontSize: fontSize, type: 'text' } ];

}


function line( points, options={} ) {

  var color = 'color' in options ? options.color : 'blue';
  var opacity = 'opacity' in options ? options.opacity : 1;

  if ( 'radius' in options ) {

    var segments = [];

    if ( options.endcaps )
      segments.push( sphere( options.radius, { center: points[0], color: color } )[0] );

    for ( var i = 1 ; i < points.length ; i++ ) {

      var a = points[i-1];
      var b = points[i];

      var height = Math.sqrt( (b[0]-a[0])**2 + (b[1]-a[1])**2 + (b[2]-a[2])**2 );

      options.axis = [ b[0]-a[0], b[1]-a[1], b[2]-a[2] ];
      options.center = [ (a[0]+b[0])/2, (a[1]+b[1])/2, (a[2]+b[2])/2 ];

      segments.push( cylinder( options.radius, height, options )[0] );

      if ( options.endcaps )
        segments.push( sphere( options.radius, { center: b, color: color } )[0] );

    }

    return segments;

  }

  else {

    var linewidth = 'linewidth' in options ? options.linewidth : 1;

    return [ { points: points, color: color, opacity: opacity,
               linewidth: linewidth, type: 'line' } ];

  }

}


// simple 3D objects

function box( width, depth, height, options={} ) {

  var color = 'color' in options ? options.color : 'blue';
  var opacity = 'opacity' in options ? options.opacity : 1;

  var x = width / 2;
  var y = depth / 2;
  var z = height / 2;

  var vertices = [ [x,y,z], [-x,y,z], [x,-y,z], [-x,-y,z],
                   [x,y,-z], [-x,y,-z], [x,-y,-z], [-x,-y,-z] ];

  var faces = [ [0,1,3,2], [4,5,7,6], [0,4,5,1], [2,6,7,3],
                [0,4,6,2], [1,5,7,3] ];

  return [ { vertices: vertices, faces: faces, color: color, opacity: opacity,
             type: 'surface' } ];

}

function sphere( radius, options={} ) {

  var color = 'color' in options ? options.color : 'blue';
  var opacity = 'opacity' in options ? options.opacity : 1;

  var steps = 'steps' in options ? options.steps : 20;
  var r = radius;

  var vertices = [], faces = [];

  for ( var i = 1 ; i < steps ; i++ ) {

    var a = Math.PI * (i-1) / (steps-1);
    var b = Math.PI * i / (steps-1);

    for ( var j = 1 ; j < steps ; j++ ) {

      var c = 2 * Math.PI * (j-1) / (steps-1);
      var d = 2 * Math.PI * j / (steps-1);

    vertices.push(
      [ r * Math.sin(a) * Math.cos(c), r * Math.sin(a) * Math.sin(c), r * Math.cos(a) ],
      [ r * Math.sin(a) * Math.cos(d), r * Math.sin(a) * Math.sin(d), r * Math.cos(a) ],
      [ r * Math.sin(b) * Math.cos(c), r * Math.sin(b) * Math.sin(c), r * Math.cos(b) ],
      [ r * Math.sin(b) * Math.cos(d), r * Math.sin(b) * Math.sin(d), r * Math.cos(b) ]  );

      var l = vertices.length;

      faces.push( [l-4,l-3,l-1,l-2] );

    }

  }

  if ( 'center' in options ) translate( vertices, options.center );

  return [ { vertices: vertices, faces: faces, color: color, opacity: opacity,
             type: 'surface' } ];

}

function cylinder( radius, height, options={} ) {

  var color = 'color' in options ? options.color : 'blue';
  var opacity = 'opacity' in options ? options.opacity : 1;

  var steps = 'steps' in options ? options.steps : 20;
  var r = radius;
  var h = height / 2;

  var vertices = [ [0,0,h], [0,0,-h] ];
  var faces = [];

  for ( var i = 1 ; i < steps ; i++ ) {

    var a = 2 * Math.PI * (i-1) / (steps-1);
    var b = 2 * Math.PI * i / (steps-1);

    vertices.push( [ r * Math.cos(a), r * Math.sin(a), h ],
                   [ r * Math.cos(b), r * Math.sin(b), h ],
                   [ r * Math.cos(a), r * Math.sin(a), -h ],
                   [ r * Math.cos(b), r * Math.sin(b), -h ] );

    var l = vertices.length;

    faces.push( [0,l-4,l-3], [1,l-2,l-1], [l-4,l-3,l-1,l-2] );

  }

  if ( 'axis' in options ) {

    var v = options.axis;
    var angle = Math.acos( v[2] / Math.sqrt( v[0]*v[0] + v[1]*v[1] + v[2]*v[2] ) );

    rotate( vertices, angle, [ -v[1], v[0], 0 ] );

  }

  if ( 'center' in options ) translate( vertices, options.center );

  return [ { vertices: vertices, faces: faces, color: color, opacity: opacity,
             type: 'surface' } ];

}

