/*
 * UBC CPSC 314 (2016_W1)
 * Assignment 2
 */

 

// we aren't allowed to use the built-in THREEJS helpers so I made my own, hahaha.
var channel = 0;

function toRadians (angle) {
  return angle * (Math.PI / 180);
}

function getXRotationMatrix(angle) {
  return new THREE.Matrix4().set(
  1.0,0.0,0.0,0.0,
  0.0,Math.cos(toRadians(angle)),-1.0 * Math.sin(toRadians(angle)),0.0,
  0.0,Math.sin(toRadians(angle)),Math.cos(toRadians(angle)),0.0,
  0.0,0.0,0.0,1.0 );
}

function getYRotationMatrix(angle) {
  return new THREE.Matrix4().set(
  Math.cos(toRadians(angle)),0.0,Math.sin(toRadians(angle)),0.0,
  0.0,1.0,0.0,0.0,
  -1.0 * Math.sin(toRadians(angle)),0.0,Math.cos(toRadians(angle)),0.0,
  0.0,0.0,0.0,1.0);
}

function getZRotationMatrix(angle) {
  return new THREE.Matrix4().set(
  Math.cos(toRadians(angle)),-1.0 * Math.sin(toRadians(angle)),0.0,0.0,
  Math.sin(toRadians(angle)),Math.cos(toRadians(angle)),0.0,0.0,
  0.0,0.0,1.0,0.0,
  0.0,0.0,0.0,1.0);
}

function getCompositeRotation(xAxis, yAxis, zAxis) {
  var m = new THREE.Matrix4();
  var xRotation = getXRotationMatrix(xAxis);
  var yRotation = getYRotationMatrix(yAxis);
  var zRotation = getZRotationMatrix(zAxis);
  m.multiplyMatrices(xRotation, yRotation);
  m.multiply(zRotation);
  return m;
}

function getTranslationMatrix(x,y,z) {
  return new THREE.Matrix4().set(
    1.0,0.0,0.0,x,
    0.0,1.0,0.0,y,
    0.0,0.0,1.0,z,
    0.0,0.0,0.0,1.0
    );
}

function getScaleMatrix(x,y,z) {
  return new THREE.Matrix4().set(
    x,0.0,0.0,0.0,
    0.0,y,0.0,0.0,
    0.0,0.0,z,0.0,
    0.0,0.0,0.0,1.0
    );
}

//TODO: 

function generateTentacle(id) {
  // 1. -x, 0, z
  // 2. x, 0, z
  // 3. -x, 0, -z
  // 4. x, 0, -z
}

// ASSIGNMENT-SPECIFIC API EXTENSION
THREE.Object3D.prototype.setMatrix = function(a) {
  this.matrix=a;
  this.matrix.decompose(this.position,this.quaternion,this.scale);
}


// SETUP RENDERER AND SCENE
var scene = new THREE.Scene();
var renderer = new THREE.WebGLRenderer();
renderer.setClearColor(0xffffff); // white background colour
document.body.appendChild(renderer.domElement);


// SETUP CAMERA
var camera = new THREE.PerspectiveCamera(30, 1, 0.1, 1000); // view angle, aspect ratio, near, far
camera.position.set(-28,10,28);
camera.lookAt(scene.position);
scene.add(camera);


// SETUP ORBIT CONTROL OF THE CAMERA
var controls = new THREE.OrbitControls(camera);
controls.damping = 0.2;


// ADAPT TO WINDOW RESIZE
function resize() {
  renderer.setSize(window.innerWidth, window.innerHeight);
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
}

window.addEventListener('resize', resize);
resize();


// FLOOR WITH CHECKERBOARD 
var floorTexture = new THREE.ImageUtils.loadTexture('images/checkerboard.jpg');
floorTexture.wrapS = floorTexture.wrapT = THREE.RepeatWrapping;
floorTexture.repeat.set(4, 4);

var floorMaterial = new THREE.MeshBasicMaterial({ map: floorTexture, side: THREE.DoubleSide });
var floorGeometry = new THREE.PlaneBufferGeometry(30, 30);
var floor = new THREE.Mesh(floorGeometry, floorMaterial);
floor.position.y = 0;
floor.rotation.x = Math.PI / 2;
scene.add(floor);




// MATERIALS
var normalMaterial = new THREE.MeshNormalMaterial();

// OCTOPUS MATERIAL
//You must change this matrix in updateBody() if you want to animate the octopus head.
var octopusMatrix = {type: 'm4', value: new THREE.Matrix4().set(
  1.0,0.0,0.0,0.0, 
  0.0,1.0,0.0,3.0, 
  0.0,0.0,1.0,0.0, 
  0.0,0.0,0.0,1.0
  )};
