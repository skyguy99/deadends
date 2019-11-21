import 'styles/index.scss';
import Cone from './elements/cone';
import Tourus from './elements/tourus';
import Cylinder from './elements/cylinder';
import { radians, map, distance } from './helpers';
import TouchTexture from './vendor/TouchTexture';

const glslify = require('glslify');

export default class App {
  setup() {

console.log("SKY");

  //3D STUFF
    this.gutter = { size: 4 };
    this.meshes = []; //objects we need to worry about for interaction
    this.grid = { rows: 5, cols: 5 };
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.mouse3D = new THREE.Vector2();
    this.effect = new THREE.ShaderPass();
    this.geometries = [
      new Cone(),
      new Tourus(),
      new Cylinder(),
    ];

    this.raycaster = new THREE.Raycaster();
this.testCube = new THREE.Mesh();
    this.mouse = new THREE.Vector2();
    this.target = new THREE.Vector2();
    this.windowHalf = new THREE.Vector2( window.innerWidth / 2, window.innerHeight / 2 );
    this.movableLight = new THREE.PointLight();
    this.mixer = new THREE.AnimationMixer();
    this.clock = new THREE.Clock(true);
    this.animatedmesh = new THREE.Mesh();
    this.mixers = [];
    this.animatedMeshes = [];
    this.roomModels = [];
    this.interactiveMeshes = [];
    this.audio = new Audio();
    this.audioVolume = 0.7;

    //LOGIC
    this.loadingHasStarted = false;
    this.middleMenuIsUp = true;
    this.midMenuIndex = 0;
    this.currentRoom = 0;
    this.scl = 0;
    this.hasTransitioned = false;
    this.mouseDown = false;

    //UI
    $('.dots li').first().addClass('active');
    $('.bottomTitle .dots li').first().addClass('active');
    $('.parallax img').each(function() {
      $(this).hide();
    });
  }

  createScene() {
    this.scene = new THREE.Scene();

    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setClearColor(new THREE.Color(0, 0, 0));

    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    //this.renderer.shadowMap.type = THREE.PCFShadowMap;

    var element = this.renderer.domElement;
    document.body.appendChild(element);
    element.className += " mainCanvas";

  }

  addModelToScene(position, string, isCam)
  {
    var localThis = this;

  var material = new THREE.MeshStandardMaterial({
    color: 0xffff00,
    roughness: 0.5,
    metalness: 0.0
});

//---------------------------------
//GLTF LOADER
var loader = new THREE.GLTFLoader();
// const decoder = require('draco3dgltf').createDecoderModule();

// loader.setDRACOLoader(decoder);

//https://blackthread.io/gltf-converter/
loader.load(
  // resource URL
  string,
  // called when the resource is loaded
  function ( gltf ) {

    localThis.scene.add(gltf.scene);

    //gltf.scene.visible = true;

    gltf.scene.position.set(position);
    //gltf.scene.position.set(10,10,10);

    //gltf.scene.scale.set(0.1,0.1,0.1);

    gltf.scene.traverse(function (node) {
    if (node.isMesh)
    {
      node.material = material;
      node.castShadow = true;
      node.receiveShadow = true;

      // if(isCam)
      // {
      //   localThis.camera.
      // }
    }
  });


//constants
    // gltf.animations; // Array<THREE.AnimationClip>
    // gltf.scene; // THREE.Scene
    // gltf.scenes; // Array<THREE.Scene>
    // gltf.cameras; // Array<THREE.Camera>
    // gltf.asset; // Object

//Camera mixer
    localThis.mixer = new THREE.AnimationMixer(gltf.scene);

      //Play all
      if(gltf.animations)
      {
        var clips = gltf.animations;
        //console.log(clips);

        // clips.forEach( function ( clip ) {
        //      localThis.mixer.clipAction( clip ).play();
        //     } );
      //  Play a specific animation
          var clip = THREE.AnimationClip.findByName( clips, "camMove" );
          var action = localThis.mixer.clipAction( clip );
          action.loop = THREE.LoopOnce;
          action.play();
      }

  },
  // called while loading is progressing
  function ( xhr ) {

    console.log( ( xhr.loaded / xhr.total * 100 ) + '% loaded' );

  },
  // called when loading has errors
  function ( error ) {

    console.log( 'An error happened' +error);

  }
);

}

//PARTICLES --------------------------------------

particlesTest()
{

  const uniforms = {
    uTime: { value: 0.2 },
    uRandom: { value: 1.0 },
    uDepth: { value: 2.0 },
    uSize: { value: 1.0 },
    uTextureSize: { value: new THREE.Vector2(this.width, this.height) },
    uTexture: { value: this.texture },
    uTouch: { value: null },
  };
//
//   const material = new THREE.MeshStandardMaterial( {
//
//   color: 0x00ffff,
//
//   roughness: 0.3,
//   metalness: 0.2
// });

  const material = new THREE.RawShaderMaterial({
    uniforms,
    vertexShader: glslify(require('./vendor/shaders/particle.vert')),
    fragmentShader: glslify(require('./vendor/shaders/particle.frag')),
    depthTest: false, //change later?
    transparent: true,
    // blending: THREE.AdditiveBlending
  });

  // vertexShader: glslify(require('./vendor/shaders/particle.vert')),
  // fragmentShader: glslify(require('./vendor/shaders/particle.frag')),

  // vertexShader: glslify(document.getElementById("vertexShader2").textContent),
  // fragmentShader: glslify(document.getElementById("fragShader2").textContent),

  const geometry = new THREE.InstancedBufferGeometry();

// positions
const positions = new THREE.BufferAttribute(new Float32Array(4 * 3), 3);
positions.setXYZ(0, -0.5, 0.5, 0.0);
positions.setXYZ(1, 0.5, 0.5, 0.0);
positions.setXYZ(2, -0.5, -0.5, 0.0);
positions.setXYZ(3, 0.5, -0.5, 0.0);
geometry.addAttribute('position', positions);

// uvs
const uvs = new THREE.BufferAttribute(new Float32Array(4 * 2), 2);
uvs.setXYZ(0, 0.0, 0.0);
uvs.setXYZ(1, 1.0, 0.0);
uvs.setXYZ(2, 0.0, 1.0);
uvs.setXYZ(3, 1.0, 1.0);
geometry.addAttribute('uv', uvs);

// index
geometry.setIndex(new THREE.BufferAttribute(new Uint16Array([ 0, 2, 1, 2, 3, 1 ]), 1));

this.object3D = new THREE.Mesh(geometry, material);
this.scene.add(this.object3D);
this.object3D.position.set(0,5,2);
this.object3D.scale.set(3,3,3);
var box = new THREE.BoxHelper( this.object3D, 0xffff00 );
	this.scene.add( box );
}

//-------------------------------------------------------- 
  createCamera() {


    var SCREEN_WIDTH = window.innerWidth, SCREEN_HEIGHT = window.innerHeight;
  	var VIEW_ANGLE = 45, ASPECT = SCREEN_WIDTH / SCREEN_HEIGHT, NEAR = 0.1, FAR = 20000;
  	this.camera = new THREE.PerspectiveCamera( VIEW_ANGLE, ASPECT, NEAR, FAR);
    this.camera.position.set(0, 4, 9);

    this.scene.add(this.camera);
  }

