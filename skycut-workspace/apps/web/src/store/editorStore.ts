import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";

export type TrackKind = "video" | "audio" | "text" | "overlay" | "adjustment" | "vfx";
export type BlendMode = "normal" | "multiply" | "screen" | "overlay" | "darken" | "lighten" | "difference";
export type Vec2 = readonly [number, number];
export type KeyframeValue = number | Vec2;
export interface Keyframe { id: string; frame: number; value: KeyframeValue; inTangent?: Vec2; outTangent?: Vec2; interpolation: "linear" | "bezier" | "hold"; }
export interface Asset { id: string; uri: string; type: "video" | "audio" | "image"; durationFrames: number; width?: number; height?: number; }
export interface Clip {
  id: string; assetId: string; startFrame: number; sourceInFrame: number; durationFrames: number;
  playbackRate: number; volume: number; muted: boolean; opacity: number; blendMode: BlendMode;
  transform: { position: Vec2; scale: Vec2; rotation: number; anchor: Vec2 };
  keyframes: Record<string, readonly Keyframe[]>;
  effects?: Record<string, number>; mask?: "none" | "circle" | "oval" | "rounded" | "left" | "right";
}
export interface Track { id: string; name: string; kind: TrackKind; muted: boolean; locked: boolean; visible: boolean; clips: readonly Clip[]; }
export interface Composition { id: string; name: string; fps: number; width: number; height: number; durationFrames: number; tracks: readonly Track[]; }
export interface EditorProject { id: string; name: string; fps: number; width: number; height: number; assets: readonly Asset[]; tracks: readonly Track[]; compositions: readonly Composition[]; activeCompositionId: string; }
export interface EditorSnapshot { project: EditorProject; playheadFrame: number; selectedClipId: string | null; selectedTrackId: string | null; }
type HistoryEntry = EditorSnapshot;
interface EditorState extends EditorSnapshot {
  zoom: number; scrollFrame: number; snapping: boolean; ripple: boolean; historyPast: readonly HistoryEntry[]; historyFuture: readonly HistoryEntry[];
  setPlayhead(frame: number): void; selectClip(trackId: string | null, clipId: string | null): void;
  setZoom(zoom: number): void; setScrollFrame(frame: number): void; setSnapping(value: boolean): void; setRipple(value: boolean): void;
  createComposition(name: string, width?: number, height?: number, fps?: number): string; switchComposition(compositionId: string): void; addTrack(track: Track): void; updateTrack(trackId: string, patch: Partial<Track>): void; moveTrack(trackId: string, direction: -1 | 1): void; addAsset(asset: Asset): void; addClip(trackId: string, clip: Clip): void;
  updateClip(trackId: string, clipId: string, patch: Partial<Clip>): void; splitClip(trackId: string, clipId: string, atFrame: number): void;
  trimClip(trackId: string, clipId: string, startFrame: number, endFrame: number): void;
  moveClip(trackId: string, clipId: string, startFrame: number): void; deleteClip(trackId: string, clipId: string): void;
  rippleDelete(trackId: string, clipId: string): void; setKeyframe(trackId: string, clipId: string, property: string, keyframe: Keyframe): void;
  undo(): void; redo(): void; replaceProject(project: EditorProject): void;
}
const clamp = (v:number,min:number,max:number) => Math.min(max,Math.max(min,v));
const snapshot = (s: EditorState): EditorSnapshot => ({ project:s.project, playheadFrame:s.playheadFrame, selectedClipId:s.selectedClipId, selectedTrackId:s.selectedTrackId });
function pushHistory(s: EditorState, project: EditorProject, selectedClipId=s.selectedClipId, selectedTrackId=s.selectedTrackId): Partial<EditorState> {
  return { project, selectedClipId, selectedTrackId, historyPast:[...s.historyPast,snapshot(s)].slice(-200), historyFuture:[] };
}
function getClip(project:EditorProject,trackId:string,clipId:string) {
  const track=project.tracks.find(t=>t.id===trackId); const clip=track?.clips.find(c=>c.id===clipId);
  if(!track||!clip) throw new Error("Track or clip not found"); if(track.locked) throw new Error("Track is locked"); return {track,clip};
}
export function cubicBezierProgress(t:number,p1:Vec2,p2:Vec2):number {
  const x1=clamp(p1[0],0,1),y1=p1[1],x2=clamp(p2[0],0,1),y2=p2[1];
  const curve=(u:number,a:number,b:number)=>3*(1-u)*(1-u)*u*a+3*(1-u)*u*u*b+u*u*u;
  const derivative=(u:number,a:number,b:number)=>3*(1-u)*(1-u)*a+6*(1-u)*u*(b-a)+3*u*u*(1-b);
  let u=clamp(t,0,1);
  for(let i=0;i<7;i++){const d=derivative(u,x1,x2);if(Math.abs(d)<1e-6)break;const next=u-(curve(u,x1,x2)-t)/d;if(next<0||next>1)break;u=next;}
  let lo=0,hi=1;for(let i=0;i<18;i++){const x=curve(u,x1,x2);if(Math.abs(x-t)<1e-6)break;if(x<t)lo=u;else hi=u;u=(lo+hi)/2;}
  return curve(u,y1,y2);
}
export function evaluateKeyframes(frames:readonly Keyframe[],frame:number,fallback:KeyframeValue):KeyframeValue {
  if(!frames.length)return fallback;const sorted=[...frames].sort((a,b)=>a.frame-b.frame);
  if(frame<=sorted[0].frame)return sorted[0].value;const last=sorted[sorted.length-1];if(frame>=last.frame)return last.value;
  let i=1;while(i<sorted.length&&sorted[i].frame<frame)i++;const a=sorted[i-1],b=sorted[i];if(a.interpolation==="hold")return a.value;
  const t=(frame-a.frame)/(b.frame-a.frame);const p=a.interpolation==="bezier"&&a.outTangent&&b.inTangent?cubicBezierProgress(t,a.outTangent,b.inTangent):t;
  if(typeof a.value==="number"&&typeof b.value==="number")return a.value+(b.value-a.value)*p;
  if(Array.isArray(a.value)&&Array.isArray(b.value))return [a.value[0]+(b.value[0]-a.value[0])*p,a.value[1]+(b.value[1]-a.value[1])*p];
  return p<1?a.value:b.value;
}
const initialCompositionId="main-comp";
const initialProject:EditorProject={id:"new-project",name:"Untitled project",fps:30,width:1920,height:1080,assets:[],tracks:[],activeCompositionId:initialCompositionId,compositions:[{id:initialCompositionId,name:"Main Comp",fps:30,width:1920,height:1080,durationFrames:900,tracks:[]}]};
function syncActiveComposition(project:EditorProject,tracks:readonly Track[]):EditorProject {
  const active=project.activeCompositionId;
  return {...project,tracks,compositions:project.compositions.map(comp=>comp.id===active?{...comp,tracks}:comp)};
}
function normalizeProject(project:EditorProject):EditorProject {
  const legacy=project as EditorProject & {compositions?:readonly Composition[];activeCompositionId?:string};
  if(Array.isArray(legacy.compositions)&&legacy.compositions.length){
    const active=legacy.compositions.find(comp=>comp.id===legacy.activeCompositionId)??legacy.compositions[0];
    return {...legacy,activeCompositionId:active.id,fps:active.fps,width:active.width,height:active.height,tracks:active.tracks??legacy.tracks??[]};
  }
  const id=crypto.randomUUID();
  const comp:Composition={id,name:"Main Comp",fps:legacy.fps??30,width:legacy.width??1920,height:legacy.height??1080,durationFrames:Math.max((legacy.fps??30)*30,...(legacy.tracks??[]).flatMap(t=>t.clips.map(c=>c.startFrame+c.durationFrames))),tracks:legacy.tracks??[]};
  return {...legacy,compositions:[comp],activeCompositionId:id,tracks:comp.tracks};
}
export const useEditorStore=create<EditorState>()(subscribeWithSelector((set,get)=>({
  project:initialProject,playheadFrame:0,selectedClipId:null,selectedTrackId:null,zoom:1,scrollFrame:0,snapping:true,ripple:false,historyPast:[],historyFuture:[],
  setPlayhead:frame=>set(s=>({playheadFrame:clamp(Math.round(frame),0,Number.MAX_SAFE_INTEGER)})),
  selectClip:(trackId,clipId)=>set({selectedTrackId:trackId,selectedClipId:clipId}),
  setZoom:zoom=>set({zoom:clamp(zoom,.05,100)}),setScrollFrame:frame=>set({scrollFrame:Math.max(0,Math.floor(frame))}),
  setSnapping:value=>set({snapping:value}),setRipple:value=>set({ripple:value}),
  createComposition:(name,width=1920,height=1080,fps=30)=>{const id=crypto.randomUUID();set(s=>{const comp:Composition={id,name:name.trim()||"Untitled Comp",width:Math.max(16,Math.round(width)),height:Math.max(16,Math.round(height)),fps:clamp(Math.round(fps),1,120),durationFrames:Math.max(1,Math.round(fps*30)),tracks:[]};const project={...s.project,activeCompositionId:id,tracks:[],compositions:[...s.project.compositions.map(x=>x.id===s.project.activeCompositionId?{...x,tracks:s.project.tracks}:x),comp]};return {...pushHistory(s,project,null,null),playheadFrame:0};});return id;},
  switchComposition:compositionId=>set(s=>{const target=s.project.compositions.find(c=>c.id===compositionId);if(!target||target.id===s.project.activeCompositionId)return s;const comps=s.project.compositions.map(c=>c.id===s.project.activeCompositionId?{...c,tracks:s.project.tracks}:c);const project={...s.project,compositions:comps,activeCompositionId:target.id,fps:target.fps,width:target.width,height:target.height,tracks:target.tracks};return {...pushHistory(s,project,null,null),playheadFrame:0};}),
  addTrack:track=>set(s=>{if(s.project.tracks.some(t=>t.id===track.id))throw new Error("Duplicate track id");return pushHistory(s,{...s.project,tracks:[...s.project.tracks,track]});}),
  updateTrack:(trackId,patch)=>set(s=>{if(!s.project.tracks.some(t=>t.id===trackId))throw new Error("Track not found");const tracks=s.project.tracks.map(t=>t.id===trackId?{...t,...patch}:t);return pushHistory(s,syncActiveComposition(s.project,tracks));}),
  moveTrack:(trackId,direction)=>set(s=>{const from=s.project.tracks.findIndex(t=>t.id===trackId),to=from+direction;if(from<0||to<0||to>=s.project.tracks.length)return s;const tracks=[...s.project.tracks];[tracks[from],tracks[to]]=[tracks[to],tracks[from]];return pushHistory(s,syncActiveComposition(s.project,tracks));}),
  addAsset:asset=>set(s=>{if(s.project.assets.some(a=>a.id===asset.id))throw new Error("Duplicate asset id");return pushHistory(s,{...s.project,assets:[...s.project.assets,asset]});}),
  addClip:(trackId,clip)=>set(s=>{const t=s.project.tracks.find(x=>x.id===trackId);if(!t||t.locked)throw new Error("Track unavailable");if(!s.project.assets.some(a=>a.id===clip.assetId))throw new Error("Asset not found");const tracks=s.project.tracks.map(x=>x.id===trackId?{...x,clips:[...x.clips,clip].sort((a,b)=>a.startFrame-b.startFrame)}:x);return pushHistory(s,syncActiveComposition(s.project,tracks));}),
  updateClip:(trackId,clipId,patch)=>set(s=>{getClip(s.project,trackId,clipId);const tracks=s.project.tracks.map(t=>t.id===trackId?{...t,clips:t.clips.map(c=>c.id===clipId?{...c,...patch}:c)}:t);return pushHistory(s,syncActiveComposition(s.project,tracks));}),
  splitClip:(trackId,clipId,atFrame)=>set(s=>{const {clip}=getClip(s.project,trackId,clipId);const end=clip.startFrame+clip.durationFrames;if(atFrame<=clip.startFrame||atFrame>=end)throw new RangeError("Split must be inside clip");const leftFrames=atFrame-clip.startFrame;const right:Clip={...clip,id:crypto.randomUUID(),startFrame:atFrame,sourceInFrame:clip.sourceInFrame+Math.round(leftFrames*clip.playbackRate),durationFrames:end-atFrame};const tracks=s.project.tracks.map(t=>t.id!==trackId?t:{...t,clips:t.clips.flatMap(c=>c.id!==clipId?[c]:[{...c,durationFrames:leftFrames},right])});return pushHistory(s,syncActiveComposition(s.project,tracks),right.id,trackId);}),
  trimClip:(trackId,clipId,startFrame,endFrame)=>set(s=>{const {clip}=getClip(s.project,trackId,clipId);const start=clamp(Math.floor(startFrame),clip.startFrame,clip.startFrame+clip.durationFrames-1);const end=clamp(Math.floor(endFrame),start+1,clip.startFrame+clip.durationFrames);const delta=start-clip.startFrame;const tracks=s.project.tracks.map(t=>t.id===trackId?{...t,clips:t.clips.map(c=>c.id===clipId?{...c,startFrame:start,sourceInFrame:c.sourceInFrame+Math.round(delta*c.playbackRate),durationFrames:end-start}:c)}:t);return pushHistory(s,syncActiveComposition(s.project,tracks));}),
  moveClip:(trackId,clipId,startFrame)=>set(s=>{getClip(s.project,trackId,clipId);const tracks=s.project.tracks.map(t=>t.id===trackId?{...t,clips:t.clips.map(c=>c.id===clipId?{...c,startFrame:Math.max(0,Math.round(startFrame))}:c).sort((a,b)=>a.startFrame-b.startFrame)}:t);return pushHistory(s,syncActiveComposition(s.project,tracks));}),
  deleteClip:(trackId,clipId)=>set(s=>{getClip(s.project,trackId,clipId);const tracks=s.project.tracks.map(t=>t.id===trackId?{...t,clips:t.clips.filter(c=>c.id!==clipId)}:t);return pushHistory(s,syncActiveComposition(s.project,tracks),s.selectedClipId===clipId?null:s.selectedClipId,s.selectedTrackId);}),
  rippleDelete:(trackId,clipId)=>set(s=>{const {clip}=getClip(s.project,trackId,clipId);const end=clip.startFrame+clip.durationFrames;const tracks=s.project.tracks.map(t=>t.id!==trackId?t:{...t,clips:t.clips.filter(c=>c.id!==clipId).map(c=>c.startFrame>=end?{...c,startFrame:c.startFrame-clip.durationFrames}:c)});return pushHistory(s,syncActiveComposition(s.project,tracks),null,trackId);}),
  setKeyframe:(trackId,clipId,property,keyframe)=>set(s=>{const {clip}=getClip(s.project,trackId,clipId);if(keyframe.frame<0||keyframe.frame>clip.durationFrames)throw new RangeError("Keyframe outside clip");const list=[...(clip.keyframes[property]??[])];const index=list.findIndex(k=>k.frame===keyframe.frame);if(index>=0)list[index]=keyframe;else list.push(keyframe);list.sort((a,b)=>a.frame-b.frame);const tracks=s.project.tracks.map(t=>t.id===trackId?{...t,clips:t.clips.map(c=>c.id===clipId?{...c,keyframes:{...c.keyframes,[property]:list}}:c)}:t);return pushHistory(s,syncActiveComposition(s.project,tracks));}),
  undo:()=>set(s=>{if(!s.historyPast.length)return s;const prev=s.historyPast[s.historyPast.length-1];return {...prev,historyPast:s.historyPast.slice(0,-1),historyFuture:[snapshot(s),...s.historyFuture]};}),
  redo:()=>set(s=>{if(!s.historyFuture.length)return s;const next=s.historyFuture[0];return {...next,historyPast:[...s.historyPast,snapshot(s)].slice(-200),historyFuture:s.historyFuture.slice(1)};}),
  replaceProject:project=>set(s=>({...pushHistory(s,normalizeProject(project)),playheadFrame:0,selectedClipId:null,selectedTrackId:null}))
})));
export function frameToSeconds(frame:number,fps:number):number{return frame/fps;}
export function secondsToFrame(seconds:number,fps:number):number{return Math.round(seconds*fps);}
