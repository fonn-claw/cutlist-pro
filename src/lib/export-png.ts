export async function exportToPng(
  containerId: string,
  filename: string = 'cutlist.png'
): Promise<void> {
  const container = document.getElementById(containerId);
  if (!container) {
    throw new Error(`Container element with id "${containerId}" not found`);
  }

  const svgs = container.querySelectorAll('svg');
  if (svgs.length === 0) {
    throw new Error('No SVG elements found in container');
  }

  const scale = 2; // Retina quality
  const gap = 20;

  // Measure all SVGs and prepare serialized images
  const svgDataList: Array<{ dataUrl: string; width: number; height: number }> = [];

  for (const svg of svgs) {
    const clone = svg.cloneNode(true) as SVGSVGElement;

    // Inline computed styles for key elements
    const elementTypes = ['rect', 'text', 'line', 'path', 'pattern', 'g', 'tspan'];
    for (const tag of elementTypes) {
      const originals = svg.querySelectorAll(tag);
      const clones = clone.querySelectorAll(tag);
      for (let i = 0; i < originals.length; i++) {
        const computed = getComputedStyle(originals[i]);
        const cloneEl = clones[i] as SVGElement | HTMLElement;
        if (!cloneEl) continue;

        const stylesToInline = [
          'fill',
          'stroke',
          'stroke-width',
          'stroke-opacity',
          'font-size',
          'font-family',
          'font-weight',
          'text-anchor',
          'dominant-baseline',
          'opacity',
          'fill-opacity',
        ];

        for (const prop of stylesToInline) {
          const val = computed.getPropertyValue(prop);
          if (val) {
            cloneEl.style.setProperty(prop, val);
          }
        }
      }
    }

    // Get the bounding rect for sizing
    const bbox = svg.getBoundingClientRect();
    const width = bbox.width || 800;
    const height = bbox.height || 400;

    // Set explicit dimensions on clone
    clone.setAttribute('width', String(width));
    clone.setAttribute('height', String(height));

    const serializer = new XMLSerializer();
    const svgString = serializer.serializeToString(clone);
    const blob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
    const dataUrl = URL.createObjectURL(blob);

    svgDataList.push({ dataUrl, width, height });
  }

  // Calculate total canvas size
  const maxWidth = Math.max(...svgDataList.map(d => d.width));
  const totalHeight =
    svgDataList.reduce((sum, d) => sum + d.height, 0) +
    gap * (svgDataList.length - 1);

  const canvas = document.createElement('canvas');
  canvas.width = maxWidth * scale;
  canvas.height = totalHeight * scale;
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    // Clean up object URLs
    for (const d of svgDataList) URL.revokeObjectURL(d.dataUrl);
    throw new Error('Could not get canvas context');
  }

  ctx.scale(scale, scale);

  // Fill with white background
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, maxWidth, totalHeight);

  // Draw each SVG sequentially
  let currentY = 0;
  for (const { dataUrl, width, height } of svgDataList) {
    await new Promise<void>((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        ctx.drawImage(img, 0, currentY, width, height);
        currentY += height + gap;
        URL.revokeObjectURL(dataUrl);
        resolve();
      };
      img.onerror = () => {
        URL.revokeObjectURL(dataUrl);
        reject(new Error('Failed to load SVG image'));
      };
      img.src = dataUrl;
    });
  }

  // Trigger download
  canvas.toBlob(
    (blob) => {
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    },
    'image/png'
  );
}
