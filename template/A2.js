/*
 * UBC CPSC 314 (2016_W1)
 * Assignment 2
 */

 

// we aren't allowed to use the built-in THREEJS helpers so I made my own, hahaha.
var channel = 0;
var rotationOffsetLinkOne = 0;
var rotationOffsetLinkTwo = 0;
var newPose = true;

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

function generateTentacleLinkOneMatrix(id) {
  var parentSocket = null;
  var translationMatrix = getTranslationMatrix(0,baseTentacleHeight/2.0,0);
  if (id == 1) {
    parentSocket = joint1Matrix;
  }
  else if (id == 2) {
    parentSocket = joint2Matrix;
  }
  else if (id == 3) {
    parentSocket = joint3Matrix;
  }
  else if (id == 4) {
    parentSocket = joint4Matrix;
  }
  return new THREE.Matrix4().multiplyMatrices(parentSocket, baseTentacleMatrix).multiply(translationMatrix);
  // 1. -x, 0, z
  // 2. x, 0, z
  // 3. -x, 0, -z
  // 4. x, 0, -z
}

function generateTentacleLinkTwoMatrix(id) {
  var parentTentacle;
  var translationMatrix = getTranslationMatrix(0, 0.75 * baseTentacleHeight, 0);
  if(id == 1) {
    parentTentacle = babbyJoint1Matrix;
  }
  else if (id == 2) {
    parentTentacle = babbyJoint2Matrix;
  }
  else if (id == 3) {
    parentTentacle = babbyJoint3Matrix;
  }
  else if (id == 4) {
    parentTentacle = babbyJoint4Matrix;
  }
  else {
    return baseTentacleMatrix;
  }
  return new THREE.Matrix4().multiplyMatrices(parentTentacle, baseTentacleMatrix).multiply(translationMatrix);
}

function generateLinkOneJointMatrix(id) {
  var parentSocket;
  var rotationMatrix;
  var rotationOffset = getCompositeRotation(0, 0, rotationOffsetLinkOne);
  if (id == 1) {
    parentSocket = octopusSocket1Matrix;
    rotationMatrix = getCompositeRotation(0,45,90);
  }
  else if (id == 2) {
    parentSocket = octopusSocket2Matrix;
    rotationMatrix = getCompositeRotation(0,135,90);
  }
  else if (id == 3) {
    parentSocket = octopusSocket3Matrix;
    rotationMatrix = getCompositeRotation(0,-45,90);
  }
  else if (id == 4) {
    parentSocket = octopusSocket4Matrix;
    rotationMatrix = getCompositeRotation(0,-135,90);
  }
  else {
    return baseTentacleMatrix;
  }
  return new THREE.Matrix4().multiplyMatrices(parentSocket, jointMatrix).multiply(rotationMatrix).multiply(rotationOffset);
}

function generateLinkTwoJointMatrix(id) {
  var parentSocket;
  var translationMatrix = getTranslationMatrix(0, 0.75 * baseTentacleHeight, 0);
  var rotationOffset = getCompositeRotation(0,0,rotationOffsetLinkTwo);
  if (id == 1) {
    parentSocket = t_01_l_01_Matrix;
  }
  else if (id == 2) {
    parentSocket = t_02_l_01_Matrix;
  }
  else if (id == 3) {
    parentSocket = t_03_l_01_Matrix;
  }
  else if (id == 4) {
    parentSocket = t_04_l_01_Matrix;
  }
  else {
    return baseTentacleMatrix;
  }
  return new THREE.Matrix4().multiplyMatrices(parentSocket, babbyJointMatrix).multiply(translationMatrix).multiply(rotationOffset);
}

function poseLinkOne() {
  var rotationOffsetMatrix;
  rotationOffsetMatrix = getCompositeRotation(rotationOffsetLinkOne, 0, rotationOffsetLinkOne);
  joint1Matrix.multiply(rotationOffsetMatrix);
  joint2Matrix.multiply(rotationOffsetMatrix);
  joint3Matrix.multiply(rotationOffsetMatrix);
  joint4Matrix.multiply(rotationOffsetMatrix);
  updateJoints();
}

