// Trying to recreate https://bruno-simon.com/ with React and Three.js but in a space theme
// Users will interact with the website by controlling a rocket ship and flying around the solar system to different planets where a popup of the information will be displayed for them
// The rocket ship will be controlled by the arrow keys on the keyboard
// The rocket ship will be able to fly around the solar system and land on different planets
// The rocket ship will be able to fly around the planet and land on different moons
// The rocket will need to avoid asteroids and other space debris
// The rocket will need to be able to refuel at different space stations
// I will need to create a 3d model of the rocket ship
// I will need to create a 3d model of the planets
// I will need to create a 3d model of the moons
// I will need to create a 3d model of the space stations
// I will need to create a 3d model of the asteroids and other space debris
// I will need to create a 3d model of the sun
// I will need to create a 3d model of the stars
// I will need to create a 3d model of the space background
// I will need to create a 3d model of the space dust
// I will need to create a 3d model of the space clouds
// There should be aliens that give the information once the user lands on the planet
// The information is my projects, about page and contact me page`
// ThreeScene.js
import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';
import * as CANNON from 'cannon';
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader';
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry';


const ThreeScene = () => {
  const mountRef = useRef(null);

  const isDragging = useRef(false);
  const previousMousePosition = useRef({
    x: 0,
    y: 0
  });


  useEffect(() => {
    const mount = mountRef.current;

    const cameraOffset = new THREE.Vector3(0, 10, 30);

    // Physics setup
    const world = new CANNON.World();
    world.gravity.set(0, -9.82, 0);
    world.broadphase = new CANNON.NaiveBroadphase();  // Detects collisions between all bodies
    world.solver.iterations = 10;

     // Scene setup
     const scene = new THREE.Scene();
     scene.background = new THREE.Color(0x000000);

    // Camera setup
     const camera = new THREE.PerspectiveCamera(75, mount.clientWidth / mount.clientHeight, 0.1, 1000);
     camera.position.set(...cameraOffset);

     function handleWheel(event){
      const zoomSpeed = 0.2;

      camera.fov += event.deltaY * zoomSpeed;

      camera.fov = Math.max(10, Math.min(100, camera.fov));

      camera.updateProjectionMatrix();
     }

    // Renderer setup
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(mount.clientWidth, mount.clientHeight);
    renderer.setClearColor(0x000000);
    mount.appendChild(renderer.domElement);

    // Setting up the starfield background
    const starsGeometry = new THREE.BufferGeometry();
    const starsVertices = [];

    for (let i = 0; i < 10000; i++) {
      const x = THREE.MathUtils.randFloatSpread(2000);
      const y = THREE.MathUtils.randFloatSpread(2000);
      const z = THREE.MathUtils.randFloatSpread(2000);
      starsVertices.push(x, y, z);
    }
    starsGeometry.setAttribute('position', new THREE.Float32BufferAttribute(starsVertices, 3));

    const starsMaterial = new THREE.PointsMaterial({ color: 0xffffff, size: 0.7 });
    const starfield = new THREE.Points(starsGeometry, starsMaterial);
    scene.add(starfield);

    // Planet setup
    const planetGeometry = new THREE.SphereGeometry(5, 32, 32);
    const planetMaterial = new THREE.MeshPhongMaterial({ color: 0x32a852 });
    const planet = new THREE.Mesh(planetGeometry, planetMaterial);
    planet.position.set(50, 0, 0);
    scene.add(planet);

    // Mercury setup
    const mercuryGeometry = new THREE.SphereGeometry(0.383, 32, 32);
    const mercuryMaterial = new THREE.MeshPhongMaterial({ color: 0x9e9e9e });
    const mercury = new THREE.Mesh(mercuryGeometry, mercuryMaterial);
    mercury.position.set(5, 0, 0);
    scene.add(mercury);

    // Lighting setup
    const ambientLight = new THREE.AmbientLight(0x404040);
    scene.add(ambientLight);
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.intensity = 1.5;
    directionalLight.position.set(0, 20, 20);
    scene.add(directionalLight);

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

    // Keyboard state setup
    const keyState = {
      ArrowUp: false,
      ArrowDown: false,
      ArrowLeft: false,
      ArrowRight: false,
    };

    function onMouseDown(event) {
      isDragging.current = true;
      previousMousePosition.current = {x: event.clientX, y: event.clientY};
     }

    // Function to update the mouse position
    function onMouseMove(event) {
      if (isDragging.current) {
        const deltaMove = {
          x: event.clientX - previousMousePosition.current.x,
          y: event.clientY - previousMousePosition.current.y
        };

        let angleChange = {
          azimuthal: deltaMove.x * 0.005,
          polar: deltaMove.y * 0.005
        };

        const radius = cameraOffset.length();
        let theta = Math.atan2(cameraOffset.x, cameraOffset.z);
        let phi = Math.acos(cameraOffset.y / radius);

        theta -= angleChange.azimuthal;
        phi -= angleChange.polar;

        phi = Math.max(0.1, Math.min(Math.PI - 0.1, phi));

        cameraOffset.x = radius * Math.sin(phi) * Math.sin(theta);
        cameraOffset.y = radius * Math.cos(phi);
        cameraOffset.z = radius * Math.sin(phi) * Math.cos(theta);

        previousMousePosition.current = {
          x: event.clientX,
          y: event.clientY
        };

        camera.position.addVectors(cube.position, cameraOffset);
        camera.lookAt(cube.position);
      }
    }

      function onMouseUp(event) {
        isDragging.current = false;
      }


    // Function to handle click events
    function onDocumentMouseDown(event) {
      event.preventDefault();
    }

    // Event listeners
    window.addEventListener('mousemove', onMouseMove, false);
    window.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mouseup', onMouseUp);

    function handleKeyDown(event) {
      if (keyState[event.code] !== undefined) {
        keyState[event.code] = true;

        const forceMagnitude = 50;
        const force = new CANNON.Vec3();

        switch(event.code) {
          case 'ArrowUp':
            force.z = -forceMagnitude;
            break;
          case 'ArrowDown':
            force.z = forceMagnitude;
            break;
          case 'ArrowLeft':
            force.x = -forceMagnitude;
            break;
          case 'ArrowRight':
            force.x = forceMagnitude;
            break;
          default:
            break;
    }
        cubeBody.applyForce(force, cubeBody.position);
    }
  }

    function handleKeyUp(event) {
      if (keyState[event.code] !== undefined) {
        keyState[event.code] = false;
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mousedown', onDocumentMouseDown);
    window.addEventListener('wheel', handleWheel);

    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate);

      // Update physics world
      world.step(1 / 60);
      
      // Update cube position based on keyboard state
      const moveSpeed = 0.5;
      if (keyState.ArrowUp) cubeBody.position.z -= moveSpeed;
      if (keyState.ArrowDown) cubeBody.position.z += moveSpeed;
      if (keyState.ArrowLeft) cubeBody.position.x -= moveSpeed;
      if (keyState.ArrowRight) cubeBody.position.x += moveSpeed;

      cubeBody.angularVelocity.set(0, 0, 0);
      cubeBody.quaternion.setFromAxisAngle(0, 0, 0, 1);

       // Update camera position
       const cubePosition = new THREE.Vector3(cubeBody.position.x, cubeBody.position.y, cubeBody.position.z);
       const desiredCameraPosition = cubePosition.clone().add(cameraOffset);
       camera.position.lerp(desiredCameraPosition, 0.05);
       camera.lookAt(cubePosition);

      // Update cube position
      cube.position.copy(cubeBody.position);

      // Update text meshes position
      charMeshes.forEach((charMesh, index) => {
        const body = charBodies[index];
        if (body) {
          charMesh.position.copy(body.position);
          charMesh.quaternion.set(0, 0, 0, 1);
        }
      });
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
      window.removeEventListener('wheel', handleWheel);
      window.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mouseup', onMouseUp);
      renderer.setAnimationLoop(null);
      mount.removeChild(renderer.domElement); // This will remove the canvas from the DOM and clean up memory
    };
  }, []);

  return <div ref={mountRef} style={{width:'100%', height:'100%'}} />;
};

export default ThreeScene;