  roomTransition()
  {
    // if(!this.hasTransitioned)
    // {
    //   this.hasTransitioned = true;
    // }

    //https://greensock.com/ease-visualizer/
    var animation = new TimelineLite()
    animation.to(this.camera.position, .4, {
      ease: Expo.easeOut,
      x: this.camera.position.x,
      y: this.camera.position.y,
      z: this.camera.position.z - 3,
    }).to(this.camera.position, 1.5, {
      ease: Elastic.easeOut.config(1, 0.5),
      x: this.camera.position.x,
      y: this.camera.position.y,
      z: 9,
    });

  //   setTimeout( function(){
  //     this.hasTransitioned = false;
  // }  , 2000);
  }

  addAmbientLight() {
    const light = new THREE.AmbientLight('#ffffff', 1);

    this.scene.add(light);
  }

  addOtherPointLights()
  {
    var light = new THREE.PointLight(0xffffff, 0.5);
    light.castShadow = true;
    light.shadow.radius = 10;

    light.position.set(0, 4, 2);
    this.scene.add(light);

    var helper = new THREE.PointLightHelper(light, 1);
    light.add( helper );
  }

  addDirectionalLight()
  {
    const light = new THREE.DirectionalLight('#ffffff', 0.5);
    light.castShadow = true;
    var helper = new THREE.DirectionalLightHelper( light );

    light.shadow.mapSize.width = 1024;
    light.shadow.mapSize.height = 1024;

    light.add( helper );
    light.position.set(0, 4, -2);
    //light.lookAt(0, 0, 0);

    this.scene.add(light);
  }

  addRectLight() {
    const light = new THREE.RectAreaLight('#ffffff', 1, 2000, 2000);

    var helper = new THREE.RectAreaLightHelper( light );

    light.add( helper );

    light.position.set(0, 10, 0);
    light.lookAt(0, 0, 0);

    //this.scene.add(light);
  }

//FOLLOWS MOUSE
  addPointLight(color, position) {
    this.movableLight = new THREE.PointLight('#ffffff', 0.5, 1000, 1); //2nd num is intensity

    this.movableLight.position.set(position.x, position.y, position.z);

    this.scene.add(this.movableLight);

    var helper = new THREE.PointLightHelper(this.movableLight, 1);

    //this.movableLight.add( helper );
  }

  applyTVShader()
  {

    this.uniforms = {
      u_time : {
        type : "f",
        value : 0.0
      },
      u_frame : {
        type : "f",
        value : 0.0
      },
      u_resolution : {
        type : "v2",
        value : new THREE.Vector2(window.innerWidth, window.innerHeight)
            .multiplyScalar(window.devicePixelRatio)
      },
      u_mouse : {
        type : "v2",
        value : new THREE.Vector2(0.5 * window.innerWidth, window.innerHeight)
            .multiplyScalar(window.devicePixelRatio)
      },
      u_texture : {
        type : "t",
        value : null
      }
    };

    // postprocessing
		var material = new THREE.ShaderMaterial({
			uniforms : this.uniforms,
			vertexShader : document.getElementById("vertexShader").textContent,
			fragmentShader : document.getElementById("fragmentShader").textContent
		});

		// Initialize the effect composer
		this.composer = new THREE.EffectComposer(this.renderer);
		this.composer.addPass(new THREE.RenderPass(this.scene, this.camera));

		// Add the post-processing effect
		this.effect = new THREE.ShaderPass(material, "u_texture");
		this.effect.renderToScreen = true;
		this.composer.addPass(this.effect);

	// this.composer = new THREE.EffectComposer(this.renderer); //THREE.whatever is different
	// var renderPass = new THREE.RenderPass(this.scene, this.camera);
	// this.composer.addPass(renderPass);
  //
	// // badtv pass
  //
	// var shaderMaterial = new THREE.ShaderMaterial({
	// 	uniforms: this.uniforms,
	// 	vertexShader: document.getElementById("vertexShader").textContent,
	// 	fragmentShader: document.getElementById("fragmentShader").textContent
	// });
  //
	// var effectBadTV = new THREE.ShaderPass(shaderMaterial, "u_texture");
	// this.composer.addPass(effectBadTV);
  }

  startLoading(load)
  {

    var localThis = this;
    if(load)
    {
      if(!this.loadingHasStarted)
      {
        this.loadingHasStarted = true;
        console.log("Starting load to back");
        //wait 3 seconds, then go

        setTimeout( function(){
          $('.bottomTitle img').show();
          $('.bottomTitle h1').hide();
          setTimeout(function() {
            // NOW SWITCH
            if(localThis.loadingHasStarted)
            {
              localThis.triggerRoomChange();
            }
        }, 4000);

      }  , 800);

      }
    } else {
      //this.roomTransition(); //cam only
      $('.bottomTitle img').hide();
      $('.bottomTitle h1').show();
    }

  }

