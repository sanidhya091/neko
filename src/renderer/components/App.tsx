import React, { useEffect, useRef } from 'react';
import * as PIXI from 'pixi.js';

export default function App() {
  const canvasContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!canvasContainerRef.current) return;

    // Initialize PixiJS Application
    const app = new PIXI.Application({
      width: window.innerWidth,
      height: window.innerHeight,
      backgroundAlpha: 0,
      antialias: true,
      autoDensity: true,
      resolution: window.devicePixelRatio || 1,
    });

    canvasContainerRef.current.appendChild(app.view as unknown as HTMLElement);

    // Test graphic: a friendly placeholder circle for our pet engine scaffold
    const graphics = new PIXI.Graphics();
    graphics.beginFill(0xff758c, 0.8);
    graphics.drawCircle(200, 200, 32);
    graphics.endFill();
    app.stage.addChild(graphics);

    const text = new PIXI.Text('Project Neko Engine (Phase 1)', {
      fontFamily: 'Arial',
      fontSize: 16,
      fill: 0xffffff,
      dropShadow: true,
      dropShadowBlur: 4,
      dropShadowDistance: 2,
    });
    text.x = 150;
    text.y = 245;
    app.stage.addChild(text);

    const handleResize = () => {
      app.renderer.resize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      app.destroy(true, { children: true });
    };
  }, []);

  return (
    <div style={{ width: '100vw', height: '100vw', position: 'relative' }}>
      <div ref={canvasContainerRef} style={{ width: '100%', height: '100%', pointerEvents: 'auto' }} />
      <div style={{
        position: 'absolute',
        top: 20,
        left: 20,
        background: 'rgba(0,0,0,0.6)',
        color: '#fff',
        padding: '10px 15px',
        borderRadius: '8px',
        fontFamily: 'sans-serif',
        fontSize: '14px',
        pointerEvents: 'auto',
        backdropFilter: 'blur(4px)'
      }}>
        <strong>Project Neko Engine</strong><br />
        Status: Scaffold Active (Phase 1)<br />
        Transparent Overlay Running
      </div>
    </div>
  );
}
