import { CAMERAS, LIGHTS, MATERIALS, renderDimensions } from "../domain/playground3d";
import type { Settings3D } from "../domain/playground3d";

export interface Scene3D {
  draw(settings: Settings3D, angle: number): void;
  resize(cssWidth: number, cssHeight: number, dpr: number): void;
  dispose(): void;
}

const VERTEX_SHADER = `
attribute vec3 aPosition;
attribute vec3 aNormal;
uniform mat4 uProjection;
uniform float uAngle;
uniform float uDistance;
uniform vec3 uLight;
varying float vShade;
void main() {
  float c = cos(uAngle); float s = sin(uAngle);
  mat3 yaw = mat3(c,0.0,-s, 0.0,1.0,0.0, s,0.0,c);
  float t = 0.3; float ct = cos(t); float st = sin(t);
  mat3 tilt = mat3(1.0,0.0,0.0, 0.0,ct,st, 0.0,-st,ct);
  mat3 model = tilt * yaw;
  vec3 transformed = model * aPosition;
  vec3 normal = normalize(model * aNormal);
  vShade = 0.25 + 0.75 * max(dot(normal, normalize(uLight)), 0.0);
  gl_Position = uProjection * vec4(transformed.xy, transformed.z - uDistance, 1.0);
}
`;
const FRAGMENT_SHADER = `
precision mediump float;
varying float vShade;
uniform vec3 uColor;
void main() { gl_FragColor = vec4(uColor * vShade, 1.0); }
`;

function shader(gl: WebGLRenderingContext, type: number, source: string): WebGLShader {
  const result = gl.createShader(type);
  if (!result) throw new Error("Shader unavailable");
  gl.shaderSource(result, source);
  gl.compileShader(result);
  if (!gl.getShaderParameter(result, gl.COMPILE_STATUS)) {
    const log = gl.getShaderInfoLog(result) ?? "Shader failed";
    gl.deleteShader(result);
    throw new Error(log);
  }
  return result;
}
function geometry(): Float32Array {
  const data: number[] = [];
  const faces: ReadonlyArray<readonly [number[], number[], number[]]> = [
    [[0,0,1],[1,0,0],[0,1,0]], [[0,0,-1],[-1,0,0],[0,1,0]],
    [[1,0,0],[0,0,-1],[0,1,0]], [[-1,0,0],[0,0,1],[0,1,0]],
    [[0,1,0],[1,0,0],[0,0,-1]], [[0,-1,0],[1,0,0],[0,0,1]]
  ];
  for (const [n, right, up] of faces) {
    const point = (x: number, y: number): number[] => n.map((v,i) => v + x * right[i] + y * up[i]);
    const corners = [point(-1,-1),point(1,-1),point(1,1),point(-1,1)];
    for (const index of [0,1,2,0,2,3]) data.push(...corners[index],...n);
  }
  return new Float32Array(data);
}

/** Called only after an explicit Enable 3D user action; has no background work. */
export function createScene(canvas: HTMLCanvasElement, gl: WebGLRenderingContext): Scene3D {
  let vertex: WebGLShader | null = null;
  let fragment: WebGLShader | null = null;
  let program: WebGLProgram | null = null;
  let buffer: WebGLBuffer | null = null;
  try {
    vertex = shader(gl, gl.VERTEX_SHADER, VERTEX_SHADER);
    fragment = shader(gl, gl.FRAGMENT_SHADER, FRAGMENT_SHADER);
    program = gl.createProgram();
    if (!program) throw new Error("Program unavailable");
    gl.attachShader(program, vertex);
    gl.attachShader(program, fragment);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(program) ?? "Link failed");
    buffer = gl.createBuffer();
    if (!buffer) throw new Error("Buffer unavailable");
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, geometry(), gl.STATIC_DRAW);
    gl.useProgram(program);
    const pos = gl.getAttribLocation(program,"aPosition");
    const norm = gl.getAttribLocation(program,"aNormal");
    if (pos < 0 || norm < 0) throw new Error("Shader attributes unavailable");
    gl.enableVertexAttribArray(pos);
    gl.vertexAttribPointer(pos,3,gl.FLOAT,false,24,0);
    gl.enableVertexAttribArray(norm);
    gl.vertexAttribPointer(norm,3,gl.FLOAT,false,24,12);
    gl.enable(gl.DEPTH_TEST);
    const projection = gl.getUniformLocation(program,"uProjection");
    const angleLoc = gl.getUniformLocation(program,"uAngle");
    const distance = gl.getUniformLocation(program,"uDistance");
    const light = gl.getUniformLocation(program,"uLight");
    const color = gl.getUniformLocation(program,"uColor");
    if (!projection || !angleLoc || !distance || !light || !color) throw new Error("Shader uniforms unavailable");
    let disposed = false;
    let aspect = 16 / 9;
    const activeProgram = program;
    const activeBuffer = buffer;
    const activeVertex = vertex;
    const activeFragment = fragment;
    return {
      resize(width, height, dpr) {
        if (disposed) return;
        const size = renderDimensions(width,height,dpr);
        canvas.width = size.width; canvas.height = size.height;
        aspect = size.width / size.height;
        gl.viewport(0,0,size.width,size.height);
      },
      draw(settings, rotation) {
        if (disposed || gl.isContextLost()) return;
        const f = 1 / Math.tan(Math.PI / 7);
        const near = 0.1, far = 30;
        const matrix = new Float32Array([
          f/aspect,0,0,0, 0,f,0,0,
          0,0,(far+near)/(near-far),-1,
          0,0,2*far*near/(near-far),0
        ]);
        gl.clearColor(0.895,0.937,0.918,1);
        gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);
        gl.useProgram(activeProgram);
        gl.uniformMatrix4fv(projection,false,matrix);
        gl.uniform1f(angleLoc, rotation);
        gl.uniform1f(distance,CAMERAS[settings.camera]);
        gl.uniform3fv(light,LIGHTS[settings.light]);
        gl.uniform3fv(color,MATERIALS[settings.material]);
        gl.bindBuffer(gl.ARRAY_BUFFER,activeBuffer);
        gl.drawArrays(gl.TRIANGLES,0,36);
      },
      dispose() {
        if (disposed) return;
        disposed = true;
        if (!gl.isContextLost()) {
          gl.deleteBuffer(activeBuffer);
          gl.deleteProgram(activeProgram);
          gl.deleteShader(activeVertex);
          gl.deleteShader(activeFragment);
        }
      }
    };
  } catch (error) {
    if (!gl.isContextLost()) {
      if (buffer) gl.deleteBuffer(buffer);
      if (program) gl.deleteProgram(program);
      if (vertex) gl.deleteShader(vertex);
      if (fragment) gl.deleteShader(fragment);
    }
    throw error;
  }
}