  addFloor() {
    const geometry = new THREE.PlaneGeometry(100, 100);
    const material = new THREE.ShadowMaterial({ opacity: .3 });

    this.floor = new THREE.Mesh(geometry, material);
    this.floor.position.y = 0;
    this.floor.receiveShadow = true;
    this.floor.rotateX(- Math.PI / 2);

    this.scene.add(this.floor);
  }

  playAudio(){
    // this.audio = new Audio("./src/resources/test.mp3");
    // this.audio.loop = true;
    // this.audio.autoplay = true;

    this.audio = $('#audioplayer')[0];
  //
    var localThis = this;
  setTimeout( function(){
    $('#audioplayer')[0].play();
    $('#audioplayer')[0].muted = false;
  }  , 500);
  }

  cubeCloud()
  {
    const geometry = new THREE.BoxBufferGeometry();
    const material = new THREE.MeshStandardMaterial( {

    color: 0xffffff,

    roughness: 0.3,
    metalness: 1

    // roughnessMap: roughnessMap,
    // metalnessMap: metalnessMap,
    //
    // envMap: envMap, // important -- especially for metals!
    // envMapIntensity: envMapIntensity

} );

    for ( let i = 0; i < 1000; i ++ ) {

      const object = new THREE.Mesh( geometry, material );
      object.position.x = Math.random() * 80 - 40;
      object.position.y = Math.random() * 80 - 40;
      object.position.z = Math.random() * 80 - 40;
      object.rotation.x = Math.random() * 2 * Math.PI;
      object.rotation.y = Math.random() * 2 * Math.PI;
      object.rotation.z = Math.random() * 2 * Math.PI;
      this.scene.add( object );

		}
  }

  runParallax()
  {
    var scene = document.getElementsByClassName('parallax')[0];
    var parallaxInstance = new Parallax(scene);
    parallaxInstance.friction(0.05, 0.05);
    parallaxInstance.relativeInput = true;

  }

//FOR INTRO
  switchSiteVideo()
  {
    //switch opening video > images

    $('.parallax video source').each(function(){
        $(this).attr('src', '')
    });
  $('.parallax video').remove();

    $('#bgVideo').each(function(){
        $(this).attr('src', './src/images/glitchbg.mp4')
    });

    $('.parallax img').each(function() {
      $(this).show();
    });
  }

//initial loading
  doneLoading()
  {
    //load experience

  var localThis = this;
  setTimeout( function(){
    localThis.switchSiteVideo();
  }  , 6500);

  }

//To actual experience
  forceDoneLoading()
  {
    $(".frame").show();
    $(".mainCanvas").show();
    $(".loadingScreen").hide();

    $('#bgVideo').each(function(){
        $(this).attr('src', '')
    });
    $('#bgVideo').remove();

    $('#myVideo').each(function(){
        $(this).attr('src', '../src/images/glitchbg.mp4')
    });
  }

  toggleVideo()
  {
    $(".mainCanvas").toggle();
    //$("#myVideo").toggle();
  }
  makeIntoShape()
  {

    //LOCAL VARS---------------
    var localThis = this;
    var particleMeshes = [];
    var pScale = 0.3;
    const meshParams = {
      color: '#ff00ff',
      metalness: .58,
      emissive: '#222222',
      roughness: .18,
    };

    var particleContainer = new THREE.Object3D();

    const material = new THREE.MeshPhysicalMaterial(meshParams);
    var loader = new THREE.ObjectLoader();
//---------------------------------

    loader.load(
    	// DEBUG
      "./src/scripts/elements/Icosphere.json",

      //DEPLOY
    	//"https://dojusticeandlettheskiesfall.firebaseapp.com/elements/Icosphere.json",

    	function ( obj ) {

        var geoFromScene = new THREE.Geometry();

    		//localThis.scene.add( obj );
        obj.position.set(0, 4, 0);
        obj.scale.set(3, 3, 3);

        obj.traverse( function (child){
          if(child.isMesh)
          {

                geoFromScene = (new THREE.Geometry()).fromBufferGeometry(child.geometry);
                //console.log(geometry.vertices.length);
          }
});

        var particleCount = geoFromScene.vertices.length;

        for (var p = 0; p < particleCount; p ++) {
            // var particle = model.geometry.vertices[p];
            // particles.vertices.push(particle);

            //console.log(geometry2.vertices[p].x); //Test get a vertex

            const geometry = localThis.getRandomGeometry();
            const mesh = localThis.getMesh(geometry.geom, material);

            mesh.position.set(geoFromScene.vertices[p].x, geoFromScene.vertices[p].y, geoFromScene.vertices[p].z);
            mesh.scale.set(pScale, pScale, pScale);
            // mesh.position.set(col + (col * this.gutter.size), 0, row + (row * this.gutter.size));
            mesh.rotation.x = geometry.rotationX;
            mesh.rotation.y = geometry.rotationY;
            mesh.rotation.z = geometry.rotationZ;

            // store the initial values of each element so we can animate back
            mesh.initialRotation = {
              x: mesh.rotation.x,
              y: mesh.rotation.y,
              z: mesh.rotation.z,
            };
            mesh.initialPosition = {
              x: mesh.position.x,
              y: mesh.position.y,
              z: mesh.position.z,
            };
            mesh.initialScale = pScale;

            //do if statement - if there isn't already a particle at this location

            var canAdd = true;
            particleMeshes.forEach(function(s) {
              //console.log(s.position);
              if(s.position.equals(mesh.position))
              {
                canAdd = false;
              }

              });

              if(canAdd)
              {
                particleMeshes.push(mesh);
                  particleContainer.add(mesh);
              }
            // store the element inside our array so we can get back when need to animate
            //localThis.meshes[0][p] = mesh;

        } //end of for
        particleContainer.scale.set(8, 8, 8);
        particleContainer.position.set(0, 8, 0);
        localThis.scene.add(particleContainer);

    	},

    	// onProgress callback -------------------------------
    	function ( xhr ) {
    		console.log( (xhr.loaded / xhr.total * 100) + '% loaded' );
    	},

    	// onError callback
    	function ( err ) {
    		console.error( 'Sky - An error happened' );
    	}
    );
    //assign to global array
    //this.overallParticleMeshes = particleMeshes;
    //this.overallParticleContainer = particleContainer; //is groupmesh

  }

