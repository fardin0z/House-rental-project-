"use client";

import {
  ALL_FORMATS,
  BlobSource,
  BufferTarget,
  Conversion,
  Input,
  Mp4OutputFormat,
  Output,
  QUALITY_MEDIUM,
} from "mediabunny";

export function webCodecsSupported(): boolean {
  return typeof window !== "undefined" && typeof window.VideoEncoder !== "undefined";
}

export function readVideoDuration(file: File): Promise<number> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const video = document.createElement("video");
    video.preload = "metadata";
    video.onloadedmetadata = () => {
      URL.revokeObjectURL(url);
      resolve(video.duration);
    };
    video.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("ভিডিও পড়া যায়নি"));
    };
    video.src = url;
  });
}

export async function compressVideo(
  file: File,
  onProgress?: (ratio: number) => void,
): Promise<File> {
  if (!webCodecsSupported()) {
    return file;
  }

  try {
    const input = new Input({ source: new BlobSource(file), formats: ALL_FORMATS });
    const output = new Output({
      format: new Mp4OutputFormat(),
      target: new BufferTarget(),
    });

    const conversion = await Conversion.init({
      input,
      output,
      video: {
        width: 1280,
        height: 1280,
        fit: "contain",
        bitrate: QUALITY_MEDIUM,
      },
    });

    if (!conversion.isValid) {
      console.error("[videoCompress] invalid conversion", conversion.discardedTracks);
      return file;
    }

    conversion.onProgress = (progress) => onProgress?.(progress);
    await conversion.execute();

    const buffer = output.target.buffer;
    if (!buffer) return file;

    const name = file.name.replace(/\.[^.]+$/, "") + "-compressed.mp4";
    return new File([buffer], name, { type: "video/mp4" });
  } catch (error) {
    console.error("[videoCompress]", error);
    return file;
  }
}
