import * as THREE from "three";
import { TWEEN } from "https://cdn.jsdelivr.net/npm/three@0.131/examples/jsm/libs/tween.module.min.js";

const transitionParams = {
  transition: 0,
  texture: 5,
  cycle: true,
  animate: true,
};

export function getTransition({ renderer, sceneA, sceneB }) {
  const scene = new THREE.Scene();
  const w = window.innerWidth;
  const h = window.innerHeight;
  const camera = new THREE.OrthographicCamera(w / -2, w / 2, h / 2, h / -2, -10, 10);

  const textures = [];
  const loader = new THREE.TextureLoader();

  for (let i = 0; i < 3; i++) {
    textures[i] = loader.load(`./img/transition${i}.png`);
  }

  const material = new THREE.ShaderMaterial({
    uniforms: {
      tDiffuse1: { value: null },
      tDiffuse2: { value: null },
      mixRatio: { value: 0.0 },
      threshold: { value: 0.1 },
      useTexture: { value: 1 },
      tMixTexture: { value: textures[0] },
    },
    vertexShader: `varying vec2 vUv;
    void main() {
      vUv = vec2( uv.x, uv.y );
      gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
    }`,
    fragmentShader: `
      uniform float mixRatio;
      uniform sampler2D tDiffuse1;
      uniform sampler2D tDiffuse2;
      uniform sampler2D tMixTexture;
      uniform int useTexture;
      uniform float threshold;
      varying vec2 vUv;

      void main() {
        vec4 texel1 = texture2D( tDiffuse1, vUv );
        vec4 texel2 = texture2D( tDiffuse2, vUv );

        if (useTexture == 1) {
          vec4 transitionTexel = texture2D( tMixTexture, vUv );
          float r = mixRatio * (1.0 + threshold * 2.0) - threshold;
          float mixf = clamp((transitionTexel.r - r) * (1.0 / threshold), 0.0, 1.0);

          gl_FragColor = mix(texel1, texel2, mixf);
        } else {
          gl_FragColor = mix(texel2, texel1, mixRatio);
        }
      }`,
  });

  const geometry = new THREE.PlaneGeometry(w, h);
  const mesh = new THREE.Mesh(geometry, material);
  scene.add(mesh);

  let currentScene = sceneA; // Inicialmente define a cena atual como sceneA

  function startTransition(targetScene) {
    if (targetScene === sceneA) {
      material.uniforms.tDiffuse1.value = sceneB.fbo.texture;
      material.uniforms.tDiffuse2.value = sceneA.fbo.texture;
    } else {
      material.uniforms.tDiffuse1.value = sceneA.fbo.texture;
      material.uniforms.tDiffuse2.value = sceneB.fbo.texture;
    }

    new TWEEN.Tween(transitionParams)
      .to({ transition: 1 }, 1000) // duração da transição
      .onComplete(() => {
        transitionParams.transition = 0;
      })
      .start();
  }

  const render = (delta) => {
    TWEEN.update();

    material.uniforms.mixRatio.value = transitionParams.transition;

    if (transitionParams.transition === 0) {
      currentScene.update(delta);
      currentScene.render(delta, false);
    } else {
      sceneA.render(delta, true);
      sceneB.render(delta, true);
      renderer.setRenderTarget(null);
      renderer.render(scene, camera);
    }
  };

  return { render, startTransition };
}
