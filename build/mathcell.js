
function MathCell( id, inputArray ) {

  // process array of dictionaries
  var s = '';
    for ( var i = 0 ; i < inputArray.length ; i++ ) {
      var input = inputArray[i];
      var label = 'label' in input ? input.label : '';
      if ( label.length === 1 ) label = `<i>${label}</i>`;
        s += `
<div style="white-space: nowrap">
<div style="min-width: .5in; display: inline-block">${label}</div>
<div style="width: 100%; display: inline-block; white-space: nowrap">
  ${interact( id, input )} </div>
</div>
        `;
    }
  s += `
<div>&nbsp;</div>
<div id=${id}wrap style="width: 100%; flex: 1; position: relative">
<div id=${id}output style="width: 100%; height: 100%;
                           position: absolute; top: 0; left: 0"></div>
</div>
  `;

  var cell = document.createRange().createContextualFragment( s )
  document.getElementById( id ).appendChild( cell );

}


function interact( id, input ) {

  switch ( input.type ) {

    case 'slider':

      var name = 'name' in input ? input.name : '';
      var min = 'min' in input ? input.min : 0;
      var max = 'max' in input ? input.max : 1;
      var step = 'step' in input ? input.step : .01;
      var value = 'default' in input ? input.default : min;

      return `
<input id=${id + name} type=range min=${min} max=${max} step=${step} value=${value}
       style="vertical-align: middle; width: calc(100% - 1.2in)"
       onchange="${id + name}box.value=${id + name}.value;${id}.update('${id}')"/>
<input id=${id + name}box type=number value=${value} title="" style="width: .5in"
       onchange="${id + name}.value=${id + name}box.value;${id}.update('${id}')"/>
      `;

    case 'buttons':

      var name = 'name' in input ? input.name : '';
      var list = 'list' in input ? input.list : [1,2,3];
      var check = 'default' in input ? input.default : list[0];

      var s = ''
      for ( var i = 0 ; i < list.length ; i++ )
        s += `
<input id=${id + name}_${i} name=${id + name} type=radio
       value=${list[i]} ${list[i]===check?'checked':''}
       onchange="${id}.update('${id}')">
<label for=${id + name}_${i}> ${list[i]} </label> &nbsp; </input>
        `;
      return s;

    case 'checkbox':

      var name = 'name' in input ? input.name : '';
      var checked = 'default' in input ? input.default : '';

      return `
<input id=${id + name} type=checkbox ${checked?'checked':''}
       onchange="${id}.update('${id}')"/>
      `;

    default:

      return 'Unsupported input type';

  }

}


function graphic( id, data, config ) {

  switch ( config.type ) {

    case 'svgplot':

      return svgPlot( id, data, config );

    case 'threejs':

      return threejsPlot( data, config );

    case 'text':

      return `<div style="white-space: nowrap; overflow-x: auto">${JSON.stringify(data)}</div>`;

    case 'matrix':

      s = '<table class="matrix" style="width: 95%; margin: auto; \
                                        line-height: 1.5; text-align: center">';

      for ( var i = 0 ; i < data.length ; i++ ) {
        s += '<tr>';
        for ( var j = 0 ; j < data[i].length ; j++ ) {
          s += '<td>' + data[i][j] + '</td>';
        }
        s += '</tr>';
      }

      return s + '</table>';

    default:

      return 'Unsupported graphic type';

  }

}


function evaluate( id, data, config ) {

  var output = document.getElementById( id + 'output' );
  output.innerHTML = graphic( id, data, config );

  if ( config.type === 'threejs' ) {

    var iframe = output.children[0];

    if ( /Safari/g.test( navigator.userAgent ) ) iframe.srcdoc = iframe.srcdoc;

    if ( /(iPad|iPhone|iPod)/g.test( navigator.userAgent ) ) {
      iframe.style.width = getComputedStyle( iframe ).width;
      iframe.style.height = getComputedStyle( iframe ).height;
      iframe.srcdoc = iframe.srcdoc;
    }

  }

}


function minMax( d, index ) {

  var min = Number.MAX_VALUE;
  var max = -Number.MAX_VALUE;

  for ( var i = 0 ; i < d.length ; i++ ) {
    if ( d[i][index] < min ) min = d[i][index];
    if ( d[i][index] > max ) max = d[i][index];
  }

  return { min: min, max: max };

}


function linspace( a, b, points ) {

  var result = [];
  var step = ( b - a ) / ( points - 1 );
  for ( var x = a ; x < b ; x += step ) result.push( x );
  result.push( b );

  return result;

}


var mathcellStyle = document.createElement( 'style' );
mathcellStyle.type = 'text/css';
mathcellStyle.innerHTML = `

input[type=number] {

	-webkit-appearance: none;
	box-shadow: none;
	border: 1px solid black;
	border-radius: 5px;

}

input[type=number]::-webkit-outer-spin-button,
input[type=number]::-webkit-inner-spin-button {

    -webkit-appearance: none;
    margin: 0;

}

input[type=number] {

    -moz-appearance:textfield;

}

input[type=radio] {

	display: none;

}

input[type=radio] + label {

	display: inline-block;
	vertical-align: middle;
	min-width: 25px;
	height: 20px;
	line-height: 20px;
	text-align: center;
	border: 1px solid black;
	border-radius: 5px;
	background-color: #eee;

}

input[type=radio]:checked + label {

	border-width: 2px;
	background-color: #fafafa

}

.mathcell {

	width: 5in;
	margin: .25in auto .25in auto;
	border: 2px solid black;
	display: flex;
	flex-direction: column;
	box-sizing: border-box;
	padding: .25in .5in .5in .5in;
	line-height: 2.5;

}

/* Courtesy of http://jsfiddle.net/NQ6ww/38/ */

.matrix:before, .matrix:after {

	content: "";
	position: absolute;
	top: 0;
	border: 1.5px solid black;
	width: 10px;
	height: 100%;

}

.matrix:before {

	left: 5px;
	border-right: 0px;

}

.matrix:after {

	right: 5px;
	border-left: 0px;

}

/*
Generated at http://www.cssportal.com/style-input-range/
Thumb is 20px by 25px with 5px radius
Track is 10px high with 3px radius
For MS, 1px margins top and right to avoid cutoffs
Replace when major browsers support common styling
*/

input[type=range] {
  -webkit-appearance: none;
  margin: 10px 0;
  width: 100%;
}
input[type=range]:focus {
  outline: none;
}
input[type=range]::-webkit-slider-runnable-track {
  width: 100%;
  height: 10px;
  cursor: pointer;
  animate: 0.2s;
  box-shadow: 0px 0px 0px #000000;
  background: #FFFFFF;
  border-radius: 3px;
  border: 1px solid #000000;
}
input[type=range]::-webkit-slider-thumb {
  box-shadow: 0px 0px 0px #000000;
  border: 1px solid #000000;
  height: 20px;
  width: 25px;
  border-radius: 5px;
  background: #eee;
  cursor: pointer;
  -webkit-appearance: none;
  margin-top: -6px;
}
input[type=range]:focus::-webkit-slider-runnable-track {
  background: #FFFFFF;
}
input[type=range]::-moz-range-track {
  width: 100%;
  height: 10px;
  cursor: pointer;
  animate: 0.2s;
  box-shadow: 0px 0px 0px #000000;
  background: #FFFFFF;
  border-radius: 3px;
  border: 1px solid #000000;
}
input[type=range]::-moz-range-thumb {
  box-shadow: 0px 0px 0px #000000;
  border: 1px solid #000000;
  height: 20px;
  width: 25px;
  border-radius: 5px;
  background: #eee;
  cursor: pointer;
}
input[type=range]::-ms-track {
  width: 100%;
  height: 10px;
  cursor: pointer;
  animate: 0.2s;
  background: transparent;
  border-color: transparent;
  color: transparent;
}
input[type=range]::-ms-fill-lower {
  background: #FFFFFF;
  border: 1px solid #000000;
  border-radius: 3px;
  box-shadow: 0px 0px 0px #000000;
}
input[type=range]::-ms-fill-upper {
  background: #FFFFFF;
  border: 1px solid #000000;
  border-radius: 3px;
  box-shadow: 0px 0px 0px #000000;
  margin-right: 1px;
}
input[type=range]::-ms-thumb {
  box-shadow: 0px 0px 0px #000000;
  border: 1px solid #000000;
  height: 18px;
  width: 25px;
  border-radius: 5px;
  background: #eee;
  cursor: pointer;
  margin-top: 1px;
}
input[type=range]:focus::-ms-fill-lower {
  background: #FFFFFF;
}
input[type=range]:focus::-ms-fill-upper {
  background: #FFFFFF;
}


/* not in cssportal */
input[type=range]::-moz-focus-outer {
  border: 0;
}

  `;

