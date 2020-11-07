import { useEffect, useRef, useState } from "preact/hooks";
import captureImage from "./captureImage";
import AsyncWorker from "../utils/AsyncWorker";
import { wait } from "../utils/utils";

let processImageWorker = new AsyncWorker("processImage.worker.js");

export default function useStreamScanner(video) {
  let [processor, setProcessor] = useState(null);
  useEffect(() => {
    let isUnmounted = false;
    if (video.isPlaying && video.ref.current) {
      let doAsync = async () => {
        await wait(75);
        let data = await processFrame(video.ref.current);
        if (isUnmounted) return;

        setProcessor(data);
      };

      doAsync();
    }

    return () => {
      isUnmounted = true;
    };
  }, [video.ref, video.isPlaying, processor]);

  return processor;
}

const processFrame = async (video: HTMLVideoElement) => {
  const imageData = captureImage(video);
  let data = await processImageWorker
    .execute({
      imageData,
      width: video.videoWidth,
      height: video.videoHeight,
    })
    .catch((err) => {
      console.log("process frame error", err);
    });
  return data as any;
  //   console.log("data", data);
  //   console.log("Image Bytes", image.bytes);
};
