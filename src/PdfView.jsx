import React, {useEffect, useRef, useState} from 'react';

let pdfjsPromise = null;
async function pdfjs() {
  if (!pdfjsPromise) pdfjsPromise = (async () => {
    await import('pdfjs-dist/build/pdf.worker.mjs'); // bundled worker: runs on the main thread
    return import('pdfjs-dist/build/pdf.mjs');
  })();
  return pdfjsPromise;
}

// Draws every page of a PDF (Uint8Array) as crisp canvases that fit the container width.
// Works on phones, where browsers do not show PDFs inside iframes.
export function PdfView({bytes, label = 'Resume preview'}) {
  const box = useRef(null);
  const [width, setWidth] = useState(0);
  const [pages, setPages] = useState(0);
  const [error, setError] = useState('');

  useEffect(() => {
    const el = box.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setWidth(Math.round(el.clientWidth)));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    let cancelled = false, task = null;
    const el = box.current;
    if (!bytes || !el || !width) return;
    (async () => {
      try {
        const lib = await pdfjs();
        task = lib.getDocument({data: bytes.slice()});
        const doc = await task.promise;
        if (cancelled) return;
        const frag = document.createDocumentFragment();
        const ratio = Math.min(window.devicePixelRatio || 1, 2.5);
        for (let i = 1; i <= doc.numPages; i++) {
          const page = await doc.getPage(i);
          const base = page.getViewport({scale: 1});
          const scale = (width - 2) / base.width;
          const vp = page.getViewport({scale: scale * ratio});
          const canvas = document.createElement('canvas');
          canvas.width = Math.floor(vp.width);
          canvas.height = Math.floor(vp.height);
          canvas.style.width = Math.floor(vp.width / ratio) + 'px';
          canvas.style.height = Math.floor(vp.height / ratio) + 'px';
          canvas.className = 'pdf-page';
          canvas.setAttribute('aria-label', label + ', page ' + i);
          await page.render({canvasContext: canvas.getContext('2d'), viewport: vp}).promise;
          if (cancelled) return;
          frag.appendChild(canvas);
        }
        el.replaceChildren(frag);
        setPages(doc.numPages);
        setError('');
      } catch (e) {
        if (!cancelled) setError('Could not draw this PDF.');
      }
    })();
    return () => { cancelled = true; if (task) task.destroy().catch(() => {}); };
  }, [bytes, width]);

  return <div className="pdfview">
    <div ref={box} className="pdf-pages" role="img" aria-label={label} />
    {error && <p className="hint">{error}</p>}
    {pages > 1 && <p className="pdf-count">{pages} pages</p>}
  </div>;
}