document.getElementsByTagName( 'head' )[0].appendChild( mathcellStyle );


// return arrays of objects for all plots


function plot( f, xRange, color='#07f' ) {

  if ( xRange.length < 3 ) xRange[2] = 200;

  var points = [];
  linspace( xRange[0], xRange[1], xRange[2] ).forEach(
    x => points.push( [ x, f(x) ] )
  );

  return [ { points:points, color:color } ];

}


function listPlot( points, color='#07f' ) {

  if ( points[0].length === 2 )

    return [ { points:points, color:color } ];

  if ( points[0].length === 3 )

    return [ { points:points, color:color, type: line } ];

}


function parametric( z, xRange, yRange, color='#07f', opacity ) {

  var slices = xRange[2];
  var stacks = yRange[2];

  var xStep = ( xRange[1] - xRange[0] ) / slices;
  var yStep = ( yRange[1] - yRange[0] ) / stacks;

  var vertices = [];
  for ( var i = 0 ; i <= stacks ; i++ ) {
    var y = yRange[0] + i * yStep;
    for ( var j = 0 ; j <= slices ; j++ ) {
      var x = xRange[0] + j * xStep;
      vertices.push( [x, y, z(x,y)] );
    }
  }

  var faces = [];
  var count = slices + 1;
  for ( var i = 0 ; i < stacks ; i++ ) {
    for ( var j = 0 ; j < slices ; j++ ) {
      faces.push( [j+count*i, j+count*i+1, j+count*(i+1)+1, j+count*(i+1)] );
    }
  }

  return [ { vertices:vertices, faces:faces, color:color, opacity:opacity,
             type: 'surface' } ];

}


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

  return [ { points:[ begin, end, p1, p2, end ], color:color } ];

}



function svgPlot( id, data, config ) {

  function parsedLength( input ) {

    var frag = new DOMParser().parseFromString( input, 'text/html' );
    return frag.documentElement.textContent.length;

  }

  function roundTo( x, n ) {

    return Math.round( Math.pow(10,n) * x ) / Math.pow(10,n);

  }

  function ceilTo( x, n ) {

    return Math.ceil( Math.pow(10,n) * x ) / Math.pow(10,n);

  }

  function floorTo( x, n ) {

    return Math.floor( Math.pow(10,n) * x ) / Math.pow(10,n);

  }

  function decimalsInNumber( x ) {

    for ( var i = 0 ; i < 100 ; i++ ) {
      if ( roundTo(x,i) === x ) break;
    }
    return i;

  }


  var width = document.getElementById( id + 'output' ).offsetWidth;
  var height = document.getElementById( id + 'output' ).offsetHeight;
  var ext = 20; // axis extension

  if ( config.includeOrigin ) data.push( [ { points:[[0,0]], color:'' } ] );

  var all = [];
  for ( var i = 0 ; i < data.length ; i++ )
    for ( var j = 0 ; j < data[i].length ; j++ ) all = all.concat( data[i][j].points );

  var xMinMax = minMax( all, 0 );
  var yMinMax = minMax( all, 1 );

  // rounding currently to remove excessive decimals
  // needs improving for exponential notation
  var xMin = 'xMin' in config ? config.xMin
             : floorTo( xMinMax.min, 4); //3 - Math.round( Math.log10(xMinMax.min) ) );
  var xMax = 'xMax' in config ? config.xMax
             : ceilTo( xMinMax.max, 4); //3 - Math.round( Math.log10(xMinMax.max) ) );
  var yMin = 'yMin' in config ? config.yMin
             : floorTo( yMinMax.min, 4); //3 - Math.round( Math.log10(yMinMax.min) ) );
  var yMax = 'yMax' in config ? config.yMax
             : ceilTo( yMinMax.max, 4); //3 - Math.round( Math.log10(yMinMax.max) ) );

  if ( yMin === yMax ) yMax += 1;

  var xRange = xMax - xMin;
  var yRange = yMax - yMin;

  var xScale = width / xRange;
  var yScale = height / yRange;

  var axes = 'axes' in config ? config.axes : true;
  var ticks = 'ticks' in config ? config.ticks : [ 'auto', 'auto' ];
  var tickSize = 5;

  if ( ticks[0] === 'auto' ) {
    ticks[0] = Math.pow( 10, Math.floor( Math.log10(xRange) ) );
    if ( 3*ticks[0] > xRange ) ticks[0] = ticks[0] / 2;
    if ( 4*ticks[0] > xRange ) ticks[0] = ticks[0] / 2;
  }
  if ( ticks[1] === 'auto' ) {
    ticks[1] = Math.pow( 10, Math.floor( Math.log10(yRange) ) );
    if ( 3*ticks[1] > yRange ) ticks[1] = ticks[1] / 2;
    if ( 4*ticks[1] > yRange ) ticks[1] = ticks[1] / 2;
  }

  var xTickDecimals = decimalsInNumber( ticks[0] );
  var yTickDecimals = decimalsInNumber( ticks[1] );

  // size of largest y-axis tick label
  var yNumSize = 10 * Math.max( roundTo( yMin, yTickDecimals ).toString().length,
                                roundTo( yMax, yTickDecimals ).toString().length,
                                roundTo( 3*ticks[1], yTickDecimals ).toString().length  );

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
  var gutter = Math.max(ext, yNumSize + xOffset - xOrigin, yLabelSize - xOrigin);
  var xTotal = width + gutter + ext + xLabel;
  var xShift = gutter;

  if ( xOrigin < 0 ) {
    xAxis = -1.5*ext;
    gutter = Math.max(yNumSize + xOffset, yLabelSize);
    xTotal = width + gutter + 2.5*ext + xLabel;
    xShift = gutter + 1.5*ext;
  }
  if ( xOrigin > width ) {
    xAxis = width + 1.5*ext;
    gutter = Math.max(yNumSize, yLabelSize, xLabel);
    xTotal = width + gutter + 2.5*ext;
    xOffset = -yNumSize;
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
     xmlns="http://www.w3.org/2000/svg">
  `;

  if ( axes ) {

    svg += `<path d="M ${-ext} ${yAxis} L ${width + ext} ${yAxis}" stroke="black"/>`;
    svg += `<path d="M ${xAxis} ${-ext} L ${xAxis} ${height + ext}" stroke="black"/>`;

    var xStart = ticks[0] * Math.ceil( xMin / ticks[0] );
    for ( var i = xStart ; i <= xMax ; i += ticks[0] ) {
      if ( i != 0 || ( yOrigin != yAxis && yLabel === 0 ) ) {
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
      if ( i != 0 || ( xOrigin != xAxis && xLabel === 0 ) ) {
        var y = Math.round( yOrigin - yScale*i );
        svg += `<path d="M ${xAxis} ${y} L ${xAxis + Math.sign(xOffset)*tickSize} ${y}"
                      stroke="black" />`;
        svg += `<text x="${xAxis - xOffset}" y="${y}"
                      font-family="monospace" text-anchor="end" dominant-baseline="central">
                ${+i.toFixed(yTickDecimals)}</text>`;
      }
    }

    svg += `<text x="${width + ext + Math.abs(xOffset)}" y="${yAxis}"
            font-family="monospace" font-size="110%" font-weight="bold"
            dominant-baseline="central">${xAxisLabel}</text>`;
    svg += `<text x="${xAxis}" y="${-ext - yLabel/2}"
            font-family="monospace" font-size="110%" font-weight="bold"
            text-anchor="middle">${yAxisLabel}</text>`;

  }

  function xPos( x ) { return roundTo( xOrigin + xScale*x, 2 ); }

  function yPos( y ) { return roundTo( yOrigin - yScale*y, 2 ); }

  // function paths in arrays of arrays
  for ( var i = 0 ; i < data.length ; i++ ) {
    for ( var j = 0 ; j < data[i].length ; j++ ) {

      var d = data[i][j];
      var x = d.points[0][0];
      var y = d.points[0][1];

      svg += `<path d="M ${ xPos(x) } ${ yPos(y) }`;
      var lastX = x;
      var lastY = y;

      for ( var k = 1 ; k < d.points.length ; k++ ) {

        x = d.points[k][0];
        y = d.points[k][1];

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

      svg += `" stroke="${d.color}" stroke-width="1.5" fill="${d.fill ? d.color : 'none'}"/>`;

    }
  }

  return svg + '</svg>';

}


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


