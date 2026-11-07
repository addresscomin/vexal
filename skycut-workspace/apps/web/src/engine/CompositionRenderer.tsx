import React,{useEffect,useRef} from "react";
import {evaluateKeyframes,type EditorProject,type BlendMode} from "../store/editorStore";
interface Props {project:EditorProject;urls:Record<string,string>;frame:number;playing:boolean;canvasRef?:React.RefObject<HTMLCanvasElement|null>;}
const compositeMode:Record<BlendMode,GlobalCompositeOperation>={normal:"source-over",multiply:"multiply",screen:"screen",overlay:"overlay",darken:"darken",lighten:"lighten",difference:"difference"};
const clamp=(n:number,min:number,max:number)=>Math.min(max,Math.max(min,n));
export function CompositionRenderer({project,urls,frame,playing,canvasRef:externalCanvasRef}:Props){
 const internalCanvasRef=useRef<HTMLCanvasElement>(null);
 const canvasRef=externalCanvasRef??internalCanvasRef;
 const latest=useRef({project,urls,frame,playing});
 useEffect(()=>{latest.current={project,urls,frame,playing};},[project,urls,frame,playing]);
 useEffect(()=>{
  const canvas=canvasRef.current,ctx=canvas?.getContext("2d",{alpha:true});
  if(!canvas||!ctx)return;
  const videos=new Map<string,HTMLVideoElement>(),images=new Map<string,HTMLImageElement>();
  const createSources=(state:typeof latest.current)=>{
   for(const asset of state.project.assets){
    const url=state.urls[asset.id];if(!url)continue;
    if(asset.type==="video"&&!videos.has(asset.id)){const video=document.createElement("video");video.src=url;video.preload="auto";video.playsInline=true;video.muted=true;video.load();videos.set(asset.id,video);}
    if(asset.type==="image"&&!images.has(asset.id)){const image=new Image();image.src=url;images.set(asset.id,image);}
   }
  };
  let raf=0;
  const draw=()=>{
   const state=latest.current,p=state.project;createSources(state);
   if(canvas.width!==p.width)canvas.width=p.width;if(canvas.height!==p.height)canvas.height=p.height;
   ctx.clearRect(0,0,canvas.width,canvas.height);ctx.fillStyle="#080b11";ctx.fillRect(0,0,canvas.width,canvas.height);
   const activeVideoIds=new Set<string>();
   for(const track of p.tracks){
    if(!track.visible||track.kind==="audio")continue;
    for(const clip of track.clips){
     const local=state.frame-clip.startFrame;if(local<0||local>=clip.durationFrames)continue;
     const asset=p.assets.find(item=>item.id===clip.assetId);if(!asset)continue;
     const ov=evaluateKeyframes(clip.keyframes.opacity??[],local,clip.opacity);
     const opacity=typeof ov==="number"?clamp(ov,0,1):clip.opacity;
     const pv=evaluateKeyframes(clip.keyframes.position??[],local,clip.transform.position);
     const sv=evaluateKeyframes(clip.keyframes.scale??[],local,clip.transform.scale);
     const rv=evaluateKeyframes(clip.keyframes.rotation??[],local,clip.transform.rotation);
     const pos=Array.isArray(pv)?pv:clip.transform.position,scale=Array.isArray(sv)?sv:clip.transform.scale,rotation=typeof rv==="number"?rv:clip.transform.rotation;
     ctx.save();ctx.globalAlpha=opacity;ctx.globalCompositeOperation=compositeMode[clip.blendMode]??"source-over";
     const fx=clip.effects??{};
     ctx.filter=[fx.blur?"blur("+fx.blur+"px)":"",fx.brightness?"brightness("+fx.brightness+")":"",fx.contrast?"contrast("+fx.contrast+")":"",fx.saturate?"saturate("+fx.saturate+")":"",fx.grayscale?"grayscale("+fx.grayscale+")":"",fx.sepia?"sepia("+fx.sepia+")":"",fx.hue?"hue-rotate("+fx.hue+"deg)":""] .filter(Boolean).join(" ")||"none";
     if(track.kind==="text"){
      ctx.translate(canvas.width/2+pos[0],canvas.height/2+pos[1]);ctx.rotate(rotation*Math.PI/180);ctx.scale(scale[0],scale[1]);ctx.fillStyle="#fff";ctx.font="700 72px Inter,Arial,sans-serif";ctx.textAlign="center";ctx.textBaseline="middle";ctx.shadowColor="rgba(0,0,0,.55)";ctx.shadowBlur=12;ctx.fillText(asset.uri,0,0,canvas.width*.85);ctx.restore();continue;
     }
     let source:CanvasImageSource|undefined,sw=asset.width??0,sh=asset.height??0;
     if(asset.type==="image"){const image=images.get(asset.id);if(image?.complete&&image.naturalWidth){source=image;sw=image.naturalWidth;sh=image.naturalHeight;}}
     if(asset.type==="video"){
      const video=videos.get(asset.id);
      if(video){activeVideoIds.add(asset.id);
       const target=(clip.sourceInFrame+local*clip.playbackRate)/p.fps;
       if(video.readyState>=2&&Number.isFinite(target)&&Math.abs(video.currentTime-target)>.18){try{video.currentTime=Math.max(0,target);}catch{}}
       if(video.readyState>=2&&video.videoWidth){source=video;sw=video.videoWidth;sh=video.videoHeight;}
       if(state.playing&&video.paused)video.play().catch(()=>{});else if(!state.playing&&!video.paused)video.pause();
      }
     }
     if(source&&sw>0&&sh>0){
      const fit=Math.min(canvas.width/sw,canvas.height/sh),w=sw*fit,h=sh*fit,mask=clip.mask??"none";
      if(mask!=="none"){
       ctx.beginPath();
       if(mask==="circle"||mask==="oval")ctx.ellipse(canvas.width/2,canvas.height/2,canvas.width*.48,canvas.height*(mask==="circle"?.48:.42),0,0,Math.PI*2);
       else if(mask==="left")ctx.rect(0,0,canvas.width*.72,canvas.height);
       else if(mask==="right")ctx.rect(canvas.width*.28,0,canvas.width*.72,canvas.height);
       else if(mask==="rounded")ctx.roundRect(canvas.width*.04,canvas.height*.04,canvas.width*.92,canvas.height*.92,Math.min(canvas.width,canvas.height)*.06);
       ctx.clip();
      }
      ctx.translate(canvas.width/2+pos[0],canvas.height/2+pos[1]);ctx.rotate(rotation*Math.PI/180);ctx.scale(scale[0],scale[1]);ctx.drawImage(source,-w/2,-h/2,w,h);
     }
     ctx.restore();
    }
   }
   videos.forEach((video,id)=>{if(!activeVideoIds.has(id)&&!video.paused)video.pause();});
   raf=requestAnimationFrame(draw);
  };
  draw();
  return ()=>{cancelAnimationFrame(raf);videos.forEach(video=>{video.pause();video.removeAttribute("src");video.load();});};
 },[]);
 return <canvas ref={canvasRef} className="composition-renderer" aria-label="Composition output"/>;
}