  getRandomGeometry() {
    return this.geometries[Math.floor(Math.random() * Math.floor(this.geometries.length))];
  }

  addTextureAnimationObject()
  {

    var video = document.createElement( 'video' );
    video.src = './src/images/firenoalpha.webm';
    video.load(); // must call after setting/changing source
    video.preload = 'auto';
    video.loop = true;
    video.autoload = true;
    video.transparent = true;
    video.playbackRate = 1.06;

    this.videoTex = video;


    var texture = new THREE.VideoTexture( video );
    texture.minFilter = THREE.LinearFilter;
    texture.magFilter = THREE.LinearFilter;
    texture.format = THREE.RGBAFormat;

  	var runnerMaterial = new THREE.MeshBasicMaterial( { map: texture, transparent: true, side:THREE.DoubleSide, alphaTest: 0.5 } );
  	var runnerGeometry = new THREE.PlaneGeometry(5, 5, 1, 1);
    runnerMaterial.transparent = true;
  	var runner = new THREE.Mesh(runnerGeometry, runnerMaterial);
  	runner.position.set(0,5,-10);
  	this.scene.add(runner);

  }

  addTestObject()
  {

    const geometry = new THREE.BoxBufferGeometry();
    var material = new THREE.MeshPhongMaterial({
			color : 0xffffff,
			precision: "mediump"
		});

this.testCube.geometry = geometry;
	geometry.computeVertexNormals();
this.testCube.material = material;

//this.testCube.scale.set(15,15,15);
this.testCube.position.set(0,5,0);
this.scene.add(this.testCube);

  }

  stemoskiScene()
{
  // LIGHT
  var light = new THREE.PointLight(0xffffff);
  light.position.set(0,250,0);
  this.scene.add(light);
  // FLOOR
  var floorTexture = new THREE.TextureLoader().load( './src/images/checkerboard.jpg' );
  floorTexture.wrapS = floorTexture.wrapT = THREE.RepeatWrapping;
  floorTexture.repeat.set( 10, 10 );
  var floorMaterial = new THREE.MeshBasicMaterial( { map: floorTexture, side: THREE.DoubleSide } );
  var floorGeometry = new THREE.PlaneGeometry(1000, 1000, 10, 10);
  var floor = new THREE.Mesh(floorGeometry, floorMaterial);
  floor.position.y = -50.5;
  floor.rotation.x = Math.PI / 2;
  this.scene.add(floor);
  // SKYBOX
  var imagePrefix = "./src/images/dawnmountain-";
  var directions  = ["xpos", "xneg", "ypos", "yneg", "zpos", "zneg"];
  var imageSuffix = ".png";
  var skyGeometry = new THREE.CubeGeometry( 5000, 5000, 5000 );

  this.urls = [];
  for (var i = 0; i < 6; i++)
    this.urls.push( imagePrefix + directions[i] + imageSuffix );

  var materialArray = [];
  for (var i = 0; i < 6; i++)
    materialArray.push( new THREE.MeshBasicMaterial({
      map: new THREE.TextureLoader().load( imagePrefix + directions[i] + imageSuffix ),
      side: THREE.BackSide
    }));

    // for (var i = 0; i < 6; i++)
    // 	materialArray.push( new THREE.MeshBasicMaterial({
    // 		map: new THREE.TextureLoader().load("./src/scripts/images/bg.png"),
    // 		side: THREE.BackSide
    // 	}));

  var skyBox = new THREE.Mesh(skyGeometry, materialArray);
  this.scene.add( skyBox );
}

glowSphere()
  {
//https://stemkoski.github.io/Three.js/Shader-Glow.html
var geometry = new THREE.SphereGeometry( 30, 32, 16 );
    var material = new THREE.MeshLambertMaterial( { color: 0x000088 } );
    var mesh = new THREE.Mesh( geometry, material );
    mesh.position.set(0,3,-10);
    mesh.scale.set(0.1,0.1, 0.1);
    this.scene.add(mesh);

    var spriteMaterial = new THREE.SpriteMaterial(
    {
      map: new THREE.TextureLoader().load( './src/images/glow.png' ),
      color: 0xffff00, transparent: true, blending: THREE.AdditiveBlending,
    });
    var sprite = new THREE.Sprite( spriteMaterial );
    sprite.scale.set(200, 200, 1.0);
    mesh.add(sprite);
}

addParticleEngine(parameters)
{
  var engine = new ParticleEngine();
  // engine.setValues( Examples.fountain );

  engine.position.set(0,5,0);
    engine.setValues(parameters);
  engine.initialize();

}
getMaterial(string)
{

  //DEFAULT
  var material = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    roughness: 0.8,
    metalness: 0.7,
    //normalMap: materials.normalMap,
    //roughnessMap: materials.roughnessMap,
    //metalnessMap: materials.metalnessMap,
    //envMap: me.reflectionCube,
    skinning: true
  });

  if(string.toLowerCase() == "glass-REAL".toLowerCase())
  {
    var imagePrefix = "./src/images/dawnmountain-";
    var directions  = ["xpos", "xneg", "ypos", "yneg", "zpos", "zneg"];
    var imageSuffix = ".png";
    var skyGeometry = new THREE.CubeGeometry( 5000, 5000, 5000 );

    this.urls = [];
    for (var i = 0; i < 6; i++)
      this.urls.push( imagePrefix + directions[i] + imageSuffix );

    var materialArray = [];
    for (var i = 0; i < 6; i++)
      materialArray.push( new THREE.MeshBasicMaterial({
        map: new THREE.TextureLoader().load( imagePrefix + directions[i] + imageSuffix ),
        side: THREE.BackSide
      }));

    var textureCube = new THREE.CubeTextureLoader().load(this.urls);
    textureCube.mapping = THREE.CubeRefractionMapping;

      var fShader = THREE.FresnelShader;

      var fresnelUniforms =
      {
        "mRefractionRatio": { type: "f", value: 1.02 },
        "mFresnelBias": 	{ type: "f", value: 0.1 },
        "mFresnelPower": 	{ type: "f", value: 2.0 },
        "mFresnelScale": 	{ type: "f", value: 1.0 },
        "tCube": 			{ type: "t", value: textureCube} //textureCube
      };

      // create custom material for the shader
      material = new THREE.ShaderMaterial(
      {
          uniforms: 		fresnelUniforms,
        vertexShader:   fShader.vertexShader,
        fragmentShader: fShader.fragmentShader,
        skinning: true
      }   );
  } else if(string.toLowerCase() == "repeller".toLowerCase())
  {
      material = new THREE.MeshStandardMaterial({
        color: 0xff0000,
        roughness: 0.8,
        metalness: 0.5,
        //normalMap: materials.normalMap,
        //roughnessMap: materials.roughnessMap,
        //metalnessMap: materials.metalnessMap,
        //envMap: me.reflectionCube,
        skinning: true
      });
  }

  return material;
}

