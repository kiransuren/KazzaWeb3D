var scene = new THREE.Scene();  //Instantiate Scene
var camera = new THREE.PerspectiveCamera(       //Instantiate Camera
    75,
    window.innerWidth/window.innerHeight,
    0.1,
    1000
)


var renderer = new THREE.WebGLRenderer({antialias: true});  //Instantiate Renderer
renderer.setClearColor("#e5e5e5");                          //Set Background/Clear colour
renderer.setSize(window.innerWidth, window.innerHeight);    //Set Renderer size

//Listen for window resizes
window.addEventListener('resize', () =>{
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.aspect = window.innerWidth/window.innerHeight;
    camera.updateProjectionMatrix();
})

//Mouse pointer lock
var havePointerLock = 'pointerLockElement' in document ||
            'mozPointerLockElement' in document ||
            'webkitPointerLockElement' in document;
element = document.body;            //Set body as pointer lock element
element.requestPointerLock = element.requestPointerLock ||
    element.mozRequestPointerLock ||
    element.webkitRequestPointerLock;

element.onclick = function() {       // Ask the browser to lock the pointer
    element.requestPointerLock();
}
// Ask the browser to release the pointer
document.exitPointerLock = document.exitPointerLock ||
    document.mozExitPointerLock ||
    document.webkitExitPointerLock;
document.exitPointerLock();         //Exit pointer when escape is pressed

document.body.appendChild( renderer.domElement );           //Add render to document

var posX = 0;           //Cumulative X Position for cameraMove_v1 
var posY = 0;           //Cumulative Y Position for cameraMove_v1 


//Initialize camera position
camera.position.z = 3;
camera.position.x = 0;
camera.position.y = 0;

var mouse_sense = 0.002;         //Mouse sensitivity
var speed = 0.1;                //Movement speed
var movement = {forward:false, backward:false, left:false, right:false};    //Movement input data

//CAMERA ROTATION
const cameraMove_v2 = (event) => {
    /*
    * Preferred Camera Move Function
    */
    var PI_90 = Math.PI / 2;                              //Define 90 degrees in radians
    var xMaxClamp = Math.PI;                              //Define max look clamp
    var xMinClamp = 0;                                    //Define min look clamp

    var rot_vec = new THREE.Euler( 0, 0, 0, 'YXZ' );      //Instantiate rotation vector
    rot_vec.setFromQuaternion( camera.quaternion );       //Copy camera quaternion into rot_vec as an Euler Vector

    rot_vec.y -= event.movementX * mouse_sense * PI_90;   //Rotate camera about y axis
    rot_vec.x -= event.movementY * mouse_sense * PI_90;   //Rotate camera about x axis
    rot_vec.x = Math.max( PI_90 - xMaxClamp, Math.min( PI_90 - xMinClamp, rot_vec.x ) );    //Ensure camera angle does not exceed clamps
    camera.quaternion.setFromEuler( rot_vec );            //Apply Euler rotation as a quaternion on camera
}
document.addEventListener('mousemove', cameraMove_v2);    //Add camera move to document

/*
let cameraMove_v1 = (event) => {
    //Deprecated Camera Move Function
    
    posX += event.movementX;
    posY += event.movementY;
    var ms = 1;
    coordX = (posX - innerWidth/2) / (innerWidth/2);
    coordY = (posY - innerHeight/2) / (innerHeight/2);
    var ihat = -coordY * ms;
    var jhat = -coordX * ms;
    var khat = 0;

    if(ihat > Math.PI/4){
        ihat = Math.PI/4;
    }
    var a = new THREE.Euler( ihat, jhat, khat, "YXZ");
    var q = new THREE.Quaternion().setFromEuler(a);
    camera.setRotationFromQuaternion(q);
    camera.quaternion.normalize();  // Normalize Quaternion

}
*/


//CAMERA POSTIONAL MOVEMENT
const onKeyDown = (event) =>{
    event = event || window.event;  //Non null event
    if(event.key === "w"){
        movement.forward = true;
    }else if(event.key === "s"){
        movement.backward = true;
    }else if(event.key === "a"){
        movement.right = true;
    }else if(event.key === "d"){
        movement.left = true;
    }else if(event.key ==="r"){      //Reset Camera rotation and position
        camera.position.set(0,0,3);
        camera.rotation.set(0,0,0);
    }
}

