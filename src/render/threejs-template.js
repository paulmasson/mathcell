
function threejsTemplate( config, lights, texts, points, lines, surfaces ) {

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

<script src="https://cdn.jsdelivr.net/gh/paulmasson/threejs-with-controls@r121/build/three.min.js"></script>

<script>

var config = ${config};
var scene = new THREE.Scene();

var renderer = new THREE.WebGLRenderer( { antialias: true } );
renderer.setPixelRatio( window.devicePixelRatio );
renderer.setSize( window.innerWidth, window.innerHeight );
renderer.setClearColor( config.clearColor, 1 );
document.body.appendChild( renderer.domElement );

var a = config.aspectRatio; // aspect multipliers
var animate = config.animate;

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

if ( zRange > rRange && a[2] === 1 && !config.equalAspect ) {
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
  var pixelRatio = Math.round( window.devicePixelRatio );
  canvas.width = 128 * pixelRatio;
  canvas.height = 32 * pixelRatio; // powers of two
  canvas.style.width = '128px';
  canvas.style.height = '32px';

  var context = canvas.getContext( '2d' );
  context.scale( pixelRatio, pixelRatio );
  context.fillStyle = color;
  context.font = fontsize + 'px monospace';
  context.textAlign = 'center';
  context.textBaseline = 'middle';
  context.fillText( text, canvas.width/2/pixelRatio, canvas.height/2/pixelRatio );

  var texture = new THREE.Texture( canvas );
  texture.needsUpdate = true;

  var sprite = new THREE.Sprite( new THREE.SpriteMaterial( { map: texture, sizeAttenuation: false } ) );
  sprite.position.set( x, y, z );
  sprite.scale.set( 1/4, 1/16, 1 ); // ratio of width to height plus scaling
  scene.add( sprite );

}

if ( config.axes ) scene.add( new THREE.AxesHelper( Math.min( xMax, yMax, zMax ) ) );

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

window.addEventListener( 'mousedown', suspendAnimation );
window.addEventListener( 'mousemove', suspendAnimation );
window.addEventListener( 'mousewheel', suspendAnimation );

window.addEventListener( 'touchstart', suspendAnimation );
window.addEventListener( 'touchmove', suspendAnimation );
window.addEventListener( 'touchend', suspendAnimation );

var suspendTimer;

function suspendAnimation() {
  clearInterval( suspendTimer );
  animate = false;
  suspendTimer = setTimeout( function() { if ( config.animate ) { animate = true; render(); } }, 5000 );
}

var texts = ${texts};

for ( var i = 0 ; i < texts.length ; i++ ) {
  var t = texts[i];
  addLabel( t.text, t.point[0], t.point[1], t.point[2], t.options.color, t.options.fontSize );
}

var points = ${points};

for ( var i = 0 ; i < points.length ; i++ ) addPoint( points[i] );

function addPoint( p ) {

  var geometry = new THREE.Geometry();
  var v = p.point;
  geometry.vertices.push( new THREE.Vector3( a[0]*v[0], a[1]*v[1], a[2]*v[2] ) );

  var canvas = document.createElement( 'canvas' );
  canvas.width = 128;
  canvas.height = 128;

  var context = canvas.getContext( '2d' );
  context.arc( 64, 64, 64, 0, 2 * Math.PI );
  context.fillStyle = p.options.color;
  context.fill();

  var texture = new THREE.Texture( canvas );
  texture.needsUpdate = true;

  var transparent = p.options.opacity < 1 ? true : false;
  var material = new THREE.PointsMaterial( { size: p.options.size/20, map: texture,
                                             transparent: transparent, opacity: p.options.opacity,
                                             alphaTest: .1 } );

  var c = new THREE.Vector3();
  geometry.computeBoundingBox();
  geometry.boundingBox.getCenter( c );
  geometry.translate( -c.x, -c.y, -c.z );

  var mesh = new THREE.Points( geometry, material );
  mesh.position.set( c.x, c.y, c.z );
  scene.add( mesh );

}

var lines = ${lines};

var newLines = [];

for ( var i = 0 ; i < lines.length ; i++ ) {

  lines[i].points.forEach( v => {
    // apply aspect multipliers for convenience
    //   and set points outside bounds to empty array
    v[0] *= a[0]; v[1] *= a[1]; v[2] *= a[2];
    if ( v[0] < xMin || v[0] > xMax || v[1] < yMin || v[1] > yMax
           || v[2] < zMin || v[2] > zMax )
      v.splice(0);
  } );

  // split lines at empty points
  var tempPoints = [];
  for ( var j = 0 ; j < lines[i].points.length ; j++ )
    if ( lines[i].points[j].length === 0 ) tempPoints = lines[i].points.splice( j );

  var l = [];
  for ( var j = 0 ; j < tempPoints.length ; j++ ) {
    var p = tempPoints[j];
    if ( p.length > 0 ) l.push( p );
    else if ( l.length > 0 ) {
      newLines.push( { points: l, options: lines[i].options } );
      l = [];
    }
  }

}

newLines.forEach( l => lines.push( l ) );
newLines = [];

for ( var i = 0 ; i < lines.length ; i++ ) addLine( lines[i] );

function addLine( l ) {

  var geometry = new THREE.Geometry();
  for ( var i = 0 ; i < l.points.length ; i++ ) {
    var v = l.points[i];
    geometry.vertices.push( new THREE.Vector3( v[0], v[1], v[2] ) );
  }

  var transparent = l.options.opacity < 1 ? true : false;
  var material = new THREE.LineBasicMaterial( { color: l.options.color, linewidth: l.options.linewidth,
                                                transparent: transparent, opacity: l.options.opacity } );

  var c = new THREE.Vector3();
  geometry.computeBoundingBox();
  geometry.boundingBox.getCenter( c );
  geometry.translate( -c.x, -c.y, -c.z );

  var mesh = new THREE.Line( geometry, material );
  mesh.position.set( c.x, c.y, c.z );
  scene.add( mesh );

}

var surfaces = ${surfaces};

for ( var i = 0 ; i < surfaces.length ; i++ ) addSurface( surfaces[i] );

function addSurface( s ) {

  // apply aspect multipliers for convenience
  s.vertices.forEach( v => { v[0] *= a[0]; v[1] *= a[1]; v[2] *= a[2]; } );

  // remove faces completely outside vertical range
  for ( var i = s.faces.length - 1 ; i >= 0 ; i-- ) {
    var f = s.faces[i];
    var check = true;
    f.forEach( index => check = check && s.vertices[index][2] < zMin );
    if ( check ) s.faces.splice( i, 1 );
    var check = true;
    f.forEach( index => check = check && s.vertices[index][2] > zMax );
    if ( check ) s.faces.splice( i, 1 );
  }

  // constrain vertices to vertical range
  for ( var i = 0 ; i < s.vertices.length ; i++ ) {
    if ( s.vertices[i][2] < zMin ) s.vertices[i][2] = zMin;
    if ( s.vertices[i][2] > zMax ) s.vertices[i][2] = zMax;
  }

  // no appreciable speedup with BufferGeometry
  var geometry = new THREE.Geometry();
  for ( var i = 0 ; i < s.vertices.length ; i++ ) {
    var v = s.vertices[i];
    geometry.vertices.push( new THREE.Vector3( v[0], v[1], v[2] ) );
  }
  for ( var i = 0 ; i < s.faces.length ; i++ ) {
    var f = s.faces[i];
    for ( var j = 0 ; j < f.length - 2 ; j++ )
      geometry.faces.push( new THREE.Face3( f[0], f[j+1], f[j+2] ) );
  }
  geometry.computeVertexNormals();

  var side = s.options.singleSide ? THREE.FrontSide : THREE.DoubleSide;
  var transparent = s.options.opacity < 1 ? true : false;
  var material;

  switch ( s.options.material ) {

    case 'normal':

      material = new THREE.MeshNormalMaterial( { side: THREE.DoubleSide } );
      break;

    case 'standard':

      material = new THREE.MeshStandardMaterial( {
                               color: s.options.color, side: side,
                               transparent: transparent, opacity: s.options.opacity,
                               metalness: .5, roughness: .5 } );
      break;

    case 'phong':
    default:

      material = new THREE.MeshPhongMaterial( {
                               color: s.options.color, side: side,
                               transparent: transparent, opacity: s.options.opacity,
                               shininess: 20 } );

  }

  if ( 'colors' in s.options ) {
    for ( var i = 0 ; i < geometry.vertices.length ; i++ )
      geometry.colors.push( new THREE.Color( s.options.colors[i] ) );
    for ( var i = 0 ; i < geometry.faces.length ; i++ ) {
      var f = geometry.faces[i];
      f.vertexColors = [ geometry.colors[f.a], geometry.colors[f.b], geometry.colors[f.c] ];
    }
    material.vertexColors = THREE.VertexColors;
    material.color.set( 'white' ); // crucial!
  }

  var c = new THREE.Vector3();
  geometry.computeBoundingBox();
  geometry.boundingBox.getCenter( c );
  geometry.translate( -c.x, -c.y, -c.z );

  var mesh = new THREE.Mesh( geometry, material );
  mesh.position.set( c.x, c.y, c.z );
  if ( s.options.renderOrder ) mesh.renderOrder = s.options.renderOrder;
  if ( s.options.rotationAxisAngle ) {
    mesh.userData.rotateOnAxis = true;
    var v = s.options.rotationAxisAngle[0];
    mesh.userData.axis = new THREE.Vector3( v[0], v[1], v[2] ).normalize();
    mesh.userData.angle = s.options.rotationAxisAngle[1];
  }

  if ( 'group' in s.options ) {

    var group = scene.getObjectByName( s.options.group );
    if ( !group ) {
      group = new THREE.Group();
      group.name = s.options.group;
      scene.add( group );
    }
    group.add( mesh );

    if ( mesh.userData.rotateOnAxis ) {
      mesh.userData.rotateOnAxis = false;
      group.userData.rotateOnAxis = true;
      group.userData.axis = mesh.userData.axis;
      group.userData.angle = mesh.userData.angle;
    }

  } else scene.add( mesh );

}

if ( config.clippingPlane ) {

  var v = config.clippingPlane[0];
  var d = config.clippingPlane[1];
  var plane = new THREE.Plane( new THREE.Vector3(v[0],v[1],v[2]).normalize(), d );
  renderer.clippingPlanes = [ plane ];

}

function render() {

  if ( animate ) requestAnimationFrame( render );
  renderer.render( scene, camera );

  scene.children.forEach( child => {

    if ( child.userData.rotateOnAxis && animate )
      child.rotateOnAxis( child.userData.axis, child.userData.angle );

  } );

}

render();
controls.update();
if ( !animate ) render();

</script>

</body>
</html>`;

}