var octopusMaterial = new THREE.ShaderMaterial({
  uniforms:{
    octopusMatrix: octopusMatrix,
  },
});

var shaderFiles = [
  'glsl/octopus.vs.glsl',
  'glsl/octopus.fs.glsl'
];
new THREE.SourceLoader().load(shaderFiles, function(shaders) {
  octopusMaterial.vertexShader = shaders['glsl/octopus.vs.glsl'];
  octopusMaterial.fragmentShader = shaders['glsl/octopus.fs.glsl'];
})


// GEOMETRY

//Here we load the octopus geometry from a .obj file, just like the dragon
function loadOBJ(file, material, scale, xOff, yOff, zOff, xRot, yRot, zRot) {
  var onProgress = function(query) {
    if ( query.lengthComputable ) {
      var percentComplete = query.loaded / query.total * 100;
      console.log( Math.round(percentComplete, 2) + '% downloaded' );

    }
  };

  var onError = function() {
    console.log('Failed to load ' + file);
  };

  var loader = new THREE.OBJLoader();
  loader.load(file, function(object) {
    object.traverse(function(child) {
      if (child instanceof THREE.Mesh) {
        child.material = material;
      }
    });
    object.position.set(xOff,yOff,zOff);
    object.rotation.x= xRot;
    object.rotation.y = yRot;
    object.rotation.z = zRot;
    object.scale.set(scale,scale,scale);
    scene.add(object);
  }, onProgress, onError);
  
}

//We keep the octopus at (0,0,0) and without any offset or scale factor, so we can change these values with transformation matrices.
loadOBJ('obj/Octopus_04_A.obj',octopusMaterial,1.0,0,0,0,0,0,0);


//Eyes

//We create a sphereGeometry for the eyes and the pupils
var eyeGeometry = new THREE.SphereGeometry(1.0,64,64);

var eye_R = new THREE.Mesh(eyeGeometry,normalMaterial);
//This Matrix for the right eye includes translation and scale
var eyeTSMatrix_R = new THREE.Matrix4().set(
  0.5,0.0,0.0,-0.2, 
  0.0,0.5,0.0,4.1, 
  0.0,0.0,0.5,-0.92, 
  0.0,0.0,0.0,1.0
  );
//Here we relate the eye with the octopus by multiplying their matrices
var octopusEye_RMatrix = new THREE.Matrix4().multiplyMatrices(octopusMatrix.value, eyeTSMatrix_R);
eye_R.setMatrix(octopusEye_RMatrix);
scene.add(eye_R);
//Right eye pupil translation and scale matrix
var pupilMatrix_R = new THREE.Matrix4().set(
  0.35,0.0,0.0,0.0, 
  0.0,0.35,0.0,0.0, 
  0.0,0.0,0.15,-0.9, 
  0.0,0.0,0.0,1.0
  );
var cosTheta = Math.cos(Math.PI * (-50 /180.0));
var sinTheta = Math.sin(Math.PI * (-50 /180.0));
//This is a rotation matrix for the right pupil
var pupilRotMatrix_R = new THREE.Matrix4().set(
  cosTheta,0.0,-sinTheta,0.0, 
  0.0,1.0,0.0,0.0, 
  sinTheta,0.0,cosTheta,0.0, 
  0.0,0.0,0.0,1.0
  );
var pupilTSRMatrix_R = new THREE.Matrix4().multiplyMatrices(pupilRotMatrix_R, pupilMatrix_R);
var eyePupilMatrix_R = new THREE.Matrix4().multiplyMatrices(octopusEye_RMatrix, pupilTSRMatrix_R);
var pupil_R = new THREE.Mesh(eyeGeometry,normalMaterial);
pupil_R.setMatrix(eyePupilMatrix_R);
scene.add(pupil_R);

var eye_L = new THREE.Mesh(eyeGeometry,normalMaterial);
//Left eye translation and scale matrix
var eyeTSMatrix_L = new THREE.Matrix4().set(
  0.5,0.0,0.0,-0.2, 
  0.0,0.5,0.0,4.1, 
  0.0,0.0,0.5,0.92, 
  0.0,0.0,0.0,1.0
  );
var octopusEye_LMatrix = new THREE.Matrix4().multiplyMatrices(octopusMatrix.value, eyeTSMatrix_L);
eye_L.setMatrix(octopusEye_LMatrix);
scene.add(eye_L);
//Left eye pupil translation and scale matrix
var pupilMatrix_L = new THREE.Matrix4().set(
  0.35,0.0,0.0,0.0, 
  0.0,0.35,0.0,0.0, 
  0.0,0.0,0.15,-0.9, 
  0.0,0.0,0.0,1.0
  );
