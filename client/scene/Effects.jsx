import { Bloom, EffectComposer, Vignette } from '@react-three/postprocessing';

/**
 * Bloom only picks up pixels brighter than 1.0, which is why the glowing
 * frames use colours scaled past that and skip tone mapping.
 */
export default function Effects() {
  return (
    <EffectComposer multisampling={4}>
      <Bloom luminanceThreshold={1} luminanceSmoothing={0.25} mipmapBlur intensity={1.1} radius={0.65} />
      <Vignette eskil={false} offset={0.18} darkness={0.8} />
    </EffectComposer>
  );
}
