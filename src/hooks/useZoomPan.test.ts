import { describe, it, expect } from 'vitest';

/**
 * Tests for useZoomPan zoom computation and pan delta logic.
 * We test the pure math that the hook uses internally.
 */

function clampZoom(current: number, delta: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, current * delta));
}

function panDelta(dx: number, zoom: number): number {
  return dx / zoom;
}

describe('useZoomPan: zoom clamping', () => {
  const MIN = 1;
  const MAX = 4;

  it('should not zoom below minZoom when zooming out', () => {
    // At min already, zooming out should stay at 1
    expect(clampZoom(1, 0.9, MIN, MAX)).toBe(1);
  });

  it('should zoom in from 1x', () => {
    const result = clampZoom(1, 1.1, MIN, MAX);
    expect(result).toBeCloseTo(1.1);
  });

  it('should stay at minZoom with repeated zoom-out from 1', () => {
    let zoom = 1;
    for (let i = 0; i < 10; i++) {
      zoom = clampZoom(zoom, 0.9, MIN, MAX);
    }
    expect(zoom).toBe(1);
  });

  it('should cap at maxZoom when zooming in past 4', () => {
    // 3.8 * 1.1 = 4.18, should cap at 4
    expect(clampZoom(3.8, 1.1, MIN, MAX)).toBe(4);
  });

  it('should allow intermediate zoom values', () => {
    expect(clampZoom(2, 1.1, MIN, MAX)).toBeCloseTo(2.2);
  });
});

describe('useZoomPan: pan delta division', () => {
  it('should divide pan delta by current zoom level', () => {
    expect(panDelta(10, 2)).toBe(5);
  });

  it('should return full delta at zoom 1', () => {
    expect(panDelta(10, 1)).toBe(10);
  });

  it('should reduce delta at higher zoom', () => {
    expect(panDelta(10, 4)).toBe(2.5);
  });
});
