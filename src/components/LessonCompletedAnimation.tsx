'use client';

import { DotLottiePlayer } from '@dotlottie/react-player';

export default function LessonCompletedAnimation(props: any) {
  return (
    <DotLottiePlayer
      src='/lessonCompletedAnimation.lottie'
      autoplay
      loop
      {...props}
    ></DotLottiePlayer>
  );
}