addRoomToScene(i, string)
{
      //ADD MODEL
      var localThis = this;
    const texture = new THREE.TextureLoader().load( "./src/images/DeadEnds_globalmaterial.png");
    texture.encoding = THREE.sRGBEncoding;

    var material = new THREE.MeshStandardMaterial({
      color: 0xffff00,
      roughness: 0.5,
      metalness: 0.0,
      // refractionRatio: 0.98,
      envMapIntensity: 1.0,
      map: texture,
      //normalMap: materials.normalMap,
      //roughnessMap: materials.roughnessMap,
      //metalnessMap: materials.metalnessMap,
      //envMap: me.reflectionCube,
      skinning: true,
      normalScale: new THREE.Vector2( 1, -1 )
    });

    //---------------------------------
    //GLTF LOADER
    var loader = new THREE.GLTFLoader();

    //https://blackthread.io/gltf-converter/
    loader.load(
    // resource URL
    string,
    // called when the resource is loaded
    function ( gltf ) {


      localThis.scene.add(gltf.scene);

      //ADD TO DICTIONARY***
      gltf.scene.pathName = string;
      gltf.scene.index = i;
      localThis.roomModels[i] = gltf.scene;

      gltf.scene.position.set(0,4,0);
      gltf.scene.scale.set(0.1,0.1,0.1);

        gltf.scene.updateMatrixWorld(true);

      gltf.scene.traverse(function (node) {

      if (node.isMesh)
      {
        // console.log(node.material.name);
        node.material = localThis.getMaterial(node.material.name);
        //node.material = material;
        node.castShadow = true;
        node.receiveShadow = true;

        //**ADD TO INTERACTIVES
        if(node.name.includes('(repel)'))
        {

          localThis.interactiveMeshes[localThis.interactiveMeshes.length] = node;
          node.initialPosition = node.position;
          node.initialRotation = {
            x: node.rotation.x,
            y: node.rotation.y,
            z: node.rotation.z,
          };
         node.material = localThis.getMaterial('repeller');
         //node.material = localThis.getMaterial('glass-real');

        }
      }
    });

      var myMixer = new THREE.AnimationMixer(gltf.scene);
      localThis.mixers[i] = myMixer;
      myMixer.hasClips = (gltf.animations.length > 0);
        //->PLAY ALL
        // console.log(string+" | "+myMixer.hasClips);
        // if(gltf.animations)
        if(gltf.animations.length > 0)
        {
          var clips = gltf.animations;
          //console.log(clips);

          clips.forEach( function ( clip ) {
               myMixer.clipAction( clip ).play();
              } );
        // -> PLAY A SPECIFIC CLIP
            // var clip = THREE.AnimationClip.findByName( clips, "mixamo.com" );
            // var action = localThis.mixer.clipAction( clip );
            // action.play();
            //action.loop = THREE.LoopOnce;
        }
    },
    // called while loading is progressing
    function ( xhr ) {

      //console.log( ( xhr.loaded / xhr.total * 100 ) + '% loaded' );

    },
    // called when loading has errors
    function ( error ) {

      console.log( 'An error happened' +error);

    }
    );
}

loadRoomModels()
{

  //**When export to glb, make sure no missing images in material
  var paths = [
  // "./src/scripts/elements/dancing.glb",
  "./src/scripts/elements/shapestest.glb"
];

  for(var i = 0; i<paths.length;i++)
  {
    this.addRoomToScene(i, paths[i]);
  }

  //verify

var localThis = this;
  setTimeout( function(){
    console.log("Models length: "+localThis.roomModels.length);

    localThis.roomModels.forEach(function(obj) {
      //console.log(obj.pathName + " | "+obj.index); //this
    });
}  , 3000);
}

updateCurrentRoom()
{
  var localThis = this;
  this.roomModels.forEach(function(obj) {
    obj.visible = (obj.index == localThis.currentRoom);
  });
}

