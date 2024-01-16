// Trying to recreate https://bruno-simon.com/ with React and Three.js
// ThreeScene.js
import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';
import * as CANNON from 'cannon';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader';
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry';


const ThreeScene = () => {
  const mountRef = useRef(null);
  
  useEffect(() => {
    const mount = mountRef.current;

    // Physics setup
    const world = new CANNON.World();
    world.gravity.set(0, -9.82, 0);
    world.broadphase = new CANNON.NaiveBroadphase();  // Detects collisions between all bodies
    world.solver.iterations = 10;

     // Scene setup
     const scene = new THREE.Scene();
     const camera = new THREE.PerspectiveCamera(75, mount.clientWidth / mount.clientHeight, 0.1, 1000);
     camera.position.set(0, 50, 50);
     camera.lookAt(new THREE.Vector3(0, 0, 0));

    // Renderer setup
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(mount.clientWidth, mount.clientHeight);
    mount.appendChild(renderer.domElement);

    // Controls setup
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.25;
    controls.screenSpacePanning = false;
    controls.minDistance = 10;
    controls.maxDistance = 500;
    controls.maxPolarAngle = Math.PI / 2;

    // Lighting setup
    const ambientLight = new THREE.AmbientLight(0x404040);
    scene.add(ambientLight);
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(10, 20, 10);
    scene.add(directionalLight);

    // Terrain setup with solid color
    const terrainGeometry = new THREE.PlaneGeometry(500, 500, 64, 64);
    const terrainMaterial = new THREE.MeshStandardMaterial({ color: 0x32a852 }); // To change the color of terrain
    const terrain = new THREE.Mesh(terrainGeometry, terrainMaterial);
    terrain.rotation.x = -Math.PI / 2;
    scene.add(terrain);

    // Interactive cubes setup
    const cubeGerometry = new THREE.BoxGeometry(5, 5, 5);
    const cubeMaterial = new THREE.MeshStandardMaterial({ color: 0xff0e0e });
    const cube = new THREE.Mesh(cubeGerometry, cubeMaterial);
    cube.position.set(0, 5, 0);
    scene.add(cube);
   
    // Create a physical plane for the terrain
    const groundShape = new CANNON.Plane();
    const groundBody = new CANNON.Body({ 
      mass: 0, 
      shape: groundShape 
    });

    // Rotate the ground plane to be horizontal
    groundBody.quaternion.setFromEuler(-Math.PI / 2, 0, 0);
    world.addBody(groundBody);

   // Create a physical body for the cube
   const initialCubeY = 10;
   const cubeShape = new CANNON.Box(new CANNON.Vec3(2.5, 2.5, 2.5)); // Create a box shape with half the size of the cube
   const cubeBody = new CANNON.Body({
     mass: 5,
     position: new CANNON.Vec3(0, initialCubeY, 0), // Start position of the cube
     shape: cubeShape, // Setting the cube shape
   });
   world.addBody(cubeBody);

    // Font loader
    const loader = new FontLoader();
    loader.load('https://threejsfundamentals.org/threejs/resources/threejs/fonts/helvetiker_regular.typeface.json', function (font) {
      createText(font);
    });

    let charMeshes = [];
    let charBodies = [];

    function createText (font) {
      const text = 'Jack Shomer';
      let offsetX = -50;

      for (let i = 0; i < text.length; i++) {
        const char = text[i];
        const charGeometry = new TextGeometry(char, {
          font: font,
          size: 10,
          height: 2,
          curveSegments: 12,
          bevelEnabled: true,
          bevelThickness: 1,
          bevelSize: 1,
          bevelOffset: 0,
          bevelSegments: 5
      });

      charGeometry.computeBoundingBox();
      const charSize = charGeometry.boundingBox.getSize(new THREE.Vector3());

      const charMaterial = new THREE.MeshStandardMaterial({ color: 0x87ceeb });
      const charMesh = new THREE.Mesh(charGeometry, charMaterial);
      charMesh.position.set(offsetX, 10, 0);
      scene.add(charMesh);

      offsetX += charSize.x + 1;

      const charShape = new CANNON.Box(new CANNON.Vec3(charSize.x / 2, charSize.y / 2, charSize.z / 2));
      const charBody = new CANNON.Body({
        mass: 1,
        position: new CANNON.Vec3(charMesh.position.x, charMesh.position.y, charMesh.position.z),
        shape: charShape,
      });
      world.addBody(charBody);

      charMeshes.push(charMesh);
      charBodies.push(charBody);
    }
  }


    // Raycaster setup
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();


    // Keyboard state setup
    const keyState = {
      ArrowUp: false,
      ArrowDown: false,
      ArrowLeft: false,
      ArrowRight: false,
    };

    // Function to update the mouse position
    function onMouseMove(event) {
      mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
      mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    }

    // Function to handle click events
    function onDocumentMouseDown(event) {
      event.preventDefault();
      raycaster.setFromCamera(mouse, camera);
    }

    // Event listeners
    window.addEventListener('mousemove', onMouseMove, false);
    window.addEventListener('mousedown', onDocumentMouseDown, false);

    function handleKeyDown(event) {
      if (keyState[event.code] !== undefined) {
        keyState[event.code] = true;
        controls.enabled = false;
        const forceMagnitude = 50;
        switch (event.code) {
          case 'ArrowUp':
            cubeBody.applyLocalForce(new CANNON.Vec3(0, 0, -forceMagnitude), cubeBody.position);
            break;
          case 'ArrowDown':
            cubeBody.applyLocalForce(new CANNON.Vec3(0, 0, forceMagnitude), cubeBody.position);
            break;
          case 'ArrowLeft':
            cubeBody.applyLocalForce(new CANNON.Vec3(-forceMagnitude, 0, 0), cubeBody.position);
            break;
          case 'ArrowRight':
            cubeBody.applyLocalForce(new CANNON.Vec3(forceMagnitude, 0, 0), cubeBody.position);
            break;
          default:
            break;
      }
    }
  }

    function handleKeyUp(event) {
      if (keyState[event.code] !== undefined) {
        keyState[event.code] = false;
        controls.enabled = true;
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mousedown', onDocumentMouseDown);

    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate);

      // Update physics world
      world.step(1 / 60);

      // Update cube position
      cube.position.copy(cubeBody.position);
      cube.quaternion.copy(cubeBody.quaternion);

      charMeshes.forEach((charMesh, index) => {
        const body = charBodies[index];
        if (body) {
          charMesh.position.copy(body.position);
          charMesh.quaternion.copy(body.quaternion);
        }
      });
       
      // Update cube position based on keyboard state
      if (keyState.ArrowUp) cubeBody.position.z -= 0.5;
      if (keyState.ArrowDown) cubeBody.position.z += 0.5;
      if (keyState.ArrowLeft) cubeBody.position.x -= 0.5;
      if (keyState.ArrowRight) cubeBody.position.x += 0.5;


      controls.update();
      renderer.render(scene, camera);
      
    };
    
    animate();
    
    // Handle window resize
    function onWindowResize() {
      camera.aspect = mount.clientWidth / mount.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(mount.clientWidth, mount.clientHeight);
    }
    window.addEventListener('resize', onWindowResize, false);
    
    // Cleanup function
    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mousedown', onDocumentMouseDown);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('resize', onWindowResize);
      mount.removeChild(renderer.domElement); // This will remove the canvas from the DOM and clean up memory
    };
  }, []);

  return <div ref={mountRef} style={{width:'100%', height:'100%'}} />;
};

export default ThreeScene;