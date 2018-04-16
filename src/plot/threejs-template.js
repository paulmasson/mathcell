
function template( config, lights, texts, points, lines, surfaces ) {

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

var config = ${config};
var scene = new THREE.Scene();

var renderer = new THREE.WebGLRenderer( { antialias: true } );
renderer.setPixelRatio( window.devicePixelRatio );
renderer.setSize( window.innerWidth, window.innerHeight );
renderer.setClearColor( config.clearColor, 1 );
document.body.appendChild( renderer.domElement );

var a = config.aspectRatio; // aspect multipliers
var animate = false; // config.animate;

var xMin = config.xMin, yMin = config.yMin, zMin = config.zMin;
var xMax = config.xMax, yMax = config.yMax, zMax = config.zMax;

if ( xMin === xMax ) { xMin -= 1; xMax += 1; }
if ( yMin === yMax ) { yMin -= 1; yMax += 1; }
if ( zMin === zMax ) { zMin -= 1; zMax += 1; }

// apply aspect multipliers for convenience
xMin *= a[0]; yMin *= a[1]; zMin *= a[2];
xMax *= a[0]; yMax *= a[1]; zMax *= a[2];

var xRange = xMax - xMin;
var yRange = yMax - yMin;
var zRange = zMax - zMin;
var rRange = Math.sqrt( xRange*xRange + yRange*yRange );

if ( zRange > rRange && a[2] === 1 ) {
  a[2] = rRange / zRange;
  zMin *= a[2];
  zMax *= a[2];
  zRange *= a[2];
}

var xMid = ( xMin + xMax ) / 2;
var yMid = ( yMin + yMax ) / 2;
var zMid = ( zMin + zMax ) / 2;

var box = new THREE.Geometry();
box.vertices.push( new THREE.Vector3( xMin, yMin, zMin ) );
box.vertices.push( new THREE.Vector3( xMax, yMax, zMax ) );
var boxMesh = new THREE.Line( box );
if ( config.frame ) scene.add( new THREE.BoxHelper( boxMesh, 'black' ) );

if ( config.axesLabels ) {

  var d = config.decimals; // decimals
  var offsetRatio = 0.1;
  var al = config.axesLabels;

  var offset = offsetRatio * ( yMax - yMin );
  var xm = ( xMid/a[0] ).toFixed(d);
  if ( /^-0.?0*$/.test(xm) ) xm = xm.substr(1);
  addLabel( al[0] + '=' + xm, xMid, yMax+offset, zMin );
  addLabel( ( xMin/a[0] ).toFixed(d), xMin, yMax+offset, zMin );
  addLabel( ( xMax/a[0] ).toFixed(d), xMax, yMax+offset, zMin );

  var offset = offsetRatio * ( xMax - xMin );
  var ym = ( yMid/a[1] ).toFixed(d);
  if ( /^-0.?0*$/.test(ym) ) ym = ym.substr(1);
  addLabel( al[1] + '=' + ym, xMax+offset, yMid, zMin );
  addLabel( ( yMin/a[1] ).toFixed(d), xMax+offset, yMin, zMin );
  addLabel( ( yMax/a[1] ).toFixed(d), xMax+offset, yMax, zMin );

  var offset = offsetRatio * ( yMax - yMin );
  var zm = ( zMid/a[2] ).toFixed(d);
  if ( /^-0.?0*$/.test(zm) ) zm = zm.substr(1);
  addLabel( al[2] + '=' + zm, xMax, yMin-offset, zMid );
  addLabel( ( zMin/a[2] ).toFixed(d), xMax, yMin-offset, zMin );
  addLabel( ( zMax/a[2] ).toFixed(d), xMax, yMin-offset, zMax );

}

function addLabel( text, x, y, z, color='black', fontsize=14 ) {

  var canvas = document.createElement( 'canvas' );
  canvas.width = 128;
  canvas.height = 32; // powers of two

  var context = canvas.getContext( '2d' );
  context.fillStyle = color;
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

if ( config.axes ) scene.add( new THREE.AxisHelper( Math.min( xMax, yMax, zMax ) ) );

var camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 0.1, 1000 );
camera.up.set( 0, 0, 1 );

// default auto position, followed by rotation to viewpoint direction
camera.position.set( xMid, yMid, zMid );
var defaultOffset = new THREE.Vector3( xRange, yRange, zRange );

if ( config.viewpoint !== 'auto' ) {
  var v = config.viewpoint;
  var t = new THREE.Vector3( v[0], v[1], v[2] );
  var phi = defaultOffset.angleTo( t );
  var n = t.cross( defaultOffset ).normalize();
  defaultOffset.applyAxisAngle( n, -phi );
}

camera.position.add( defaultOffset );

var lights = ${lights};

for ( var i = 0 ; i < lights.length ; i++ ) {
  var light = new THREE.DirectionalLight( lights[i].color, 1 );
  var v = lights[i].position;
  light.position.set( a[0]*v[0], a[1]*v[1], a[2]*v[2] );
  if ( lights[i].parent === 'camera' ) {
    light.target.position.set( xMid, yMid, zMid );
    scene.add( light.target );
    camera.add( light );
  } else scene.add( light );
}
scene.add( camera );

scene.add( new THREE.AmbientLight( config.ambientLight, 1 ) );

var controls = new THREE.OrbitControls( camera, renderer.domElement );
controls.target.set( xMid, yMid, zMid );
controls.addEventListener( 'change', function() { if ( !animate ) render(); } );

window.addEventListener( 'resize', function() {

  renderer.setSize( window.innerWidth, window.innerHeight );
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  if ( !animate ) render();

} );

var texts = ${texts};

for ( var i = 0 ; i < texts.length ; i++ ) {
  var t = texts[i];
  addLabel( t.text, t.point[0], t.point[1], t.point[2], t.options.color, t.options.fontSize );
}

var points = ${points};

for ( var i = 0 ; i < points.length ; i++ ) addPoint( points[i] );

function addPoint( json ) {

  var geometry = new THREE.Geometry();
  var v = json.point;
  geometry.vertices.push( new THREE.Vector3( a[0]*v[0], a[1]*v[1], a[2]*v[2] ) );

  var canvas = document.createElement( 'canvas' );
  canvas.width = 128;
  canvas.height = 128;

  var context = canvas.getContext( '2d' );
  context.arc( 64, 64, 64, 0, 2 * Math.PI );
  context.fillStyle = json.options.color;
  context.fill();

  var texture = new THREE.Texture( canvas );
  texture.needsUpdate = true;

  var transparent = json.options.opacity < 1 ? true : false;
  var material = new THREE.PointsMaterial( { size: json.size/100, map: texture,
                                             transparent: transparent, opacity: json.options.opacity,
                                             alphaTest: .1 } );

  var c = geometry.center().multiplyScalar( -1 );
  var mesh = new THREE.Points( geometry, material );
  mesh.position.set( c.x, c.y, c.z );
  scene.add( mesh );

}

var lines = ${lines};

for ( var i = 0 ; i < lines.length ; i++ ) addLine( lines[i] );

function addLine( json ) {

  var geometry = new THREE.Geometry();
  for ( var i = 0 ; i < json.points.length ; i++ ) {
    var v = json.points[i];
    geometry.vertices.push( new THREE.Vector3( a[0]*v[0], a[1]*v[1], a[2]*v[2] ) );
  }

  var transparent = json.options.opacity < 1 ? true : false;
  var material = new THREE.LineBasicMaterial( { color: json.options.color, linewidth: json.options.linewidth,
                                                transparent: transparent, opacity: json.options.opacity } );

  var c = geometry.center().multiplyScalar( -1 );
  var mesh = new THREE.Line( geometry, material );
  mesh.position.set( c.x, c.y, c.z );
  scene.add( mesh );

}

var surfaces = ${surfaces};

for ( var i = 0 ; i < surfaces.length ; i++ ) addSurface( surfaces[i] );

function addSurface( json ) {

  var geometry = new THREE.Geometry();
  for ( var i = 0 ; i < json.vertices.length ; i++ ) {
    var v = json.vertices[i];
    geometry.vertices.push( new THREE.Vector3( a[0]*v[0], a[1]*v[1], a[2]*v[2] ) );
  }
  for ( var i = 0 ; i < json.faces.length ; i++ ) {
    var f = json.faces[i];
    for ( var j = 0 ; j < f.length - 2 ; j++ )
      geometry.faces.push( new THREE.Face3( f[0], f[j+1], f[j+2] ) );
  }
  geometry.mergeVertices();

  // remove faces completely outside vertical range
  for ( var i = geometry.faces.length - 1 ; i >= 0 ; i-- ) {
    var f = geometry.faces[i];
    if ( geometry.vertices[f.a].z < zMin && geometry.vertices[f.b].z < zMin
           && geometry.vertices[f.c].z < zMin ) geometry.faces.splice( i, 1 );
    if ( geometry.vertices[f.a].z > zMax && geometry.vertices[f.b].z > zMax 
           && geometry.vertices[f.c].z > zMax ) geometry.faces.splice( i, 1 );
  }

  // constrain vertices to vertical range
  for ( var i = 0 ; i < geometry.vertices.length ; i++ ) {
    if ( geometry.vertices[i].z < zMin ) geometry.vertices[i].z = zMin;
    if ( geometry.vertices[i].z > zMax ) geometry.vertices[i].z = zMax;
  }
  geometry.computeVertexNormals();

  var side = json.options.singleSide ? THREE.FrontSide : THREE.DoubleSide;
  var transparent = json.options.opacity < 1 ? true : false;
  var material = new THREE.MeshPhongMaterial( {
                               color: json.options.color, side: side,
                               transparent: transparent, opacity: json.options.opacity,
                               shininess: 20 } );

  if ( 'colors' in json.options ) {
    for ( var i = 0 ; i < geometry.vertices.length ; i++ )
      geometry.colors.push( new THREE.Color().setHSL( json.options.colors[i], 1, .5 ) );
    for ( var i = 0 ; i < geometry.faces.length ; i++ ) {
      var f = geometry.faces[i];
      f.vertexColors = [ geometry.colors[f.a], geometry.colors[f.b], geometry.colors[f.c] ];
    }
    material.vertexColors = THREE.VertexColors;
    material.color.set( 'white' ); // crucial!
  }

  if ( json.options.normalMaterial ) material = new THREE.MeshNormalMaterial( { side: THREE.DoubleSide } );

  var c = geometry.center().multiplyScalar( -1 );
  var mesh = new THREE.Mesh( geometry, material );
  mesh.position.set( c.x, c.y, c.z );
  if ( json.options.renderOrder ) mesh.renderOrder = json.options.renderOrder;
  scene.add( mesh );

}

if ( config.clippingPlane ) {

  var v = config.clippingPlane[0];
  var d = config.clippingPlane[1];
  var plane = new THREE.Plane( new THREE.Vector3(v[0],v[1],v[2]).normalize(), d );
  renderer.clippingPlanes = [ plane ];

}

var scratch = new THREE.Vector3();

function render() {

  if ( animate ) requestAnimationFrame( render );
  renderer.render( scene, camera );

  for ( var i = 0 ; i < scene.children.length ; i++ )
    if ( scene.children[i].type === 'Sprite' ) {
      var sprite = scene.children[i];
      var adjust = scratch.addVectors( sprite.position, scene.position )
                          .sub( camera.position ).length() / 5;
      sprite.scale.set( adjust, .25*adjust ); // ratio of canvas width to height
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

