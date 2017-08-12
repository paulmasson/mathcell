
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
<div id=${id}busy
     style="width: 100%; height: 100%; z-index: 1;
            position: absolute; top: 0; left: 0; visibility: hidden;
            background: url(http://analyticphysics.com/www/math/reload.svg?${Math.random()})
                        center no-repeat;
            background-size: auto 50%"></div>
</div>
  `;

  // Appended random number forces Safari to refresh for animation on page reload

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

  for ( var i = 0 ; i < output.children.length ; i++ ) {

    var view = output.children[i];
    if ( view.tagName === 'IFRAME' && /(iPad|iPhone|iPod)/g.test( navigator.userAgent ) ) {

	view.style.width = getComputedStyle( view ).width;
	view.style.height = getComputedStyle( view ).height;

    }
  }

}


function minMax( d, index ) {

  var min = Number.MAX_VALUE;
  var max = -Number.MAX_VALUE;

  for ( var i = 0 ; i < d.length ; i++ )
    for ( var j = 0 ; j < d[i].length ; j++ ) {
      if ( d[i][j][index] < min ) min = d[i][j][index];
      if ( d[i][j][index] > max ) max = d[i][j][index];
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


function parametric( z, xRange, yRange, color, opacity ) {

  var slices = xRange[2];
  var stacks = yRange[2];

  var xStep = ( xRange[1] - xRange[0] ) / slices;
  var yStep = ( yRange[1] - yRange[0] ) / stacks;

  var vertices = []
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

  return { 'vertices': vertices, 'faces': faces, 'color': color, 'opacity': opacity }

}


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

  if ( config.includeOrigin ) data.push( [[0,0]] );

  var xMinMax = minMax( data, 0 );
  var yMinMax = minMax( data, 1 );

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

  function xPos( x ) { return roundTo( xOrigin + xScale*x, 2 ); }

  function yPos( y ) { return roundTo( yOrigin - yScale*y, 2 ); }

  // function paths in data arrays
  for ( var k = 0 ; k < data.length ; k++ ) {

    var d = data[k];
    var x = d[0][0];
    var y = d[0][1];

    svg += `<path d="M ${ xPos(x) } ${ yPos(y) }`;
    var lastX = x;
    var lastY = y;

    for ( var i = 1 ; i < d.length ; i++ ) {

      x = d[i][0];
      y = d[i][1];

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

    var color = config.colors && config.colors[k]  ? config.colors[k] : 'black';
    svg += `" stroke="${color}" stroke-width="1.5" fill="none"/>`;

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

  var texts = data.texts ? data.texts : [];
  var points = data.points ? data.points : [];
  var lines = data.lines ? data.lines : [];
  var surfaces = data.surfaces ? data.surfaces : [];

  var all = [];
  for ( var i = 0 ; i < texts.length ; i++ ) all.push( [texts[i].slice(1)] );
  for ( var i = 0 ; i < points.length ; i++ ) all.push( points[i].point );
  for ( var i = 0 ; i < lines.length ; i++ ) all.push( lines[i].points );
  for ( var i = 0 ; i < surfaces.length ; i++ ) all.push( surfaces[i].vertices );

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

