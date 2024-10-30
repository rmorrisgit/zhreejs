import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';



// RENDERER
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
renderer.shadowMap.enabled = true;
document.body.appendChild(renderer.domElement);

// CAMERA
const cameraSettings = { fov: 45, near: 0.1, far: 500 };
const primaryCamera = new THREE.PerspectiveCamera(cameraSettings.fov,
    window.innerWidth / window.innerHeight, cameraSettings.near, cameraSettings.far);
primaryCamera.position.set(-16, 8, 16);

const textureLoader = new THREE.TextureLoader()
const loader = new GLTFLoader();

loader.load('resources/Shipping Container.glb', (gltf) => {
    console.log('GLB model loaded:', gltf);
    primaryScene.add(gltf.scene);
    // Optionally position and scale the model
    gltf.scene.position.set(0, 0, 6); 
    gltf.scene.rotateY(THREE.MathUtils.degToRad(90));
    gltf.scene.scale.set(1, 1, 1); // Adjust scale if necessary
}, undefined, (error) => {
    console.error('An error occurred while loading the model:', error);
});



// ORBIT CONTROLS for Scene 1 (Primary Camera)
const orbitControls = new OrbitControls(primaryCamera, renderer.domElement);
orbitControls.enableDamping = true;
orbitControls.dampingFactor = 0.05;
orbitControls.minDistance = 5;
orbitControls.maxDistance = 60;
orbitControls.maxPolarAngle = Math.PI / 2 - 0.05;
orbitControls.minPolarAngle = Math.PI / 4;
orbitControls.update();

// RENDER TARGETS for Scene 2, Scene 3, and Scene 4
const targetPlaneSize = { width: 6, height: 7 };
const renderTarget2 = new THREE.WebGLRenderTarget(targetPlaneSize.width * 512, targetPlaneSize.height * 512);
const renderTarget3 = new THREE.WebGLRenderTarget(targetPlaneSize.width * 512, targetPlaneSize.height * 512);
const renderTarget4 = new THREE.WebGLRenderTarget(targetPlaneSize.width * 512, targetPlaneSize.height * 512);

// SECONDARY CAMERAS
const secondaryCam1 = new THREE.PerspectiveCamera(cameraSettings.fov, targetPlaneSize.width / targetPlaneSize.height, cameraSettings.near, cameraSettings.far);
const secondaryCam2 = new THREE.PerspectiveCamera(cameraSettings.fov, targetPlaneSize.width / targetPlaneSize.height, cameraSettings.near, cameraSettings.far);
const secondaryCam3 = new THREE.PerspectiveCamera(cameraSettings.fov, targetPlaneSize.width / targetPlaneSize.height, cameraSettings.near, cameraSettings.far);
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();
let selectedCamera = secondaryCam1; // Track which camera is active

// Event listener for mouse click
window.addEventListener('click', (event) => {
    // Calculate mouse position in normalized device coordinates (-1 to +1) for both components
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    // Update the raycaster with the camera and mouse position
    raycaster.setFromCamera(mouse, primaryCamera);

    // Check for intersections with the target planes
    const intersects = raycaster.intersectObjects([targetPlane1]);

    if (intersects.length > 0) {
        // Switch between cameras on click (toggle behavior example)
        if (selectedCamera === secondaryCam1) {
            selectedCamera = secondaryCam2;
            console.log("Switched to Camera 3");
        } else if (selectedCamera === secondaryCam2) {
            selectedCamera = secondaryCam3;
            console.log("Switched to Camera 4");
        } else {
            selectedCamera = secondaryCam1;
            console.log("Switched to Camera 2");
        }
    }
});
// SCENE 1
const primaryScene = new THREE.Scene();
primaryScene.background = new THREE.Color(0xa8def0);

// Global Lighting
const directionalLight = new THREE.DirectionalLight(0xFFFFFF, 1);
directionalLight.position.set(3, 10, -4);
directionalLight.castShadow = true;
primaryScene.add(directionalLight);

const ambientLight = new THREE.AmbientLight(0xFFFFFF, 0.5);
primaryScene.add(ambientLight);

const textureTest = await new Promise((resolve, reject) => {
    textureLoader.load('textures/badlands-boulders-bl/badlands-boulders_albedo.png', resolve, undefined, reject);
});
const material = new THREE.MeshBasicMaterial({ map: textureTest });


// Ground plane for Scene 1
const planeGeometry = new THREE.PlaneGeometry(20, 20);
// const planeMaterial = new THREE.MeshPhongMaterial({ color: 0x999999, depthWrite: false });
const ground = new THREE.Mesh(planeGeometry, material);
ground.rotation.x = -Math.PI / 2;
ground.receiveShadow = true;
primaryScene.add(ground);

// Cube in Scene 1
const cubeGeometry = new THREE.BoxGeometry(2, 2, 2);
const cubeMaterial = new THREE.MeshPhongMaterial({ color: 0x00ff00 });
const cube = new THREE.Mesh(cubeGeometry, cubeMaterial);
cube.castShadow = true;
cube.position.set(0, 1, 0);
primaryScene.add(cube);
const cubeGeometry2 = new THREE.BoxGeometry(2, 1, 3);
const cube2 = new THREE.Mesh(cubeGeometry2, cubeMaterial);
cube2.position.set(6, 2, 9);
primaryScene.add(cube2);

