
window.onerror = function( message ) {
  document.getElementById( window.id + 'output' ).innerHTML = message;
}

function MathCell( id, inputs, config={} ) {

  function labeledInteract( input ) {

    var label = 'label' in input ? input.label : '';
    if ( label.length === 1 ) label = `<i>${label}</i>`;

    return `
<div style="white-space: nowrap">
<div style="min-width: .5in; display: inline-block">${label}</div>
<div style="width: 100%; display: inline-block; white-space: nowrap">
  ${interact( id, input )} </div>
</div>`;

  }

  function inputTable( inputs ) {

    var t = '';

    if ( !Array.isArray(inputs[0]) ) inputs = [ inputs ];

    inputs.forEach( row => {

      t += '<tr>';
      row.forEach( column => {

        t += '<td>';
        if ( Array.isArray(column) )  t += inputTable( column );
        else t += labeledInteract( column );
        t += '</td>';

      } );
      t += '</tr>';

    } );

    return `
<table style="width: 100%; line-height: inherit">
${t}
</table>`;

  }

  var s = '';
  // process array of dictionaries
  for ( var i = 0 ; i < inputs.length ; i++ ) {

    var input = inputs[i];

    if ( Array.isArray(input) ) s += inputTable( input );
    else s += labeledInteract( input );

  }

  s += `
<div style="height: .25in"></div>
<div id=${id}wrapper style="width: 100%; flex: 1; position: relative">`;

  var outputIndex = 1;

  function outputTable( outputs ) {

    // table inside flex box grows on each update, divs do not!
    var t = '';

    if ( !Array.isArray(outputs[0]) ) outputs = [ outputs ];

    outputs.forEach( row => {

      t += `
<div style="width: 100%; height: ${100/outputs.length}%; white-space: nowrap">`;
      row.forEach( column => {

        if ( Array.isArray(column) )  t += outputTable( column );
        else {
          t += `
<div id=${id}output${outputIndex} style="width: ${100/outputs[0].length}%; height: calc(100% - 5px);
                                         border: 1px solid black; display: inline-block"></div>`;
          outputIndex++;
        }

      } );
      t += `
</div>`;

    } );

    return `
<div style="width: 100%; height: 100%; position: absolute">
${t}
</div>`;

  }

  if ( 'multipleOutputs' in config ) s += outputTable( config.multipleOutputs );

  else s += `
<div id=${id}output style="width: 100%; height: 100%; position: absolute"></div>`;

  s += `
</div>`;

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
       style="vertical-align: middle; width: calc(100% - 1.1in)"
       onchange="${id + name}Box.value=${id + name}.value;
                 window.id='${id}';${id}.update('${id}')"/>
<input id=${id + name}Box type=number min=${min} max=${max} step=${step} value=${value}
       title="" style="width: .5in"
       onchange="checkLimits(this);${id + name}.value=${id + name}Box.value;
                 window.id='${id}';${id}.update('${id}')"/>`;

    case 'buttons':

      var name = 'name' in input ? input.name : '';
      var values = 'values' in input ? input.values : [1,2,3];
      var labels = 'labels' in input ? input.labels : false;
      var select = 'default' in input ? input.default : values[0];

      var style = input.width ? 'style="width: ' + input.width + '"' : '';

      var s = '';
      for ( var i = 0 ; i < values.length ; i++ )
        s += `
<input id=${id + name}_${i} name=${id + name} type=radio
       value=${values[i]} ${ values[i] === select ? 'checked' : '' }
       onchange="window.id='${id}';${id}.update('${id}')"/>
<label for=${id + name}_${i} ${style}> ${ labels ? labels[i] : values[i] } </label> &nbsp; </input>`;

      return s;

    case 'number':

      var name = 'name' in input ? input.name : '';
      var min = 'min' in input ? input.min : 0;
      var max = 'max' in input ? input.max : 1;
      var step = 'step' in input ? input.step : .01;
      var value = 'default' in input ? input.default : min;

      return `
<input id=${id + name} type=number min=${min} max=${max} step=${step} value=${value}
       style="width: 1in" title="" onload=this.onchange
       onchange="checkLimits(this);window.id='${id}';${id}.update('${id}')"/>`;

    case 'checkbox':

      var name = 'name' in input ? input.name : '';
      var checked = 'default' in input ? input.default : '';

      return `
<input id=${id + name} type=checkbox ${ checked ? 'checked' : '' }
       onchange="window.id='${id}';${id}.update('${id}')"/>`;

    case 'text':

      var name = 'name' in input ? input.name : '';
      var value = 'default' in input ? input.default : '';

      var width = 'width: ' + ( input.width ? input.width : 'calc(100% - .6in)' );

      return `
<input id=${id + name} type=text value="${value}" style="${width}"
       onchange="window.id='${id}';${id}.update('${id}')"/>`;

    default:

      return 'Unsupported input type';

  }

}


