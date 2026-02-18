import { Composition } from "remotion";
import { TutorialVideo } from "./TutorialVideo";

const FPS = 30;
// 7.560 + 12.624 + 13.152 + 10.344 + 15.840 + 5.472 = 64.992s
const TOTAL = Math.ceil(64.992 * FPS);

export const RemotionRoot = () => {
  return (
    <Composition
      id="ViralVideo"
      component={TutorialVideo}
      durationInFrames={TOTAL}
      fps={FPS}
      width={1920}
      height={1080}
    />
  );
};
