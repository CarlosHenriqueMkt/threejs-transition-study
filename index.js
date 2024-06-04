import * as THREE from "three";
import { getFXScene } from "./FXScene.js";
import { getTransition } from "./Transition.js";

const clock = new THREE.Clock();
let transition;
let isSceneAActive = true; // Boolean to track if scene A is active

init();
animate();

function init() {
  const container = document.getElementById("container");

  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);
  container.appendChild(renderer.domElement);

  const materialA = new THREE.MeshBasicMaterial({
    color: 0x00FF00,
    wireframe: true,
  });
  const materialB = new THREE.MeshStandardMaterial({
    color: 0xFF9900,
    flatShading: true,
  });
  const sceneA = getFXScene({
    renderer,
    material: materialA,
    clearColor: 0x000000,
  });
  const sceneB = getFXScene({
    renderer,
    material: materialB,
    clearColor: 0x000000,
    needsAnimatedColor: true,
  });

  transition = getTransition({ renderer, sceneA, sceneB });

  // Configure the buttons
  document.getElementById('buttonA').addEventListener('click', () => {
    startTransition(sceneA);
    isSceneAActive = true; // Set scene A as active
  });

  document.getElementById('buttonB').addEventListener('click', () => {
    startTransition(sceneB);
    isSceneAActive = false; // Set scene B as active
  });
}

function startTransition(targetScene) {
  transition.startTransition(targetScene);
}

function animate() {
  requestAnimationFrame(animate);
  const delta = clock.getDelta();
  transition.render(delta, isSceneAActive); // Pass the boolean value to render
}
