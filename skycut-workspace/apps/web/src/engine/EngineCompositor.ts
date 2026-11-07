import { evaluateKeyframes, type Clip, type EditorProject, type Track, type BlendMode } from "../store/editorStore";

const VERTEX=`#version 300 es
in vec2 a_position; in vec2 a_uv; out vec2 v_uv;
void main(){v_uv=a_uv;gl_Position=vec4(a_position,0.0,1.0);}`;
const FRAGMENT=`#version 300 es
precision highp float; in vec2 v_uv; uniform sampler2D u_image; uniform float u_opacity; uniform int u_blend; out vec4 outColor;
vec3 blend(vec3 b,vec3 s,int m){
 if(m==1)return b*s;
 if(m==2)return b+s-b*s;
 if(m==3)return mix(2.0*b*s,1.0-2.0*(1.0-b)*(1.0-s),step(0.5,b));
 if(m==4)return min(b,s);
 if(m==5)return max(b,s);
 if(m==6)return abs(b-s);
 return s;
}
void main(){vec4 src=texture(u_image,v_uv);float a=src.a*u_opacity;outColor=vec4(src.rgb,a);}`;
const BLEND:Record<BlendMode,number>={normal:0,multiply:1,screen:2,overlay:3,darken:4,lighten:5,difference:6};
type MediaFrameSource={assetId:string;source:HTMLVideoElement|ImageBitmap|VideoFrame};
export interface CompositorOptions { canvas:HTMLCanvasElement; project:()=>EditorProject; getPlayheadFrame:()=>number; resolveMedia:(assetId:string)=>MediaFrameSource["source"]|undefined; onError?:(error:Error)=>void; }
export class EngineCompositor {
 private gl:WebGL2RenderingContext;private program:WebGLProgram;private buffer:WebGLBuffer;private textures=new Map<string,WebGLTexture>();private raf=0;private lastTime=0;private running=false;private opts:CompositorOptions;private locations:{position:number;uv:number;image:WebGLUniformLocation|null;opacity:WebGLUniformLocation|null;blend:WebGLUniformLocation|null};
 constructor(options:CompositorOptions){
  this.opts=options;const gl=options.canvas.getContext("webgl2",{alpha:true,antialias:true,premultipliedAlpha:false});if(!gl)throw new Error("WebGL2 is unavailable");this.gl=gl;
  const vs=this.compile(gl.VERTEX_SHADER,VERTEX),fs=this.compile(gl.FRAGMENT_SHADER,FRAGMENT);const program=gl.createProgram();if(!program)throw new Error("Unable to create WebGL program");gl.attachShader(program,vs);gl.attachShader(program,fs);gl.linkProgram(program);if(!gl.getProgramParameter(program,gl.LINK_STATUS))throw new Error(gl.getProgramInfoLog(program)??"Shader link failed");this.program=program;
  const buffer=gl.createBuffer();if(!buffer)throw new Error("Unable to create geometry buffer");this.buffer=buffer;gl.bindBuffer(gl.ARRAY_BUFFER,buffer);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,0,1,1,-1,1,1,-1,1,0,0,1,1,1,0]),gl.STATIC_DRAW);
  this.locations={position:gl.getAttribLocation(program,"a_position"),uv:gl.getAttribLocation(program,"a_uv"),image:gl.getUniformLocation(program,"u_image"),opacity:gl.getUniformLocation(program,"u_opacity"),blend:gl.getUniformLocation(program,"u_blend")};
  gl.useProgram(program);gl.enable(gl.BLEND);gl.blendFunc(gl.SRC_ALPHA,gl.ONE_MINUS_SRC_ALPHA);gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL,0);
 }
 private compile(type:number,source:string){const s=this.gl.createShader(type);if(!s)throw new Error("Shader allocation failed");this.gl.shaderSource(s,source);this.gl.compileShader(s);if(!this.gl.getShaderParameter(s,this.gl.COMPILE_STATUS)){const log=this.gl.getShaderInfoLog(s);this.gl.deleteShader(s);throw new Error(log??"Shader compilation failed");}return s;}
 start(){if(this.running)return;this.running=true;this.raf=requestAnimationFrame(this.tick);}
 stop(){this.running=false;cancelAnimationFrame(this.raf);}
 dispose(){this.stop();for(const t of this.textures.values())this.gl.deleteTexture(t);this.gl.deleteBuffer(this.buffer);this.gl.deleteProgram(this.program);}
 renderAt(frame:number){const gl=this.gl,p=this.opts.project();gl.viewport(0,0,this.opts.canvas.width,this.opts.canvas.height);gl.clearColor(0.035,0.04,0.05,1);gl.clear(gl.COLOR_BUFFER_BIT);
  const fps=p.fps;
  const active=p.tracks.filter(t=>t.visible&&!t.muted).flatMap(t=>t.clips.filter(c=>frame>=c.startFrame&&frame<c.startFrame+c.durationFrames).map(c=>({track:t,clip:c}))).sort((a,b)=>p.tracks.indexOf(a.track)-p.tracks.indexOf(b.track));
  for(const {track,clip} of active)this.drawClip(track,clip,frame,fps);
 }
 private drawClip(track:Track,clip:Clip,frame:number,fps:number){
  const source=this.opts.resolveMedia(clip.assetId);if(!source)return;const gl=this.gl;let tex=this.textures.get(clip.assetId);if(!tex){tex=gl.createTexture()??undefined;if(!tex)return;this.textures.set(clip.assetId,tex);}
  gl.bindTexture(gl.TEXTURE_2D,tex);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);
  try{gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,source);}catch(e){this.opts.onError?.(e instanceof Error?e:new Error("Frame upload failed"));return;}
  const local=frame-clip.startFrame;const opacity=evaluateKeyframes(clip.keyframes.opacity??[],local,clip.opacity);const alpha=typeof opacity==="number"?Math.max(0,Math.min(1,opacity)):clip.opacity;
  gl.useProgram(this.program);gl.bindBuffer(gl.ARRAY_BUFFER,this.buffer);const stride=16;gl.enableVertexAttribArray(this.locations.position);gl.vertexAttribPointer(this.locations.position,2,gl.FLOAT,false,stride,0);gl.enableVertexAttribArray(this.locations.uv);gl.vertexAttribPointer(this.locations.uv,2,gl.FLOAT,false,stride,8);
  gl.activeTexture(gl.TEXTURE0);gl.bindTexture(gl.TEXTURE_2D,tex);gl.uniform1i(this.locations.image!,0);gl.uniform1f(this.locations.opacity!,alpha);gl.uniform1i(this.locations.blend!,BLEND[clip.blendMode]??0);gl.drawArrays(gl.TRIANGLE_STRIP,0,4);
 }
 private tick=(time:number)=>{if(!this.running)return;const frame=this.opts.getPlayheadFrame();try{this.renderAt(frame);}catch(e){this.opts.onError?.(e instanceof Error?e:new Error("Compositor failed"));}this.lastTime=time;this.raf=requestAnimationFrame(this.tick);};
}
