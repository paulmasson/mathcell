
var defaultPlotColor = 'rgb(0,127,255)';

var mathcellStyle = document.createElement( 'style' );
mathcellStyle.type = 'text/css';
mathcellStyle.innerHTML = `

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

input[type=text] {

  -webkit-appearance: none;
  box-shadow: none;
  border: 1px solid black;
  border-radius: 5px;

}

input[type=number] {

  -webkit-appearance: none;
  -moz-appearance:textfield;
  box-shadow: none;
  border: 1px solid black;
  border-radius: 5px;

}

input[type=number]::-webkit-outer-spin-button,
input[type=number]::-webkit-inner-spin-button {

  -webkit-appearance: none;
  margin: 0;

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

