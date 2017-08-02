
function arrow( begin, end ) {

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

  return [ begin, end, p1, p2, end ]

}