animatedTexturePngs()
{

  var alphaMap = new THREE.TextureLoader().load("./src/images/explosion.jpg"); //also use for diffuse

  var runnerMaterial = new THREE.MeshBasicMaterial( { map: alphaMap, alphaMap: alphaMap, transparent: true, side:THREE.DoubleSide, alphaTest: 0.5 } );
  runnerMaterial.alphaMap.magFilter = THREE.NearestFilter;
  runnerMaterial.alphaMap.wrapT = THREE.RepeatWrapping;
  runnerMaterial.alphaMap.repeat.y = 1;

  var runnerGeometry = new THREE.PlaneGeometry(5, 5, 1, 1);
  var runner = new THREE.Mesh(runnerGeometry, runnerMaterial);
  runner.position.set(0,1,0);
  this.scene.add(runner);

}

  glassSphere()
  {
    //*note for later - just render out a skybox of the scene then feed that into glass shader it will look ok

      var imagePrefix = "./src/images/dawnmountain-";
      var directions  = ["xpos", "xneg", "ypos", "yneg", "zpos", "zneg"];
      var imageSuffix = ".png";
      var skyGeometry = new THREE.CubeGeometry( 5000, 5000, 5000 );

      this.urls = [];
      for (var i = 0; i < 6; i++)
        this.urls.push( imagePrefix + directions[i] + imageSuffix );

      var materialArray = [];
      for (var i = 0; i < 6; i++)
        materialArray.push( new THREE.MeshBasicMaterial({
          map: new THREE.TextureLoader().load( imagePrefix + directions[i] + imageSuffix ),
          side: THREE.BackSide
        }));
          var textureCube = new THREE.CubeTextureLoader().load(this.urls);
  				textureCube.mapping = THREE.CubeRefractionMapping;


  				var cubeMaterial3 = new THREE.MeshPhongMaterial( { color: 0xccddff, envMap: textureCube, refractionRatio: 0.98, reflectivity: 0.9 } );
          var cubeMaterial2 = new THREE.MeshPhongMaterial( { color: 0xccfffd, envMap: textureCube, refractionRatio: 0.985 } );
				var cubeMaterial1 = new THREE.MeshPhongMaterial( { color: 0xffffff, envMap: textureCube, refractionRatio: 0.98 } );
    //------------------------

    this.refractSphereCamera = new THREE.CubeCamera( 0.1, 10000, 512 );
  	this.scene.add( this.refractSphereCamera );

  	var fShader = THREE.FresnelShader;

  	var fresnelUniforms =
  	{
  		"mRefractionRatio": { type: "f", value: 1.02 },
  		"mFresnelBias": 	{ type: "f", value: 0.1 },
  		"mFresnelPower": 	{ type: "f", value: 2.0 },
  		"mFresnelScale": 	{ type: "f", value: 1.0 },
  		"tCube": 			{ type: "t", value: textureCube} //textureCube
  	};

  	// create custom material for the shader
  	var customMaterial = new THREE.ShaderMaterial(
  	{
  	    uniforms: 		fresnelUniforms,
  		vertexShader:   fShader.vertexShader,
  		fragmentShader: fShader.fragmentShader
  	}   );

    const material3 = new THREE.MeshStandardMaterial( {

    color: 0xff0000,

    roughness: 0.3,
    metalness: 0.2
} );

  	var sphereGeometry = new THREE.SphereGeometry( 2, 64, 32 );
  	this.sphere = new THREE.Mesh( sphereGeometry, customMaterial);

  	//this.sphere.position.set(0,9,-10);
    this.sphere.position.set(0,20,0);

  	//this.scene.add(this.sphere);
    this.refractSphereCamera.position.set(new THREE.Vector3(0,0,0));
  	//this.refractSphereCamera.position.set(this.sphere.position);
  }

