import test from "node:test";
import assert from "node:assert/strict";
import { createProject } from "./project-model.mjs";
import { addTransition, removeTransition } from "./transitions.mjs";

function fixture() {
  const p=createProject({id:"transition-project",fps:30});
  p.assets.push({id:"asset",type:"video",uri:"file:///v.mp4",duration:20});
  p.tracks.push({id:"video",kind:"video",clips:[
    {id:"a",assetId:"asset",timelineStart:0,sourceStart:0,duration:4,playbackRate:1,volume:1},
    {id:"b",assetId:"asset",timelineStart:4,sourceStart:4,duration:3,playbackRate:1,volume:1}
  ]});
  return p;
}

test("transition attaches to adjacent clips with bounded duration",()=>{
  const p=addTransition(fixture(),"video","a","b",{id:"t1",type:"crossfade",duration:1});
  assert.equal(p.tracks[0].transitions[0].timelineStart,3.5);
});

test("transition rejects non-adjacent clips and excessive duration",()=>{
  assert.throws(()=>addTransition(fixture(),"video","a","b",{id:"t1",duration:5}),/cannot exceed/);
  const p=fixture(); p.tracks[0].clips[1].timelineStart=6;
  assert.throws(()=>addTransition(p,"video","a","b",{id:"t2"}),/must be adjacent/);
});

test("transition can be removed",()=>{
  const p=addTransition(fixture(),"video","a","b",{id:"t1"});
  assert.equal(removeTransition(p,"video","t1").tracks[0].transitions.length,0);
});
