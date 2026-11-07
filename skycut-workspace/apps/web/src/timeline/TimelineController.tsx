import React,{useCallback,useMemo,useRef,useState} from "react";
import {useEditorStore,type Track,type Clip} from "../store/editorStore";

const TRACK_HEIGHT=58,HEADER_WIDTH=148,MIN_PX_PER_SECOND=12,MAX_PX_PER_SECOND=600;
function clamp(n:number,min:number,max:number){return Math.min(max,Math.max(min,n));}
export interface TimelineControllerProps { height?:number; onSeek?:(frame:number)=>void; }
export function TimelineController({height=360,onSeek}:TimelineControllerProps){
 const project=useEditorStore(s=>s.project),playhead=useEditorStore(s=>s.playheadFrame),zoom=useEditorStore(s=>s.zoom),scrollFrame=useEditorStore(s=>s.scrollFrame),snapping=useEditorStore(s=>s.snapping),ripple=useEditorStore(s=>s.ripple);
 const setPlayhead=useEditorStore(s=>s.setPlayhead),setZoom=useEditorStore(s=>s.setZoom),setScrollFrame=useEditorStore(s=>s.setScrollFrame),setSnapping=useEditorStore(s=>s.setSnapping),setRipple=useEditorStore(s=>s.setRipple),selectClip=useEditorStore(s=>s.selectClip),moveClip=useEditorStore(s=>s.moveClip),trimClip=useEditorStore(s=>s.trimClip);
 const [drag,setDrag]=useState<{trackId:string;clipId:string;originX:number;originStart:number;mode:"move"|"left"|"right"}|null>(null);
 const scrollRef=useRef<HTMLDivElement>(null),dragRef=useRef(drag);dragRef.current=drag;
 const pxPerFrame=useMemo(()=>project.fps*MIN_PX_PER_SECOND*zoom/30, [project.fps,zoom]);
 const totalFrames=Math.max(project.tracks.reduce((m,t)=>Math.max(m,...t.clips.map(c=>c.startFrame+c.durationFrames)),0),project.fps*60);
 const visibleTracks=project.tracks;
 const snapFrame=useCallback((frame:number,exclude?:string)=>{if(!snapping)return Math.round(frame);const candidates=[playhead];for(const t of project.tracks)for(const c of t.clips)if(c.id!==exclude){candidates.push(c.startFrame,c.startFrame+c.durationFrames);}const nearest=candidates.reduce((best,n)=>Math.abs(n-frame)<Math.abs(best-frame)?n:best,frame);return Math.abs(nearest-frame)<=Math.max(2,Math.round(project.fps*.12))?nearest:Math.round(frame);},[snapping,playhead,project.tracks,project.fps]);
 const seek=(clientX:number)=>{const el=scrollRef.current;if(!el)return;const rect=el.getBoundingClientRect();const x=clientX-rect.left+el.scrollLeft;const frame=Math.max(0,Math.round(x/pxPerFrame)+scrollFrame);setPlayhead(frame);onSeek?.(frame);};
 const beginDrag=(e:React.PointerEvent,track:Track,clip:Clip,mode:"move"|"left"|"right")=>{if(track.locked)return;e.preventDefault();e.stopPropagation();selectClip(track.id,clip.id);setDrag({trackId:track.id,clipId:clip.id,originX:e.clientX,originStart:clip.startFrame,mode});(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);};
 const finishDrag=(e:React.PointerEvent)=>{const d=dragRef.current;if(!d)return;const delta=Math.round((e.clientX-d.originX)/pxPerFrame);const track=project.tracks.find(t=>t.id===d.trackId),clip=track?.clips.find(c=>c.id===d.clipId);if(clip){if(d.mode==="move")moveClip(d.trackId,d.clipId,snapFrame(Math.max(0,d.originStart+delta),d.clipId));else if(d.mode==="left")trimClip(d.trackId,d.clipId,Math.min(d.originStart+clip.durationFrames-1,snapFrame(d.originStart+delta)),d.originStart+clip.durationFrames);else trimClip(d.trackId,d.clipId,d.originStart,snapFrame(d.originStart+clip.durationFrames+delta));}setDrag(null);};
 const rulerTicks=useMemo(()=>{const step=Math.max(1,Math.round(project.fps*(zoom>3?1:zoom>1?2:5)));const count=Math.ceil(totalFrames/step);return Array.from({length:Math.min(count,1500)},(_,i)=>i*step);},[totalFrames,project.fps,zoom]);
 const timelineWidth=Math.max(900,(totalFrames-scrollFrame)*pxPerFrame+600);
 return <section className="flex min-w-0 flex-col overflow-hidden rounded-xl border border-white/10 bg-[#101216] text-slate-100" style={{height}}>
  <header className="flex h-11 shrink-0 items-center gap-3 border-b border-white/10 px-3 text-xs">
   <strong className="mr-auto tracking-wide">TIMELINE</strong>
   <button className={snapping?"text-cyan-300":"text-slate-500"} onClick={()=>setSnapping(!snapping)}>Snap {snapping?"On":"Off"}</button>
   <button className={ripple?"text-cyan-300":"text-slate-500"} onClick={()=>setRipple(!ripple)}>Ripple {ripple?"On":"Off"}</button>
   <button onClick={()=>setZoom(clamp(zoom/1.2,.05,100))}>−</button><span>{Math.round(zoom*100)}%</span><button onClick={()=>setZoom(clamp(zoom*1.2,.05,100))}>+</button>
   <span className="tabular-nums text-slate-400">{(playhead/project.fps).toFixed(3)}s</span>
  </header>
  <div className="flex min-h-0 flex-1">
   <aside className="z-10 w-[148px] shrink-0 border-r border-white/10 bg-[#15181e]">
    <div className="h-8 border-b border-white/10 px-3 py-2 text-[10px] uppercase tracking-widest text-slate-500">Tracks</div>
    {visibleTracks.map(t=><div key={t.id} className="flex h-[58px] items-center border-b border-white/5 px-3 text-xs"><span className="truncate">{t.name}</span><span className="ml-auto text-[9px] text-slate-500">{t.kind}</span></div>)}
   </aside>
   <div ref={scrollRef} className="relative min-w-0 flex-1 overflow-auto" onPointerDown={e=>{if(e.target===e.currentTarget)seek(e.clientX);}}>
    <div className="relative" style={{width:timelineWidth,minHeight:32+visibleTracks.length*TRACK_HEIGHT}}>
     <div className="sticky top-0 z-20 h-8 border-b border-white/10 bg-[#171a20]">
      {rulerTicks.map(f=><button key={f} className="absolute top-0 h-8 border-l border-white/10 pl-1 text-[9px] text-slate-500" style={{left:(f-scrollFrame)*pxPerFrame}} onClick={e=>{e.stopPropagation();setPlayhead(f);onSeek?.(f);}}>{(f/project.fps).toFixed(0)}s</button>)}
     </div>
     {visibleTracks.map((track,row)=><div key={track.id} className="relative h-[58px] border-b border-white/5 bg-white/[0.015]" style={{width:timelineWidth}}>
      {track.clips.map(clip=><div key={clip.id} onPointerDown={e=>beginDrag(e,track,clip,"move")} onPointerUp={finishDrag} onPointerCancel={()=>setDrag(null)} className="group absolute top-2 h-[42px] cursor-grab overflow-hidden rounded-md border border-cyan-300/30 bg-cyan-500/20 text-[10px] active:cursor-grabbing" style={{left:(clip.startFrame-scrollFrame)*pxPerFrame,width:Math.max(12,clip.durationFrames*pxPerFrame)}} title={clip.id}>
       <button aria-label="Trim clip start" onPointerDown={e=>beginDrag(e,track,clip,"left")} onPointerUp={finishDrag} className="absolute inset-y-0 left-0 z-10 w-2 cursor-ew-resize bg-cyan-300/60"/>
       <span className="block truncate px-3 py-3">{project.assets.find(a=>a.id===clip.assetId)?.uri.split("/").pop()??"Media clip"}</span>
       <button aria-label="Trim clip end" onPointerDown={e=>beginDrag(e,track,clip,"right")} onPointerUp={finishDrag} className="absolute inset-y-0 right-0 z-10 w-2 cursor-ew-resize bg-cyan-300/60"/>
      </div>)}
     </div>)}
     <div className="pointer-events-none absolute bottom-0 top-0 z-30 w-px bg-rose-400" style={{left:(playhead-scrollFrame)*pxPerFrame}}><div className="-ml-1.5 h-3 w-3 rounded-b bg-rose-400"/></div>
    </div>
   </div>
  </div>
 </section>;
}
