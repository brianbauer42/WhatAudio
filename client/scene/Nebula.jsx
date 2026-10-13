import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { BackSide, Color } from 'three';
import { palette } from '../theme.js';

const vertexShader = /* glsl */ `
  varying vec3 vDir;
  void main() {
    vDir = position;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

// Layered value noise painted onto the inside of a sphere: teal cloud high
// up, irradiated orange along the horizon, the odd pink pocket.
const fragmentShader = /* glsl */ `
  precision highp float;
  varying vec3 vDir;
  uniform float uTime;
  uniform vec3 uBase;
  uniform vec3 uTeal;
  uniform vec3 uOrange;
  uniform vec3 uPink;

  float hash(vec3 p) {
    p = fract(p * 0.3183099 + 0.1);
    p *= 17.0;
    return fract(p.x * p.y * p.z * (p.x + p.y + p.z));
  }

  float noise(vec3 x) {
    vec3 i = floor(x);
    vec3 f = fract(x);
    f = f * f * (3.0 - 2.0 * f);
    return mix(
      mix(mix(hash(i + vec3(0, 0, 0)), hash(i + vec3(1, 0, 0)), f.x),
          mix(hash(i + vec3(0, 1, 0)), hash(i + vec3(1, 1, 0)), f.x), f.y),
      mix(mix(hash(i + vec3(0, 0, 1)), hash(i + vec3(1, 0, 1)), f.x),
          mix(hash(i + vec3(0, 1, 1)), hash(i + vec3(1, 1, 1)), f.x), f.y),
      f.z);
  }

  float fbm(vec3 p) {
    float v = 0.0;
    float a = 0.5;
    for (int i = 0; i < 5; i++) {
      v += a * noise(p);
      p = p * 2.02 + vec3(0.31, 0.17, 0.23);
      a *= 0.5;
    }
    return v;
  }

  void main() {
    vec3 d = normalize(vDir);
    float t = uTime * 0.015;

    float n1 = fbm(d * 3.0 + vec3(t, 0.0, -t));
    float n2 = fbm(d * 6.0 + vec3(-t, t * 0.7, 0.0) + n1 * 1.5);
    float haze = smoothstep(0.38, 0.82, n2);

    float up = d.y * 0.5 + 0.5;
    vec3 col = uBase;

    // Cold cloud overhead.
    col += uTeal * haze * 0.32 * smoothstep(0.25, 0.9, up);

    // Warm band low on the horizon, as if a city were burning below.
    float horizon = exp(-abs(d.y + 0.22) * 7.0);
    col += uOrange * horizon * (0.07 + 0.2 * n1);

    // Occasional pink pockets.
    float pinkMask = smoothstep(0.62, 0.95, fbm(d * 2.0 + vec3(5.0 + t * 0.4)));
    col += uPink * pinkMask * haze * 0.28;

    gl_FragColor = vec4(col, 1.0);
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
  }
`;

export default function Nebula() {
  const materialRef = useRef(null);
  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uBase: { value: new Color(palette.background) },
      uTeal: { value: new Color(palette.teal) },
      uOrange: { value: new Color(palette.orange) },
      uPink: { value: new Color(palette.pink) },
    }),
    []
  );

  useFrame((state) => {
    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value = state.clock.elapsedTime;
    }
  });

  return (
    <mesh>
      <sphereGeometry args={[300, 48, 32]} />
      <shaderMaterial
        ref={materialRef}
        uniforms={uniforms}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        side={BackSide}
        depthWrite={false}
        fog={false}
      />
    </mesh>
  );
}