cosTheta = Math.cos(Math.PI * (-130 /180.0));
sinTheta = Math.sin(Math.PI * (-130 /180.0));
var pupilRotMatrix_L = new THREE.Matrix4().set(
  cosTheta,0.0,-sinTheta,0.0, 
  0.0,1.0,0.0,0.0, 
  sinTheta,0.0,cosTheta,0.0, 
  0.0,0.0,0.0,1.0
  );
var pupilTSRMatrix_L = new THREE.Matrix4().multiplyMatrices(pupilRotMatrix_L, pupilMatrix_L);
var eyePupilMatrix_L = new THREE.Matrix4().multiplyMatrices(octopusEye_LMatrix, pupilTSRMatrix_L);
var pupil_L = new THREE.Mesh(eyeGeometry,normalMaterial);
pupil_L.setMatrix(eyePupilMatrix_L);
scene.add(pupil_L);


//Tentacle socket
//This point indicates the position for the first tentacle socket, you must figure out the other positions, (you get extra points if it is algorithmically)
var tentacleSocket1Matrix = new THREE.Matrix4().set(
  1.0,0.0,0.0,-2.4, 
  0.0,1.0,0.0,-0.35, 
  0.0,0.0,1.0,2.4, 
  0.0,0.0,0.0,1.0
  );
var tentacleSocket2Matrix = new THREE.Matrix4().set(
  1.0,0.0,0.0,2.4, 
  0.0,1.0,0.0,-0.35, 
  0.0,0.0,1.0,2.4, 
  0.0,0.0,0.0,1.0
  );
var tentacleSocket3Matrix = new THREE.Matrix4().set(
  1.0,0.0,0.0,-2.4, 
  0.0,1.0,0.0,-0.35, 
  0.0,0.0,1.0,-2.4, 
  0.0,0.0,0.0,1.0
  );
var tentacleSocket4Matrix = new THREE.Matrix4().set(
  1.0,0.0,0.0,2.4, 
  0.0,1.0,0.0,-0.35, 
  0.0,0.0,1.0,-2.4, 
  0.0,0.0,0.0,1.0
  );
var octopusSocket1Matrix = new THREE.Matrix4().multiplyMatrices(octopusMatrix.value, tentacleSocket1Matrix);
var octopusSocket2Matrix = new THREE.Matrix4().multiplyMatrices(octopusMatrix.value, tentacleSocket2Matrix);
var octopusSocket3Matrix = new THREE.Matrix4().multiplyMatrices(octopusMatrix.value, tentacleSocket3Matrix);
var octopusSocket4Matrix = new THREE.Matrix4().multiplyMatrices(octopusMatrix.value, tentacleSocket4Matrix);
var tentacleSocketGeometry = new THREE.Geometry();
tentacleSocketGeometry.vertices.push(new THREE.Vector3(0, 0, 0));
var tentacleSocketMaterial = new THREE.PointCloudMaterial( { size: 10, sizeAttenuation: false, color:0xff0000} );
var tentacle1Socket = new THREE.PointCloud( tentacleSocketGeometry, tentacleSocketMaterial );
var tentacle2Socket = new THREE.PointCloud( tentacleSocketGeometry, tentacleSocketMaterial );
var tentacle3Socket = new THREE.PointCloud( tentacleSocketGeometry, tentacleSocketMaterial );
var tentacle4Socket = new THREE.PointCloud( tentacleSocketGeometry, tentacleSocketMaterial );
tentacle1Socket.setMatrix(octopusSocket1Matrix);
tentacle2Socket.setMatrix(octopusSocket2Matrix);
tentacle3Socket.setMatrix(octopusSocket3Matrix);
tentacle4Socket.setMatrix(octopusSocket4Matrix);
scene.add(tentacle1Socket);
scene.add(tentacle2Socket);
scene.add(tentacle3Socket);
scene.add(tentacle4Socket);


//create tentacles and add them to the scene here (at least two cylinders per tentacle):

//Example of tentacle's links

var baseTentacleHeight = 3;

// TENTACLE 1

