
function x3dPlot( id, data, config ) {

  var width = document.getElementById( id + 'output' ).offsetWidth;
  var height = document.getElementById( id + 'output' ).offsetHeight;

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

  var html = `
<html>
<head>
<title></title>
<meta charset="utf-8">
<link rel="stylesheet" type="text/css" href="https://www.x3dom.org/download/x3dom.css">
</head>

<body>

<script src="https://www.x3dom.org/download/x3dom.js"></script>

<X3D>
<Scene>
  `;

  for ( var i = 0 ; i < surfaces.length ; i++ ) {

    var s = surfaces[i];

    var indices = '';
    for ( var j = 0 ; j < s.faces.length ; j++ )
      indices += s.faces[j].join(' ') + ' -1 ';

    var points = '';
    for ( var j = 0 ; j < s.vertices.length ; j++ )
      points += s.vertices[j].join(' ') + ' ';

    var p = document.createElement( 'p' );
    p.style.color = s.color;
    var rgb = p.style.color.replace( /[^\d,]/g, '' ).split(',');
    rgb.forEach( (e,i,a) => a[i] = a[i] / 255 );
    var color = rgb.join(' '); 

    html += `
<Shape>
<Appearance><TwoSidedMaterial diffuseColor="${color}"/></Appearance>
<IndexedFaceSet coordIndex="${indices}">
<Coordinate point="${points}"></Coordinate>
    `;

    if ( s.colors.length > 0 ) {
      var colors = '';
      for ( var j = 0 ; j < s.colors.length ; j++ ) {
        p.style.color = 'hsl(' + 360*s.colors[j] + ',100%,50%)';
        rgb = p.style.color.replace( /[^\d,]/g, '' ).split(',');
        rgb.forEach( (e,i,a) => a[i] = a[i] / 255 );
        colors +=  rgb.join(' ') + ' ';
      }
      html += `
<Color color="${colors}"></Color>
      `;
    }

    html += `
</IndexedFaceSet>
</Shape>
    `;

  }

  html += `
</Scene>
</X3D>

</body>
</html>
  `;

  return `<iframe style="width: 100%; height: 100%; border: 1px solid black"
                  srcdoc="${html.replace( /\"/g, '&quot;' )}" scrolling="no"></iframe>`;

}

