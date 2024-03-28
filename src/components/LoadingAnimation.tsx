'use client';

import loadingAnimation from 'public/loadingAnimation.json';
import Lottie from 'react-lottie-player';

export default function LoadingAnimation(props: any) {
  return <Lottie loop play animationData={loadingAnimation} {...props} />;
}
