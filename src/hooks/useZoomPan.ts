'use client';

import { useState, useRef, useCallback, useEffect } from 'react';

interface ZoomPanState {
  zoom: number;
  panX: number;
  panY: number;
}

export function useZoomPan(minZoom = 1, maxZoom = 4) {
  const [state, setState] = useState<ZoomPanState>({ zoom: 1, panX: 0, panY: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  const isPanning = useRef(false);
  const lastPointer = useRef({ x: 0, y: 0 });

  const handleWheel = useCallback(
    (e: WheelEvent) => {
      e.preventDefault();
      const delta = e.deltaY > 0 ? 0.9 : 1.1;
      setState((prev) => ({
        ...prev,
        zoom: Math.min(maxZoom, Math.max(minZoom, prev.zoom * delta)),
      }));
    },
    [minZoom, maxZoom]
  );

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    isPanning.current = true;
    lastPointer.current = { x: e.clientX, y: e.clientY };
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  }, []);

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!isPanning.current) return;
    const dx = e.clientX - lastPointer.current.x;
    const dy = e.clientY - lastPointer.current.y;
    lastPointer.current = { x: e.clientX, y: e.clientY };
    setState((prev) => ({
      ...prev,
      panX: prev.panX + dx / prev.zoom,
      panY: prev.panY + dy / prev.zoom,
    }));
  }, []);

  const handlePointerUp = useCallback(() => {
    isPanning.current = false;
  }, []);

  const reset = useCallback(() => {
    setState({ zoom: 1, panX: 0, panY: 0 });
  }, []);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    el.addEventListener('wheel', handleWheel, { passive: false });
    return () => {
      el.removeEventListener('wheel', handleWheel);
    };
  }, [handleWheel]);

  return {
    zoom: state.zoom,
    panX: state.panX,
    panY: state.panY,
    containerRef,
    handlePointerDown,
    handlePointerMove,
    handlePointerUp,
    reset,
  };
}
