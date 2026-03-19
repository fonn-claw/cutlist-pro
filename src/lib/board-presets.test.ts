import { describe, it, expect } from 'vitest';
import { BOARD_PRESETS, type BoardPreset } from '@/lib/board-presets';

describe('BOARD_PRESETS', () => {
  it('has exactly 10 entries', () => {
    expect(BOARD_PRESETS).toHaveLength(10);
  });

  it('every preset has a non-empty name, lengthIn > 0, widthIn > 0', () => {
    for (const preset of BOARD_PRESETS) {
      expect(preset.name.length).toBeGreaterThan(0);
      expect(preset.lengthIn).toBeGreaterThan(0);
      expect(preset.widthIn).toBeGreaterThan(0);
    }
  });

  it('"4x8 Plywood" preset has lengthIn=96, widthIn=48', () => {
    const plywood = BOARD_PRESETS.find(p => p.name === '4x8 Plywood');
    expect(plywood).toBeDefined();
    expect(plywood!.lengthIn).toBe(96);
    expect(plywood!.widthIn).toBe(48);
  });

  it('"2x4" preset has lengthIn=96, widthIn=3.5', () => {
    const twoByFour = BOARD_PRESETS.find(p => p.name === '2x4');
    expect(twoByFour).toBeDefined();
    expect(twoByFour!.lengthIn).toBe(96);
    expect(twoByFour!.widthIn).toBe(3.5);
  });

  it('"1x6" preset has lengthIn=96, widthIn=5.5', () => {
    const oneBySix = BOARD_PRESETS.find(p => p.name === '1x6');
    expect(oneBySix).toBeDefined();
    expect(oneBySix!.lengthIn).toBe(96);
    expect(oneBySix!.widthIn).toBe(5.5);
  });

  it('"1x12" preset has lengthIn=96, widthIn=11.25', () => {
    const oneByTwelve = BOARD_PRESETS.find(p => p.name === '1x12');
    expect(oneByTwelve).toBeDefined();
    expect(oneByTwelve!.lengthIn).toBe(96);
    expect(oneByTwelve!.widthIn).toBe(11.25);
  });

  it('all preset inch values produce valid mm when multiplied by 25.4', () => {
    for (const preset of BOARD_PRESETS) {
      const lengthMm = preset.lengthIn * 25.4;
      const widthMm = preset.widthIn * 25.4;
      expect(lengthMm).toBeGreaterThan(0);
      expect(widthMm).toBeGreaterThan(0);
      expect(Number.isFinite(lengthMm)).toBe(true);
      expect(Number.isFinite(widthMm)).toBe(true);
    }
  });
});
