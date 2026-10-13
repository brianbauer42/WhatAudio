import { useEffect, useMemo, useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Color, MathUtils } from 'three';
import { CARD_WIDTH, CARD_HEIGHT, drawCard, makeCardTexture } from './cardTexture.js';
import { resourceUrl } from '../api.js';
import { palette } from '../theme.js';

// Frame colours brighter than 1.0 cross the bloom threshold and glow. The
// playing track burns Las Vegas orange, the front card LA teal, the rest sit
// in a dim teal that stays under the threshold.
const FRAME = {
  current: new Color(palette.orange).multiplyScalar(2.8),
  focused: new Color(palette.teal).multiplyScalar(2.2),
  hover: new Color(palette.teal).multiplyScalar(1.3),
  idle: new Color(palette.teal).multiplyScalar(0.22),
};

const FRAME_INSET = 0.07;

export default function TrackCard({ track, index, angle, radius, isFocused, isCurrent, onSelect }) {
  const groupRef = useRef(null);
  const frameMaterial = useRef(null);
  const [hovered, setHovered] = useState(false);

  const canvas = useMemo(() => document.createElement('canvas'), []);
  const texture = useMemo(() => {
    drawCard(canvas, track, null);
    return makeCardTexture(canvas);
  }, [canvas, track]);

  useEffect(() => () => texture.dispose(), [texture]);

  // Paint the cover art in once it arrives, and repaint once the web fonts
  // are ready so the labels don't stay in the fallback face.
  useEffect(() => {
    let cancelled = false;
    let image = null;
    const redraw = (loadedImage) => {
      if (cancelled) return;
      drawCard(canvas, track, loadedImage);
      texture.needsUpdate = true;
    };
    const url = resourceUrl(track.artUri);
    if (url) {
      image = new Image();
      image.onload = () => redraw(image);
      image.src = url;
    }
    document.fonts?.ready.then(() => {
      redraw(image && image.complete && image.naturalWidth ? image : null);
    });
    return () => {
      cancelled = true;
    };
  }, [canvas, texture, track]);

  useEffect(() => {
    document.body.style.cursor = hovered ? 'pointer' : '';
    return () => {
      document.body.style.cursor = '';
    };
  }, [hovered]);

  useFrame((state, delta) => {
    const group = groupRef.current;
    if (!group) return;
    const k = 1 - Math.exp(-delta * 8);

    const targetScale = isFocused ? 1.08 : hovered ? 1.04 : 1;
    group.scale.setScalar(MathUtils.lerp(group.scale.x, targetScale, k));

    // A slow drift so the ring feels suspended rather than bolted down.
    group.position.y = Math.sin(state.clock.elapsedTime * 0.6 + index * 0.9) * 0.06;

    const target = isCurrent ? FRAME.current : isFocused ? FRAME.focused : hovered ? FRAME.hover : FRAME.idle;
    frameMaterial.current?.color.lerp(target, k);
  });

  return (
    <group
      position={[Math.sin(angle) * radius, 0, Math.cos(angle) * radius]}
      rotation-y={angle}
    >
      <group
        ref={groupRef}
        onClick={(event) => {
          event.stopPropagation();
          onSelect(track);
        }}
        onPointerOver={(event) => {
          event.stopPropagation();
          setHovered(true);
        }}
        onPointerOut={() => setHovered(false)}
      >
        <mesh position-z={-0.015}>
          <planeGeometry args={[CARD_WIDTH + FRAME_INSET, CARD_HEIGHT + FRAME_INSET]} />
          <meshBasicMaterial ref={frameMaterial} color={palette.teal} toneMapped={false} />
        </mesh>
        <mesh>
          <planeGeometry args={[CARD_WIDTH, CARD_HEIGHT]} />
          <meshBasicMaterial map={texture} toneMapped={false} />
        </mesh>
      </group>
    </group>
  );
}
