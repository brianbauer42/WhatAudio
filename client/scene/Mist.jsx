import { useEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { CanvasTexture, Color, Object3D } from 'three';
import { CARD_HEIGHT } from './cardTexture.js';

const COUNT = 520;
const TAU = Math.PI * 2;

// Thin smoke tints: mostly fog-grey, with a little of the neon bleeding in.
const TINTS = ['#6f8494', '#64899a', '#587f90', '#7d6f7c', '#6f8494'];

/** A soft, slightly lumpy blob. Hundreds of these overlapping read as smoke. */
function makePuffTexture() {
  const size = 128;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  const blobs = [
    [0.5, 0.5, 0.5],
    [0.38, 0.45, 0.3],
    [0.62, 0.56, 0.28],
    [0.5, 0.36, 0.26],
  ];
  for (const [cx, cy, r] of blobs) {
    const gradient = ctx.createRadialGradient(cx * size, cy * size, 0, cx * size, cy * size, r * size);
    gradient.addColorStop(0, 'rgba(255,255,255,0.55)');
    gradient.addColorStop(0.45, 'rgba(255,255,255,0.18)');
    gradient.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, size, size);
  }
  return new CanvasTexture(canvas);
}

/**
 * A bed of slowly drifting mist under the ring, where the neon rail used to
 * be. Billboarded instanced quads, each on its own slow orbit.
 */
export default function Mist({ radius }) {
  const meshRef = useRef(null);
  const texture = useMemo(() => makePuffTexture(), []);
  const dummy = useMemo(() => new Object3D(), []);

  const puffs = useMemo(() => {
    const list = [];
    for (let i = 0; i < COUNT; i += 1) {
      list.push({
        angle: Math.random() * TAU,
        // Mostly inside the ring and under the cards, so it never drifts
        // between the camera and the front card.
        radial: -1.6 + Math.random() * 2.2,
        y: -CARD_HEIGHT / 2 - 1.0 + Math.random() * 0.9,
        size: 1.2 + Math.random() * 1.8,
        speed: (0.006 + Math.random() * 0.012) * (Math.random() < 0.5 ? -1 : 1),
        bob: Math.random() * TAU,
        spin: (Math.random() - 0.5) * 0.08,
      });
    }
    return list;
  }, []);

  useEffect(() => () => texture.dispose(), [texture]);

  useEffect(() => {
    const mesh = meshRef.current;
    if (!mesh) return;
    const color = new Color();
    puffs.forEach((_puff, i) => {
      color.set(TINTS[i % TINTS.length]);
      mesh.setColorAt(i, color);
    });
    mesh.instanceColor.needsUpdate = true;
  }, [puffs]);

  useFrame((state) => {
    const mesh = meshRef.current;
    if (!mesh) return;
    const t = state.clock.elapsedTime;
    puffs.forEach((puff, i) => {
      const angle = puff.angle + t * puff.speed;
      const r = radius + puff.radial + Math.sin(t * 0.11 + puff.bob) * 0.3;
      dummy.position.set(Math.sin(angle) * r, puff.y + Math.sin(t * 0.17 + puff.bob) * 0.12, Math.cos(angle) * r);
      dummy.quaternion.copy(state.camera.quaternion);
      dummy.rotateZ(puff.bob + t * puff.spin);
      dummy.scale.setScalar(puff.size);
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);
    });
    mesh.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, COUNT]} frustumCulled={false}>
      <planeGeometry args={[1, 1]} />
      <meshBasicMaterial map={texture} transparent opacity={0.045} depthWrite={false} toneMapped={false} />
    </instancedMesh>
  );
}