function graphic( id, data, config ) {

  switch ( config.type ) {

    case 'svg':

      return svg( id, data, config );

    case 'threejs':

      return threejs( id, data, config );

    case 'x3d':

      return x3d( id, data, config );

    case 'text':

      // need JSON stringify to render objects
      // explicit double quotes removed by default
      // if needed in output use &quot;

      var center = config.center ? 'text-align: center' : '';

      return `
<div style="width: 100%; height: 100%; float: left;
            white-space: nowrap; overflow-x: auto; ${center}">
   ${JSON.stringify( data ).replace( /\"/g, '' )} </div>`;

    case 'matrix':

      var s = `
<table style="width: 95%; margin: auto; line-height: 1.5; text-align: center">`;

      for ( var i = 0 ; i < data.length ; i++ ) {
        s += '<tr>';
        for ( var j = 0 ; j < data[i].length ; j++ ) {
          s += '<td>' + data[i][j] + '</td>';
        }
        s += '</tr>';
      }

      s += '</table>';

      var leftBracket = `
<svg width="2%" height=95% preserveAspectRatio="none"
     xmlns="http://www.w3.org/2000/svg"
     style="border: 1.5px solid black; border-right: none"></svg>`;

      var rightBracket = `
<svg width="2%" height="95%" preserveAspectRatio="none"
     xmlns="http://www.w3.org/2000/svg"
     style="border: 1.5px solid black; border-left: none"></svg>`;

      return `
<div style="display: flex; width: 97%; height: 97%; text-align: center">
${leftBracket}
${s}
${rightBracket}
</div>`;

    default:

      return 'Unsupported graphic type';

  }

}


function generateId() {

  return 'id' + Math.floor( 10**10 * Math.random() );

}


function checkLimits( input ) {

  if ( +input.value < +input.min ) input.value = input.min;
  if ( +input.value > +input.max ) input.value = input.max;

}


function getVariable( id, name ) {

  // plus sign invokes Number object to ensure numeric result
  // input type already validated on creation

  var input = document.getElementById( id + name );

  if ( input ) switch ( input.type ) {

    case 'number':
    case 'range':

      return +input.value;

    case 'checkbox':

      return input.checked;

    case 'text':

      return input.value;

  } else {

    var value = document.querySelector( 'input[name=' + id + name + ']:checked' ).value;

    if ( isNaN(value) ) return value;
    else return +value;

  }

}


function setLimit( id, name, end, value ) {

  var input = document.getElementById( id + name );

  switch( end ) {

    case 'min' :

      input.min = value;
      if ( input.value < value ) input.value = value;
      break;

    case 'max' :

      input.max = value;
      if ( input.value > value ) input.value = value;

  }

  if ( input.type === 'range' ) {
    // update slider box
    var box = document.getElementById( id + name + 'Box' );
    box.min = input.min;
    box.max = input.max;
    box.value = input.value;
  }

}


function evaluate( id, data, config ) {

  var outputs = document.querySelectorAll( '[id^=' + id + 'output]' );

  if ( outputs.length === 1 ) {

    var output = outputs[0];
    output.innerHTML = graphic( id, data, config );
    if ( config.type === 'threejs' ) iOSFix( output );

  } else {

    for ( var i = 0 ; i < outputs.length ; i ++ ) {

      var output = outputs[i];
      var n = output.id.substr( output.id.indexOf('output') + 6 );

      var c = Array.isArray(config) ? config[i] : config;
      c.output = n;
      c.no3DBorder = true;

      output.innerHTML = graphic( id, data[i], c );
      if ( c.type === 'threejs' ) iOSFix( output );
      if ( c.type === 'matrix' ) output.style.border = 'none';

    }

  }

  function iOSFix( output ) {

    var iframe = output.children[0];

    if ( /(iPad|iPhone|iPod)/g.test( navigator.userAgent ) ) {
      iframe.style.width = getComputedStyle( iframe ).width;
      iframe.style.height = getComputedStyle( iframe ).height;
    }

  }

}

