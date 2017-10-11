
function template( options, bounds, lights, texts, points, lines, surfaces ) {

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

    var bounds = ${bounds};
    var b0 = bounds[0]; // lower
    var b1 = bounds[1]; // upper

    if ( b0[0] === b1[0] ) {
        b0[0] -= 1;
        b1[0] += 1;
    }
    if ( b0[1] === b1[1] ) {
        b0[1] -= 1;
        b1[1] += 1;
    }
    if ( b0[2] === b1[2] ) {
        b0[2] -= 1;
        b1[2] += 1;
    }

    var xRange = b1[0] - b0[0];
    var yRange = b1[1] - b0[1];
    var zRange = b1[2] - b0[2];
    var rRange = Math.sqrt( xRange*xRange + yRange*yRange );

    var a = options.aspectRatio; // aspect multipliers
    if ( zRange > rRange && a[2] === 1 ) a[2] = rRange / zRange;

    var xMid = ( b0[0] + b1[0] ) / 2;
    var yMid = ( b0[1] + b1[1] ) / 2;
    var zMid = ( b0[2] + b1[2] ) / 2;

    var box = new THREE.Geometry();
    box.vertices.push( new THREE.Vector3( a[0]*b0[0], a[1]*b0[1], a[2]*b0[2] ) );
    box.vertices.push( new THREE.Vector3( a[0]*b1[0], a[1]*b1[1], a[2]*b1[2] ) );
    var boxMesh = new THREE.Line( box );
    if ( options.frame ) scene.add( new THREE.BoxHelper( boxMesh, 'black' ) );

    if ( options.axesLabels ) {
        var d = options.decimals; // decimals
        var offsetRatio = 0.1;
        var al = options.axesLabels;

        var offset = offsetRatio * a[1]*( b1[1] - b0[1] );
        var xm = xMid.toFixed(d);
        if ( /^-0.?0*$/.test(xm) ) xm = xm.substr(1);
        addLabel( al[0] + '=' + xm, a[0]*xMid, a[1]*b1[1]+offset, a[2]*b0[2] );
        addLabel( ( b0[0] ).toFixed(d), a[0]*b0[0], a[1]*b1[1]+offset, a[2]*b0[2] );
        addLabel( ( b1[0] ).toFixed(d), a[0]*b1[0], a[1]*b1[1]+offset, a[2]*b0[2] );

        var offset = offsetRatio * a[0]*( b1[0] - b0[0] );
        var ym = yMid.toFixed(d);
        if ( /^-0.?0*$/.test(ym) ) ym = ym.substr(1);
        addLabel( al[1] + '=' + ym, a[0]*b1[0]+offset, a[1]*yMid, a[2]*b0[2] );
        addLabel( ( b0[1] ).toFixed(d), a[0]*b1[0]+offset, a[1]*b0[1], a[2]*b0[2] );
        addLabel( ( b1[1] ).toFixed(d), a[0]*b1[0]+offset, a[1]*b1[1], a[2]*b0[2] );

        var offset = offsetRatio * a[1]*( b1[1] - b0[1] );
        var zm = zMid.toFixed(d);
        if ( /^-0.?0*$/.test(zm) ) zm = zm.substr(1);
        addLabel( al[2] + '=' + zm, a[0]*b1[0], a[1]*b0[1]-offset, a[2]*zMid );
        addLabel( ( b0[2] ).toFixed(d), a[0]*b1[0], a[1]*b0[1]-offset, a[2]*b0[2] );
        addLabel( ( b1[2] ).toFixed(d), a[0]*b1[0], a[1]*b0[1]-offset, a[2]*b1[2] );
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

    if ( options.axes ) scene.add( new THREE.AxisHelper( Math.min( a[0]*b1[0], a[1]*b1[1], a[2]*b1[2] ) ) );

    var camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 0.1, 1000 );
    camera.up.set( 0, 0, 1 );

    if ( options.viewpoint === 'auto' )
      camera.position.set( a[0]*(xMid+xRange), a[1]*(yMid+yRange), a[2]*(zMid+zRange) );
    else {
      var v = options.viewpoint;
      camera.position.set( a[0]*v[0], a[1]*v[1], a[2]*v[2] );
    }

    var lights = ${lights};
    for ( var i=0 ; i < lights.length ; i++ ) {
        var light = new THREE.DirectionalLight( lights[i].color, 1 );
        var v = lights[i].position;
        light.position.set( a[0]*v[0], a[1]*v[1], a[2]*v[2] );
        if ( lights[i].parent === 'camera' ) {
            light.target.position.set( a[0]*xMid, a[1]*yMid, a[2]*zMid );
            scene.add( light.target );
            camera.add( light );
        } else scene.add( light );
    }
    scene.add( camera );

    scene.add( new THREE.AmbientLight( options.ambientLight, 1 ) );

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
    for ( var i=0 ; i < texts.length ; i++ ) {
      var t = texts[i];
      addLabel( t.text, t.point[0], t.point[1], t.point[2], t.color, t.fontSize );
    }

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
        for ( var i=0 ; i < json.points.length ; i++ ) {
            var v = json.points[i];
            geometry.vertices.push( new THREE.Vector3( a[0]*v[0], a[1]*v[1], a[2]*v[2] ) );
        }

        var transparent = json.opacity < 1 ? true : false;
        var material = new THREE.LineBasicMaterial( { color: json.color, linewidth: json.linewidth,
                                                      transparent: transparent, opacity: json.opacity } );

        var c = geometry.center().multiplyScalar( -1 );
        var mesh = new THREE.Line( geometry, material );
        mesh.position.set( c.x, c.y, c.z );
        scene.add( mesh );
    }

    var surfaces = ${surfaces};
    for ( var i=0 ; i < surfaces.length ; i++ ) addSurface( surfaces[i] );

    function addSurface( json ) {
        var geometry = new THREE.Geometry();
        for ( var i=0 ; i < json.vertices.length ; i++ ) {
            var v = json.vertices[i];
            if ( v[2] < b0[2] ) v[2] = b0[2]; // allow cap on poles
            if ( v[2] > b1[2] ) v[2] = b1[2];
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

