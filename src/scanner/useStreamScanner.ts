import { useEffect, useRef, useState } from "preact/hooks";
import captureImage from "./captureImage";
import AsyncWorker from "../utils/AsyncWorker";
import { wait } from "../utils/utils";

let processImageWorker = new AsyncWorker("processImage.worker.js");

export default function useStreamScanner(video) {
  let imageDataRef = useRef(null);
  let [processor, setProcessor] = useState(null);
  useEffect(() => {
    let isUnmounted = false;
    if (video.isPlaying && video.ref.current) {
      let doAsync = async () => {
        await wait(75);
        if (isUnmounted) return;
        let videoElem: HTMLVideoElement = video.ref.current;
        imageDataRef.current = captureImage(videoElem);
        let data = await processFrame(
          imageDataRef.current,
          videoElem.videoWidth,
          videoElem.videoHeight
        );
        if (isUnmounted) return;

        setProcessor(data);
      };

      doAsync();
    }

    return () => {
      isUnmounted = true;
    };
  }, [video.ref, video.isPlaying, processor]);

  return { ...processor, imageData: imageDataRef.current };
}

const processFrame = async (imageData: ImageData, width, height) => {
  let data = await processImageWorker
    .execute({
      imageData,
      width,
      height,
    })
    .catch((err) => {
      console.log("process frame error", err);
    });
  return data as any;
  //   console.log("data", data);
  //   console.log("Image Bytes", image.bytes);
};
