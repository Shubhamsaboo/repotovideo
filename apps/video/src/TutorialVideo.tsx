import { Audio, staticFile } from "remotion";
import { TransitionSeries, linearTiming } from "@remotion/transitions";
import { slide } from "@remotion/transitions/slide";
import { fade } from "@remotion/transitions/fade";
import { CTAScene } from "./scenes/CTAScene";
import { FeaturesScene } from "./scenes/FeaturesScene";
import { HookScene } from "./scenes/HookScene";
import { StatsScene } from "./scenes/StatsScene";
import { TechScene } from "./scenes/TechScene";
import { WhatScene } from "./scenes/WhatScene";

const FPS = 30;

const SCENES = [
  { id: "hook", dur: Math.ceil(7.560 * FPS), audio: "audio_viral/scene_00.mp3" },
  { id: "what", dur: Math.ceil(12.624 * FPS), audio: "audio_viral/scene_01.mp3" },
  { id: "features", dur: Math.ceil(13.152 * FPS), audio: "audio_viral/scene_02.mp3" },
  { id: "tech", dur: Math.ceil(10.344 * FPS), audio: "audio_viral/scene_03.mp3" },
  { id: "stats", dur: Math.ceil(15.840 * FPS), audio: "audio_viral/scene_04.mp3" },
  { id: "cta", dur: Math.ceil(5.472 * FPS), audio: "audio_viral/scene_05.mp3" }
];

const DATA = {
  'name': 'openclaw',
  'fullName': 'openclaw/openclaw',
  'description': 'A self-hosted, personal AI assistant that integrates with all your favorite chat apps.',
  'stars': 192673,
  'forks': 33034,
  'language': 'TypeScript',
  'hookStyle': 'counter',
  'hookText': 'This AI assistant has almost 200,000 stars.',
  'tagline': 'Your personal AI, everywhere you chat.',
  'features': [
    {
      'emoji': '\ud83d\udcac',
      'title': 'Universal Integration',
      'desc': 'Talk to your AI on WhatsApp, Slack, iMessage, and more.'
    },
    {
      'emoji': '\ud83d\udd12',
      'title': 'Own Your Data',
      'desc': 'Self-hosted on your own devices for maximum privacy.'
    },
    {
      'emoji': '\ud83d\udcbb',
      'title': 'Cross-Platform',
      'desc': 'Works on any OS, with voice support for mobile and desktop.'
    },
    {
      'emoji': '\ud83e\udde0',
      'title': 'Multi-Model Support',
      'desc': 'Plug in your favorite models from OpenAI, Anthropic, and others.'
    }
  ],
  'techStack': [
    {
      'emoji': '\ud83d\udcdc',
      'name': 'TypeScript'
    },
    {
      'emoji': '\ud83d\udfe9',
      'name': 'Node.js'
    },
    {
      'emoji': '\ud83d\udc33',
      'name': 'Docker'
    },
    {
      'emoji': '\ud83e\udd16',
      'name': 'OpenAI'
    },
    {
      'emoji': '\ud83e\udde0',
      'name': 'Anthropic'
    },
    {
      'emoji': '\ud83d\udce6',
      'name': 'npm/pnpm/bun'
    },
    {
      'emoji': '\u2744\ufe0f',
      'name': 'Nix'
    }
  ]
};

function getSceneDur(id: string): number {
  return SCENES.find(s => s.id === id)?.dur ?? 150;
}

export const TutorialVideo = () => {
  return (
    <div style={ { backgroundColor: "#0a0a0a", width: 1920, height: 1080 } }>
      {/* Background music */}
      <Audio src={staticFile("music/tech.mp3")} volume={0.22} />
      
      <TransitionSeries>
        {/* Scene audio tracks */}
        {SCENES.map((s, i) => (
          <TransitionSeries.Sequence key={s.id + "-audio"} durationInFrames={s.dur}>
            <Audio src={staticFile(s.audio)} volume={0.9} />
          </TransitionSeries.Sequence>
        ))}
      </TransitionSeries>

      <TransitionSeries>
        
        <TransitionSeries.Sequence durationInFrames={getSceneDur("hook")}>
          <HookScene data={DATA} />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition
          presentation={slide({ direction: "from-right" })}
          timing={linearTiming({ durationInFrames: 8 })}
        />
        <TransitionSeries.Sequence durationInFrames={getSceneDur("what")}>
          <WhatScene data={DATA} />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition
          presentation={slide({ direction: "from-right" })}
          timing={linearTiming({ durationInFrames: 8 })}
        />
        <TransitionSeries.Sequence durationInFrames={getSceneDur("features")}>
          <FeaturesScene data={DATA} />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition
          presentation={slide({ direction: "from-right" })}
          timing={linearTiming({ durationInFrames: 8 })}
        />
        <TransitionSeries.Sequence durationInFrames={getSceneDur("tech")}>
          <TechScene data={DATA} />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition
          presentation={slide({ direction: "from-right" })}
          timing={linearTiming({ durationInFrames: 8 })}
        />
        <TransitionSeries.Sequence durationInFrames={getSceneDur("stats")}>
          <StatsScene data={DATA} />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition
          presentation={slide({ direction: "from-right" })}
          timing={linearTiming({ durationInFrames: 8 })}
        />
        <TransitionSeries.Sequence durationInFrames={getSceneDur("cta")}>
          <CTAScene data={DATA} />
        </TransitionSeries.Sequence>
        
      </TransitionSeries>
    </div>
  );
};
