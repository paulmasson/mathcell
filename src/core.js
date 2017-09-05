
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

      var style = input.width ? 'style="width: ' + input.width + '"' : '';

      var s = ''
      for ( var i = 0 ; i < list.length ; i++ )
        s += `
<input id=${id + name}_${i} name=${id + name} type=radio
       value=${list[i]} ${list[i]===check?'checked':''}
       onchange="${id}.update('${id}')">
<label for=${id + name}_${i} ${style}> ${list[i]} </label> &nbsp; </input>
        `;
      return s;

    case 'number':

      var name = 'name' in input ? input.name : '';
      var min = 'min' in input ? input.min : 0;
      var max = 'max' in input ? input.max : 1;
      var value = 'default' in input ? input.default : min;

      return `
<input id=${id + name} type=number min=${min} max=${max} value=${value}
       style="width: 1in" title="" onload=this.onchange
       onchange="if (+this.value < +this.min) this.value=this.min;
                 if (+this.value > +this.max) this.value=this.max;${id}.update('${id}')"/>
      `;

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

      // need JSON stringify to render objects
      // explicit double quotes removed by default
      // escape in other ways if needed in output

      return `<div style="white-space: nowrap; overflow-x: auto">
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