// CCTV Camera Representation for Scene 1 (First Camera Pole)
const pole1 = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 3, 8), new THREE.MeshPhongMaterial({ color: 0xff8800 }));
pole1.position.set(5, 1.5, -5);
pole1.castShadow = true;
primaryScene.add(pole1);

// CCTV Camera Representation for Scene 2 (Camera for Scene 2)
const cameraGeo1 = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.5, 0.5), new THREE.MeshPhongMaterial({ color: 0xff8800 }));
pole1.position.set(5, 1.5, -5);
cameraGeo1.position.set(5, 3, -5);
cameraGeo1.castShadow = true;

primaryScene.add(cameraGeo1);

// CCTV Camera Representation for Scene 3 (Second Camera Pole)
const pole2 = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 3, 8), new THREE.MeshPhongMaterial({ color: 0xfff88 }));
pole2.position.set(-5, 1.5, 8); // Positioned between the first pole and the cube
pole2.castShadow = true;
primaryScene.add(pole2);

// CCTV Camera Representation for Scene 3 (Camera for Scene 3)
const cameraGeo2 = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.5, 0.5), new THREE.MeshPhongMaterial({ color: 0xfff88 }));
cameraGeo2.position.set(-5, 3, 8);
cameraGeo2.castShadow = true;
primaryScene.add(cameraGeo2);

// CCTV Camera Representation for Scene 4 (Third Camera Pole - Front Right)
const pole3 = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 3, 8), new THREE.MeshPhongMaterial({ color: 0x000000 }));
pole3.position.set(5, 1.5, 6); // Front-right corner of the scene
pole3.castShadow = true;
primaryScene.add(pole3);

// CCTV Camera Representation for Scene 4 (Camera for Scene 4)
const cameraGeo3 = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.5, 0.5), new THREE.MeshPhongMaterial({ color: 0x000000 }));
cameraGeo3.position.set(5, 3, 6); // Above the pole
cameraGeo3.castShadow = true;
primaryScene.add(cameraGeo3);

// Setting up secondary cameras BLUE POV
secondaryCam1.position.copy(pole1.position);
secondaryCam1.position.x += 0; // Move it slightly to the right
secondaryCam1.position.y += 1.7; // Adjust height if needed
secondaryCam1.lookAt(cube.position); // Face the cube
//RED POV
secondaryCam2.position.copy(pole2.position);
secondaryCam2.position.x -= 0; // Move it slightly to the left
secondaryCam2.position.y += 1.7; // Adjust height if needed
secondaryCam2.lookAt(cameraGeo3.position); // Look at the green cube
//BLACK POV
secondaryCam3.position.copy(pole3.position); // For Scene 4
secondaryCam3.position.x -= 0; // Move it slightly to the left
secondaryCam3.position.y += 1.7; // Adjust height if needed
secondaryCam3.lookAt(cameraGeo2.position); // Looking at the second cube


// PLANES for Scene 2, Scene 3, and Scene 4
const material2 = new THREE.MeshPhongMaterial({ map: renderTarget2.texture });
const targetPlane1 = new THREE.Mesh(new THREE.PlaneGeometry(targetPlaneSize.width, targetPlaneSize.height), material2);
targetPlane1.userData.clickable = true; // Mark as clickable
targetPlane1.position.set(0, 5, -8);
primaryScene.add(targetPlane1);

// const material3 = new THREE.MeshPhongMaterial({ map: renderTarget3.texture });
// const targetPlane2 = new THREE.Mesh(new THREE.PlaneGeometry(targetPlaneSize.width, targetPlaneSize.height), material3);
// targetPlane2.position.set(7, 5, -7); 
// primaryScene.add(targetPlane2);

// const material4 = new THREE.MeshPhongMaterial({ map: renderTarget4.texture });
// const targetPlane3 = new THREE.Mesh(new THREE.PlaneGeometry(targetPlaneSize.width, targetPlaneSize.height), material4);
// targetPlane3.position.set(-8, 5, -8); 
// primaryScene.add(targetPlane3);

// RESIZE HANDLER
function onWindowResize() {
    primaryCamera.aspect = window.innerWidth / window.innerHeight;
    primaryCamera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}
window.addEventListener('resize', onWindowResize);
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
// GAME LOOP
let rotationSpeed = 0.05;
let maxRotation = Math.PI * 2;

function rotateCube() {
  if (cube.rotation.y < maxRotation) {
    cube.rotation.y += rotationSpeed;
  } else {
    cube.rotation.y = maxRotation; // Reset the rotation for continuous rotation
  }
}
function gameLoop() {
    // Perform cube rotation only if needed
    rotateCube(cube);

    // Update the orbit controls (if needed)
    orbitControls.update();

    // Render the active camera to `renderTarget2`
    renderer.setRenderTarget(renderTarget2);
    renderer.render(primaryScene, selectedCamera);

    // Render Scene 3 onto the RenderTarget texture (secondaryCam3)
    renderer.setRenderTarget(renderTarget3);
    renderer.render(primaryScene, secondaryCam3);

    // Render Scene 4 onto the RenderTarget texture (secondaryCam2)
    renderer.setRenderTarget(renderTarget4);
    renderer.render(primaryScene, secondaryCam2);

    // Reset render target to null to render the main scene
    renderer.setRenderTarget(null);

    // Render the primary scene with the primary camera
    renderer.render(primaryScene, primaryCamera);

    // Request the next frame
    requestAnimationFrame(gameLoop);
}


// Start the game loop
gameLoop();