function template( options, bounds, lights, ambient, texts, points, lines, surfaces ) {

  return `
<!DOCTYPE html>
<html>
<head>
<title></title>
<meta charset="utf-8">
<meta name=viewport content="width=device-width, user-scalable=no, minimum-scale=1.0, maximum-scale=1.0">
<style>

    body { margin: 0px; overflow: hidden; }
  
</style>
</head>

<body>

<script src="https://cdn.rawgit.com/mrdoob/three.js/r80/build/three.js"></script>
<script src="https://cdn.rawgit.com/mrdoob/three.js/r80/examples/js/controls/OrbitControls.js"></script>

<script>

    var scene = new THREE.Scene();

    var renderer = new THREE.WebGLRenderer( { antialias: true } );
    renderer.setPixelRatio( window.devicePixelRatio );
    renderer.setSize( window.innerWidth, window.innerHeight );
    renderer.setClearColor( 0xffffff, 1 );
    document.body.appendChild( renderer.domElement );

    var options = ${options};

    var animate = false; // options.animate;

    var b = ${bounds}; // bounds

    if ( b[0].x === b[1].x ) {
        b[0].x -= 1;
        b[1].x += 1;
    }
    if ( b[0].y === b[1].y ) {
        b[0].y -= 1;
        b[1].y += 1;
    }
    if ( b[0].z === b[1].z ) {
        b[0].z -= 1;
        b[1].z += 1;
    }

    var xRange = b[1].x - b[0].x;
    var yRange = b[1].y - b[0].y;
    var zRange = b[1].z - b[0].z;
    var rRange = Math.sqrt( xRange*xRange + yRange*yRange );

    var ar = options.aspectRatio;
    var a = [ ar[0], ar[1], ar[2] ]; // aspect multipliers
    if ( zRange > rRange && a[2] === 1 ) a[2] = rRange / zRange;

    var xMid = ( b[0].x + b[1].x ) / 2;
    var yMid = ( b[0].y + b[1].y ) / 2;
    var zMid = ( b[0].z + b[1].z ) / 2;

    var box = new THREE.Geometry();
    box.vertices.push( new THREE.Vector3( a[0]*b[0].x, a[1]*b[0].y, a[2]*b[0].z ) );
    box.vertices.push( new THREE.Vector3( a[0]*b[1].x, a[1]*b[1].y, a[2]*b[1].z ) );
    var boxMesh = new THREE.LineSegments( box );
    if ( options.frame ) scene.add( new THREE.BoxHelper( boxMesh, 'black' ) );

    if ( options.axesLabels ) {
        var d = options.decimals; // decimals
        var offsetRatio = 0.1;
        var al = options.axesLabels;

        var offset = offsetRatio * a[1]*( b[1].y - b[0].y );
        var xm = xMid.toFixed(d);
        if ( /^-0.?0*$/.test(xm) ) xm = xm.substr(1);
        addLabel( al[0] + '=' + xm, a[0]*xMid, a[1]*b[1].y+offset, a[2]*b[0].z );
        addLabel( ( b[0].x ).toFixed(d), a[0]*b[0].x, a[1]*b[1].y+offset, a[2]*b[0].z );
        addLabel( ( b[1].x ).toFixed(d), a[0]*b[1].x, a[1]*b[1].y+offset, a[2]*b[0].z );

        var offset = offsetRatio * a[0]*( b[1].x - b[0].x );
        var ym = yMid.toFixed(d);
        if ( /^-0.?0*$/.test(ym) ) ym = ym.substr(1);
        addLabel( al[1] + '=' + ym, a[0]*b[1].x+offset, a[1]*yMid, a[2]*b[0].z );
        addLabel( ( b[0].y ).toFixed(d), a[0]*b[1].x+offset, a[1]*b[0].y, a[2]*b[0].z );
        addLabel( ( b[1].y ).toFixed(d), a[0]*b[1].x+offset, a[1]*b[1].y, a[2]*b[0].z );

        var offset = offsetRatio * a[1]*( b[1].y - b[0].y );
        var zm = zMid.toFixed(d);
        if ( /^-0.?0*$/.test(zm) ) zm = zm.substr(1);
        addLabel( al[2] + '=' + zm, a[0]*b[1].x, a[1]*b[0].y-offset, a[2]*zMid );
        addLabel( ( b[0].z ).toFixed(d), a[0]*b[1].x, a[1]*b[0].y-offset, a[2]*b[0].z );
        addLabel( ( b[1].z ).toFixed(d), a[0]*b[1].x, a[1]*b[0].y-offset, a[2]*b[1].z );
    }

    function addLabel( text, x, y, z ) {
        var fontsize = 14;

        var canvas = document.createElement( 'canvas' );
        canvas.width = 128;
        canvas.height = 32; // powers of two

        var context = canvas.getContext( '2d' );
        context.fillStyle = 'black';
        context.font = fontsize + 'px monospace';
        context.textAlign = 'center';
        context.textBaseline = 'middle';
        context.fillText( text, .5*canvas.width, .5*canvas.height );

        var svg = '<svg xmlns="http://www.w3.org/2000/svg" width="128" height="32">'
                  + '<text x="64" y="16" font-size="16" font-family="monospace">'
                  + text + '</text></svg>';

        var img = new Image();
        img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent( svg );

        var texture = new THREE.Texture( canvas );
        texture.needsUpdate = true;

        var sprite = new THREE.Sprite( new THREE.SpriteMaterial( { map: texture } ) );
        sprite.position.set( x, y, z );
        sprite.scale.set( 1, .25 ); // ratio of width to height
        scene.add( sprite );
    }

    if ( options.axes ) scene.add( new THREE.AxisHelper( Math.min( a[0]*b[1].x, a[1]*b[1].y, a[2]*b[1].z ) ) );

    var camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 0.1, 1000 );
    camera.up.set( 0, 0, 1 );
    camera.position.set( a[0]*(xMid+xRange), a[1]*(yMid+yRange), a[2]*(zMid+zRange) );

    var lights = ${lights};
    for ( var i=0 ; i < lights.length ; i++ ) {
        var light = new THREE.DirectionalLight( lights[i].color, 1 );
        light.position.set( a[0]*lights[i].x, a[1]*lights[i].y, a[2]*lights[i].z );
        if ( lights[i].parent === 'camera' ) {
            light.target.position.set( a[0]*xMid, a[1]*yMid, a[2]*zMid );
            scene.add( light.target );
            camera.add( light );
        } else scene.add( light );
    }
    scene.add( camera );

    var ambient = ${ambient};
    scene.add( new THREE.AmbientLight( ambient.color, 1 ) );

    var controls = new THREE.OrbitControls( camera, renderer.domElement );
    controls.target.set( a[0]*xMid, a[1]*yMid, a[2]*zMid );
    controls.addEventListener( 'change', function() { if ( !animate ) render(); } );

    window.addEventListener( 'resize', function() {
        
        renderer.setSize( window.innerWidth, window.innerHeight );
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        if ( !animate ) render();
        
    } );

    var texts = ${texts};
    for ( var i=0 ; i < texts.length ; i++ )
        addLabel( texts[i].text, texts[i].x, texts[i].y, texts[i].z );

    var points = ${points};
    for ( var i=0 ; i < points.length ; i++ ) addPoint( points[i] );

    function addPoint( json ) {
        var geometry = new THREE.Geometry();
        var v = json.point;
        geometry.vertices.push( new THREE.Vector3( a[0]*v[0], a[1]*v[1], a[2]*v[2] ) );

        var canvas = document.createElement( 'canvas' );
        canvas.width = 128;
        canvas.height = 128;

        var context = canvas.getContext( '2d' );
        context.arc( 64, 64, 64, 0, 2 * Math.PI );
        context.fillStyle = json.color;
        context.fill();

        var texture = new THREE.Texture( canvas );
        texture.needsUpdate = true;

        var transparent = json.opacity < 1 ? true : false;
        var material = new THREE.PointsMaterial( { size: json.size/100, map: texture,
                                                   transparent: transparent, opacity: json.opacity,
                                                   alphaTest: .1 } );

        var c = geometry.center().multiplyScalar( -1 );
        var mesh = new THREE.Points( geometry, material );
        mesh.position.set( c.x, c.y, c.z );
        scene.add( mesh );
    }

    var lines = ${lines};
    for ( var i=0 ; i < lines.length ; i++ ) addLine( lines[i] );

    function addLine( json ) {
        var geometry = new THREE.Geometry();
        for ( var i=0 ; i < json.points.length - 1 ; i++ ) {
            var v = json.points[i];
            geometry.vertices.push( new THREE.Vector3( a[0]*v[0], a[1]*v[1], a[2]*v[2] ) );
            var v = json.points[i+1];
            geometry.vertices.push( new THREE.Vector3( a[0]*v[0], a[1]*v[1], a[2]*v[2] ) );
        }

        var transparent = json.opacity < 1 ? true : false;
        var material = new THREE.LineBasicMaterial( { color: json.color, linewidth: json.linewidth,
                                                      transparent: transparent, opacity: json.opacity } );

        var c = geometry.center().multiplyScalar( -1 );
        var mesh = new THREE.LineSegments( geometry, material );
        mesh.position.set( c.x, c.y, c.z );
        scene.add( mesh );
    }

    var surfaces = ${surfaces};
    for ( var i=0 ; i < surfaces.length ; i++ ) addSurface( surfaces[i] );

    function addSurface( json ) {
        var geometry = new THREE.Geometry();
        for ( var i=0 ; i < json.vertices.length ; i++ ) {
            var v = json.vertices[i];
            geometry.vertices.push( new THREE.Vector3( a[0]*v[0], a[1]*v[1], a[2]*v[2] ) );
        }
        for ( var i=0 ; i < json.faces.length ; i++ ) {
            var f = json.faces[i];
            for ( var j=0 ; j < f.length - 2 ; j++ ) {
                geometry.faces.push( new THREE.Face3( f[0], f[j+1], f[j+2] ) );
            }
        }
        geometry.mergeVertices();
        geometry.computeVertexNormals();

        var transparent = json.opacity < 1 ? true : false;
        var material = new THREE.MeshPhongMaterial( {
                                     color: json.color, side: THREE.DoubleSide,
                                     transparent: transparent, opacity: json.opacity,
                                     shininess: 20 } );

        var c = geometry.center().multiplyScalar( -1 );
        var mesh = new THREE.Mesh( geometry, material );
        mesh.position.set( c.x, c.y, c.z );
        scene.add( mesh );
    }

    var scratch = new THREE.Vector3();

    function render() {

        if ( animate ) requestAnimationFrame( render );
        renderer.render( scene, camera );

        for ( var i=0 ; i < scene.children.length ; i++ ) {
            if ( scene.children[i].type === 'Sprite' ) {
                var sprite = scene.children[i];
                var adjust = scratch.addVectors( sprite.position, scene.position )
                               .sub( camera.position ).length() / 5;
                sprite.scale.set( adjust, .25*adjust ); // ratio of canvas width to height
            }
        }
    }
    
    render();
    controls.update();
    if ( !animate ) render();

</script>

</body>
</html>
  `;
}


