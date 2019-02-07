
function MathCell( id, inputs ) {

  // process array of dictionaries
  var s = '';
    for ( var i = 0 ; i < inputs.length ; i++ ) {
      var input = inputs[i];
      var label = 'label' in input ? input.label : '';
      if ( label.length === 1 ) label = `<i>${label}</i>`;
        s += `
<div style="white-space: nowrap">
<div style="min-width: .5in; display: inline-block">${label}</div>
<div style="width: 100%; display: inline-block; white-space: nowrap">
  ${interact( id, input )} </div>
</div>`;
    }
  s += `
<div style="height: .25in"></div>
<div id=${id}wrap style="width: 100%; flex: 1; position: relative">
<div id=${id}output style="width: 100%; height: 100%;
                           position: absolute; top: 0; left: 0"></div>
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
       style="vertical-align: middle; width: calc(100% - 1.2in)"
       onchange="${id + name}Box.value=${id + name}.value;${id}.update('${id}')"/>
<input id=${id + name}Box type=number min=${min} max=${max} step=${step} value=${value}
       title="" style="width: .5in"
       onchange="${id + name}.value=${id + name}Box.value;${id}.update('${id}')"/>`;

    case 'buttons':

      var name = 'name' in input ? input.name : '';
      var values = 'values' in input ? input.values : [1,2,3];
      var labels = 'labels' in input ? input.labels : false;
      var select = 'default' in input ? input.default : values[0];

      var style = input.width ? 'style="width: ' + input.width + '"' : '';

      var s = ''
      for ( var i = 0 ; i < values.length ; i++ )
        s += `
<input id=${id + name}_${i} name=${id + name} type=radio
       value=${values[i]} ${ values[i] === select ? 'checked' : '' }
       onchange="${id}.update('${id}')"/>
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
       onchange="if (+this.value < +this.min) this.value=this.min;
                 if (+this.value > +this.max) this.value=this.max;${id}.update('${id}')"/>`;

    case 'checkbox':

      var name = 'name' in input ? input.name : '';
      var checked = 'default' in input ? input.default : '';

      return `
<input id=${id + name} type=checkbox ${ checked ? 'checked' : '' }
       onchange="${id}.update('${id}')"/>`;

    default:

      return 'Unsupported input type';

  }

}


function graphic( id, data, config ) {

  switch ( config.type ) {

    case 'svg':

      return svgPlot( id, data, config );

    case 'threejs':

      return threejsPlot( id, data, config );

    case 'x3d':

      return x3dPlot( id, data, config );

    case 'text':

      // need JSON stringify to render objects
      // explicit double quotes removed by default
      // if needed in output use &quot;

      var center = config.center ? 'text-align: center' : '';

      return `<div style="white-space: nowrap; overflow-x: auto; ${center}">
              ${JSON.stringify( data ).replace( /\"/g, '' )} </div>`;

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


function generateId() {

  return 'id' + Math.floor( 10**10 * Math.random() );

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

  var output = document.getElementById( id + 'output' );
  output.innerHTML = graphic( id, data, config );

  if ( config.type === 'threejs' ) {

    var iframe = output.children[0];

    if ( /(iPad|iPhone|iPod)/g.test( navigator.userAgent ) ) {
      iframe.style.width = getComputedStyle( iframe ).width;
      iframe.style.height = getComputedStyle( iframe ).height;
    }

  }

}

