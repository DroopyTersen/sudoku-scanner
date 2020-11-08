import { useCallback, useEffect, useRef, useState } from "preact/hooks";

const getStream = () => {
  return navigator.mediaDevices.getUserMedia({
    video: { facingMode: "environment", width: 640 },
    audio: false,
  });
};
export default function useCameraVideoStream() {
  const videoRef = useRef<HTMLVideoElement>(null);
  let streamRef = useRef(null);
  let [dimensions, setDimensions] = useState({ width: 200, height: 200 });
  let [isPlaying, setIsPlaying] = useState(false);

  const handleCanPlay = () => {
    const video = videoRef.current;
    video.removeEventListener("canplay", handleCanPlay);
    setDimensions({
      width: video.videoWidth,
      height: video.videoHeight,
    });
    setIsPlaying(true);
  };

  useEffect(() => {
    const video = videoRef.current;
    console.log(video);
    if (video) {
      console.log("video is loaded");
      let doAsync = async () => {
        streamRef.current = await getStream();
        video.addEventListener("canplay", handleCanPlay);
        video.srcObject = streamRef.current;
        video.play();
      };
      doAsync();
    }
  }, [videoRef]);

  const stop = useCallback(() => {
    setIsPlaying(false);
  }, [setIsPlaying]);

  return {
    ref: videoRef,
    stream: streamRef.current,
    ...dimensions,
    isPlaying,
    props: {
      ref: videoRef,
      ...dimensions,
    },
    stop,
  };
}
