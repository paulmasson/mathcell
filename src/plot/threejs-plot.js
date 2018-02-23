
function threejsPlot( id, data, config ) {

  var ambientLight = 'ambientLight' in config ? config.ambientLight : 'rgb(127,127,127)';
  var aspectRatio = 'aspectRatio' in config ? config.aspectRatio : [1,1,1];
  var axes = 'axes' in config ? config.axes : false;
  var axesLabels = 'axesLabels' in config ? config.axesLabels : ['x','y','z'];
  var clearColor = 'clearColor' in config ? config.clearColor : 'white';
  var decimals = 'decimals' in config ? config.decimals : 2;
  var frame = 'frame' in config ? config.frame : true;
  var viewpoint = 'viewpoint' in config ? config.viewpoint : 'auto';

  var output = document.getElementById( id + 'output' );

  if ( output.children.length > 0 ) {

    var cw = output.children[0].contentWindow;
    var v = cw.camera.position;

    // only direction of viewpoint meaningful, not normalization
    viewpoint = [ v.x - cw.xMid, v.y - cw.yMid, v.z - cw.zMid ];

  }

  if ( !frame ) axesLabels = false;

  var options = JSON.stringify( { ambientLight: ambientLight,
      aspectRatio: aspectRatio, axes: axes, axesLabels: axesLabels,
      clearColor: clearColor, decimals: decimals, frame: frame,
      viewpoint: viewpoint } );

  var texts = [], points = [], lines = [], surfaces = [];

  for ( var i = 0 ; i < data.length ; i++ )
    for ( var j = 0 ; j < data[i].length ; j++ ) {
      var d = data[i][j];
      if ( d.type === 'text' ) texts.push( d );
      if ( d.type === 'point' ) points.push( d );
      if ( d.type === 'line' ) lines.push( d );
      if ( d.type === 'surface' ) {
        d.vertices = roundTo( d.vertices, 3, false ); // reduce raw data size
        if ( 'colors' in d.options ) d.options.colors = roundTo( d.options.colors, 3 );
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
  var xMax = 'xMax' in config ? config.xMax : xMinMax.max;
  var yMin = 'yMin' in config ? config.yMin : yMinMax.min;
  var yMax = 'yMax' in config ? config.yMax : yMinMax.max;
  var zMin = 'zMin' in config ? config.zMin : zMinMax.min;
  var zMax = 'zMax' in config ? config.zMax : zMinMax.max;

  var bounds = JSON.stringify( [ [xMin,yMin,zMin], [xMax,yMax,zMax] ] );

  var lights = JSON.stringify( [ { position: [-5,3,0], color: 'rgb(127,127,127)', parent: 'camera' } ] );

  texts = JSON.stringify( texts );
  points = JSON.stringify( points );
  lines = JSON.stringify( lines );
  surfaces = JSON.stringify( surfaces );

  var html = template( options, bounds, lights, texts, points, lines, surfaces );

  return `<iframe style="width: 100%; height: 100%; border: 1px solid black"
                  srcdoc="${html.replace( /\"/g, '&quot;' )}" scrolling="no"></iframe>`;

}