function isosurface( f, xRange, yRange, zRange, color='#07f', opacity=1, level=0 ) {

  if ( xRange.length < 3 ) xRange[2] = 50;
  if ( yRange.length < 3 ) yRange[2] = 50;
  if ( zRange.length < 3 ) zRange[2] = 50;

  var xStep = ( xRange[1] - xRange[0] ) / ( xRange[2] - 1 );
  var yStep = ( yRange[1] - yRange[0] ) / ( yRange[2] - 1 );
  var zStep = ( zRange[1] - zRange[0] ) / ( zRange[2] - 1 );

  var d = []; // value data

  for ( var i = 0 ; i < xRange[2] ; i++ ) {
    d[i] = [];
    var x = xRange[0] + i * xStep;
    for ( var j = 0 ; j < yRange[2] ; j++ ) {
      var y = yRange[0] + j * yStep;
      d[i][j] = [];
      for ( var k = 0 ; k < zRange[2] ; k++ ) {
        var z = zRange[0] + k * zStep;
        d[i][j][k] = [ x, y, z, f(x,y,z) ];
      }
    }
  }

  function lerp( u1, u2 ) {

    var m = ( level - u1[3] ) / ( u2[3] - u1[3] );

    var x = u1[0] + m * ( u2[0] - u1[0] );
    var y = u1[1] + m * ( u2[1] - u1[1] );
    var z = u1[2] + m * ( u2[2] - u1[2] );

    return [ x, y, z ];

  }

  var vertices = [], faces = [];

  // adapted from http://paulbourke.net/geometry/polygonise/

  for ( var i = 0 ; i < d.length - 1 ; i++ ) {
    for ( var j = 0 ; j < d[i].length - 1 ; j++ ) {
      for ( var k = 0 ; k < d[i][j].length - 1 ; k++ ) {

        var v0 = d[i][j][k];
        var v1 = d[i][j+1][k];
        var v2 = d[i+1][j+1][k];
        var v3 = d[i+1][j][k];
        var v4 = d[i][j][k+1];
        var v5 = d[i][j+1][k+1];
        var v6 = d[i+1][j+1][k+1];
        var v7 = d[i+1][j][k+1];

        var v = []; // temp list of vertices
        var index = 0;

        if ( v0[3] < level ) index += 1;
        if ( v1[3] < level ) index += 2;
        if ( v2[3] < level ) index += 4;
        if ( v3[3] < level ) index += 8;
        if ( v4[3] < level ) index += 16;
        if ( v5[3] < level ) index += 32;
        if ( v6[3] < level ) index += 64;
        if ( v7[3] < level ) index += 128;

        if ( edgeTable[index] === 0 ) continue;

        if ( edgeTable[index] & 1 )    v[0]  = lerp( v0, v1 );
        if ( edgeTable[index] & 2 )    v[1]  = lerp( v1, v2 );
        if ( edgeTable[index] & 4 )    v[2]  = lerp( v2, v3 );
        if ( edgeTable[index] & 8 )    v[3]  = lerp( v3, v0 );
        if ( edgeTable[index] & 16 )   v[4]  = lerp( v4, v5 );
        if ( edgeTable[index] & 32 )   v[5]  = lerp( v5, v6 );
        if ( edgeTable[index] & 64 )   v[6]  = lerp( v6, v7 );
        if ( edgeTable[index] & 128 )  v[7]  = lerp( v7, v4 );
        if ( edgeTable[index] & 256 )  v[8]  = lerp( v0, v4 );
        if ( edgeTable[index] & 512 )  v[9]  = lerp( v1, v5 );
        if ( edgeTable[index] & 1024 ) v[10] = lerp( v2, v6 );
        if ( edgeTable[index] & 2048 ) v[11] = lerp( v3, v7 );

        for ( var m = 0 ; triangleTable[index][m] != -1 ; m += 3 ) {
          vertices.push( v[ triangleTable[index][m]   ],
                         v[ triangleTable[index][m+1] ],
                         v[ triangleTable[index][m+2] ] );
          var l = vertices.length;
          faces.push( [ l-3, l-2, l-1 ] );
        }

      }
    }
  }

  return [ { vertices:vertices, faces:faces, color:color, opacity:opacity,
             type: 'surface' } ];

}


var edgeTable = [

0x0  , 0x109, 0x203, 0x30a, 0x406, 0x50f, 0x605, 0x70c,
0x80c, 0x905, 0xa0f, 0xb06, 0xc0a, 0xd03, 0xe09, 0xf00,
0x190, 0x99 , 0x393, 0x29a, 0x596, 0x49f, 0x795, 0x69c,
0x99c, 0x895, 0xb9f, 0xa96, 0xd9a, 0xc93, 0xf99, 0xe90,
0x230, 0x339, 0x33 , 0x13a, 0x636, 0x73f, 0x435, 0x53c,
0xa3c, 0xb35, 0x83f, 0x936, 0xe3a, 0xf33, 0xc39, 0xd30,
0x3a0, 0x2a9, 0x1a3, 0xaa , 0x7a6, 0x6af, 0x5a5, 0x4ac,
0xbac, 0xaa5, 0x9af, 0x8a6, 0xfaa, 0xea3, 0xda9, 0xca0,
0x460, 0x569, 0x663, 0x76a, 0x66 , 0x16f, 0x265, 0x36c,
0xc6c, 0xd65, 0xe6f, 0xf66, 0x86a, 0x963, 0xa69, 0xb60,
0x5f0, 0x4f9, 0x7f3, 0x6fa, 0x1f6, 0xff , 0x3f5, 0x2fc,
0xdfc, 0xcf5, 0xfff, 0xef6, 0x9fa, 0x8f3, 0xbf9, 0xaf0,
0x650, 0x759, 0x453, 0x55a, 0x256, 0x35f, 0x55 , 0x15c,
0xe5c, 0xf55, 0xc5f, 0xd56, 0xa5a, 0xb53, 0x859, 0x950,
0x7c0, 0x6c9, 0x5c3, 0x4ca, 0x3c6, 0x2cf, 0x1c5, 0xcc ,
0xfcc, 0xec5, 0xdcf, 0xcc6, 0xbca, 0xac3, 0x9c9, 0x8c0,
0x8c0, 0x9c9, 0xac3, 0xbca, 0xcc6, 0xdcf, 0xec5, 0xfcc,
0xcc , 0x1c5, 0x2cf, 0x3c6, 0x4ca, 0x5c3, 0x6c9, 0x7c0,
0x950, 0x859, 0xb53, 0xa5a, 0xd56, 0xc5f, 0xf55, 0xe5c,
0x15c, 0x55 , 0x35f, 0x256, 0x55a, 0x453, 0x759, 0x650,
0xaf0, 0xbf9, 0x8f3, 0x9fa, 0xef6, 0xfff, 0xcf5, 0xdfc,
0x2fc, 0x3f5, 0xff , 0x1f6, 0x6fa, 0x7f3, 0x4f9, 0x5f0,
0xb60, 0xa69, 0x963, 0x86a, 0xf66, 0xe6f, 0xd65, 0xc6c,
0x36c, 0x265, 0x16f, 0x66 , 0x76a, 0x663, 0x569, 0x460,
0xca0, 0xda9, 0xea3, 0xfaa, 0x8a6, 0x9af, 0xaa5, 0xbac,
0x4ac, 0x5a5, 0x6af, 0x7a6, 0xaa , 0x1a3, 0x2a9, 0x3a0,
0xd30, 0xc39, 0xf33, 0xe3a, 0x936, 0x83f, 0xb35, 0xa3c,
0x53c, 0x435, 0x73f, 0x636, 0x13a, 0x33 , 0x339, 0x230,
0xe90, 0xf99, 0xc93, 0xd9a, 0xa96, 0xb9f, 0x895, 0x99c,
0x69c, 0x795, 0x49f, 0x596, 0x29a, 0x393, 0x99 , 0x190,
0xf00, 0xe09, 0xd03, 0xc0a, 0xb06, 0xa0f, 0x905, 0x80c,
0x70c, 0x605, 0x50f, 0x406, 0x30a, 0x203, 0x109, 0x0

];

