
// return arrays of objects for all graphics


function arrow( begin, end, color='#07f' ) {

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

  return [ { points:[ begin, end, p1, p2, end ], color:color, type: 'line' } ];

}


function text( content, location, color='black', fontSize=14 ) {

    return [ { text:content, point:location, color:color,
               fontSize:fontSize, type: 'text' } ]

}


// simple 3D objects

function cuboid( width, depth, height, options={} ) {

  var color = 'color' in options ? options.color : 'red';
  var opacity = 'opacity' in options ? options.opacity : 1;

  var x = width / 2;
  var y = depth / 2;
  var z = height / 2;

  var vertices = [ [x,y,z], [-x,y,z], [x,-y,z], [-x,-y,z],
                   [x,y,-z], [-x,y,-z], [x,-y,-z], [-x,-y,-z] ];

  var faces = [ [0,1,3,2], [4,5,7,6], [0,4,5,1], [2,6,7,3],
                [0,4,6,2], [1,5,7,3] ];

  return [ { vertices:vertices, faces:faces, color:color, opacity:opacity,
             type: 'surface' } ];

}

function sphere() {


}

function cylinder( radius, height, color='red', opacity=1 ) {

  



}

