export interface ImportedMediaMetadata { durationFrames:number; width?:number; height?:number; }

function readDuration(element:HTMLMediaElement,url:string):Promise<number>{
 return new Promise((resolve,reject)=>{
  const cleanup=()=>{element.onloadedmetadata=null;element.onerror=null;};
  element.preload="metadata";
  element.onloadedmetadata=()=>{const duration=element.duration;cleanup();if(Number.isFinite(duration)&&duration>0)resolve(duration);else reject(new Error("Media duration is unavailable."));};
  element.onerror=()=>{cleanup();reject(new Error("This media file could not be decoded by the browser."));};
  element.src=url;
  element.load();
 });
}

export async function inspectImportedMedia(file:File,url:string,fps:number):Promise<ImportedMediaMetadata>{
 if(file.type.startsWith("image/")){
  const image=new Image();
  const dimensions=await new Promise<{width:number;height:number}>((resolve,reject)=>{
   image.onload=()=>resolve({width:image.naturalWidth,height:image.naturalHeight});
   image.onerror=()=>reject(new Error("Image could not be decoded."));
   image.src=url;
  });
  return {durationFrames:Math.max(1,Math.round(fps*5)),...dimensions};
 }
 if(file.type.startsWith("video/")){
  const video=document.createElement("video");
  const duration=await readDuration(video,url);
  return {durationFrames:Math.max(1,Math.round(duration*fps)),width:video.videoWidth||undefined,height:video.videoHeight||undefined};
 }
 if(file.type.startsWith("audio/")){
  const audio=document.createElement("audio");
  const duration=await readDuration(audio,url);
  return {durationFrames:Math.max(1,Math.round(duration*fps))};
 }
 throw new Error("Unsupported media type.");
}
