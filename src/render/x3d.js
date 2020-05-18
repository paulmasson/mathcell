
function x3d( id, data, config ) {

  if ( JSON.stringify( data ).includes( 'null' ) ) throw Error( 'Infinity or NaN in plot data' );

  function compositeRotation( first, second ) {

    var a = first[0], na = first[1];
    var b = second[0], nb = second[1];

    var dot = na[0]*nb[0] + na[1]*nb[1] + na[2]*nb[2];
    var cross = [ na[1]*nb[2] - na[2]*nb[1],
                  na[2]*nb[0] - na[0]*nb[2],
                  na[0]*nb[1] - na[1]*nb[0]  ];

    var c = 2 * Math.acos( Math.cos(a/2) * Math.cos(b/2)
                           - dot * Math.sin(a/2) * Math.sin(b/2) );

    var nc = [];
    for ( var i = 0 ; i < 3 ; i++ )
      nc[i] = na[i] * Math.sin(a/2) * Math.cos(b/2) / Math.sin(c/2)
              + nb[i] * Math.cos(a/2) * Math.sin(b/2) / Math.sin(c/2)
              - cross[i] * Math.sin(a/2) * Math.sin(b/2) / Math.sin(c/2);

    return [ c, nc ];

  }

  var frame = 'frame' in config ? config.frame : true;
  var viewer = 'viewer' in config ? config.viewer : 'x3dom';

  var n = 'output' in config ? config.output : '';
  var output = document.getElementById( id + 'output' + n );

  var width = output.offsetWidth;
  var height = output.offsetHeight;

  var texts = [], points = [], lines = [], surfaces = [];

  for ( var i = 0 ; i < data.length ; i++ )
    for ( var j = 0 ; j < data[i].length ; j++ ) {
      var d = data[i][j];
      if ( d.type === 'text' ) texts.push( d );
      if ( d.type === 'point' ) points.push( d );
      if ( d.type === 'line' ) lines.push( d );
      if ( d.type === 'surface' ) {
        d.vertices = roundTo( d.vertices, 3, false ); // reduce raw data size
        surfaces.push( d );
      }
    }

  var all = [];
  for ( var i = 0 ; i < texts.length ; i++ ) all.push( texts[i].point );
  for ( var i = 0 ; i < points.length ; i++ ) all.push( points[i].point );
  for ( var i = 0 ; i < lines.length ; i++ ) lines[i].points.forEach( p => all.push( p ) );
  for ( var i = 0 ; i < surfaces.length ; i++ ) surfaces[i].vertices.forEach( p => all.push( p ) );

  var xMinMax = minMax( all, 0 );
  var yMinMax = minMax( all, 1 );
  var zMinMax = minMax( all, 2 );

  var xMin = 'xMin' in config ? config.xMin : xMinMax.min;
  var yMin = 'yMin' in config ? config.yMin : yMinMax.min;
  var zMin = 'zMin' in config ? config.zMin : zMinMax.min;

  var xMax = 'xMax' in config ? config.xMax : xMinMax.max;
  var yMax = 'yMax' in config ? config.yMax : yMinMax.max;
  var zMax = 'zMax' in config ? config.zMax : zMinMax.max;

  var xRange = xMax - xMin;
  var yRange = yMax - yMin;
  var zRange = zMax - zMin;

  var xMid = ( xMax + xMin ) / 2;
  var yMid = ( yMax + yMin ) / 2;
  var zMid = ( zMax + zMin ) / 2;

  var boxHelper = [ [ [xMin,yMin,zMin],[xMax,yMin,zMin] ],
                    [ [xMin,yMin,zMin],[xMin,yMax,zMin] ],
                    [ [xMin,yMin,zMin],[xMin,yMin,zMax] ],
                    [ [xMax,yMin,zMin],[xMax,yMax,zMin] ],
                    [ [xMax,yMin,zMin],[xMax,yMin,zMax] ],
                    [ [xMin,yMax,zMin],[xMax,yMax,zMin] ],
                    [ [xMin,yMax,zMin],[xMin,yMax,zMax] ],
                    [ [xMin,yMin,zMax],[xMax,yMin,zMax] ],
                    [ [xMin,yMin,zMax],[xMin,yMax,zMax] ],
                    [ [xMax,yMax,zMin],[xMax,yMax,zMax] ],
                    [ [xMax,yMin,zMax],[xMax,yMax,zMax] ],
                    [ [xMin,yMax,zMax],[xMax,yMax,zMax] ] ];

  // default orientation is looking down z-axis, even after displacement
  // need to rotate viewpoint back to origin with composite orientation

  var zRotation = [ Math.PI/2 + Math.atan(yRange/xRange), [ 0, 0, 1 ] ];

  var norm1 = Math.sqrt( xRange**2 + yRange**2 + zRange**2 );
  var norm2 = Math.sqrt( xRange**2 + yRange**2 );

  var xyRotation = [ Math.acos( zRange/norm1 ),
                               [ -yRange/norm2, xRange/norm2, 0 ] ];

  var cr = compositeRotation( zRotation, xyRotation );

  var x3d = `
<X3D width="${width}" height="${height}">
<Scene>
<Background skyColor="1 1 1"></Background>
<Viewpoint position="${xRange+xMid} ${yRange+yMid} ${zRange+zMid}"
           orientation="${cr[1].join(' ')} ${cr[0]}"
           centerOfRotation="${xMid} ${yMid} ${zMid}"></Viewpoint>`;

  if ( frame ) x3d += `
<Shape>
<Appearance>
<Material emissiveColor="0 0 0"></Material>
</Appearance>
<LineSet vertexCount="2 2 2 2 2 2 2 2 2 2 2 2">
<Coordinate point="${boxHelper.map(a => a[0].concat(a[1]).join(' ')).join(', ')}"></Coordinate>
</LineSet>
</Shape>`;

  for ( var i = 0 ; i < surfaces.length ; i++ ) {

    var s = surfaces[i];

    // remove faces completely outside vertical range
    for ( var j = s.faces.length - 1 ; j >= 0 ; j-- ) {
      var f = s.faces[j];
      var check = true;
      f.forEach( index => check = check && s.vertices[index][2] < zMin );
      if ( check ) s.faces.splice( j, 1 );
      var check = true;
      f.forEach( index => check = check && s.vertices[index][2] > zMax );
      if ( check ) s.faces.splice( j, 1 );
    }

    // constrain vertices to vertical range
    for ( var j = 0 ; j < s.vertices.length ; j++ ) {
      if ( s.vertices[j][2] < zMin ) s.vertices[j][2] = zMin;
      if ( s.vertices[j][2] > zMax ) s.vertices[j][2] = zMax;
    }

    var indices = '';
    for ( var j = 0 ; j < s.faces.length ; j++ )
      indices += s.faces[j].join(' ') + ' -1 ';

    var points = '';
    for ( var j = 0 ; j < s.vertices.length ; j++ )
      points += s.vertices[j].join(' ') + ' ';

    var p = document.createElement( 'p' );
    p.style.color = s.options.color;
    var rgb = p.style.color.replace( /[^\d,]/g, '' ).split(',');
    rgb.forEach( (e,i,a) => a[i] /= 255 );
    var color = rgb.join(' '); 

    x3d += `
<Shape>
<Appearance>
<TwoSidedMaterial diffuseColor="${color}" transparency="${1-s.options.opacity}"></TwoSidedMaterial>
</Appearance>
<IndexedFaceSet creaseAngle="1.57" solid="false" coordIndex="${indices}">
<Coordinate point="${points}"></Coordinate>`;

    if ( 'colors' in s.options ) {
      var colors = '';
      for ( var j = 0 ; j < s.options.colors.length ; j++ ) {
        p.style.color = s.options.colors[j];
        rgb = p.style.color.replace( /[^\d,]/g, '' ).split(',');
        rgb.forEach( (e,i,a) => a[i] /= 255 );
        rgb = roundTo( rgb, 3 );
        colors +=  rgb.join(' ') + ' ';
      }
      x3d += `
<Color color="${colors}"></Color>`;
    }

    x3d += `
</IndexedFaceSet>
</Shape>`;

  }

  x3d += `
</Scene>
</X3D>`;

  if ( config.saveAsXML ) {

    var xml = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE X3D PUBLIC "ISO//Web3D//DTD X3D 3.3//EN" "http://www.web3d.org/specifications/x3d-3.3.dtd">
${x3d}`;

    var blob = new Blob( [ xml ] );
    var a = document.body.appendChild( document.createElement( 'a' ) );
    a.href = window.URL.createObjectURL( blob );
    a.download = 'scene.xml';
    a.click();

  }

  var stylesheet = config.viewer === 'x3dom' ?
`<link rel="stylesheet" type="text/css" href="https://www.x3dom.org/download/x3dom.css">` :
`<link rel="stylesheet" type="text/css" href="https://code.create3000.de/x_ite/4.6.9/dist/x_ite.css"/>`;

  var script = config.viewer === 'x3dom' ?
`<script src="https://www.x3dom.org/download/x3dom.js"></script>` :
`<script src="https://code.create3000.de/x_ite/4.6.9/dist/x_ite.min.js"></script>
<script src="https://raw.githack.com/andreasplesch/x_ite_dom/master/release/x_ite_dom.1.3.js"></script>
<script>
  //disable straighten horizon
  X3D( function ready() {
    var browser = X3D.getBrowser( 'X3DCanvas' );
    browser.setBrowserOption( 'StraightenHorizon', false );
  } );
</script>`;

  var html = `
<html>
<head>
<title></title>
<meta charset="utf-8">
${stylesheet}
</head>

<body style="margin: 0px">

${script}

<X3DCanvas style="width: ${width}px; height: ${height}px">
${x3d}
</X3DCanvas>

</body>
</html>`;

  var border = config.no3DBorder ? 'none' : '1px solid black';

  return `<iframe style="width: ${output.offsetWidth}px; height: ${output.offsetHeight}px; border: ${border}"
                  srcdoc="${html.replace( /\"/g, '&quot;' )}" scrolling="no"></iframe>`;

}

