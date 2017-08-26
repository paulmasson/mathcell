
function threejsPlot( data, config ) {

  var aspectRatio = 'aspectRatio' in config ? config.aspectRatio : [1,1,1];
  var axes = 'axes' in config ? config.axes : false;
  var axesLabels = 'axesLabels' in config ? config.axesLabels : ['x','y','z'];
  var decimals = 'decimals' in config ? config.decimals : 2;
  var frame = 'frame' in config ? config.frame : true;

  if ( !frame ) axesLabels = false;

  var options = JSON.stringify( {
      aspectRatio: aspectRatio, axes: axes, axesLabels: axesLabels,
      decimals: decimals, frame: frame } );

  // UNIFY DATA HANDLING IN TEMPLATE

  var texts = [], points = [], lines = [], surfaces = [];

  for ( var i = 0 ; i < data.length ; i++ )
    for ( var j = 0 ; j < data[i].length ; j++ ) {
      var d = data[i][j];
      if ( d.type === 'text' ) texts.push( d );
      if ( d.type === 'point' ) points.push( d );
      if ( d.type === 'line' ) lines.push( d );
      if ( d.type === 'surface' ) surfaces.push( d );
    }

  var all = [];
  for ( var i = 0 ; i < texts.length ; i++ ) all = all.concat( [texts[i].slice(1)] );
  for ( var i = 0 ; i < points.length ; i++ ) all = all.concat( points[i].point );
  for ( var i = 0 ; i < lines.length ; i++ ) all = all.concat( lines[i].points );
  for ( var i = 0 ; i < surfaces.length ; i++ ) all = all.concat( surfaces[i].vertices );

  var xMinMax = minMax( all, 0 );
  var yMinMax = minMax( all, 1 );
  var zMinMax = minMax( all, 2 );

  var xMin = 'xMin' in config ? config.xMin : xMinMax.min;
  var xMax = 'xMax' in config ? config.xMax : xMinMax.max;
  var yMin = 'yMin' in config ? config.yMin : yMinMax.min;
  var yMax = 'yMax' in config ? config.yMax : yMinMax.max;
  var zMin = 'zMin' in config ? config.zMin : zMinMax.min;
  var zMax = 'zMax' in config ? config.zMax : zMinMax.max;

  var bounds = JSON.stringify( [{ x:xMin, y:yMin, z:zMin },{ x:xMax, y:yMax, z:zMax }] );

  var lights = '[{ "x":-5, "y":3, "z":0, "color":"#7f7f7f", "parent":"camera" }]';
  var ambient = '{ "color":"#7f7f7f" }';

  texts = JSON.stringify( texts );
  points = JSON.stringify( points );
  lines = JSON.stringify( lines );
  surfaces = JSON.stringify( surfaces );

  var html = template( options, bounds, lights, ambient, texts, points, lines, surfaces );

  return `<iframe style="width: 100%; height: 100%; border: 1px solid black"
                  srcdoc="${html.replace( /\"/g, '&quot;' )}" scrolling="no"></iframe>`;

}