var tentacle_01Link_01G = new THREE.CylinderGeometry(0.35,0.45,baseTentacleHeight,64);
var tentacle01_Link01Matrix = new THREE.Matrix4().set(
 1.0,0.0,0.0,0.0, 
  0.0,1.0,0.0,0.0, 
 0.0,0.0,1.0,0.0, 
  0.0,0.0,0.0,1.0
);
var t_01_l_01_Matrix = new THREE.Matrix4().multiplyMatrices(octopusSocket1Matrix, tentacle01_Link01Matrix);
// ROTATE X by 90 degrees
var t1rotationMatrix = getCompositeRotation(0,45,90);
var t1l1translationMatrix = getTranslationMatrix(-baseTentacleHeight/4.0,0,baseTentacleHeight/4.0);
t_01_l_01_Matrix.multiply(t1l1translationMatrix);
t_01_l_01_Matrix.multiply(t1rotationMatrix);
var tentacle_01Link_01 = new THREE.Mesh(tentacle_01Link_01G,normalMaterial);
tentacle_01Link_01.setMatrix(t_01_l_01_Matrix);
scene.add(tentacle_01Link_01);

// T1 LINK TWO 

var tentacle_01Link_02G = new THREE.CylinderGeometry(0.15,0.30,3,64);
var tentacle_01Link_02GMatrix = new THREE.Matrix4().set(
  1.0,0.0,0.0,0.0, 
  0.0,1.0,0.0,0.0, 
  0.0,0.0,1.0,0.0, 
  0.0,0.0,0.0,1.0
  );
var t_01_l_02_Matrix = new THREE.Matrix4().multiplyMatrices(t_01_l_01_Matrix, tentacle_01Link_02GMatrix);
var t1l2translationMatrix = getTranslationMatrix(0,baseTentacleHeight,0);
t_01_l_02_Matrix.multiply(t1l2translationMatrix);
var tentacle_01Link_02 = new THREE.Mesh(tentacle_01Link_02G,normalMaterial);
tentacle_01Link_02.setMatrix(t_01_l_02_Matrix);
scene.add(tentacle_01Link_02);


// TENTACLE 2

var tentacle_02Link_01G = new THREE.CylinderGeometry(0.35,0.45,baseTentacleHeight,64);
var tentacle02_Link01Matrix = new THREE.Matrix4().set(
 1.0,0.0,0.0,0.0, 
  0.0,1.0,0.0,0.0, 
 0.0,0.0,1.0,0.0, 
  0.0,0.0,0.0,1.0
);
var t_02_l_01_Matrix = new THREE.Matrix4().multiplyMatrices(octopusSocket2Matrix, tentacle02_Link01Matrix);
// ROTATE X by 90 degrees
var t2rotationMatrix = getCompositeRotation(0,135,90);
var t2l1translationMatrix = getTranslationMatrix(baseTentacleHeight/4.0,0,baseTentacleHeight/4.0);
t_02_l_01_Matrix.multiply(t2l1translationMatrix);
t_02_l_01_Matrix.multiply(t2rotationMatrix);
var tentacle_02Link_01 = new THREE.Mesh(tentacle_01Link_01G,normalMaterial);
tentacle_02Link_01.setMatrix(t_02_l_01_Matrix);
scene.add(tentacle_02Link_01);

// T2 LINK TWO 
var tentacle_02Link_02G = new THREE.CylinderGeometry(0.15,0.30,3,64);
var tentacle_02Link_02GMatrix = new THREE.Matrix4().set(
  1.0,0.0,0.0,0.0, 
  0.0,1.0,0.0,0.0, 
  0.0,0.0,1.0,0.0, 
  0.0,0.0,0.0,1.0
  );
var t_02_l_02_Matrix = new THREE.Matrix4().multiplyMatrices(t_02_l_01_Matrix, tentacle_02Link_02GMatrix);
var t2l2translationMatrix = getTranslationMatrix(0,baseTentacleHeight,0);
t_02_l_02_Matrix.multiply(t2l2translationMatrix);
var tentacle_02Link_02 = new THREE.Mesh(tentacle_02Link_02G,normalMaterial);
tentacle_02Link_02.setMatrix(t_02_l_02_Matrix);
scene.add(tentacle_02Link_02);


// TENTACLE 3

var tentacle_03Link_01G = new THREE.CylinderGeometry(0.35,0.45,baseTentacleHeight,64);
var tentacle03_Link01Matrix = new THREE.Matrix4().set(
 1.0,0.0,0.0,0.0, 
  0.0,1.0,0.0,0.0, 
 0.0,0.0,1.0,0.0, 
  0.0,0.0,0.0,1.0
);
var t_03_l_01_Matrix = new THREE.Matrix4().multiplyMatrices(octopusSocket3Matrix, tentacle03_Link01Matrix);
// ROTATE X by 90 degrees
var t3rotationMatrix = getCompositeRotation(0,-45,90);
var t3l1translationMatrix = getTranslationMatrix(-baseTentacleHeight/4.0,0,-baseTentacleHeight/4.0);
t_03_l_01_Matrix.multiply(t3l1translationMatrix);
t_03_l_01_Matrix.multiply(t3rotationMatrix);
var tentacle_03Link_01 = new THREE.Mesh(tentacle_03Link_01G,normalMaterial);
tentacle_03Link_01.setMatrix(t_03_l_01_Matrix);
scene.add(tentacle_03Link_01);