function poseLinkTwo() {
  var rotationOffsetMatrix;
  resetJoints();
  rotationOffsetMatrix = getCompositeRotation(rotationOffsetLinkTwo, 0,rotationOffsetLinkTwo);
  babbyJoint1Matrix.multiply(rotationOffsetMatrix);
  babbyJoint2Matrix.multiply(rotationOffsetMatrix);
  babbyJoint3Matrix.multiply(rotationOffsetMatrix);
  babbyJoint4Matrix.multiply(rotationOffsetMatrix);
  updateJoints();
}

function animateLinkOne() {

}
function animateLinkTwo() {

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

var jointGeometry = new THREE.SphereGeometry(10, 16, 16);
var octopusSocket1Matrix = new THREE.Matrix4().multiplyMatrices(octopusMatrix.value, tentacleSocket1Matrix);
var octopusSocket2Matrix = new THREE.Matrix4().multiplyMatrices(octopusMatrix.value, tentacleSocket2Matrix);
var octopusSocket3Matrix = new THREE.Matrix4().multiplyMatrices(octopusMatrix.value, tentacleSocket3Matrix);
var octopusSocket4Matrix = new THREE.Matrix4().multiplyMatrices(octopusMatrix.value, tentacleSocket4Matrix);
var tentacleSocketGeometry = new THREE.Geometry();
tentacleSocketGeometry.vertices.push(new THREE.Vector3(0, 0, 0));
var tentacleSocketMaterial = new THREE.PointCloudMaterial( { size: 10, sizeAttenuation: false, color:0xff0000} );
var tentacle1Socket = new THREE.PointCloud( tentacleSocketGeometry, normalMaterial );
var tentacle2Socket = new THREE.PointCloud( tentacleSocketGeometry, normalMaterial );
var tentacle3Socket = new THREE.PointCloud( tentacleSocketGeometry, normalMaterial );
var tentacle4Socket = new THREE.PointCloud( tentacleSocketGeometry, normalMaterial );
tentacle1Socket.setMatrix(octopusSocket1Matrix);
tentacle2Socket.setMatrix(octopusSocket2Matrix);
tentacle3Socket.setMatrix(octopusSocket3Matrix);
tentacle4Socket.setMatrix(octopusSocket4Matrix);
scene.add(tentacle1Socket);
scene.add(tentacle2Socket);
scene.add(tentacle3Socket);
scene.add(tentacle4Socket);

// create joints and add

var jointMatrix = new THREE.Matrix4().set(
  1.0,0.0,0.0,0.0, 
  0.0,1.0,0.0,0.0, 
  0.0,0.0,1.0,0.0, 
  0.0,0.0,0.0,1.0
  );

var babbyJointMatrix = new THREE.Matrix4().set(
  1.0, 0.0, 0.0, 0.0,
  0.0, 1.0, 0.0, 0.0,
  0.0, 0.0, 1.0, 0.0,
  0.0, 0.0, 0.0, 1.0
  )

var jointGeo = new THREE.SphereGeometry(0.60, 64, 64);


var joint1Matrix = generateLinkOneJointMatrix(1);
var joint2Matrix = generateLinkOneJointMatrix(2)
var joint3Matrix = generateLinkOneJointMatrix(3);
var joint4Matrix = generateLinkOneJointMatrix(4);

var tentacle1L1joint = new THREE.Mesh(jointGeo,normalMaterial);
var tentacle2L1joint = new THREE.Mesh(jointGeo,normalMaterial);
var tentacle3L1joint = new THREE.Mesh(jointGeo,normalMaterial);
var tentacle4L1joint = new THREE.Mesh(jointGeo,normalMaterial);

tentacle1L1joint.setMatrix(joint1Matrix);
tentacle2L1joint.setMatrix(joint2Matrix);
tentacle3L1joint.setMatrix(joint3Matrix);
tentacle4L1joint.setMatrix(joint4Matrix);

scene.add(tentacle1L1joint);
scene.add(tentacle2L1joint);
scene.add(tentacle3L1joint);
scene.add(tentacle4L1joint);



//create tentacles and add them to the scene here (at least two cylinders per tentacle):

//Example of tentacle's links

var baseTentacleHeight = 3;
var baseTentacleMatrix = new THREE.Matrix4().set(
 1.0,0.0,0.0,0.0, 
  0.0,1.0,0.0,0.0, 
 0.0,0.0,1.0,0.0, 
  0.0,0.0,0.0,1.0
);
var tentacleL01Geom = new THREE.CylinderGeometry(0.35,0.45,baseTentacleHeight,64);
var tentacleL02Geom = new THREE.CylinderGeometry(0.01,0.30,baseTentacleHeight,64);

// TENTACLE 1

var t_01_l_01_Matrix = generateTentacleLinkOneMatrix(1);
var tentacle_01Link_01 = new THREE.Mesh(tentacleL01Geom,normalMaterial);
tentacle_01Link_01.setMatrix(t_01_l_01_Matrix);
scene.add(tentacle_01Link_01);

// TENTACLE 2

var t_02_l_01_Matrix = generateTentacleLinkOneMatrix(2);
var tentacle_02Link_01 = new THREE.Mesh(tentacleL01Geom,normalMaterial);
tentacle_02Link_01.setMatrix(t_02_l_01_Matrix);
scene.add(tentacle_02Link_01);

// TENTACLE 3

var t_03_l_01_Matrix = generateTentacleLinkOneMatrix(3);
var tentacle_03Link_01 = new THREE.Mesh(tentacleL01Geom,normalMaterial);
tentacle_03Link_01.setMatrix(t_03_l_01_Matrix);
scene.add(tentacle_03Link_01);

// TENTACLE 4

var t_04_l_01_Matrix = generateTentacleLinkOneMatrix(4);
var tentacle_04Link_01 = new THREE.Mesh(tentacleL01Geom,normalMaterial);
tentacle_04Link_01.setMatrix(t_04_l_01_Matrix);
scene.add(tentacle_04Link_01);


// BABBY (link two) joints

var babbyJoint1Matrix = generateLinkTwoJointMatrix(1);
var babbyJoint2Matrix = generateLinkTwoJointMatrix(2);
var babbyJoint3Matrix = generateLinkTwoJointMatrix(3);
var babbyJoint4Matrix = generateLinkTwoJointMatrix(4);

var tentacle1L2joint = new THREE.Mesh(jointGeo,normalMaterial);
var tentacle2L2joint = new THREE.Mesh(jointGeo,normalMaterial);
var tentacle3L2joint = new THREE.Mesh(jointGeo,normalMaterial);
var tentacle4L2joint = new THREE.Mesh(jointGeo,normalMaterial);

tentacle1L2joint.setMatrix(babbyJoint1Matrix);
tentacle2L2joint.setMatrix(babbyJoint2Matrix);
tentacle3L2joint.setMatrix(babbyJoint3Matrix);
tentacle4L2joint.setMatrix(babbyJoint4Matrix);

scene.add(tentacle1L2joint);
scene.add(tentacle2L2joint);
scene.add(tentacle3L2joint);
scene.add(tentacle4L2joint);


// T1 LINK TWO 

var t_01_l_02_Matrix = generateTentacleLinkTwoMatrix(1);
var tentacle_01Link_02 = new THREE.Mesh(tentacleL02Geom,normalMaterial);
tentacle_01Link_02.setMatrix(t_01_l_02_Matrix);
scene.add(tentacle_01Link_02);

// T2 LINK TWO 

var t_02_l_02_Matrix =  generateTentacleLinkTwoMatrix(2);
var tentacle_02Link_02 = new THREE.Mesh(tentacleL02Geom,normalMaterial);
tentacle_02Link_02.setMatrix(t_02_l_02_Matrix);
scene.add(tentacle_02Link_02);


// T3 LINK TWO 

var t_03_l_02_Matrix = generateTentacleLinkTwoMatrix(3);
var tentacle_03Link_02 = new THREE.Mesh(tentacleL02Geom,normalMaterial);
tentacle_03Link_02.setMatrix(t_03_l_02_Matrix);
scene.add(tentacle_03Link_02);

// T4 LINK TWO 

var t_04_l_02_Matrix = generateTentacleLinkTwoMatrix(4);
var tentacle_04Link_02 = new THREE.Mesh(tentacleL02Geom,normalMaterial);
tentacle_04Link_02.setMatrix(t_04_l_02_Matrix);
scene.add(tentacle_04Link_02);

var defaultL1J1 = joint1Matrix;
var defaultL1J2 = babbyJoint1Matrix;
var defaultL2J1 = joint2Matrix;
var defaultL2J2 = babbyJoint2Matrix;
var defaultL3J1 = joint3Matrix;
var defaultL3J2 = babbyJoint3Matrix;
var defaultL4J1 = joint4Matrix;
var defaultL4J2 = babbyJoint4Matrix;

function resetJoints() {
  joint1Matrix = defaultL1J1;
  joint2Matrix = defaultL2J1;
  joint3Matrix = defaultL3J1;
  joint4Matrix = defaultL4J1;
  tentacle1L1joint.setMatrix(joint1Matrix);
  tentacle2L1joint.setMatrix(joint2Matrix);
  tentacle3L1joint.setMatrix(joint3Matrix);
  tentacle4L1joint.setMatrix(joint4Matrix);
  babbyJoint1Matrix = defaultL1J2;
  babbyJoint2Matrix = defaultL2J2;
  babbyJoint3Matrix = defaultL3J2;
  babbyJoint4Matrix = defaultL4J2;
  tentacle1L2joint.setMatrix(babbyJoint1Matrix);
  tentacle2L2joint.setMatrix(babbyJoint2Matrix);
  tentacle3L2joint.setMatrix(babbyJoint3Matrix);
  tentacle4L2joint.setMatrix(babbyJoint4Matrix);

}

function updateJoints() {
  joint1Matrix = generateLinkOneJointMatrix(1);
  joint2Matrix = generateLinkOneJointMatrix(2);
  joint3Matrix = generateLinkOneJointMatrix(3);
  joint4Matrix = generateLinkOneJointMatrix(4);
  tentacle1L1joint.setMatrix(joint1Matrix);
  tentacle2L1joint.setMatrix(joint2Matrix);
  tentacle3L1joint.setMatrix(joint3Matrix);
  tentacle4L1joint.setMatrix(joint4Matrix);
  babbyJoint1Matrix = generateLinkTwoJointMatrix(1);
  babbyJoint2Matrix = generateLinkTwoJointMatrix(2);
  babbyJoint3Matrix = generateLinkTwoJointMatrix(3);
  babbyJoint4Matrix = generateLinkTwoJointMatrix(4);
  tentacle1L2joint.setMatrix(babbyJoint1Matrix);
  tentacle2L2joint.setMatrix(babbyJoint2Matrix);
  tentacle3L2joint.setMatrix(babbyJoint3Matrix);
  tentacle4L2joint.setMatrix(babbyJoint4Matrix);
}

function resetLinks() {
  t_01_l_01_Matrix = generateTentacleLinkOneMatrix(1);
  t_02_l_01_Matrix = generateTentacleLinkOneMatrix(2);
  t_03_l_01_Matrix = generateTentacleLinkOneMatrix(3);
  t_04_l_01_Matrix = generateTentacleLinkOneMatrix(4);
  tentacle_01Link_01.setMatrix(t_01_l_01_Matrix);
  tentacle_02Link_01.setMatrix(t_02_l_01_Matrix);
  tentacle_03Link_01.setMatrix(t_03_l_01_Matrix);
  tentacle_04Link_01.setMatrix(t_04_l_01_Matrix);
  t_01_l_02_Matrix = generateTentacleLinkTwoMatrix(1);
  t_02_l_02_Matrix = generateTentacleLinkTwoMatrix(2);
  t_03_l_02_Matrix = generateTentacleLinkTwoMatrix(3);
  t_04_l_02_Matrix = generateTentacleLinkTwoMatrix(4);
  tentacle_01Link_02.setMatrix(t_01_l_02_Matrix);
  tentacle_02Link_02.setMatrix(t_02_l_02_Matrix);
  tentacle_03Link_02.setMatrix(t_03_l_02_Matrix);
  tentacle_04Link_02.setMatrix(t_04_l_02_Matrix);
}

function updateFirstLink() {
  t_01_l_01_Matrix = generateTentacleLinkOneMatrix(1);
  t_02_l_01_Matrix = generateTentacleLinkOneMatrix(2);
  t_03_l_01_Matrix = generateTentacleLinkOneMatrix(3);
  t_04_l_01_Matrix = generateTentacleLinkOneMatrix(4);
  tentacle_01Link_01.setMatrix(t_01_l_01_Matrix);
  tentacle_02Link_01.setMatrix(t_02_l_01_Matrix);
  tentacle_03Link_01.setMatrix(t_03_l_01_Matrix);
  tentacle_04Link_01.setMatrix(t_04_l_01_Matrix);
}

function updateSecondLink() {
  t_01_l_02_Matrix = generateTentacleLinkTwoMatrix(1);
  t_02_l_02_Matrix = generateTentacleLinkTwoMatrix(2);
  t_03_l_02_Matrix = generateTentacleLinkTwoMatrix(3);
  t_04_l_02_Matrix = generateTentacleLinkTwoMatrix(4);
  
  tentacle_01Link_02.setMatrix(t_01_l_02_Matrix);
  tentacle_02Link_02.setMatrix(t_02_l_02_Matrix);
  tentacle_03Link_02.setMatrix(t_03_l_02_Matrix);
  tentacle_04Link_02.setMatrix(t_04_l_02_Matrix);

}





//APPLY DIFFERENT EFFECTS TO DIFFERNET CHANNELS

var clock = new THREE.Clock();
clock.start();
var old_T;
var animThresh = 3.0;
var onTheClock = false;
function updateBody() {

  switch(channel)
  {
    //add poses here:
    case 0:
      resetJoints();
      onTheClock = false;
      // DEFAULT "T-POSE"
      break;

    case 1:
      tentacle1L1joint.multiply(getCompositeRotation(0,0,1));
      updateJoints();
      onTheClock = false;
      // SPIDER MODE
      break;

    case 2:
      rotationOffsetLinkOne = 0;
      rotationOffsetLinkTwo = 90;
      updateJoints();
      onTheClock = false;
      break;


    //animation
    case 3:  
      {
        /*
        var timeslice = animThresh / 4.0;
        if (!onTheClock) {
          rotationOffsetLinkOne = 0;
          rotationOffsetLinkTwo = 0;
          onTheClock = true;
          old_T = clock.getElapsedTime();
        } else {
          var t = clock.getElapsedTime();
          var delta_t = t - old_T;
          if (delta_t < animThresh / 4.0) {
            rotationOffsetLinkOne -= 1.5
          } else if (delta_t < animThresh / 2.0) {
            rotationOffsetLinkTwo -= 0.75;
          } else if (delta_t < (3.0 *animThresh / 4.0)) {
            rotationOffsetLinkOne += 1.5;
          } else if (delta_t < animThresh) {
            rotationOffsetLinkTwo += 0.75;
          }else {
            onTheClock = false;
          }
        }
        //animate octopus here:
        updateFirstLink();
        updateSecondLink(); */
      }

      break;
    case 4:
      rotationOffsetLinkOne = 0;
      rotationOffsetLinkTwo = 0;
      //octopusMatrix.value.multiply(getCompositeRotation(0,1,0));
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