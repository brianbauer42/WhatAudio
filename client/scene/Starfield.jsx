import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Stars } from '@react-three/drei';

/** A slowly turning starfield, well outside the ring. */
export default function Starfield() {
  const groupRef = useRef(null);

  useFrame((_state, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.004;
      groupRef.current.rotation.x += delta * 0.0015;
    }
  });

  return (
    <group ref={groupRef}>
      <Stars radius={160} depth={120} count={5000} factor={5} saturation={0.15} fade speed={0.6} />
    </group>
  );
}