// T3 LINK TWO 
var tentacle_03Link_02G = new THREE.CylinderGeometry(0.15,0.30,3,64);
var tentacle_03Link_02GMatrix = new THREE.Matrix4().set(
  1.0,0.0,0.0,0.0, 
  0.0,1.0,0.0,0.0, 
  0.0,0.0,1.0,0.0, 
  0.0,0.0,0.0,1.0
  );
var t_03_l_02_Matrix = new THREE.Matrix4().multiplyMatrices(t_03_l_01_Matrix, tentacle_03Link_02GMatrix);
var t3l2translationMatrix = getTranslationMatrix(0,baseTentacleHeight,0);
t_03_l_02_Matrix.multiply(t3l2translationMatrix);
var tentacle_03Link_02 = new THREE.Mesh(tentacle_03Link_02G,normalMaterial);
tentacle_03Link_02.setMatrix(t_03_l_02_Matrix);
scene.add(tentacle_03Link_02);


// TENTACLE 4

var tentacle_04Link_01G = new THREE.CylinderGeometry(0.35,0.45,baseTentacleHeight,64);
var tentacle04_Link01Matrix = new THREE.Matrix4().set(
 1.0,0.0,0.0,0.0, 
  0.0,1.0,0.0,0.0, 
 0.0,0.0,1.0,0.0, 
  0.0,0.0,0.0,1.0
);
var t_04_l_01_Matrix = new THREE.Matrix4().multiplyMatrices(octopusSocket4Matrix, tentacle04_Link01Matrix);
// ROTATE X by 90 degrees
var t4rotationMatrix = getCompositeRotation(0,-135,90);
var t4l1translationMatrix = getTranslationMatrix(baseTentacleHeight/4.0,0,-baseTentacleHeight/4.0);
t_04_l_01_Matrix.multiply(t4l1translationMatrix);
t_04_l_01_Matrix.multiply(t4rotationMatrix);
var tentacle_04Link_01 = new THREE.Mesh(tentacle_04Link_01G,normalMaterial);
tentacle_04Link_01.setMatrix(t_04_l_01_Matrix);
scene.add(tentacle_04Link_01);

// T3 LINK TWO 
var tentacle_04Link_02G = new THREE.CylinderGeometry(0.15,0.30,3,64);
var tentacle_04Link_02GMatrix = new THREE.Matrix4().set(
  1.0,0.0,0.0,0.0, 
  0.0,1.0,0.0,0.0, 
  0.0,0.0,1.0,0.0, 
  0.0,0.0,0.0,1.0
  );
var t_04_l_02_Matrix = new THREE.Matrix4().multiplyMatrices(t_04_l_01_Matrix, tentacle_04Link_02GMatrix);
var t4l2translationMatrix = getTranslationMatrix(0,baseTentacleHeight,0);
t_04_l_02_Matrix.multiply(t4l2translationMatrix);
var tentacle_04Link_02 = new THREE.Mesh(tentacle_04Link_02G,normalMaterial);
tentacle_04Link_02.setMatrix(t_04_l_02_Matrix);
scene.add(tentacle_04Link_02);





//APPLY DIFFERENT EFFECTS TO DIFFERNET CHANNELS

var clock = new THREE.Clock(true);
function updateBody() {

  switch(channel)
  {
    //add poses here:
    case 0: 
      // DEFAULT "T-POSE"
      break;

    case 1:
      // SPIDER MODE
      break;

    case 2:

      break;

    //animation
    case 3:
      {
        var t = clock.getElapsedTime();

        //animate octopus here:
       
      }

      break;
    default:
      break;
  }
}


// LISTEN TO KEYBOARD
var keyboard = new THREEx.KeyboardState();

function checkKeyboard() {
  for (var i=0; i<6; i++)
  {
    if (keyboard.pressed(i.toString()))
    {
      channel = i;
      break;
    }
  }
}


// SETUP UPDATE CALL-BACK
function update() {
  checkKeyboard();
  updateBody();
  requestAnimationFrame(update);
  renderer.render(scene, camera);
}

update();