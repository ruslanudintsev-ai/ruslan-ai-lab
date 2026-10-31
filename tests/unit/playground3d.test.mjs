import test from "node:test";
import assert from "node:assert/strict";
import { DEFAULT_3D, MATERIALS, LIGHTS, CAMERAS, normalize3D, renderDimensions, shouldDraw, clampElapsed } from "../../src/domain/playground3d.ts";
test("default material/light/camera are valid and color vectors bounded", () => {
  assert.deepEqual(DEFAULT_3D,{material:"teal",light:"front",camera:"wide"});
  for(const color of Object.values(MATERIALS)) assert.ok(color.every(x=>x>=0&&x<=1&&Number.isFinite(x)));
  for(const vector of Object.values(LIGHTS)) assert.equal(vector.length,3);
  assert.ok(CAMERAS.near<CAMERAS.wide&&CAMERAS.wide<CAMERAS.far);
});
test("normalization rejects arbitrary content instead of injecting shader settings", () => {
  assert.deepEqual(normalize3D({material:"<script>",light:"invalid",camera:"../../"}),DEFAULT_3D);
  assert.deepEqual(normalize3D(null),DEFAULT_3D);
  assert.deepEqual(normalize3D({material:"amber",light:"right",camera:"near"}),{material:"amber",light:"right",camera:"near"});
});
test("normalization produces fresh objects without mutating inputs", () => {
  const raw={material:"slate",light:"left",camera:"far"};
  const copy=structuredClone(raw);
  const result=normalize3D(raw);
  assert.deepEqual(result,copy); assert.deepEqual(raw,copy);assert.notStrictEqual(result,raw);
});
test("DPR stays <=2 and backing pixel dimensions bounded", () => {
  assert.deepEqual(renderDimensions(720,405,5),{width:1440,height:810,scale:2});
  assert.deepEqual(renderDimensions(300,160,.4),{width:300,height:160,scale:1});
  assert.deepEqual(renderDimensions(Infinity,NaN,Infinity),{width:720,height:405,scale:1});
  const size=renderDimensions(99999,99999,500);
  assert.equal(size.width,2880);assert.equal(size.height,1800);
});
test("frame guard caps drawn frames to <=30 per second", () => {
  assert.equal(shouldDraw(0,null),true);
  assert.equal(shouldDraw(25,0),false);
  assert.equal(shouldDraw(33.34,0),true);
  assert.equal(shouldDraw(Infinity,0),false);
});
test("elapsed time caps gaps after background suspension", () => {
  assert.equal(clampElapsed(12000),50);assert.equal(clampElapsed(-1),0);
  assert.equal(clampElapsed(NaN),0);assert.equal(clampElapsed(undefined),0);
  assert.equal(clampElapsed(17),17);
});
