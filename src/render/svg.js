
function svg( id, data, config ) {

  function parsedLength( input ) {

    var frag = new DOMParser().parseFromString( input, 'text/html' );
    return frag.documentElement.textContent.length;

  }

  function decimalsInNumber( x ) {

    for ( var i = 0 ; i < 100 ; i++ ) {
      if ( roundTo( x, i, false ) === x ) break;
    }
    return i;

  }

  function chop( x, tolerance=1e-10 ) {

    if ( Math.abs(x) < tolerance ) x = 0;
    return x;

  }

  var n = 'output' in config ? config.output : '';
  var output = document.getElementById( id + 'output' + n );

  var width = output.offsetWidth;
  var height = output.offsetHeight;
  var ext = 20; // axis extension

  if ( config.includeOrigin ) data.push( [ { points: [[0,0]], options: { color: '' }, type: 'line' } ] );

  var texts = [], points = [], lines = [];

  for ( var i = 0 ; i < data.length ; i++ )
    for ( var j = 0 ; j < data[i].length ; j++ ) {
      var d = data[i][j];
      if ( d.type === 'text' ) texts.push( d );
      if ( d.type === 'point' ) points.push( d );
      if ( d.type === 'line' ) lines.push( d );
    }

  var all = [];
  for ( var i = 0 ; i < texts.length ; i++ ) all.push( texts[i].point );
  for ( var i = 0 ; i < points.length ; i++ ) all.push( points[i].point );
  for ( var i = 0 ; i < lines.length ; i++ ) lines[i].points.forEach( p => all.push( p ) );

  var xMinMax = minMax( all, 0 );
  var yMinMax = minMax( all, 1 );

  // rounding currently to remove excessive decimals
  // add option when needed for rounding to significant digits

  var xMin = 'xMin' in config ? config.xMin : floorTo( xMinMax.min, 4, false );
  var xMax = 'xMax' in config ? config.xMax : ceilTo( xMinMax.max, 4, false );
  var yMin = 'yMin' in config ? config.yMin : floorTo( yMinMax.min, 4, false );
  var yMax = 'yMax' in config ? config.yMax : ceilTo( yMinMax.max, 4, false );

  if ( xMin === xMax ) { xMin -= 1; xMax += 1; }
  if ( yMin === yMax ) { yMin -= 1; yMax += 1; }

  if ( config.equalLimits ) {

    if ( xMin < yMin ) yMin = xMin;
    else xMin = yMin;

    if ( xMax > yMax ) yMax = xMax;
    else xMax = yMax;

  }

  var xRange = xMax - xMin;
  var yRange = yMax - yMin;

  var xScale = width / xRange;
  var yScale = height / yRange;
  if ( config.equalAspect ) yScale = xScale;

  var axes = 'axes' in config ? config.axes : true;
  if ( !axes ) config.ticks = false;

  var ticks = 'ticks' in config ? config.ticks : [ 'auto', 'auto' ];
  if ( ticks === 'auto' ) ticks = [ 'auto', 'auto' ];
  if ( ticks === 'none' ) ticks = false;
  var tickSize = 5;

  if ( ticks[0] === 'auto' ) {
    ticks[0] = Math.pow( 10, Math.floor( Math.log10(xRange) ) );
    if ( 3*ticks[0] > xRange ) ticks[0] /= 2;
    if ( 4*ticks[0] > xRange ) ticks[0] /= 2;
  }
  if ( ticks[1] === 'auto' ) {
    ticks[1] = Math.pow( 10, Math.floor( Math.log10(yRange) ) );
    if ( 3*ticks[1] > yRange ) ticks[1] /= 2;
    if ( 4*ticks[1] > yRange ) ticks[1] /= 2;
  }

  var xTickDecimals = decimalsInNumber( ticks[0] );
  var yTickDecimals = decimalsInNumber( ticks[1] );

  // size of largest y-axis tick label
  var yNumSize = 10 * Math.max( roundTo( yMin, yTickDecimals, false ).toString().length,
                                roundTo( yMax, yTickDecimals, false ).toString().length,
                                roundTo( 3*ticks[1], yTickDecimals, false ).toString().length  );

  // offsets of numbers from axes, inverted when on right/top
  var xOffset = 10;
  var yOffset = 16;

  var xAxisLabel = 'axesLabels' in config ? config.axesLabels[0] : '';
  var xLabel = xAxisLabel.length > 0 ? Math.max( 20, 15 * parsedLength( xAxisLabel ) ) : 0;
  var yAxisLabel = 'axesLabels' in config ? config.axesLabels[1] : '';
  var yLabelSize = 4.5 * parsedLength( yAxisLabel );
  var yLabel = yAxisLabel.length > 0 ? 20 : 0;

  // mathematical origin vs. location of axis
  var xOrigin = Math.round( -xMin * xScale );
  var xAxis = xOrigin;
  var gutter = ticks ? Math.max( ext, yNumSize + xOffset - xOrigin, yLabelSize - xOrigin ) : ext;
  var xTotal = width + gutter + ext + xLabel;
  var xShift = gutter;

  if ( xOrigin < 0 ) {
    xAxis = -1.5*ext;
    gutter = ticks ? Math.max( ext, yNumSize + xOffset, yLabelSize ) : ext;
    xTotal = width + gutter + 2.5*ext + xLabel;
    xShift = gutter + 1.5*ext;
  }
  if ( xOrigin > width ) {
    xAxis = width + 1.5*ext;
    gutter = ticks ? Math.max( yNumSize, yLabelSize, xLabel ) : xLabel;
    xTotal = width + gutter + 2.5*ext;
    xOffset = ticks ? -yNumSize : ext;
  }

  // mathematical origin vs. location of axis
  var yOrigin = Math.round( yMax * yScale );
  var yAxis = yOrigin;
  var yTotal = height + 2*ext + yLabel;
  var yShift = ext + yLabel;

  if ( yOrigin < 0 ) {
    yAxis = -1.5*ext;
    yTotal += .5*ext + yOffset;
    yShift = 1.5*ext + yOffset;
    yOffset = -6;
    if ( yLabel > 0 ) yLabel += 12;
  }
  if ( yOrigin > height ) {
    yAxis = height + 1.5*ext;
    yTotal += .5*ext + 1.5*yOffset;
  }

  var svg = `
<svg width="${width}" height="${height}" preserveAspectRatio="none"
     viewBox="${-xShift} ${-yShift} ${xTotal} ${yTotal}"
     xmlns="http://www.w3.org/2000/svg">`;

  if ( axes ) {

    svg += `<path d="M ${-ext} ${yAxis} L ${width + ext} ${yAxis}" stroke="black"/>`;
    svg += `<path d="M ${xAxis} ${-ext} L ${xAxis} ${height + ext}" stroke="black"/>`;

    if ( ticks ) {

      var xStart = ticks[0] * Math.ceil( xMin / ticks[0] );
      for ( var i = xStart ; i <= xMax ; i += ticks[0] ) {
        if ( chop(i) !== 0 || ( yOrigin !== yAxis && yLabel === 0 ) ) {
          var x = Math.round( xOrigin + xScale*i );
          svg += `<path d="M ${x} ${yAxis} L ${x} ${yAxis - Math.sign(yOffset)*tickSize}"
                        stroke="black" />`;
          svg += `<text x="${x}" y="${yAxis + yOffset}"
                        font-family="monospace" text-anchor="middle">
                  ${+i.toFixed(xTickDecimals)}</text>`;
        }
      }

      var yStart = ticks[1] * Math.ceil( yMin / ticks[1] );
      for ( var i = yStart ; i <= yMax ; i += ticks[1] ) {
        if ( chop(i) !== 0 || ( xOrigin !== xAxis && xLabel === 0 ) ) {
          var y = Math.round( yOrigin - yScale*i );
          svg += `<path d="M ${xAxis} ${y} L ${xAxis + Math.sign(xOffset)*tickSize} ${y}"
                        stroke="black" />`;
          svg += `<text x="${xAxis - xOffset}" y="${y}"
                        font-family="monospace" text-anchor="end" dominant-baseline="central">
                  ${+i.toFixed(yTickDecimals)}</text>`;
        }
      }

    }

    svg += `<text x="${width + ext + Math.abs(xOffset)}" y="${yAxis}"
            font-family="monospace" font-size="110%" font-weight="bold"
            dominant-baseline="central">${xAxisLabel}</text>`;
    svg += `<text x="${xAxis}" y="${-ext - yLabel/2}"
            font-family="monospace" font-size="110%" font-weight="bold"
            text-anchor="middle">${yAxisLabel}</text>`;

  }


  function xPos( x ) { return roundTo( xOrigin + xScale*x, 2, false ); }

  function yPos( y ) { return roundTo( yOrigin - yScale*y, 2, false ); }


  for ( var i = 0 ; i < lines.length ; i++ ) {

    // working copy of line
    var l = JSON.parse( JSON.stringify( lines[i] ) );

    l.points.forEach( p => {
      // set possibly huge values to just beyond limits
      if ( p[1] < yMin ) p[1] = yMin - 1;
      if ( p[1] > yMax ) p[1] = yMax + 1;
    } );

    var x = l.points[0][0];
    var y = l.points[0][1];

    svg += `<path d="M ${ xPos(x) } ${ yPos(y) }`;
    var lastX = x;
    var lastY = y;

    for ( var k = 1 ; k < l.points.length ; k++ ) {

      x = l.points[k][0];
      y = l.points[k][1];

      function intercept( u ) {
        return (u - lastY) / (y - lastY) * (x - lastX) + lastX;
      }

      // both points inside bounds
      if ( ( lastY >= yMin && y >= yMin ) && ( lastY <= yMax && y <= yMax) )
        svg += ` L ${ xPos(x) } ${ yPos(y) }`;

      // both points outside bounds
      if ( ( lastY < yMin && y < yMin ) || ( lastY > yMax && y > yMax) )
        svg += ` M ${ xPos(x) } ${ yPos(y) }`;
      if ( lastY < yMin && y > yMax ) {
        if ( config.includeVerticals ) {
          svg += ` M ${ xPos( intercept(yMin) ) } ${ yPos(yMin) }`;
          svg += ` L ${ xPos( intercept(yMax) ) } ${ yPos(yMax) }`;
          svg += ` M ${ xPos(x) } ${ yPos(y) }`;
        }
        else svg += ` M ${ xPos(x) } ${ yPos(y) }`;
      }
      if ( lastY > yMax && y < yMin ) {
        if ( config.includeVerticals ) {
          svg += ` M ${ xPos( intercept(yMax) ) } ${ yPos(yMax) }`;
          svg += ` L ${ xPos( intercept(yMin) ) } ${ yPos(yMin) }`;
          svg += ` M ${ xPos(x) } ${ yPos(y) }`;
        }
        else svg += ` M ${ xPos(x) } ${ yPos(y) }`;
      }

      // line between points crosses bounds
      if ( lastY < yMin && y >= yMin && y < yMax ) {
        svg += ` M ${ xPos( intercept(yMin) ) } ${ yPos(yMin) }`;
        svg += ` L ${ xPos(x) } ${ yPos(y) }`;
      }
      if ( lastY >= yMin && lastY < yMax && y < yMin ) {
        svg += ` L ${ xPos( intercept(yMin) ) } ${ yPos(yMin) }`;
        svg += ` M ${ xPos(x) } ${ yPos(y) }`;
      }
      if ( lastY <= yMax && lastY > yMin && y > yMax ) {
        svg += ` L ${ xPos( intercept(yMax) ) } ${ yPos(yMax) }`;
        svg += ` M ${ xPos(x) } ${ yPos(y) }`;
      }
      if ( lastY > yMax && y <= yMax && y > yMin ) {
        svg += ` M ${ xPos( intercept(yMax) ) } ${ yPos(yMax) }`;
        svg += ` L ${ xPos(x) } ${ yPos(y) }`;
      }

      var lastX = x;
      var lastY = y;

    }

    svg += `" stroke="${l.options.color}" stroke-width="1.5" fill="${l.options.fill ? l.options.color : 'none'}"/>`;

  }

  // draw points on top of lines for now

  for ( var i = 0 ; i < points.length ; i++ ) {

    var c = points[i];
    svg += `<circle cx="${ xPos(c.point[0]) }" cy="${ yPos(c.point[1]) }"
                    r="${ 3 * c.options.size }" fill="${ c.options.color }"/>`;

  }

  for ( var i = 0 ; i < texts.length ; i++ ) {

    var t = texts[i];
    svg += `<text x="${ xPos(t.point[0]) }" y="${ yPos(t.point[1]) }"
                  fill="${ t.options.color }" font-size="${ t.options.fontSize }"
                  text-anchor="middle" dominant-baseline="central">
            ${t.text}</text>`;

  }

  return svg + '</svg>';

}