//ADDS MESHES
  createGrid() {
    this.groupMesh = new THREE.Object3D();

    const material = new THREE.MeshPhysicalMaterial({
      color: '#3e2917',
      metalness: .58,
      emissive: '#000000',
      roughness: .05,
    });

    for (let row = 0; row < this.grid.rows; row++) {
      this.meshes[row] = [];

      for (let index = 0; index < 1; index++) {
        const totalCol = this.getTotalRows(row);

        for (let col = 0; col < totalCol; col++) {
          const geometry = this.getRandomGeometry();
          const mesh = this.getMesh(geometry.geom, material);

          mesh.position.y = 0;
          mesh.position.x = col + (col * this.gutter.size) + (totalCol === this.grid.cols ? 0 : 2.5);
          mesh.position.z = row + (row * (index + .25));

          mesh.rotation.x = geometry.rotationX;
          mesh.rotation.y = geometry.rotationY;
          mesh.rotation.z = geometry.rotationZ;

//Store vars for use later
          mesh.initialRotation = {
            x: mesh.rotation.x,
            y: mesh.rotation.y,
            z: mesh.rotation.z,
          };

          // mesh.name = "Mesh num"+col.toString();

          this.groupMesh.add(mesh);

          this.meshes[row][col] = mesh;
        }
      }
    }

    const centerX = -(this.grid.cols / 2) * this.gutter.size - 1;
    const centerZ = -(this.grid.rows / 2) - .8;

    this.groupMesh.position.set(centerX, 0, centerZ);

    this.scene.add(this.groupMesh);
  }

  getTotalRows(col) {
    return (col % 2 === 0 ? this.grid.cols : this.grid.cols - 1);
  }

  getMesh(geometry, material) {
    const mesh = new THREE.Mesh(geometry, material);

    mesh.castShadow = true;
    mesh.receiveShadow = true;

    return mesh;
  }

  getMouseDistance(mesh)
  {
    //mesh world pos
    var meshWorldPos = new THREE.Vector3();
    mesh.getWorldPosition(meshWorldPos);

    //mouse world pos
    var vector = new THREE.Vector3(this.mouse3D.x, this.mouse3D.y, 0.5); //0.5
    vector.unproject(this.camera );
    var dir = vector.sub(this.camera.position ).normalize();

    var pos = this.camera.position.clone().add( dir.multiplyScalar( 14.8) );

    const mouseDistance = distance
      (pos.x,
      pos.y,
      meshWorldPos.x,
      meshWorldPos.y);

    return mouseDistance;
  }

  draw() {
    this.raycaster.setFromCamera(this.mouse3D, this.camera);


//GRID OF OBJECTS ANIMATE
    // const intersects = this.raycaster.intersectObjects([this.floor]);
    //
    // if (intersects.length) {
    //   const { x, z } = intersects[0].point;
    //
    //   for (let row = 0; row < this.grid.rows; row++) {
    //     for (let index = 0; index < 1; index++) {
    //       const totalCols = this.getTotalRows(row);
    //
    //       for (let col = 0; col < totalCols; col++) {
    //         const mesh = this.meshes[row][col];
    //
    //         const mouseDistance = distance(x, z,
    //           mesh.position.x + this.groupMesh.position.x,
    //           mesh.position.z + this.groupMesh.position.z);
    //
    //         const y = map(mouseDistance, 7, 0, 0, 6);
    //         TweenMax.to(mesh.position, .3, { y: y < 1 ? 1 : y });
    //
    //         //check for interaction -----------
    //         if(y<1)
    //         {
    //           this.mouseIsCloseTo(mesh);
    //         }
    //
    //         const scaleFactor = mesh.position.y / 1.2;
    //         const scale = scaleFactor < 1 ? 1 : scaleFactor;
    //         TweenMax.to(mesh.scale, .3, {
    //           ease: Expo.easeOut,
    //           x: scale,
    //           y: scale,
    //           z: scale,
    //         });
    //
    //         TweenMax.to(mesh.rotation, .7, {
    //           ease: Expo.easeOut,
    //           x: map(mesh.position.y, -1, 1, radians(270), mesh.initialRotation.x),
    //           z: map(mesh.position.y, -1, 1, radians(-90), mesh.initialRotation.z),
    //           y: map(mesh.position.y, -1, 1, radians(45), mesh.initialRotation.y),
    //         });
    //       }
    //     }
    //   }
    // }

//MY OBJECTS ANIMATE -------------------------------
  var localThis = this;
  this.interactiveMeshes.forEach(function(mesh)
  {
          //console.log(localThis.getMouseDistance(mesh));
          var mouseDistance = localThis.getMouseDistance(mesh);
          const y = map(mouseDistance, 3.3, 0, 0, 22); //2nd val- higher = more sensitive, last val is the max height it goes to

          //const y = map(mouseDistance, 7, 0, 0, 6);

          TweenMax.to(mesh.position, .3, { y: y < 1 ? 1 : y });
          //TweenMax.to(mesh.position, .3, { y: y < 1 ? 1 : y });

          const scaleFactor = mesh.position.y / 1.2;
          const scale = scaleFactor < 1 ? 1 : scaleFactor;
          // TweenMax.to(mesh.scale, .3, {
          //   ease: Expo.easeOut,
          //   x: scale,
          //   y: scale,
          //   z: scale,
          // });

          TweenMax.to(mesh.rotation, .9, {
            ease: Expo.easeOut,
            x: map(mesh.position.y, -1, 11, radians(270), mesh.initialRotation.x),
            z: map(mesh.position.y, -1, 11, radians(-90), mesh.initialRotation.z),
            y: map(mesh.position.y, -1, 11, radians(45), mesh.initialRotation.y),
          });
  //
  }); //-----


  }

  mouseIsCloseTo(object)
  {
    //console.log("Mouse is close to "+object.name);
  }

  init() {
    this.runParallax();

    this.setup();

    this.doneLoading();

    this.createScene();

    this.createCamera();

    //this.createGrid();

    //this.addFloor();

    this.addAmbientLight();

    //this.cubeCloud();

    this.addTestObject();

    this.addTextureAnimationObject();

    //this.animatedTexturePngs();

    //this.stemoskiScene();

    this.glassSphere();

    //this.particleemitter();

    //this.glowSphere();

    this.loadRoomModels();

    //this.addModelToScene({ x: 0, y: 5, z: -15 }, "./src/scripts/elements/dancing.glb"); //**model string

    //this.addRectLight();

    //this.addOtherPointLights();

    this.addDirectionalLight();

    this.addPointLight(0xffffff, { x: 0, y: 10, z: -100 }); //the movable one

    this.applyTVShader();

    this.animate();

    this.playAudio();

    this.particlesTest();

    //Interaction setup
    window.addEventListener('resize', this.onResize.bind(this));
    window.addEventListener('touchmove', this.onTouchMove.bind(this), false);
    window.addEventListener('mousemove', this.onMouseMove.bind(this), false);
    window.addEventListener('keydown', this.onKeyDown.bind(this));
 window.addEventListener('mousedown', this.onMouseDown.bind(this));
 window.addEventListener('mouseup', this.onMouseUp.bind(this));
    window.addEventListener('click', this.onClick.bind(this));
    window.addEventListener('wheel', this.onScroll.bind(this), false);
    this.onMouseMove({ clientX: 0, clientY: 0 });


    //bind other divs
      var localThis = this;
      $('.endLoading').click(function(){
          localThis.forceDoneLoading();
      });

      $('.endLoading').hover(function(){
          $('.parallax img').each(function(num)
        {
          if(num == 4)
          {
            $(this).attr({ "src": "../src/images/enterbox-new.png" });
          }
        })
      });
      $('.endLoading').mouseleave(function() {
        $('.parallax img').each(function(num)
      {
        if(num == 4)
        {
          $(this).attr({ "src": "../src/images/percent-new.png" });
        }
      })
      });

    //stats
    (function(){var script=document.createElement('script');script.onload=function(){var stats=new Stats();document.body.appendChild(stats.dom);requestAnimationFrame(function loop(){stats.update();requestAnimationFrame(loop)});};script.src='//mrdoob.github.io/stats.js/build/stats.min.js';document.head.appendChild(script);})()

  }
  onScroll(event)
  {
              if(event.deltaY > 0) { //up

              while(this.scl==0) {

                this.scl+=2.5;
                if(this.camera.position.z <= 9)
                {
                  //this.camera.position.z+=this.scl;

                  TweenMax.to(this.camera.position, .7, {
                        ease: Expo.easeOut,
                        x: this.camera.position.x,
                        y: this.camera.position.y,
                        z: this.camera.position.z+this.scl,
                      });
                }
              }

            } else { //down

              while(this.scl==0) {

                this.scl+=2.5;
                if(this.camera.position.z >= 7)
                {
                  TweenMax.to(this.camera.position, .7, {
                        ease: Expo.easeOut,
                        x: this.camera.position.x,
                        y: this.camera.position.y,
                        z: this.camera.position.z-this.scl,
                      });
                }
              }

            }
            this.scl=0;
      window.setInterval(function(){
         this.scl=0;
      }, 10);
    // console.log(this.camera.position.z);
    //this.camera.position.set(this.camera.position.x, this.camera.position.y, 10);
    //https://greensock.com/ease-visualizer/

  }

  onMouseDown()
  {
    this.mouseDown++;
  }
  onMouseUp()
  {
    this.mouseDown--;
  }

  onClick({ clientX, clientY })
  {
    // console.log($('#audioplayer')[0]);
    //$('#audioplayer')[0].play(); //this will FUCK UP REST OF APP SKYLAR
    $('#audioplayer')[0].muted = false;
  }

  onMouseMove({ clientX, clientY }) {


    this.mouse3D.x = (clientX / this.width) * 2 - 1;
    this.mouse3D.y = -(clientY / this.height) * 2 + 1;
    //this.mouse3D.updateMatrixWorld(true);

    this.mouse.x = (clientX - this.windowHalf.x );
    this.mouse.y = (clientY - this.windowHalf.x );

    if(this.mouse.y > this.height * 0.092 && this.mouseDown)
    {
      this.startLoading(true);
    } else {
      this.startLoading(false);
      this.loadingHasStarted = false;
    }

    //track to mouse
  var vector = new THREE.Vector3(this.mouse3D.x, this.mouse3D.y, 0.5); //0.5
	vector.unproject( this.camera );
	var dir = vector.sub( this.camera.position ).normalize();
	var distance = - this.camera.position.z / dir.z;

	var pos = this.camera.position.clone().add( dir.multiplyScalar( 14.8) ); //distance = z distance

  //var lightPos = new THREE.Vector3(pos.x, pos.y, 6);
	this.movableLight.position.copy(pos);

  //SHADER
  // this.uniforms.u_mouse.value.set(this.mouse.x, window.innerHeight - this.mouse.y).multiplyScalar(
  //     window.devicePixelRatio);

    this.uniforms.u_mouse.value.set(clientX, clientY).multiplyScalar(
		window.devicePixelRatio);

  }

  onTouchMove({ clientX, clientY }) {

    // //shader
    // this.uniforms.u_mouse.value.set(event.touches[0].pageX, window.innerHeight - event.touches[0].pageY).multiplyScalar(
    //    window.devicePixelRatio);
  }

  triggerRoomChange()
  {
    //TRIGGER ROOM CHANGE
      this.currentRoom++;
      this.roomTransition();
  }