const onKeyUp = (event) =>{
    event = event || window.event; //Non null event
    if(event.key === "w"){
        movement.forward = false;
    }else if(event.key === "s"){
        movement.backward = false;
    }else if(event.key === "a"){
        movement.right = false;
    }else if(event.key === "d"){
        movement.left = false;
    }
}
document.body.addEventListener('keyup', onKeyUp); 
document.body.addEventListener('keydown', onKeyDown); 

/*
let CrossProd3D = (vec1, vec2) => {
    ihat = (vec1.y * vec2.z) - (vec2.y * vec1.z);
    jhat = (vec1.x * vec2.z) - (vec1.z * vec2.x);
    khat = (vec1.x * vec2.y) - (vec1.y * vec1.x);
    return new THREE.Vector3(ihat, jhat, khat);
}
*/


//World Building and Geometry
var geometry = new THREE.BoxGeometry(1, 1, 1);
var material = new THREE.MeshPhongMaterial( { color: 0x2456d4, emissive: 0x2456d4 });
var cube = new THREE.Mesh( geometry, material );
scene.add( cube );

var pgeometry = new THREE.BoxGeometry(5, 0.1, 5);
var pmaterial = new THREE.MeshPhongMaterial( { color: 0x2456d4, emissive: 0x2456d4 } );
var plane = new THREE.Mesh( pgeometry, pmaterial );
scene.add(plane);
plane.position.x = 5;
plane.position.z = 3;
plane.position.y = -0.55;


var geometry2 = new THREE.BoxGeometry(1, 1, 1);
var material2 = new THREE.MeshPhongMaterial( { color: 0xd92518, emissive: 0xd92518 } );
var cube2 = new THREE.Mesh( geometry2, material2 );
cube2.position.x = 5;
cube2.position.z = -3;
scene.add( cube2 );

var light = new THREE.AmbientLight( 0xFFFFFF, 0.2 );
scene.add( light );

var light2 = new THREE.PointLight( 0xFFFFFF, 1, 10000 );
light2.position.set( 10, 0, 10 );
scene.add( light2 );

var render = function(){
    requestAnimationFrame(render);

    //Clamp to ensure camera does not leave ground (clip above or below) (not necessary!)
    camera.position.y = 0;
    

    //Translate Camera in OBJECT SPACE
    if(movement.forward){
        camera.translateOnAxis(new THREE.Vector3(0,0,-1), speed);
    }else if(movement.backward){
        camera.translateOnAxis(new THREE.Vector3(0,0,1), speed);
    }else if(movement.left){
        camera.translateOnAxis(new THREE.Vector3(1,0,0), speed);
    }else if(movement.right){
        camera.translateOnAxis(new THREE.Vector3(-1,0,0), speed);
    }

    

    //Example Cube Animation
    cube.rotation.x -= 0.05;
    cube.rotation.y += 0.05;

    //Display debugging data
    document.getElementById("xpos").textContent = "XPos:" + (camera.position.x.toFixed(3));
    document.getElementById("ypos").textContent = "YPos:" + (camera.position.y.toFixed(3));
    document.getElementById("zpos").textContent = "ZPos:" + (camera.position.z.toFixed(3));
    document.getElementById("xrot").textContent = "XRot:" + ((camera.rotation.x / Math.PI) *180).toFixed(3);
    document.getElementById("yrot").textContent = "YRot:" + ((camera.rotation.y / Math.PI) *180).toFixed(3);
    document.getElementById("zrot").textContent = "ZRot:" + ((camera.rotation.z / Math.PI) *180).toFixed(3);
    
    renderer.render(scene, camera);         //Render Scene
}

render();

//Example Animation using GSAP
this.tl = new TimelineMax().delay(.3);
this.tl.to(this.cube.scale,3,{x:2,ease:Expo.easeOut})
this.tl.to(this.cube.rotation,3,{x:2,ease:Expo.easeOut})