var triangleTable = [

[-1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
[0, 8, 3, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
[0, 1, 9, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
[1, 8, 3, 9, 8, 1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
[1, 2, 10, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
[0, 8, 3, 1, 2, 10, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
[9, 2, 10, 0, 2, 9, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
[2, 8, 3, 2, 10, 8, 10, 9, 8, -1, -1, -1, -1, -1, -1, -1],
[3, 11, 2, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
[0, 11, 2, 8, 11, 0, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
[1, 9, 0, 2, 3, 11, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
[1, 11, 2, 1, 9, 11, 9, 8, 11, -1, -1, -1, -1, -1, -1, -1],
[3, 10, 1, 11, 10, 3, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
[0, 10, 1, 0, 8, 10, 8, 11, 10, -1, -1, -1, -1, -1, -1, -1],
[3, 9, 0, 3, 11, 9, 11, 10, 9, -1, -1, -1, -1, -1, -1, -1],
[9, 8, 10, 10, 8, 11, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
[4, 7, 8, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
[4, 3, 0, 7, 3, 4, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
[0, 1, 9, 8, 4, 7, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
[4, 1, 9, 4, 7, 1, 7, 3, 1, -1, -1, -1, -1, -1, -1, -1],
[1, 2, 10, 8, 4, 7, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
[3, 4, 7, 3, 0, 4, 1, 2, 10, -1, -1, -1, -1, -1, -1, -1],
[9, 2, 10, 9, 0, 2, 8, 4, 7, -1, -1, -1, -1, -1, -1, -1],
[2, 10, 9, 2, 9, 7, 2, 7, 3, 7, 9, 4, -1, -1, -1, -1],
[8, 4, 7, 3, 11, 2, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
[11, 4, 7, 11, 2, 4, 2, 0, 4, -1, -1, -1, -1, -1, -1, -1],
[9, 0, 1, 8, 4, 7, 2, 3, 11, -1, -1, -1, -1, -1, -1, -1],
[4, 7, 11, 9, 4, 11, 9, 11, 2, 9, 2, 1, -1, -1, -1, -1],
[3, 10, 1, 3, 11, 10, 7, 8, 4, -1, -1, -1, -1, -1, -1, -1],
[1, 11, 10, 1, 4, 11, 1, 0, 4, 7, 11, 4, -1, -1, -1, -1],
[4, 7, 8, 9, 0, 11, 9, 11, 10, 11, 0, 3, -1, -1, -1, -1],
[4, 7, 11, 4, 11, 9, 9, 11, 10, -1, -1, -1, -1, -1, -1, -1],
[9, 5, 4, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
[9, 5, 4, 0, 8, 3, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
[0, 5, 4, 1, 5, 0, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
[8, 5, 4, 8, 3, 5, 3, 1, 5, -1, -1, -1, -1, -1, -1, -1],
[1, 2, 10, 9, 5, 4, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
[3, 0, 8, 1, 2, 10, 4, 9, 5, -1, -1, -1, -1, -1, -1, -1],
[5, 2, 10, 5, 4, 2, 4, 0, 2, -1, -1, -1, -1, -1, -1, -1],
[2, 10, 5, 3, 2, 5, 3, 5, 4, 3, 4, 8, -1, -1, -1, -1],
[9, 5, 4, 2, 3, 11, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
[0, 11, 2, 0, 8, 11, 4, 9, 5, -1, -1, -1, -1, -1, -1, -1],
[0, 5, 4, 0, 1, 5, 2, 3, 11, -1, -1, -1, -1, -1, -1, -1],
[2, 1, 5, 2, 5, 8, 2, 8, 11, 4, 8, 5, -1, -1, -1, -1],
[10, 3, 11, 10, 1, 3, 9, 5, 4, -1, -1, -1, -1, -1, -1, -1],
[4, 9, 5, 0, 8, 1, 8, 10, 1, 8, 11, 10, -1, -1, -1, -1],
[5, 4, 0, 5, 0, 11, 5, 11, 10, 11, 0, 3, -1, -1, -1, -1],
[5, 4, 8, 5, 8, 10, 10, 8, 11, -1, -1, -1, -1, -1, -1, -1],
[9, 7, 8, 5, 7, 9, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
[9, 3, 0, 9, 5, 3, 5, 7, 3, -1, -1, -1, -1, -1, -1, -1],
[0, 7, 8, 0, 1, 7, 1, 5, 7, -1, -1, -1, -1, -1, -1, -1],
[1, 5, 3, 3, 5, 7, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
[9, 7, 8, 9, 5, 7, 10, 1, 2, -1, -1, -1, -1, -1, -1, -1],
[10, 1, 2, 9, 5, 0, 5, 3, 0, 5, 7, 3, -1, -1, -1, -1],
[8, 0, 2, 8, 2, 5, 8, 5, 7, 10, 5, 2, -1, -1, -1, -1],
[2, 10, 5, 2, 5, 3, 3, 5, 7, -1, -1, -1, -1, -1, -1, -1],
[7, 9, 5, 7, 8, 9, 3, 11, 2, -1, -1, -1, -1, -1, -1, -1],
[9, 5, 7, 9, 7, 2, 9, 2, 0, 2, 7, 11, -1, -1, -1, -1],
[2, 3, 11, 0, 1, 8, 1, 7, 8, 1, 5, 7, -1, -1, -1, -1],
[11, 2, 1, 11, 1, 7, 7, 1, 5, -1, -1, -1, -1, -1, -1, -1],
[9, 5, 8, 8, 5, 7, 10, 1, 3, 10, 3, 11, -1, -1, -1, -1],
[5, 7, 0, 5, 0, 9, 7, 11, 0, 1, 0, 10, 11, 10, 0, -1],
[11, 10, 0, 11, 0, 3, 10, 5, 0, 8, 0, 7, 5, 7, 0, -1],
[11, 10, 5, 7, 11, 5, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
[10, 6, 5, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
[0, 8, 3, 5, 10, 6, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
[9, 0, 1, 5, 10, 6, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
[1, 8, 3, 1, 9, 8, 5, 10, 6, -1, -1, -1, -1, -1, -1, -1],
[1, 6, 5, 2, 6, 1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
[1, 6, 5, 1, 2, 6, 3, 0, 8, -1, -1, -1, -1, -1, -1, -1],
[9, 6, 5, 9, 0, 6, 0, 2, 6, -1, -1, -1, -1, -1, -1, -1],
[5, 9, 8, 5, 8, 2, 5, 2, 6, 3, 2, 8, -1, -1, -1, -1],
[2, 3, 11, 10, 6, 5, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
[11, 0, 8, 11, 2, 0, 10, 6, 5, -1, -1, -1, -1, -1, -1, -1],
[0, 1, 9, 2, 3, 11, 5, 10, 6, -1, -1, -1, -1, -1, -1, -1],
[5, 10, 6, 1, 9, 2, 9, 11, 2, 9, 8, 11, -1, -1, -1, -1],
[6, 3, 11, 6, 5, 3, 5, 1, 3, -1, -1, -1, -1, -1, -1, -1],
[0, 8, 11, 0, 11, 5, 0, 5, 1, 5, 11, 6, -1, -1, -1, -1],
[3, 11, 6, 0, 3, 6, 0, 6, 5, 0, 5, 9, -1, -1, -1, -1],
[6, 5, 9, 6, 9, 11, 11, 9, 8, -1, -1, -1, -1, -1, -1, -1],
[5, 10, 6, 4, 7, 8, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
[4, 3, 0, 4, 7, 3, 6, 5, 10, -1, -1, -1, -1, -1, -1, -1],
[1, 9, 0, 5, 10, 6, 8, 4, 7, -1, -1, -1, -1, -1, -1, -1],
[10, 6, 5, 1, 9, 7, 1, 7, 3, 7, 9, 4, -1, -1, -1, -1],
[6, 1, 2, 6, 5, 1, 4, 7, 8, -1, -1, -1, -1, -1, -1, -1],
[1, 2, 5, 5, 2, 6, 3, 0, 4, 3, 4, 7, -1, -1, -1, -1],
[8, 4, 7, 9, 0, 5, 0, 6, 5, 0, 2, 6, -1, -1, -1, -1],
[7, 3, 9, 7, 9, 4, 3, 2, 9, 5, 9, 6, 2, 6, 9, -1],
[3, 11, 2, 7, 8, 4, 10, 6, 5, -1, -1, -1, -1, -1, -1, -1],
[5, 10, 6, 4, 7, 2, 4, 2, 0, 2, 7, 11, -1, -1, -1, -1],
[0, 1, 9, 4, 7, 8, 2, 3, 11, 5, 10, 6, -1, -1, -1, -1],
[9, 2, 1, 9, 11, 2, 9, 4, 11, 7, 11, 4, 5, 10, 6, -1],
[8, 4, 7, 3, 11, 5, 3, 5, 1, 5, 11, 6, -1, -1, -1, -1],
[5, 1, 11, 5, 11, 6, 1, 0, 11, 7, 11, 4, 0, 4, 11, -1],
[0, 5, 9, 0, 6, 5, 0, 3, 6, 11, 6, 3, 8, 4, 7, -1],
[6, 5, 9, 6, 9, 11, 4, 7, 9, 7, 11, 9, -1, -1, -1, -1],
[10, 4, 9, 6, 4, 10, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
[4, 10, 6, 4, 9, 10, 0, 8, 3, -1, -1, -1, -1, -1, -1, -1],
[10, 0, 1, 10, 6, 0, 6, 4, 0, -1, -1, -1, -1, -1, -1, -1],
[8, 3, 1, 8, 1, 6, 8, 6, 4, 6, 1, 10, -1, -1, -1, -1],
[1, 4, 9, 1, 2, 4, 2, 6, 4, -1, -1, -1, -1, -1, -1, -1],
[3, 0, 8, 1, 2, 9, 2, 4, 9, 2, 6, 4, -1, -1, -1, -1],
[0, 2, 4, 4, 2, 6, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
[8, 3, 2, 8, 2, 4, 4, 2, 6, -1, -1, -1, -1, -1, -1, -1],
[10, 4, 9, 10, 6, 4, 11, 2, 3, -1, -1, -1, -1, -1, -1, -1],
[0, 8, 2, 2, 8, 11, 4, 9, 10, 4, 10, 6, -1, -1, -1, -1],
[3, 11, 2, 0, 1, 6, 0, 6, 4, 6, 1, 10, -1, -1, -1, -1],
[6, 4, 1, 6, 1, 10, 4, 8, 1, 2, 1, 11, 8, 11, 1, -1],
[9, 6, 4, 9, 3, 6, 9, 1, 3, 11, 6, 3, -1, -1, -1, -1],
[8, 11, 1, 8, 1, 0, 11, 6, 1, 9, 1, 4, 6, 4, 1, -1],
[3, 11, 6, 3, 6, 0, 0, 6, 4, -1, -1, -1, -1, -1, -1, -1],
[6, 4, 8, 11, 6, 8, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
[7, 10, 6, 7, 8, 10, 8, 9, 10, -1, -1, -1, -1, -1, -1, -1],
[0, 7, 3, 0, 10, 7, 0, 9, 10, 6, 7, 10, -1, -1, -1, -1],
[10, 6, 7, 1, 10, 7, 1, 7, 8, 1, 8, 0, -1, -1, -1, -1],
[10, 6, 7, 10, 7, 1, 1, 7, 3, -1, -1, -1, -1, -1, -1, -1],
[1, 2, 6, 1, 6, 8, 1, 8, 9, 8, 6, 7, -1, -1, -1, -1],
[2, 6, 9, 2, 9, 1, 6, 7, 9, 0, 9, 3, 7, 3, 9, -1],
[7, 8, 0, 7, 0, 6, 6, 0, 2, -1, -1, -1, -1, -1, -1, -1],
[7, 3, 2, 6, 7, 2, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
[2, 3, 11, 10, 6, 8, 10, 8, 9, 8, 6, 7, -1, -1, -1, -1],
[2, 0, 7, 2, 7, 11, 0, 9, 7, 6, 7, 10, 9, 10, 7, -1],
[1, 8, 0, 1, 7, 8, 1, 10, 7, 6, 7, 10, 2, 3, 11, -1],
[11, 2, 1, 11, 1, 7, 10, 6, 1, 6, 7, 1, -1, -1, -1, -1],
[8, 9, 6, 8, 6, 7, 9, 1, 6, 11, 6, 3, 1, 3, 6, -1],
[0, 9, 1, 11, 6, 7, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
[7, 8, 0, 7, 0, 6, 3, 11, 0, 11, 6, 0, -1, -1, -1, -1],
[7, 11, 6, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
[7, 6, 11, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
[3, 0, 8, 11, 7, 6, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
[0, 1, 9, 11, 7, 6, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
[8, 1, 9, 8, 3, 1, 11, 7, 6, -1, -1, -1, -1, -1, -1, -1],
[10, 1, 2, 6, 11, 7, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
[1, 2, 10, 3, 0, 8, 6, 11, 7, -1, -1, -1, -1, -1, -1, -1],
[2, 9, 0, 2, 10, 9, 6, 11, 7, -1, -1, -1, -1, -1, -1, -1],
[6, 11, 7, 2, 10, 3, 10, 8, 3, 10, 9, 8, -1, -1, -1, -1],
[7, 2, 3, 6, 2, 7, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
[7, 0, 8, 7, 6, 0, 6, 2, 0, -1, -1, -1, -1, -1, -1, -1],
[2, 7, 6, 2, 3, 7, 0, 1, 9, -1, -1, -1, -1, -1, -1, -1],
[1, 6, 2, 1, 8, 6, 1, 9, 8, 8, 7, 6, -1, -1, -1, -1],
[10, 7, 6, 10, 1, 7, 1, 3, 7, -1, -1, -1, -1, -1, -1, -1],
[10, 7, 6, 1, 7, 10, 1, 8, 7, 1, 0, 8, -1, -1, -1, -1],
[0, 3, 7, 0, 7, 10, 0, 10, 9, 6, 10, 7, -1, -1, -1, -1],
[7, 6, 10, 7, 10, 8, 8, 10, 9, -1, -1, -1, -1, -1, -1, -1],
[6, 8, 4, 11, 8, 6, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
[3, 6, 11, 3, 0, 6, 0, 4, 6, -1, -1, -1, -1, -1, -1, -1],
[8, 6, 11, 8, 4, 6, 9, 0, 1, -1, -1, -1, -1, -1, -1, -1],
[9, 4, 6, 9, 6, 3, 9, 3, 1, 11, 3, 6, -1, -1, -1, -1],
[6, 8, 4, 6, 11, 8, 2, 10, 1, -1, -1, -1, -1, -1, -1, -1],
[1, 2, 10, 3, 0, 11, 0, 6, 11, 0, 4, 6, -1, -1, -1, -1],
[4, 11, 8, 4, 6, 11, 0, 2, 9, 2, 10, 9, -1, -1, -1, -1],
[10, 9, 3, 10, 3, 2, 9, 4, 3, 11, 3, 6, 4, 6, 3, -1],
[8, 2, 3, 8, 4, 2, 4, 6, 2, -1, -1, -1, -1, -1, -1, -1],
[0, 4, 2, 4, 6, 2, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
[1, 9, 0, 2, 3, 4, 2, 4, 6, 4, 3, 8, -1, -1, -1, -1],
[1, 9, 4, 1, 4, 2, 2, 4, 6, -1, -1, -1, -1, -1, -1, -1],
[8, 1, 3, 8, 6, 1, 8, 4, 6, 6, 10, 1, -1, -1, -1, -1],
[10, 1, 0, 10, 0, 6, 6, 0, 4, -1, -1, -1, -1, -1, -1, -1],
[4, 6, 3, 4, 3, 8, 6, 10, 3, 0, 3, 9, 10, 9, 3, -1],
[10, 9, 4, 6, 10, 4, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
[4, 9, 5, 7, 6, 11, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
[0, 8, 3, 4, 9, 5, 11, 7, 6, -1, -1, -1, -1, -1, -1, -1],
[5, 0, 1, 5, 4, 0, 7, 6, 11, -1, -1, -1, -1, -1, -1, -1],
[11, 7, 6, 8, 3, 4, 3, 5, 4, 3, 1, 5, -1, -1, -1, -1],
[9, 5, 4, 10, 1, 2, 7, 6, 11, -1, -1, -1, -1, -1, -1, -1],
[6, 11, 7, 1, 2, 10, 0, 8, 3, 4, 9, 5, -1, -1, -1, -1],
[7, 6, 11, 5, 4, 10, 4, 2, 10, 4, 0, 2, -1, -1, -1, -1],
[3, 4, 8, 3, 5, 4, 3, 2, 5, 10, 5, 2, 11, 7, 6, -1],
[7, 2, 3, 7, 6, 2, 5, 4, 9, -1, -1, -1, -1, -1, -1, -1],
[9, 5, 4, 0, 8, 6, 0, 6, 2, 6, 8, 7, -1, -1, -1, -1],
[3, 6, 2, 3, 7, 6, 1, 5, 0, 5, 4, 0, -1, -1, -1, -1],
[6, 2, 8, 6, 8, 7, 2, 1, 8, 4, 8, 5, 1, 5, 8, -1],
[9, 5, 4, 10, 1, 6, 1, 7, 6, 1, 3, 7, -1, -1, -1, -1],
[1, 6, 10, 1, 7, 6, 1, 0, 7, 8, 7, 0, 9, 5, 4, -1],
[4, 0, 10, 4, 10, 5, 0, 3, 10, 6, 10, 7, 3, 7, 10, -1],
[7, 6, 10, 7, 10, 8, 5, 4, 10, 4, 8, 10, -1, -1, -1, -1],
[6, 9, 5, 6, 11, 9, 11, 8, 9, -1, -1, -1, -1, -1, -1, -1],
[3, 6, 11, 0, 6, 3, 0, 5, 6, 0, 9, 5, -1, -1, -1, -1],
[0, 11, 8, 0, 5, 11, 0, 1, 5, 5, 6, 11, -1, -1, -1, -1],
[6, 11, 3, 6, 3, 5, 5, 3, 1, -1, -1, -1, -1, -1, -1, -1],
[1, 2, 10, 9, 5, 11, 9, 11, 8, 11, 5, 6, -1, -1, -1, -1],
[0, 11, 3, 0, 6, 11, 0, 9, 6, 5, 6, 9, 1, 2, 10, -1],
[11, 8, 5, 11, 5, 6, 8, 0, 5, 10, 5, 2, 0, 2, 5, -1],
[6, 11, 3, 6, 3, 5, 2, 10, 3, 10, 5, 3, -1, -1, -1, -1],
[5, 8, 9, 5, 2, 8, 5, 6, 2, 3, 8, 2, -1, -1, -1, -1],
[9, 5, 6, 9, 6, 0, 0, 6, 2, -1, -1, -1, -1, -1, -1, -1],
[1, 5, 8, 1, 8, 0, 5, 6, 8, 3, 8, 2, 6, 2, 8, -1],
[1, 5, 6, 2, 1, 6, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
[1, 3, 6, 1, 6, 10, 3, 8, 6, 5, 6, 9, 8, 9, 6, -1],
[10, 1, 0, 10, 0, 6, 9, 5, 0, 5, 6, 0, -1, -1, -1, -1],
[0, 3, 8, 5, 6, 10, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
[10, 5, 6, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
[11, 5, 10, 7, 5, 11, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
[11, 5, 10, 11, 7, 5, 8, 3, 0, -1, -1, -1, -1, -1, -1, -1],
[5, 11, 7, 5, 10, 11, 1, 9, 0, -1, -1, -1, -1, -1, -1, -1],
[10, 7, 5, 10, 11, 7, 9, 8, 1, 8, 3, 1, -1, -1, -1, -1],
[11, 1, 2, 11, 7, 1, 7, 5, 1, -1, -1, -1, -1, -1, -1, -1],
[0, 8, 3, 1, 2, 7, 1, 7, 5, 7, 2, 11, -1, -1, -1, -1],
[9, 7, 5, 9, 2, 7, 9, 0, 2, 2, 11, 7, -1, -1, -1, -1],
[7, 5, 2, 7, 2, 11, 5, 9, 2, 3, 2, 8, 9, 8, 2, -1],
[2, 5, 10, 2, 3, 5, 3, 7, 5, -1, -1, -1, -1, -1, -1, -1],
[8, 2, 0, 8, 5, 2, 8, 7, 5, 10, 2, 5, -1, -1, -1, -1],
[9, 0, 1, 5, 10, 3, 5, 3, 7, 3, 10, 2, -1, -1, -1, -1],
[9, 8, 2, 9, 2, 1, 8, 7, 2, 10, 2, 5, 7, 5, 2, -1],
[1, 3, 5, 3, 7, 5, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
[0, 8, 7, 0, 7, 1, 1, 7, 5, -1, -1, -1, -1, -1, -1, -1],
[9, 0, 3, 9, 3, 5, 5, 3, 7, -1, -1, -1, -1, -1, -1, -1],
[9, 8, 7, 5, 9, 7, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
[5, 8, 4, 5, 10, 8, 10, 11, 8, -1, -1, -1, -1, -1, -1, -1],
[5, 0, 4, 5, 11, 0, 5, 10, 11, 11, 3, 0, -1, -1, -1, -1],
[0, 1, 9, 8, 4, 10, 8, 10, 11, 10, 4, 5, -1, -1, -1, -1],
[10, 11, 4, 10, 4, 5, 11, 3, 4, 9, 4, 1, 3, 1, 4, -1],
[2, 5, 1, 2, 8, 5, 2, 11, 8, 4, 5, 8, -1, -1, -1, -1],
[0, 4, 11, 0, 11, 3, 4, 5, 11, 2, 11, 1, 5, 1, 11, -1],
[0, 2, 5, 0, 5, 9, 2, 11, 5, 4, 5, 8, 11, 8, 5, -1],
[9, 4, 5, 2, 11, 3, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
[2, 5, 10, 3, 5, 2, 3, 4, 5, 3, 8, 4, -1, -1, -1, -1],
[5, 10, 2, 5, 2, 4, 4, 2, 0, -1, -1, -1, -1, -1, -1, -1],
[3, 10, 2, 3, 5, 10, 3, 8, 5, 4, 5, 8, 0, 1, 9, -1],
[5, 10, 2, 5, 2, 4, 1, 9, 2, 9, 4, 2, -1, -1, -1, -1],
[8, 4, 5, 8, 5, 3, 3, 5, 1, -1, -1, -1, -1, -1, -1, -1],
[0, 4, 5, 1, 0, 5, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
[8, 4, 5, 8, 5, 3, 9, 0, 5, 0, 3, 5, -1, -1, -1, -1],
[9, 4, 5, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
[4, 11, 7, 4, 9, 11, 9, 10, 11, -1, -1, -1, -1, -1, -1, -1],
[0, 8, 3, 4, 9, 7, 9, 11, 7, 9, 10, 11, -1, -1, -1, -1],
[1, 10, 11, 1, 11, 4, 1, 4, 0, 7, 4, 11, -1, -1, -1, -1],
[3, 1, 4, 3, 4, 8, 1, 10, 4, 7, 4, 11, 10, 11, 4, -1],
[4, 11, 7, 9, 11, 4, 9, 2, 11, 9, 1, 2, -1, -1, -1, -1],
[9, 7, 4, 9, 11, 7, 9, 1, 11, 2, 11, 1, 0, 8, 3, -1],
[11, 7, 4, 11, 4, 2, 2, 4, 0, -1, -1, -1, -1, -1, -1, -1],
[11, 7, 4, 11, 4, 2, 8, 3, 4, 3, 2, 4, -1, -1, -1, -1],
[2, 9, 10, 2, 7, 9, 2, 3, 7, 7, 4, 9, -1, -1, -1, -1],
[9, 10, 7, 9, 7, 4, 10, 2, 7, 8, 7, 0, 2, 0, 7, -1],
[3, 7, 10, 3, 10, 2, 7, 4, 10, 1, 10, 0, 4, 0, 10, -1],
[1, 10, 2, 8, 7, 4, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
[4, 9, 1, 4, 1, 7, 7, 1, 3, -1, -1, -1, -1, -1, -1, -1],
[4, 9, 1, 4, 1, 7, 0, 8, 1, 8, 7, 1, -1, -1, -1, -1],
[4, 0, 3, 7, 4, 3, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
[4, 8, 7, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
[9, 10, 8, 10, 11, 8, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
[3, 0, 9, 3, 9, 11, 11, 9, 10, -1, -1, -1, -1, -1, -1, -1],
[0, 1, 10, 0, 10, 8, 8, 10, 11, -1, -1, -1, -1, -1, -1, -1],
[3, 1, 10, 11, 3, 10, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
[1, 2, 11, 1, 11, 9, 9, 11, 8, -1, -1, -1, -1, -1, -1, -1],
[3, 0, 9, 3, 9, 11, 1, 2, 9, 2, 11, 9, -1, -1, -1, -1],
[0, 2, 11, 8, 0, 11, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
[3, 2, 11, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
[2, 3, 8, 2, 8, 10, 10, 8, 9, -1, -1, -1, -1, -1, -1, -1],
[9, 10, 2, 0, 9, 2, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
[2, 3, 8, 2, 8, 10, 0, 1, 8, 1, 10, 8, -1, -1, -1, -1],
[1, 10, 2, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
[1, 3, 8, 9, 1, 8, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
[0, 9, 1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
[0, 3, 8, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
[-1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1]

];


function isoline( f, xRange, yRange, color='#07f', level=0 ) {

  if ( xRange.length < 3 ) xRange[2] = 100;
  if ( yRange.length < 3 ) yRange[2] = 100;

  var xStep = ( xRange[1] - xRange[0] ) / ( xRange[2] - 1 );
  var yStep = ( yRange[1] - yRange[0] ) / ( yRange[2] - 1 );

  var d = []; // value data

  for ( var i = 0 ; i < xRange[2] ; i++ ) {
    d[i] = [];
    var x = xRange[0] + i * xStep;
    for ( var j = 0 ; j < yRange[2] ; j++ ) {
      var y = yRange[0] + j * yStep;
      d[i][j] = [ x, y, f(x,y) ];
    }
  }

  function lerp( u1, u2 ) {

    var m = ( level - u1[2] ) / ( u2[2] - u1[2] );

    var x = u1[0] + m * ( u2[0] - u1[0] );
    var y = u1[1] + m * ( u2[1] - u1[1] );

    return [ x, y ];

  }

  var segments = [];

  for ( var i = 0 ; i < d.length - 1 ; i++ ) {
    for ( var j = 0 ; j < d[i].length - 1 ; j++ ) {

      var v0 = d[i][j];
      var v1 = d[i+1][j];
      var v2 = d[i+1][j+1];
      var v3 = d[i][j+1];

      var index = 0;

      if ( v0[2] < level ) index += 1;
      if ( v1[2] < level ) index += 2;
      if ( v2[2] < level ) index += 4;
      if ( v3[2] < level ) index += 8;

      // keep corners below level to left of segments for consistency
      // segments can be determined using lookup tables as
      //   for marching cubes but code would be about same size

      var points = [];

      switch( index ) {

        case 0:
        case 15:

          continue;
          break;

        case 1:

          points = [ lerp( v0, v1 ), lerp( v3, v0 ) ];
          break;

        case 2:

          points = [ lerp( v1, v2 ), lerp( v0, v1 ) ];
          break;

        case 3:

          points = [ lerp( v1, v2 ), lerp( v3, v0 ) ];
          break;

        case 4:

          points = [ lerp( v2, v3 ), lerp( v1, v2 ) ];
          break;

        case 5:

          points = [ lerp( v2, v3 ), lerp( v3, v0 ) ];
          points = [ lerp( v0, v1 ), lerp( v1, v2 ) ];
          break;

        case 6:

          points = [ lerp( v2, v3 ), lerp( v0, v1 ) ];
          break;

        case 7:

          points = [ lerp( v2, v3 ), lerp( v3, v0 ) ];
          break;

        case 8:

          points = [ lerp( v3, v0 ), lerp( v2, v3 ) ];
          break;

        case 9:

          points = [ lerp( v0, v1 ), lerp( v2, v3 ) ];
          break;

        case 10:

          points = [ lerp( v3, v0 ), lerp( v0, v1 ) ];
          points = [ lerp( v1, v2 ), lerp( v2, v3 ) ];
          break;

        case 11:

          points = [ lerp( v1, v2 ), lerp( v2, v3 ) ];
          break;

        case 12:

          points = [ lerp( v3, v0 ), lerp( v1, v2 ) ];
          break;

        case 13:

          points = [ lerp( v0, v1 ), lerp( v1, v2 ) ];
          break;

        case 14:

          points = [ lerp( v3, v0 ), lerp( v0, v1 ) ];

      }

      segments.push( { points:points, color:color } );

    }
  }

  return segments;

}


function isobar( f, xRange, yRange, color='#07f', level=0 ) {

  if ( xRange.length < 3 ) xRange[2] = 80;
  if ( yRange.length < 3 ) yRange[2] = 80;

  var xStep = ( xRange[1] - xRange[0] ) / ( xRange[2] - 1 );
  var yStep = ( yRange[1] - yRange[0] ) / ( yRange[2] - 1 );

  var d = []; // value data

  for ( var i = 0 ; i < xRange[2] ; i++ ) {
    d[i] = [];
    var x = xRange[0] + i * xStep;
    for ( var j = 0 ; j < yRange[2] ; j++ ) {
      var y = yRange[0] + j * yStep;
      d[i][j] = [ x, y, f(x,y) ];
    }
  }

  function lerp( u1, u2 ) {

    var m = ( level - u1[2] ) / ( u2[2] - u1[2] );

    var x = u1[0] + m * ( u2[0] - u1[0] );
    var y = u1[1] + m * ( u2[1] - u1[1] );

    return [ x, y ];

  }

  var segments = [];

  for ( var i = 0 ; i < d.length - 1 ; i++ ) {
    for ( var j = 0 ; j < d[i].length - 1 ; j++ ) {

      var v0 = d[i][j];
      var v1 = d[i+1][j];
      var v2 = d[i+1][j+1];
      var v3 = d[i][j+1];

      var index = 0;

      if ( v0[2] < level ) index += 1;
      if ( v1[2] < level ) index += 2;
      if ( v2[2] < level ) index += 4;
      if ( v3[2] < level ) index += 8;

      // keep corners below level to left of segments for consistency

      var points = [];

      switch( index ) {

        case 0:

          continue;
          break;

        case 1:

          points = [ lerp( v0, v1 ), lerp( v3, v0 ), v0 ];
          break;

        case 2:

          points = [ lerp( v1, v2 ), lerp( v0, v1 ), v1 ];
          break;

        case 3:

          points = [ lerp( v1, v2 ), lerp( v3, v0 ), v0, v1 ];
          break;

        case 4:

          points = [ lerp( v2, v3 ), lerp( v1, v2 ), v2 ];
          break;

        case 5:

          points = [ lerp( v2, v3 ), lerp( v3, v0 ), v0,
                     lerp( v0, v1 ), lerp( v1, v2 ), v2 ];
          break;

        case 6:

          points = [ lerp( v2, v3 ), lerp( v0, v1 ), v1, v2 ];
          break;

        case 7:

          points = [ lerp( v2, v3 ), lerp( v3, v0 ), v0, v1, v2 ];
          break;

        case 8:

          points = [ lerp( v3, v0 ), lerp( v2, v3 ), v3 ];
          break;

        case 9:

          points = [ lerp( v0, v1 ), lerp( v2, v3 ), v3, v0 ];
          break;

        case 10:

          points = [ lerp( v3, v0 ), lerp( v0, v1 ), v1,
                     lerp( v1, v2 ), lerp( v2, v3 ), v3 ];
          break;

        case 11:

          points = [ lerp( v1, v2 ), lerp( v2, v3 ), v3, v0, v1 ];
          break;

        case 12:

          points = [ lerp( v3, v0 ), lerp( v1, v2 ), v2, v3 ];
          break;

        case 13:

          points = [ lerp( v0, v1 ), lerp( v1, v2 ), v2, v3, v0 ];
          break;

        case 14:

          points = [ lerp( v3, v0 ), lerp( v0, v1 ), v1, v2, v3 ];
          break;

        case 15:

          points = [ v0, v1, v2, v3 ];

      }

      segments.push( { points:points, color:color, fill: true } );

    }
  }

  return segments;

}

