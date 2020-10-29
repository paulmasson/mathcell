
function threejs( id, data, config ) {

  if ( JSON.stringify( data ).includes( 'null' ) ) throw Error( 'Infinity or NaN in plot data' );

  if ( !( 'ambientLight' in config ) ) config.ambientLight = 'rgb(127,127,127)';
  if ( !( 'animate' in config ) ) config.animate = false;
  if ( !( 'aspectRatio' in config ) ) config.aspectRatio = [1,1,1];
  if ( !( 'axes' in config ) ) config.axes = false;
  if ( !( 'axesLabels' in config ) ) config.axesLabels = ['x','y','z'];
  if ( !( 'clearColor' in config ) ) config.clearColor = 'white';
  if ( !( 'decimals' in config ) ) config.decimals = 2;
  if ( !( 'equalAspect' in config ) ) config.equalAspect = false;
  if ( !( 'frame' in config ) ) config.frame = true;
  if ( !( 'viewpoint' in config ) ) config.viewpoint = 'auto';

  if ( !config.frame ) config.axesLabels = false;

  var n = 'output' in config ? config.output : '';
  var output = document.getElementById( id + 'output' + n );

  if ( output.children.length > 0 && output.children[0].contentWindow ) {

    var cw = output.children[0].contentWindow;
    var v = cw.camera.position;

    // only direction of viewpoint meaningful, not normalization
    config.viewpoint = [ v.x - cw.xMid, v.y - cw.yMid, v.z - cw.zMid ];

  }

  var texts = [], points = [], lines = [], surfaces = [];

  for ( var i = 0 ; i < data.length ; i++ )
    for ( var j = 0 ; j < data[i].length ; j++ ) {
      var d = data[i][j];
      if ( d.type === 'text' ) texts.push( d );
      if ( d.type === 'point' ) points.push( d );
      if ( d.type === 'line' ) {
        d.points = roundTo( d.points, 3, false ); // reduce raw data size
        lines.push( d );
      }
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

  if ( !( 'xMin' in config ) ) config.xMin = xMinMax.min;
  if ( !( 'yMin' in config ) ) config.yMin = yMinMax.min;
  if ( !( 'zMin' in config ) ) config.zMin = zMinMax.min;

  if ( !( 'xMax' in config ) ) config.xMax = xMinMax.max;
  if ( !( 'yMax' in config ) ) config.yMax = yMinMax.max;
  if ( !( 'zMax' in config ) ) config.zMax = zMinMax.max;

  surfaces.forEach( s => {
    // process predefined colormaps
    if ( 'colormap' in s.options &&
          ( !( 'colors' in s.options ) || s.options.colors.length === 0 ) ) {
      s.options.colors = [];
      var f = colormap( s.options.colormap, s.options.reverseColormap );
      var zMinMax = minMax( s.vertices, 2 );
      var zMin = zMinMax.min < config.zMin ? config.zMin : zMinMax.min;
      var zMax = zMinMax.max > config.zMax ? config.zMax : zMinMax.max;
      for ( var i = 0 ; i < s.vertices.length ; i++ ) {
        var z = s.vertices[i][2];
        if ( z < zMin ) z = zMin;
        if ( z > zMax ) z = zMax;
        var w = ( z - zMin ) / ( zMax - zMin );
        s.options.colors.push( colorToHexString( f(w) ) );
      }
    }
  } );

  var border = config.no3DBorder ? 'none' : '1px solid black';

  config = JSON.stringify( config );

  var lights = JSON.stringify( [ { position: [-5,3,0], color: 'rgb(127,127,127)', parent: 'camera' } ] );

  texts = JSON.stringify( texts );
  points = JSON.stringify( points );
  lines = JSON.stringify( lines );
  surfaces = JSON.stringify( surfaces );

  var html = threejsTemplate( config, lights, texts, points, lines, surfaces );

  return `<iframe style="width: 100%; height: 100%; border: ${border};"
                  srcdoc="${html.replace( /\"/g, '&quot;' )}" scrolling="no"></iframe>`;

}

