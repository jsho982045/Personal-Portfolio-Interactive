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

import React, { useRef, useState, useEffect } from "react";
import * as THREE from "three";
import * as CANNON from "cannon";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { FontLoader } from "three/examples/jsm/loaders/FontLoader";
import { TextGeometry } from "three/examples/jsm/geometries/TextGeometry";
import { useFrame } from "react-three-fiber";
import { useCannon } from "../hooks/useCannon";
import { usePlane } from "react-three-cannon";
import { useBox } from "use-cannon";
import { useSphere } from "use-cannon";
import { useConvexPolyhedron } from "use-cannon";
import { useCylinder } from "use-cannon";
import { useHeightfield } from "use-cannon";
import { useTrimesh } from "use-cannon";
import { useCompoundBody } from "use-cannon";
import { useConeTwistConstraint } from "use-cannon";
import { useDistanceConstraint } from "use-cannon";
import { useHingeConstraint } from "use-cannon";
import { useLockConstraint } from "use-cannon";
import { usePointToPointConstraint } from "use-cannon";
import { useSliderConstraint } from "use-cannon";
import { useSpring } from "use-cannon";
import { usePlane } from "use-cannon";
import { useRaycastVehicle } from "use-cannon";

const ThreeScene = () => {
    const mountRef = useRef(null);
    
    useEffect(() => {
        const mount = mountRef.current;
    
        // Physics setup
        const world = new CANNON.World();
        world.gravity.set(0, -9.82, 0);
        world.broadphase = new CANNON.NaiveBroadphase(); // Detects collisions between all bodies
        world.solver.iterations = 10;
    
        // Scene setup
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(
        75,
        mount.clientWidth / mount.clientHeight,
        0.1,
        1000
        );
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
    
        // Lights setup
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
        scene.add(ambientLight);
    
        const pointLight = new THREE.PointLight(0xffffff, 1);
        pointLight.position.set(25, 50, 25);
        scene.add(pointLight);
    
        const pointLight2 = new THREE.PointLight(0xffffff, 1);
        pointLight2.position.set(-25, -50, -25);
        scene.add(pointLight2);
    
        // Text setup
        const fontLoader = new FontLoader();
        fontLoader.load("/fonts/helvetiker_regular.typeface.json", (font) => {
        const textGeometry = new TextGeometry("Hello World", {
            font: font,
            size: 3,
            height: 0.2,
            curveSegments: 12,
            bevelEnabled: true,
            bevelThickness: 0.15,
            bevelSize: 0.3,
            bevelOffset: 0,
            bevelSegments: 5,
        });
        const textMaterial = new THREE.MeshStandardMaterial({ color: 0x00ff00 });
        const text = new THREE.Mesh(textGeometry, textMaterial);
        text.position.set(-10, 0, 0);
        scene.add(text);
        }
        );

        // Terrain setup space theme 
        const terrainGeometry = new THREE.PlaneGeometry(500, 500, 64, 64);
        const terrainMaterial = new THREE.MeshStandardMaterial({ color: 0x32a852 }); // To change the color of terrain
        const terrain = new THREE.Mesh(terrainGeometry, terrainMaterial);
        terrain.rotation.x = -Math.PI / 2;
        scene.add(terrain);
        

