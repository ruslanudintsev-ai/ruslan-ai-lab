import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const stylesheet = readFileSync(new URL("../../src/styles/global.css", import.meta.url), "utf8");

function declaredHex(selector, property) {
  const rule = stylesheet.split("}").find(part => part.trimStart().startsWith(selector + " {"));
  assert.ok(rule, `Missing CSS rule for ${selector}`);
  const match = rule.match(new RegExp(`(?:^|[;{])\\s*${property}\\s*:\\s*(#[0-9a-fA-F]{6}|#[0-9a-fA-F]{3})\\s*(?:;|$)`));
  assert.ok(match, `Missing hex ${property} on ${selector}`);
  return match[1];
}

function luminance(hex) {
  const expanded = hex.length === 4 ? "#" + [...hex.slice(1)].map(digit => digit + digit).join("") : hex;
  const rgb = expanded.slice(1).match(/../g).map(byte => {
    const channel = Number.parseInt(byte, 16) / 255;
    return channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4;
  });
  return rgb[0] * 0.2126 + rgb[1] * 0.7152 + rgb[2] * 0.0722;
}

function ratio(foreground, background) {
  const values = [luminance(foreground), luminance(background)].sort((a, b) => b - a);
  return (values[0] + 0.05) / (values[1] + 0.05);
}

test("small panel status text meets WCAG AA on preview and controls surfaces", () => {
  const textColor = declaredHex(".panel-status", "color");
  const surfaces = [
    declaredHex(".preview-panel", "background"),
    declaredHex(".studio-controls", "background")
  ];
  for (const background of surfaces) {
    assert.ok(ratio(textColor, background) >= 4.5,
      `Status text ${textColor} on ${background} is below 4.5:1`);
  }
});

test("primary CTA text stays legible against its button surface", () => {
  const foreground = declaredHex(".button-primary", "color");
  const background = declaredHex(".button-primary", "background");
  assert.ok(ratio(foreground, background) >= 4.5,
    `CTA contrast ${ratio(foreground, background).toFixed(2)} is below 4.5:1`);
});