onKeyDown(event)
{

  //do this when come in from loading
  if(event.key == "Enter")
  {
      this.forceDoneLoading();
  }

        if(this.videoTex)
        {
          this.videoTex.play();
        }

  //console.log("keydown "+event.key);
  if(event.key == 0)
  {
    if(this.currentRoom < $('.bottomTitle .dots li').length)
    {
      this.triggerRoomChange();
    }
  }

if(this.middleMenuIsUp)
{
    if(event.key == "ArrowRight")
    {
      if(this.midMenuIndex < 2)
      {
        this.midMenuIndex++;
      }
    } else if (event.key == "ArrowLeft")
    {
      if(this.midMenuIndex > 0)
      {
        this.midMenuIndex--;
      }
    }
    var self = this;
      $('.middleMenu .dots li').each(function(){

        if($(this).index() <= self.midMenuIndex)
        {
          $(this).addClass('active');
        } else {
          $(this).removeClass('active');
        }
      });
}

}

// isCloseTo(target)
// {
//   return (new THREE.Vector3(this.mouse.x, this.mouse.y, target.position.z).distanceTo(target.position)) <= 100;
// }

  onResize() {
    this.width = window.innerWidth;
    this.height = window.innerHeight;

    this.windowHalf.set( this.width / 2, this.height / 2 );

    this.camera.aspect = this.width / this.height;
    this.camera.updateProjectionMatrix();

    this.composer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setSize(this.width, this.height);

    //shader
    // Update the resolution uniform
		this.uniforms.u_resolution.value.set(window.innerWidth, window.innerHeight).multiplyScalar(window.devicePixelRatio);
  }

  render() {
    this.uniforms.u_time.value = this.clock.getElapsedTime();
    this.uniforms.u_frame.value += 1.0;
    this.composer.render();
	}

//UPDATE
  animate() {

    this.draw();

    const resistance = 0.002;
    this.target.x = ( 1 - this.mouse.x ) * resistance;
    this.target.y = ( 1 - this.mouse.y ) * resistance;

    this.camera.rotation.x += 0.05 * ( this.target.y - this.camera.rotation.x );
    this.camera.rotation.y += 0.05 * ( this.target.x - this.camera.rotation.y );

    //anything glass----------
    this.sphere.visible = false;
        //this.refractSphereCamera.clear();
        //this.refractSphereCamera.updateCubeMap( this.renderer, this.scene );
      //this.refractSphereCamera.update();
      this.sphere.visible = true;
    //-------------------------


//other logic
this.effect.renderToScreen = this.mouseDown;
this.audio.volume = this.loadingHasStarted ? 0.2 : this.audioVolume;

//--ANIMATE MODELS------------------------------
//this.mixer.update(this.clock.getDelta());

if(this.mixers.length > 0)
{
  for(var i = 0; i< this.mixers.length;i++)
  {
    if(this.mixers[i])
    {
      this.mixers[i].update(this.clock.getDelta());
    }
  }
}
//-------------------

//this.updateCurrentRoom(); //shows only one

//console.log(this.uniforms.u_frame);

    this.renderer.render(this.scene, this.camera);

    requestAnimationFrame(this.animate.bind(this));

    //render shader
    this.render();

//UI
    var self = this;
      $('.bottomTitle .dots li').each(function(){

        if($(this).index() == self.currentRoom)
        {
          $(this).addClass('active');
        } else {
          $(this).removeClass('active');
        }
      });
  }
}
