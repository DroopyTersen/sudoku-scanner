export default function captureImage(video: HTMLVideoElement): ImageData {
  const canvas = document.createElement("canvas");
  const width = video.videoWidth;
  const height = video.videoHeight;
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext("2d");
  // draw the video to the canvas
  context!.drawImage(video, 0, 0, width, height);
  // get the raw image bytes
  return context!.getImageData(0, 0, width, height);
}
