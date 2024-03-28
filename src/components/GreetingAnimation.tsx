'use client';

import greetingAnimation from 'public/greetingAnimation.json';
import Lottie from 'react-lottie-player';

export default function LoadingAnimation(props: any) {
  return <Lottie loop play animationData={greetingAnimation} {...props} />;
}
