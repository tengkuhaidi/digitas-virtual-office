'use client';

import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { AGENTS } from '@/data/agents';

interface OfficeCanvasProps {
  selectedAgentId: string | null;
  onSelectAgent: (id: string | null) => void;
}

type AgentState = 'WORKING' | 'WALKING' | 'COFFEE' | 'GAMING' | 'MEETING' | 'DINING' | 'GYM';

interface AgentSim {
  id: string;
  name: string;
  role: string;
  color: string;
  accentHex: number;
  homePos: THREE.Vector3;
  currentPos: THREE.Vector3;
  targetPos: THREE.Vector3;
  state: AgentState;
  stateTimer: number;
  group: THREE.Group;
  charMesh: THREE.Group;
  torso: THREE.Mesh;
  head: THREE.Group;
  leftArm: THREE.Group;
  rightArm: THREE.Group;
  leftThigh: THREE.Group;
  rightThigh: THREE.Group;
  leftShin: THREE.Group;
  rightShin: THREE.Group;
  bubbleSprite: THREE.Sprite;
  currentText: string;
  isSeated: boolean;
}

export default function OfficeCanvas({ selectedAgentId, onSelectAgent }: OfficeCanvasProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const targetCamPos = useRef(new THREE.Vector3(18, 22, 26));
  const targetCamLook = useRef(new THREE.Vector3(0, 1.0, 0));
  const isTransitioning = useRef(false);

  useEffect(() => {
    if (!mountRef.current) return;

    let width = mountRef.current.clientWidth || window.innerWidth || 1200;
    let height = mountRef.current.clientHeight || window.innerHeight || 800;

    // SCENE
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x181a24);

    // CAMERA (Wide isometric diorama view)
    const camera = new THREE.PerspectiveCamera(35, width / height, 0.1, 1000);
    camera.position.set(18, 22, 26);
    camera.lookAt(0, 1.0, 0);

    // RENDERER
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      powerPreference: 'high-performance',
      alpha: false,
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    mountRef.current.appendChild(renderer.domElement);

    // ORBIT CONTROLS
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.target.set(0, 1.0, 0);
    controls.maxPolarAngle = Math.PI / 2.05;
    controls.minDistance = 4.0;
    controls.maxDistance = 50.0;
    controls.rotateSpeed = 0.8;
    controls.zoomSpeed = 1.0;
    controls.panSpeed = 0.8;
    controlsRef.current = controls;

    controls.addEventListener('start', () => {
      isTransitioning.current = false;
    });

    // LIGHTING: Cozy Warm Startup Lighting
    const hemiLight = new THREE.HemisphereLight(0xfff7ed, 0x334155, 1.3);
    scene.add(hemiLight);

    const sun = new THREE.DirectionalLight(0xffedd5, 1.6);
    sun.position.set(18, 26, 16);
    scene.add(sun);

    const fill = new THREE.DirectionalLight(0x93c5fd, 0.6);
    fill.position.set(-16, 16, -14);
    scene.add(fill);

    // --- BAKED STATIC CANVAS TEXTURES ---
    const codeCanvas = document.createElement('canvas');
    codeCanvas.width = 512; codeCanvas.height = 256;
    const cCtx = codeCanvas.getContext('2d')!;
    cCtx.fillStyle = '#0f172a'; cCtx.fillRect(0, 0, 512, 256);
    cCtx.fillStyle = '#f59e0b'; cCtx.font = 'bold 22px monospace';
    cCtx.fillText('GAJAH MADA // CLUSTER ORCHESTRATION', 20, 36);
    cCtx.fillStyle = '#38bdf8'; cCtx.font = '16px monospace';
    ['[HERMES AGENT] 4 Subagents Active', '[CRON] Talia 8x Publisher: 200 OK', '[CRON] Robert Daily Audit: Synced', '[GATEWAY] Baileys WA Port 3000: UP', '[STATUS] Workflows Nominal'].forEach((l, i) => cCtx.fillText(l, 20, 75 + i * 30));
    const codeTex = new THREE.CanvasTexture(codeCanvas);

    const chartCanvas = document.createElement('canvas');
    chartCanvas.width = 512; chartCanvas.height = 256;
    const chCtx = chartCanvas.getContext('2d')!;
    chCtx.fillStyle = '#0f172a'; chCtx.fillRect(0, 0, 512, 256);
    chCtx.fillStyle = '#3b82f6'; chCtx.font = 'bold 22px sans-serif';
    chCtx.fillText('ROBERT // SERP COMPETITOR AUDIT', 20, 36);
    [40, 65, 80, 50, 92, 75, 96, 85].forEach((v, i) => {
      chCtx.fillStyle = i === 6 ? '#60a5fa' : '#2563eb';
      chCtx.fillRect(35 + i * 56, 220 - v * 1.3, 42, v * 1.3);
    });
    const chartTex = new THREE.CanvasTexture(chartCanvas);

    const textCanvas = document.createElement('canvas');
    textCanvas.width = 512; textCanvas.height = 256;
    const tCtx = textCanvas.getContext('2d')!;
    tCtx.fillStyle = '#1e1124'; tCtx.fillRect(0, 0, 512, 256);
    tCtx.fillStyle = '#f43f5e'; tCtx.font = 'bold 22px sans-serif';
    tCtx.fillText('TALIA // HEADLESS WP ARTICLE DRAFT', 20, 36);
    tCtx.fillStyle = '#fecdd3'; tCtx.font = '16px sans-serif';
    ['Draft: "Panduan Lengkap Syarat PT PMA 2026"', 'UU Cipta Kerja & Regulasi BKPM', 'Keterbacaan: 94/100 (Sastra UI)', 'Google Indexing API: 200 OK', 'Slot: 8/8 Artikel Terbit Hari Ini'].forEach((l, i) => tCtx.fillText(l, 20, 80 + i * 30));
    const textTex = new THREE.CanvasTexture(textCanvas);

    const waCanvas = document.createElement('canvas');
    waCanvas.width = 512; waCanvas.height = 256;
    const wCtx = waCanvas.getContext('2d')!;
    wCtx.fillStyle = '#062817'; wCtx.fillRect(0, 0, 512, 256);
    wCtx.fillStyle = '#10b981'; wCtx.font = 'bold 22px sans-serif';
    wCtx.fillText('PUTRA // WHATSAPP CLIENT CS & CRM', 20, 36);
    wCtx.fillStyle = '#a7f3d0'; wCtx.font = '16px sans-serif';
    ['[+62 812-****-****] "Halo, biaya urus PT?"', '[PUTRA] "Halo! Estimasi 1-2 hari kerja..."', '[INVOICE NINJA] Generated Draft #INV-089', '[LEADS] 5 Outreach Pipeline Synced'].forEach((l, i) => wCtx.fillText(l, 20, 85 + i * 32));
    const waTex = new THREE.CanvasTexture(waCanvas);

    const meetCanvas = document.createElement('canvas');
    meetCanvas.width = 512; meetCanvas.height = 280;
    const mCtx = meetCanvas.getContext('2d')!;
    mCtx.fillStyle = '#090d16'; mCtx.fillRect(0, 0, 512, 280);
    mCtx.fillStyle = '#38bdf8'; mCtx.font = 'bold 24px sans-serif';
    mCtx.fillText('DIGITAS // WEEKLY ALL-HANDS SYNC', 24, 40);
    mCtx.fillStyle = '#94a3b8'; mCtx.font = '16px sans-serif';
    ['Q4 Growth: +142% Organic Inbound Traffic', 'Average Client Response Time: < 3 Minutes', 'SEO Article Indexation Rate: 99.4%', 'Goal: Expand Notary & Corporate Services'].forEach((l, i) => mCtx.fillText(l, 24, 85 + i * 36));
    const meetTex = new THREE.CanvasTexture(meetCanvas);

    const tvCanvas = document.createElement('canvas');
    tvCanvas.width = 512; tvCanvas.height = 280;
    const tvCtx = tvCanvas.getContext('2d')!;
    tvCtx.fillStyle = '#052e16'; tvCtx.fillRect(0, 0, 512, 280);
    tvCtx.fillStyle = '#22c55e'; tvCtx.font = 'bold 28px sans-serif';
    tvCtx.fillText('★ PS5 GAME MATCH ★', 90, 55);
    tvCtx.fillStyle = '#ffffff'; tvCtx.font = 'bold 26px sans-serif';
    tvCtx.fillText('AGENTS 3 - 1 BUGS', 115, 125);
    tvCtx.fillStyle = '#fbbf24'; tvCtx.font = '18px sans-serif';
    tvCtx.fillText('MATCH TIME: 88:14 // CASUAL BREAK', 70, 180);
    const tvTex = new THREE.CanvasTexture(tvCanvas);

    // Clock Face Canvas
    const clockCanvas = document.createElement('canvas');
    clockCanvas.width = 256; clockCanvas.height = 256;
    const clkCtx = clockCanvas.getContext('2d')!;
    clkCtx.fillStyle = '#ffffff'; clkCtx.beginPath(); clkCtx.arc(128, 128, 120, 0, Math.PI * 2); clkCtx.fill();
    clkCtx.strokeStyle = '#0f172a'; clkCtx.lineWidth = 10; clkCtx.stroke();
    clkCtx.fillStyle = '#0f172a'; clkCtx.font = 'bold 28px sans-serif'; clkCtx.textAlign = 'center';
    clkCtx.fillText('12', 128, 48); clkCtx.fillText('3', 220, 138); clkCtx.fillText('6', 128, 226); clkCtx.fillText('9', 36, 138);
    // Hands
    clkCtx.strokeStyle = '#0f172a'; clkCtx.lineWidth = 8; clkCtx.beginPath(); clkCtx.moveTo(128, 128); clkCtx.lineTo(128, 65); clkCtx.stroke();
    clkCtx.strokeStyle = '#ef4444'; clkCtx.lineWidth = 4; clkCtx.beginPath(); clkCtx.moveTo(128, 128); clkCtx.lineTo(180, 128); clkCtx.stroke();
    const clockTex = new THREE.CanvasTexture(clockCanvas);

    // Wall Art Painting 1 Canvas (Abstract Bauhaus)
    const art1Canvas = document.createElement('canvas');
    art1Canvas.width = 256; art1Canvas.height = 384;
    const a1Ctx = art1Canvas.getContext('2d')!;
    a1Ctx.fillStyle = '#fef08a'; a1Ctx.fillRect(0, 0, 256, 384);
    a1Ctx.fillStyle = '#ef4444'; a1Ctx.beginPath(); a1Ctx.arc(128, 140, 80, 0, Math.PI * 2); a1Ctx.fill();
    a1Ctx.fillStyle = '#1e3a8a'; a1Ctx.fillRect(40, 220, 180, 90);
    a1Ctx.fillStyle = '#0f172a'; a1Ctx.font = 'bold 20px sans-serif'; a1Ctx.fillText('INNOVATE', 65, 350);
    const art1Tex = new THREE.CanvasTexture(art1Canvas);

    // Wall Art Painting 2 Canvas (Modern Minimal Line)
    const art2Canvas = document.createElement('canvas');
    art2Canvas.width = 256; art2Canvas.height = 384;
    const a2Ctx = art2Canvas.getContext('2d')!;
    a2Ctx.fillStyle = '#e2e8f0'; a2Ctx.fillRect(0, 0, 256, 384);
    a2Ctx.fillStyle = '#059669'; a2Ctx.beginPath(); a2Ctx.ellipse(128, 160, 90, 60, Math.PI / 4, 0, Math.PI * 2); a2Ctx.fill();
    a2Ctx.fillStyle = '#0f172a'; a2Ctx.font = 'bold 20px sans-serif'; a2Ctx.fillText('EXECUTE', 75, 350);
    const art2Tex = new THREE.CanvasTexture(art2Canvas);

    // DYNAMIC SPEECH BUBBLE GENERATOR (High-Resolution 1024x360, High-Contrast & Wrapped Clean Layout)
    const createBubbleTexture = (name: string, role: string, text: string, colorHex: string) => {
      const bCanvas = document.createElement('canvas');
      bCanvas.width = 1024;
      bCanvas.height = 360;
      const bCtx = bCanvas.getContext('2d')!;

      // Crisp background with soft shadow
      bCtx.fillStyle = '#ffffff';
      bCtx.shadowColor = 'rgba(15, 23, 42, 0.22)';
      bCtx.shadowBlur = 24;
      bCtx.shadowOffsetY = 10;

      const x = 32, y = 24, w = 960, h = 260, r = 36;
      bCtx.beginPath();
      bCtx.moveTo(x + r, y);
      bCtx.lineTo(x + w - r, y);
      bCtx.quadraticCurveTo(x + w, y, x + w, y + r);
      bCtx.lineTo(x + w, y + h - r);
      bCtx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
      // speech tail
      bCtx.lineTo(x + w / 2 + 24, y + h);
      bCtx.lineTo(x + w / 2, y + h + 42);
      bCtx.lineTo(x + w / 2 - 24, y + h);
      bCtx.lineTo(x + r, y + h);
      bCtx.quadraticCurveTo(x, y + h, x, y + h - r);
      bCtx.lineTo(x, y + r);
      bCtx.quadraticCurveTo(x, y, x + r, y);
      bCtx.closePath();
      bCtx.fill();

      // Reset shadow for ultra-sharp typography
      bCtx.shadowColor = 'transparent';

      // Header Tag: High-contrast Dark Tone of Agent Color
      const roleMap: Record<string, string> = {
        'gajahmada': 'ORCHESTRATOR',
        'robert': 'SEO ANALYST',
        'talia': 'CONTENT WRITER',
        'putra': 'LEAD CS & CRM',
      };
      const cleanRole = roleMap[name.toLowerCase()] || role.split(' ')[0].toUpperCase();

      // Color mapping for high-contrast legible header
      let badgeColor = '#1e40af'; // dark blue for Robert
      if (colorHex.includes('f59e0b') || colorHex.includes('eab308')) badgeColor = '#b45309'; // warm amber/bronze for Gajah Mada
      else if (colorHex.includes('10b981') || colorHex.includes('22c55e')) badgeColor = '#047857'; // emerald dark for Putra
      else if (colorHex.includes('f43f5e') || colorHex.includes('ec4899')) badgeColor = '#be123c'; // rose dark for Talia

      // Capsule Badge for Role
      bCtx.fillStyle = badgeColor;
      bCtx.font = 'bold 34px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
      bCtx.fillText(`●  ${name.toUpperCase()}`, 64, 82);

      bCtx.fillStyle = '#64748b';
      bCtx.font = '600 28px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
      bCtx.fillText(`//  ${cleanRole}`, 64 + bCtx.measureText(`●  ${name.toUpperCase()}  `).width, 82);

      // Body text with 2-line auto-wrap so nothing is truncated
      bCtx.fillStyle = '#0f172a';
      bCtx.font = '500 36px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';

      // Simple word wrapping
      const words = text.replace(/"/g, '').split(' ');
      let line1 = '';
      let line2 = '';
      for (const w of words) {
        if ((line1 + w).length < 38 && !line2) {
          line1 += (line1 ? ' ' : '') + w;
        } else {
          line2 += (line2 ? ' ' : '') + w;
        }
      }

      bCtx.fillText(`"${line1}`, 64, 145);
      if (line2) {
        bCtx.fillText(`${line2}"`, 64, 195);
      } else {
        bCtx.fillText('"', 64 + bCtx.measureText(`"${line1}`).width, 145);
      }

      // Micro status pill
      bCtx.fillStyle = '#f1f5f9';
      bCtx.beginPath();
      bCtx.roundRect(64, 218, 300, 38, 12);
      bCtx.fill();

      bCtx.fillStyle = '#475569';
      bCtx.font = 'bold 20px monospace';
      bCtx.fillText('● ACTIVE AUTONOMOUS', 82, 244);

      const tex = new THREE.CanvasTexture(bCanvas);
      tex.needsUpdate = true;
      return tex;
    };

    // --- EXPANDED STARTUP OFFICE ARCHITECTURE ---
    const roomW = 32;
    const roomD = 28;

    // Floor
    const floor = new THREE.Mesh(
      new THREE.BoxGeometry(roomW, 0.4, roomD),
      new THREE.MeshStandardMaterial({ color: 0xd97706, roughness: 0.35 })
    );
    floor.position.y = -0.2;
    scene.add(floor);

    // Walls
    const wallMat = new THREE.MeshStandardMaterial({ color: 0xf1f5f9, roughness: 0.6 });
    const backWall = new THREE.Mesh(new THREE.BoxGeometry(roomW, 6.0, 0.3), wallMat);
    backWall.position.set(0, 3.0, -roomD / 2);
    scene.add(backWall);

    const leftWall = new THREE.Mesh(new THREE.BoxGeometry(0.3, 6.0, roomD), wallMat);
    leftWall.position.set(-roomW / 2, 3.0, 0);
    scene.add(leftWall);

    // --- WALL DECOR: WALL CLOCK & ART PAINTINGS ---
    // Wall Clock on Back Wall (center high)
    const wallClock = new THREE.Mesh(
      new THREE.CylinderGeometry(0.7, 0.7, 0.08, 32),
      new THREE.MeshStandardMaterial({ map: clockTex })
    );
    wallClock.rotation.x = Math.PI / 2;
    wallClock.position.set(0, 4.6, -roomD / 2 + 0.2);
    scene.add(wallClock);

    // Bauhaus Art Frame 1
    const frame1 = new THREE.Mesh(new THREE.BoxGeometry(1.4, 2.0, 0.06), new THREE.MeshStandardMaterial({ color: 0x090d16 }));
    frame1.position.set(-4.5, 4.0, -roomD / 2 + 0.18);
    const canvas1 = new THREE.Mesh(new THREE.PlaneGeometry(1.25, 1.85), new THREE.MeshBasicMaterial({ map: art1Tex }));
    canvas1.position.set(-4.5, 4.0, -roomD / 2 + 0.22);
    scene.add(frame1); scene.add(canvas1);

    // Minimal Line Art Frame 2
    const frame2 = new THREE.Mesh(new THREE.BoxGeometry(1.4, 2.0, 0.06), new THREE.MeshStandardMaterial({ color: 0x090d16 }));
    frame2.position.set(4.5, 4.0, -roomD / 2 + 0.18);
    const canvas2 = new THREE.Mesh(new THREE.PlaneGeometry(1.25, 1.85), new THREE.MeshBasicMaterial({ map: art2Tex }));
    canvas2.position.set(4.5, 4.0, -roomD / 2 + 0.22);
    scene.add(frame2); scene.add(canvas2);

    // --- BIOPHILIC PLANTS & INDOOR TREES ---
    const createIndoorTree = (px: number, pz: number, scale = 1.0) => {
      const treeGroup = new THREE.Group();
      treeGroup.position.set(px, 0, pz);
      treeGroup.scale.set(scale, scale, scale);

      // Ceramic White Pot
      const pot = new THREE.Mesh(
        new THREE.CylinderGeometry(0.65, 0.45, 1.2, 16),
        new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.2 })
      );
      pot.position.y = 0.6;
      treeGroup.add(pot);

      // Pot Gold Accent Ring
      const potRing = new THREE.Mesh(
        new THREE.TorusGeometry(0.66, 0.03, 8, 24),
        new THREE.MeshStandardMaterial({ color: 0xf59e0b, metalness: 0.8 })
      );
      potRing.rotation.x = Math.PI / 2;
      potRing.position.y = 0.95;
      treeGroup.add(potRing);

      // Wooden Trunk
      const trunk = new THREE.Mesh(
        new THREE.CylinderGeometry(0.12, 0.15, 2.2, 8),
        new THREE.MeshStandardMaterial({ color: 0x5c3a21, roughness: 0.8 })
      );
      trunk.position.y = 2.0;
      treeGroup.add(trunk);

      // Lush Leaves Foliage (Multi-tier cones & spheres)
      const leafMat1 = new THREE.MeshStandardMaterial({ color: 0x15803d, roughness: 0.6 });
      const leafMat2 = new THREE.MeshStandardMaterial({ color: 0x16a34a, roughness: 0.6 });

      const f1 = new THREE.Mesh(new THREE.SphereGeometry(0.9, 12, 12), leafMat1);
      f1.position.y = 3.0;
      treeGroup.add(f1);

      const f2 = new THREE.Mesh(new THREE.SphereGeometry(0.7, 12, 12), leafMat2);
      f2.position.set(0.3, 3.6, 0.2);
      treeGroup.add(f2);

      const f3 = new THREE.Mesh(new THREE.SphereGeometry(0.65, 12, 12), leafMat1);
      f3.position.set(-0.3, 3.4, -0.2);
      treeGroup.add(f3);

      scene.add(treeGroup);
    };

    // Plant Indoor Trees in key spots
    createIndoorTree(-roomW / 2 + 1.8, -roomD / 2 + 1.8, 1.2); // Corner back-left
    createIndoorTree(roomW / 2 - 1.8, -roomD / 2 + 1.8, 1.2);  // Corner back-right
    createIndoorTree(-roomW / 2 + 1.8, roomD / 2 - 2.0, 1.1);  // Corner front-left
    createIndoorTree(roomW / 2 - 1.8, roomD / 2 - 2.0, 1.1);   // Corner front-right

    // Table flower pots
    const createFlowerPot = (parent: THREE.Group, lx: number, ly: number, lz: number) => {
      const p = new THREE.Group();
      p.position.set(lx, ly, lz);
      const smallPot = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.08, 0.2, 12), new THREE.MeshStandardMaterial({ color: 0xffffff }));
      smallPot.position.y = 0.1;
      p.add(smallPot);
      const flower = new THREE.Mesh(new THREE.SphereGeometry(0.14, 8, 8), new THREE.MeshStandardMaterial({ color: 0xf43f5e }));
      flower.position.y = 0.24;
      p.add(flower);
      parent.add(p);
    };

    // --- ZONA 1: RUANG MEETING KACA (North-East: x: 9.5, z: -8.0) ---
    const meetGroup = new THREE.Group();
    meetGroup.position.set(9.5, 0, -8.0);

    const glassMat = new THREE.MeshStandardMaterial({
      color: 0xbae6fd,
      transparent: true,
      opacity: 0.35,
      roughness: 0.1,
    });
    const meetWallFront = new THREE.Mesh(new THREE.BoxGeometry(9.0, 4.5, 0.08), glassMat);
    meetWallFront.position.set(0, 2.25, 4.5);
    meetGroup.add(meetWallFront);

    const meetWallSide = new THREE.Mesh(new THREE.BoxGeometry(0.08, 4.5, 9.0), glassMat);
    meetWallSide.position.set(-4.5, 2.25, 0);
    meetGroup.add(meetWallSide);

    const metalMullion = new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.8 });
    const m1 = new THREE.Mesh(new THREE.BoxGeometry(0.12, 4.5, 0.12), metalMullion);
    m1.position.set(-4.5, 2.25, 4.5);
    meetGroup.add(m1);

    const confTable = new THREE.Mesh(
      new THREE.BoxGeometry(5.2, 0.1, 2.4),
      new THREE.MeshStandardMaterial({ color: 0xb45309, roughness: 0.3 })
    );
    confTable.position.set(0, 1.05, 0);
    meetGroup.add(confTable);
    createFlowerPot(meetGroup, 0, 1.1, 0);

    [[-2.2, -0.9], [2.2, -0.9], [-2.2, 0.9], [2.2, 0.9]].forEach(([lx, lz]) => {
      const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 1.0, 12), metalMullion);
      leg.position.set(lx, 0.55, lz);
      meetGroup.add(leg);
    });

    const confChairMat = new THREE.MeshStandardMaterial({ color: 0x1e293b });
    const addConfChair = (cx: number, cz: number, ry: number) => {
      const c = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.8, 0.65), confChairMat);
      c.position.set(cx, 0.85, cz);
      c.rotation.y = ry;
      meetGroup.add(c);
    };
    addConfChair(-1.5, -1.5, 0);
    addConfChair(1.5, -1.5, 0);
    addConfChair(-1.5, 1.5, Math.PI);
    addConfChair(1.5, 1.5, Math.PI);

    const presFrame = new THREE.Mesh(new THREE.BoxGeometry(3.2, 1.8, 0.08), new THREE.MeshStandardMaterial({ color: 0x090d16 }));
    presFrame.position.set(0, 2.8, -4.4);
    meetGroup.add(presFrame);

    const presScreen = new THREE.Mesh(new THREE.PlaneGeometry(3.1, 1.7), new THREE.MeshBasicMaterial({ map: meetTex }));
    presScreen.position.set(0, 2.8, -4.35);
    meetGroup.add(presScreen);

    scene.add(meetGroup);

    // --- ZONA 2: PANTRY & COFFEE BAR STATION (North-West: x: -9.5, z: -8.0) ---
    const pantryGroup = new THREE.Group();
    pantryGroup.position.set(-9.5, 0, -8.0);

    const barTop = new THREE.Mesh(
      new THREE.BoxGeometry(5.5, 0.12, 1.6),
      new THREE.MeshStandardMaterial({ color: 0xfde68a, roughness: 0.3 })
    );
    barTop.position.set(0, 1.1, 0);
    pantryGroup.add(barTop);

    const barBase = new THREE.Mesh(
      new THREE.BoxGeometry(5.3, 1.05, 1.4),
      new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.5 })
    );
    barBase.position.set(0, 0.525, 0);
    pantryGroup.add(barBase);

    const espMachine = new THREE.Mesh(
      new THREE.BoxGeometry(1.2, 0.75, 0.8),
      new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.8, roughness: 0.2 })
    );
    espMachine.position.set(-1.4, 1.55, 0.1);
    pantryGroup.add(espMachine);

    const espLight = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.06, 0.02), new THREE.MeshBasicMaterial({ color: 0x10b981 }));
    espLight.position.set(-1.4, 1.8, 0.51);
    pantryGroup.add(espLight);

    const cooler = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.35, 1.5, 16), new THREE.MeshStandardMaterial({ color: 0xe2e8f0 }));
    cooler.position.set(1.8, 0.75, 0);
    pantryGroup.add(cooler);

    const jug = new THREE.Mesh(
      new THREE.CylinderGeometry(0.28, 0.28, 0.7, 16),
      new THREE.MeshStandardMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.6 })
    );
    jug.position.set(1.8, 1.8, 0);
    pantryGroup.add(jug);

    [0xef4444, 0x3b82f6, 0xf59e0b, 0x10b981].forEach((col, idx) => {
      const cmug = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.07, 0.16, 12), new THREE.MeshStandardMaterial({ color: col, roughness: 0.2 }));
      cmug.position.set(-0.2 + idx * 0.3, 1.25, 0.2);
      pantryGroup.add(cmug);
    });

    scene.add(pantryGroup);

    // --- ZONA 3: REAL DINING TABLE (Meja Makan Bersama: x: -10.5, z: 0) ---
    const diningGroup = new THREE.Group();
    diningGroup.position.set(-10.5, 0, 0);

    // Large Solid Light Oak Dining Table
    const diningTableTop = new THREE.Mesh(
      new THREE.BoxGeometry(4.2, 0.12, 2.2),
      new THREE.MeshStandardMaterial({ color: 0xfde68a, roughness: 0.3 })
    );
    diningTableTop.position.set(0, 1.05, 0);
    diningGroup.add(diningTableTop);

    // Table legs
    [[-1.8, -0.8], [1.8, -0.8], [-1.8, 0.8], [1.8, 0.8]].forEach(([dx, dz]) => {
      const dleg = new THREE.Mesh(new THREE.BoxGeometry(0.12, 1.0, 0.12), new THREE.MeshStandardMaterial({ color: 0x18181b }));
      dleg.position.set(dx, 0.52, dz);
      diningGroup.add(dleg);
    });

    // Dining Plates & Food Bowls
    [-1.2, 0, 1.2].forEach((px) => {
      // Plate top
      const plate = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.25, 0.03, 16), new THREE.MeshStandardMaterial({ color: 0xffffff }));
      plate.position.set(px, 1.12, -0.45);
      diningGroup.add(plate);

      // Plate bottom
      const plate2 = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.25, 0.03, 16), new THREE.MeshStandardMaterial({ color: 0xffffff }));
      plate2.position.set(px, 1.12, 0.45);
      diningGroup.add(plate2);
    });

    // Salad / Fruit Bowl in Center
    const fruitBowl = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.25, 0.2, 16), new THREE.MeshStandardMaterial({ color: 0xd97706 }));
    fruitBowl.position.set(0, 1.2, 0);
    diningGroup.add(fruitBowl);

    // Dining Wooden Chairs (6 chairs)
    const dChairMat = new THREE.MeshStandardMaterial({ color: 0xd97706, roughness: 0.5 });
    const addDiningChair = (cx: number, cz: number, ry: number) => {
      const ch = new THREE.Group();
      ch.position.set(cx, 0, cz);
      ch.rotation.y = ry;
      const cseat = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.08, 0.55), dChairMat);
      cseat.position.y = 0.65;
      ch.add(cseat);
      const cback = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.6, 0.06), dChairMat);
      cback.position.set(0, 0.95, -0.24);
      ch.add(cback);
      [[-0.24, -0.22], [0.24, -0.22], [-0.24, 0.22], [0.24, 0.22]].forEach(([lx, lz]) => {
        const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.65, 8), metalMullion);
        leg.position.set(lx, 0.325, lz);
        ch.add(leg);
      });
      diningGroup.add(ch);
    };
    addDiningChair(-1.2, -1.4, 0);
    addDiningChair(0, -1.4, 0);
    addDiningChair(1.2, -1.4, 0);
    addDiningChair(-1.2, 1.4, Math.PI);
    addDiningChair(0, 1.4, Math.PI);
    addDiningChair(1.2, 1.4, Math.PI);

    scene.add(diningGroup);

    // --- ZONA 4: STARTUP GYM & FITNESS CORNER (South-East: x: 10.5, z: 7.5) ---
    const gymGroup = new THREE.Group();
    gymGroup.position.set(10.5, 0, 7.5);

    // Rubber Gym Floor Mat
    const gymMat = new THREE.Mesh(
      new THREE.BoxGeometry(7.5, 0.03, 6.5),
      new THREE.MeshStandardMaterial({ color: 0x18181b, roughness: 0.9 })
    );
    gymMat.position.y = 0.015;
    gymGroup.add(gymMat);

    // 1. Treadmill Machine
    const treadGroup = new THREE.Group();
    treadGroup.position.set(-2.0, 0, 0.5);

    const treadBase = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.25, 2.4), new THREE.MeshStandardMaterial({ color: 0x334155 }));
    treadBase.position.y = 0.125;
    treadGroup.add(treadBase);

    const treadBelt = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.02, 2.0), new THREE.MeshStandardMaterial({ color: 0x090d16 }));
    treadBelt.position.set(0, 0.26, -0.1);
    treadGroup.add(treadBelt);

    const treadHandL = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 1.4, 8), metalMullion);
    treadHandL.position.set(-0.55, 0.8, -0.9);
    treadGroup.add(treadHandL);
    const treadHandR = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 1.4, 8), metalMullion);
    treadHandR.position.set(0.55, 0.8, -0.9);
    treadGroup.add(treadHandR);

    const treadDash = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.15, 0.4), new THREE.MeshStandardMaterial({ color: 0x090d16 }));
    treadDash.position.set(0, 1.5, -0.9);
    treadGroup.add(treadDash);

    gymGroup.add(treadGroup);

    // 2. Dumbbell Weight Rack with Hex Dumbbells
    const dRackGroup = new THREE.Group();
    dRackGroup.position.set(2.2, 0, -1.8);

    const rackFrame = new THREE.Mesh(new THREE.BoxGeometry(2.4, 1.0, 0.6), new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.8 }));
    rackFrame.position.y = 0.5;
    dRackGroup.add(rackFrame);

    // Row of colorful dumbbells
    const dbColors = [0xef4444, 0x3b82f6, 0xf59e0b, 0x10b981];
    dbColors.forEach((col, idx) => {
      const db = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.14, 0.14), new THREE.MeshStandardMaterial({ color: col }));
      db.position.set(-0.8 + idx * 0.5, 1.08, 0);
      dRackGroup.add(db);
    });
    gymGroup.add(dRackGroup);

    // 3. Yoga / Exercise Ball
    const yogaBall = new THREE.Mesh(new THREE.SphereGeometry(0.55, 16, 16), new THREE.MeshStandardMaterial({ color: 0x06b6d4, roughness: 0.3 }));
    yogaBall.position.set(2.0, 0.55, 1.5);
    gymGroup.add(yogaBall);

    scene.add(gymGroup);

    // --- ZONA 5: GAMING & BREAKOUT LOUNGE (South-West: x: -8.5, z: 8.5) ---
    const loungeGroup = new THREE.Group();
    loungeGroup.position.set(-8.5, 0, 8.5);

    const sofaMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.8 });
    const sofaMain = new THREE.Mesh(new THREE.BoxGeometry(4.4, 0.5, 1.5), sofaMat);
    sofaMain.position.set(0, 0.3, 0);
    loungeGroup.add(sofaMain);

    const sofaBackMain = new THREE.Mesh(new THREE.BoxGeometry(4.4, 0.85, 0.35), sofaMat);
    sofaBackMain.position.set(0, 0.9, -0.6);
    loungeGroup.add(sofaBackMain);

    const sofaL = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.5, 2.2), sofaMat);
    sofaL.position.set(1.45, 0.3, 1.6);
    loungeGroup.add(sofaL);

    const sofaLBack = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.85, 2.2), sofaMat);
    sofaLBack.position.set(2.05, 0.9, 1.6);
    loungeGroup.add(sofaLBack);

    const c1 = new THREE.Mesh(new THREE.BoxGeometry(0.45, 0.45, 0.2), new THREE.MeshStandardMaterial({ color: 0xf59e0b }));
    c1.position.set(-1.4, 0.7, -0.4);
    loungeGroup.add(c1);

    const c2 = new THREE.Mesh(new THREE.BoxGeometry(0.45, 0.45, 0.2), new THREE.MeshStandardMaterial({ color: 0x38bdf8 }));
    c2.position.set(0.2, 0.7, -0.4);
    loungeGroup.add(c2);

    const cTable = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.35, 1.2), new THREE.MeshStandardMaterial({ color: 0xfef08a, roughness: 0.4 }));
    cTable.position.set(-0.5, 0.2, 1.5);
    loungeGroup.add(cTable);

    const ps5 = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.12, 0.35), new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.2 }));
    ps5.position.set(-0.7, 0.42, 1.5);
    loungeGroup.add(ps5);

    const ps5Light = new THREE.Mesh(new THREE.BoxGeometry(0.56, 0.03, 0.03), new THREE.MeshBasicMaterial({ color: 0x38bdf8 }));
    ps5Light.position.set(-0.7, 0.44, 1.68);
    loungeGroup.add(ps5Light);

    // Media Unit & TV
    const mediaUnit = new THREE.Group();
    mediaUnit.position.set(-0.5, 0, 3.8);

    const tvStand = new THREE.Mesh(new THREE.BoxGeometry(3.6, 0.6, 0.8), new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.5 }));
    tvStand.position.y = 0.3;
    mediaUnit.add(tvStand);

    const tvPole = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 1.2, 12), new THREE.MeshStandardMaterial({ color: 0x090d16, metalness: 0.9 }));
    tvPole.position.set(0, 1.1, 0);
    mediaUnit.add(tvPole);

    const tvFrame = new THREE.Mesh(new THREE.BoxGeometry(3.4, 1.9, 0.08), new THREE.MeshStandardMaterial({ color: 0x090d16 }));
    tvFrame.position.set(0, 2.2, 0);
    mediaUnit.add(tvFrame);

    const tvScreen = new THREE.Mesh(new THREE.PlaneGeometry(3.3, 1.8), new THREE.MeshBasicMaterial({ map: tvTex }));
    tvScreen.position.set(0, 2.2, -0.05);
    tvScreen.rotation.y = Math.PI;
    mediaUnit.add(tvScreen);

    loungeGroup.add(mediaUnit);
    scene.add(loungeGroup);

    // --- ZONA 6: OPEN WORKSTATIONS (Center Hub) ---
    const clickableObjects: THREE.Object3D[] = [];

    const POD_POSITIONS: Record<string, [number, number, number]> = {
      gajahmada: [-1.8, 0, -2.5],
      robert: [2.8, 0, -2.5],
      talia: [-1.8, 0, 2.8],
      putra: [2.8, 0, 2.8],
    };

    const buildWorkstation = (agentId: string) => {
      const data = AGENTS[agentId];
      const [px, py, pz] = POD_POSITIONS[agentId];
      const podGroup = new THREE.Group();
      podGroup.position.set(px, py, pz);
      podGroup.userData = { agentId };

      const rug = new THREE.Mesh(new THREE.BoxGeometry(3.6, 0.02, 3.2), new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.9 }));
      rug.position.y = 0.01;
      rug.userData = { agentId };
      podGroup.add(rug);
      clickableObjects.push(rug);

      const desk = new THREE.Mesh(new THREE.BoxGeometry(2.5, 0.1, 1.3), new THREE.MeshStandardMaterial({ color: 0xfef3c7, roughness: 0.3 }));
      desk.position.set(0, 1.05, 0);
      desk.userData = { agentId };
      podGroup.add(desk);
      clickableObjects.push(desk);

      // Desk flower pot
      createFlowerPot(podGroup, 1.05, 1.1, -0.4);

      const legMat = new THREE.MeshStandardMaterial({ color: 0x18181b, metalness: 0.8 });
      [[-1.1, -0.5], [1.1, -0.5], [-1.1, 0.5], [1.1, 0.5]].forEach(([lx, lz]) => {
        const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 1.0, 12), legMat);
        leg.position.set(lx, 0.55, lz);
        podGroup.add(leg);
      });

      if (agentId === 'gajahmada') {
        const monFrame = new THREE.Mesh(new THREE.BoxGeometry(1.3, 0.8, 0.05), legMat);
        monFrame.position.set(0, 1.6, -0.38);
        podGroup.add(monFrame);
        const monScreen = new THREE.Mesh(new THREE.PlaneGeometry(1.24, 0.74), new THREE.MeshBasicMaterial({ map: codeTex }));
        monScreen.position.set(0, 1.6, -0.35);
        podGroup.add(monScreen);
      } else if (agentId === 'robert') {
        const mon1 = new THREE.Mesh(new THREE.BoxGeometry(1.0, 0.65, 0.04), legMat);
        mon1.position.set(-0.55, 1.55, -0.32);
        mon1.rotation.y = 0.22;
        podGroup.add(mon1);
        const s1 = new THREE.Mesh(new THREE.PlaneGeometry(0.96, 0.6), new THREE.MeshBasicMaterial({ map: chartTex }));
        s1.position.set(-0.55, 1.55, -0.29);
        s1.rotation.y = 0.22;
        podGroup.add(s1);

        const mon2 = new THREE.Mesh(new THREE.BoxGeometry(1.0, 0.65, 0.04), legMat);
        mon2.position.set(0.55, 1.55, -0.32);
        mon2.rotation.y = -0.22;
        podGroup.add(mon2);
        const s2 = new THREE.Mesh(new THREE.PlaneGeometry(0.96, 0.6), new THREE.MeshBasicMaterial({ map: chartTex }));
        s2.position.set(0.55, 1.55, -0.29);
        s2.rotation.y = -0.22;
        podGroup.add(s2);
      } else if (agentId === 'talia') {
        const laptop = new THREE.Mesh(new THREE.BoxGeometry(0.65, 0.03, 0.45), new THREE.MeshStandardMaterial({ color: 0xe2e8f0, metalness: 0.9 }));
        laptop.position.set(-0.25, 1.12, 0.05);
        podGroup.add(laptop);
        const lScreen = new THREE.Mesh(new THREE.PlaneGeometry(0.62, 0.4), new THREE.MeshBasicMaterial({ map: textTex }));
        lScreen.position.set(-0.25, 1.36, -0.16);
        lScreen.rotation.x = -0.18;
        podGroup.add(lScreen);
      } else if (agentId === 'putra') {
        const monFrame = new THREE.Mesh(new THREE.BoxGeometry(1.3, 0.8, 0.05), legMat);
        monFrame.position.set(0, 1.6, -0.35);
        podGroup.add(monFrame);
        const monScreen = new THREE.Mesh(new THREE.PlaneGeometry(1.24, 0.74), new THREE.MeshBasicMaterial({ map: waTex }));
        monScreen.position.set(0, 1.6, -0.32);
        podGroup.add(monScreen);
      }

      // Proper Ergonomic Chair
      const chairGroup = new THREE.Group();
      chairGroup.position.set(0, 0, 0.85);

      const seatMesh = new THREE.Mesh(new THREE.BoxGeometry(0.75, 0.1, 0.7), new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.7 }));
      seatMesh.position.y = 0.58;
      chairGroup.add(seatMesh);

      const backMesh = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.8, 0.08), new THREE.MeshStandardMaterial({ color: 0x1e293b }));
      backMesh.position.set(0, 1.05, 0.32);
      backMesh.rotation.x = 0.08;
      chairGroup.add(backMesh);

      const standLeg = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.58, 12), legMat);
      standLeg.position.y = 0.29;
      chairGroup.add(standLeg);

      podGroup.add(chairGroup);
      scene.add(podGroup);
    };

    Object.keys(AGENTS).forEach(buildWorkstation);

    // --- AUTONOMOUS AGENT SIMULATOR WITH WAYPOINTS & DOCKING ---
    const agentsList: AgentSim[] = [];

    // STRICT DOCKING SLOTS WITH TARGET YAW ANGLES
    // Meeting Room is centered at x: 9.5, z: -8.0.
    // Table is at (9.5, 0, -8.0). Chairs are at:
    // Slot 0: (8.0, 0, -9.5) facing south (yaw: 0)
    // Slot 1: (11.0, 0, -9.5) facing south (yaw: 0)
    // Slot 2: (8.0, 0, -6.5) facing north (yaw: Math.PI)
    // Slot 3: (11.0, 0, -6.5) facing north (yaw: Math.PI)
    // Meeting door entrance waypoint: (5.0, 0, -3.5)

    // Dining Table is centered at x: -10.5, z: 0. Chairs are at:
    // Slot 0: (-11.7, 0, -1.4) facing south (yaw: 0)
    // Slot 1: (-10.5, 0, -1.4) facing south (yaw: 0)
    // Slot 2: (-9.3, 0, -1.4) facing south (yaw: 0)
    // Slot 3: (-10.5, 0, 1.4) facing north (yaw: Math.PI)

    // Gaming Lounge Sofa L is at (-8.5, 0, 8.5)
    // Slots facing front TV (yaw: 0):
    // Slot 0: (-9.5, 0, 8.5)
    // Slot 1: (-8.5, 0, 8.5)
    // Slot 2: (-7.5, 0, 8.5)
    // Slot 3: (-7.0, 0, 9.8) chaise facing west (yaw: -Math.PI / 2)

    // Gym corner at (10.5, 0, 7.5):
    // Slot 0: (8.5, 0, 8.0) treadmill facing north (yaw: Math.PI)
    // Slot 1: (12.7, 0, 5.7) dumbbell rack facing west (yaw: -Math.PI / 2)
    // Slot 2: (12.5, 0, 9.0) yoga ball facing center (yaw: -Math.PI * 0.75)
    // Slot 3: (9.5, 0, 6.5) stretch mat facing north (yaw: Math.PI)

    // Coffee bar at (-9.5, 0, -8.0):
    // Slot 0: (-10.9, 0, -6.9) facing bar (yaw: -Math.PI / 2)
    // Slot 1: (-9.5, 0, -6.9) facing bar (yaw: -Math.PI / 2)
    // Slot 2: (-8.2, 0, -6.9) facing bar (yaw: -Math.PI / 2)
    // Slot 3: (-7.7, 0, -7.0) water cooler (yaw: -Math.PI / 2)

    interface DockSlot {
      pos: THREE.Vector3;
      yaw: number;
      doorWaypoints?: THREE.Vector3[];
    }

    const DOCK_SLOTS: Record<AgentState, DockSlot[]> = {
      WORKING: [], // populated dynamically from agent homePos
      WALKING: [],
      MEETING: [
        { pos: new THREE.Vector3(8.0, 0, -9.5), yaw: 0, doorWaypoints: [new THREE.Vector3(5.0, 0, -3.5), new THREE.Vector3(7.5, 0, -5.5)] },
        { pos: new THREE.Vector3(11.0, 0, -9.5), yaw: 0, doorWaypoints: [new THREE.Vector3(5.0, 0, -3.5), new THREE.Vector3(9.5, 0, -5.5)] },
        { pos: new THREE.Vector3(8.0, 0, -6.5), yaw: Math.PI, doorWaypoints: [new THREE.Vector3(5.0, 0, -3.5)] },
        { pos: new THREE.Vector3(11.0, 0, -6.5), yaw: Math.PI, doorWaypoints: [new THREE.Vector3(5.0, 0, -3.5)] },
      ],
      DINING: [
        { pos: new THREE.Vector3(-11.7, 0, -1.4), yaw: 0, doorWaypoints: [new THREE.Vector3(-6.5, 0, -1.4)] },
        { pos: new THREE.Vector3(-10.5, 0, -1.4), yaw: 0, doorWaypoints: [new THREE.Vector3(-6.5, 0, -1.4)] },
        { pos: new THREE.Vector3(-9.3, 0, -1.4), yaw: 0, doorWaypoints: [new THREE.Vector3(-6.5, 0, -1.4)] },
        { pos: new THREE.Vector3(-10.5, 0, 1.4), yaw: Math.PI, doorWaypoints: [new THREE.Vector3(-6.5, 0, 1.4)] },
      ],
      GAMING: [
        { pos: new THREE.Vector3(-9.5, 0, 8.5), yaw: 0, doorWaypoints: [new THREE.Vector3(-6.5, 0, 6.0)] },
        { pos: new THREE.Vector3(-8.5, 0, 8.5), yaw: 0, doorWaypoints: [new THREE.Vector3(-6.5, 0, 6.0)] },
        { pos: new THREE.Vector3(-7.5, 0, 8.5), yaw: 0, doorWaypoints: [new THREE.Vector3(-6.5, 0, 6.0)] },
        { pos: new THREE.Vector3(-7.0, 0, 9.8), yaw: -Math.PI / 2, doorWaypoints: [new THREE.Vector3(-6.5, 0, 6.0)] },
      ],
      GYM: [
        { pos: new THREE.Vector3(8.5, 0, 8.0), yaw: Math.PI, doorWaypoints: [new THREE.Vector3(6.0, 0, 6.0)] },
        { pos: new THREE.Vector3(12.7, 0, 5.7), yaw: -Math.PI / 2, doorWaypoints: [new THREE.Vector3(6.0, 0, 6.0)] },
        { pos: new THREE.Vector3(12.5, 0, 9.0), yaw: -Math.PI * 0.75, doorWaypoints: [new THREE.Vector3(6.0, 0, 6.0)] },
        { pos: new THREE.Vector3(9.5, 0, 6.5), yaw: Math.PI, doorWaypoints: [new THREE.Vector3(6.0, 0, 6.0)] },
      ],
      COFFEE: [
        { pos: new THREE.Vector3(-10.9, 0, -6.8), yaw: 0, doorWaypoints: [new THREE.Vector3(-6.5, 0, -5.5)] },
        { pos: new THREE.Vector3(-9.5, 0, -6.8), yaw: 0, doorWaypoints: [new THREE.Vector3(-6.5, 0, -5.5)] },
        { pos: new THREE.Vector3(-8.2, 0, -6.8), yaw: 0, doorWaypoints: [new THREE.Vector3(-6.5, 0, -5.5)] },
        { pos: new THREE.Vector3(-7.7, 0, -6.8), yaw: 0, doorWaypoints: [new THREE.Vector3(-6.5, 0, -5.5)] },
      ],
    };

    const STATE_SPEECHES: Record<string, Record<AgentState, string>> = {
      gajahmada: {
        WORKING: 'Cluster nominal. 4 agents online & orchestrating.',
        WALKING: 'Menuju lokasi berikutnya...',
        COFFEE: 'Espresso shot dulu, persiapan strategi sore.',
        GAMING: 'Push rank FIFA sejenak, refreshing otak.',
        MEETING: 'Review sprint: roadmap kuartal tuntas.',
        DINING: 'Makan siang bersama tim di meja makan.',
        GYM: 'Lari di treadmill 15 menit biar fit!',
      },
      robert: {
        WORKING: 'SERP audit: 5 competitor keyword gaps ready.',
        WALKING: 'Jalan santai ambil data...',
        COFFEE: 'Coffee break sambil pantau algoritma Google.',
        GAMING: 'Istirahat bentar, main game bareng tim.',
        MEETING: 'Presentasi laporan SEO kompetitor mingguan.',
        DINING: 'Makan siang santai sambil ngobrol ringan.',
        GYM: 'Angkat dumbbell sejenak peregangan otot.',
      },
      talia: {
        WORKING: 'Slot 8/8 draft selesai & push ke Indexing API.',
        WALKING: 'Peregangan sejenak ke pantry...',
        COFFEE: 'Teh hangat biar inspirasi nulis mengalir deras.',
        GAMING: 'Santai di sofa baca feedback artikel.',
        MEETING: 'Pemaparan matriks keterbacaan konten & UU.',
        DINING: 'Makan bersama di meja makan, suasana hangat.',
        GYM: 'Yoga stretch santai sehabis nulis artikel.',
      },
      putra: {
        WORKING: 'WhatsApp live: 5 leads inbound dikonfirmasi.',
        WALKING: 'Ambil minum sebelum follow-up klien...',
        COFFEE: 'Isi tenaga dulu, chat calon klien lancar jaya.',
        GAMING: 'Break time main stick PS di lounge.',
        MEETING: 'Laporan konversi invoice & CS WhatsApp.',
        DINING: 'Santap makan siang bareng rekan kerja.',
        GYM: 'Jogging di gym corner sebelum closing deals.',
      },
    };

    // Navigation queue helper
    const agentPathQueues: Record<string, THREE.Vector3[]> = {
      gajahmada: [],
      robert: [],
      talia: [],
      putra: [],
    };
    const agentTargetYaws: Record<string, number> = {
      gajahmada: 0,
      robert: 0,
      talia: 0,
      putra: 0,
    };

    // BUILD ARTICULATED BIPEDAL AGENTS
    Object.keys(AGENTS).forEach((agentId, idx) => {
      const data = AGENTS[agentId];
      const [hx, hy, hz] = POD_POSITIONS[agentId];
      const homeVec = new THREE.Vector3(hx, 0, hz + 0.85);

      const agentGroup = new THREE.Group();
      agentGroup.position.copy(homeVec);
      agentGroup.userData = { agentId };

      const charMesh = new THREE.Group();

      const pantsMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.8 });
      const shirtMat = new THREE.MeshStandardMaterial({ color: data.accentHex, roughness: 0.6 });
      const skinMat = new THREE.MeshStandardMaterial({ color: 0xffdfba, roughness: 0.4 });

      // Pelvis
      const pelvis = new THREE.Mesh(new THREE.BoxGeometry(0.52, 0.2, 0.38), pantsMat);
      pelvis.position.y = 0.65;
      charMesh.add(pelvis);

      // Torso
      const torso = new THREE.Mesh(new THREE.BoxGeometry(0.54, 0.62, 0.36), shirtMat);
      torso.position.y = 1.05;
      charMesh.add(torso);

      const collar = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.08, 0.04), new THREE.MeshStandardMaterial({ color: 0xffffff }));
      collar.position.set(0, 1.35, -0.18);
      charMesh.add(collar);

      // Head
      const headGroup = new THREE.Group();
      headGroup.position.y = 1.55;
      const head = new THREE.Mesh(new THREE.BoxGeometry(0.36, 0.36, 0.36), skinMat);
      headGroup.add(head);

      const hairMat = new THREE.MeshStandardMaterial({ color: idx === 1 ? 0x451a03 : 0x18181b, roughness: 0.5 });
      const hair = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.14, 0.4), hairMat);
      hair.position.y = 0.22;
      headGroup.add(hair);

      charMesh.add(headGroup);

      // Arms
      const leftArm = new THREE.Group();
      leftArm.position.set(-0.35, 1.25, 0);
      const lArmMesh = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.45, 0.14), shirtMat);
      lArmMesh.position.y = -0.225;
      leftArm.add(lArmMesh);
      charMesh.add(leftArm);

      const rightArm = new THREE.Group();
      rightArm.position.set(0.35, 1.25, 0);
      const rArmMesh = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.45, 0.14), shirtMat);
      rArmMesh.position.y = -0.225;
      rightArm.add(rArmMesh);
      charMesh.add(rightArm);

      // Articulated Legs (Thigh + Shin)
      const leftThigh = new THREE.Group();
      leftThigh.position.set(-0.16, 0.6, 0);
      const lThighMesh = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.42, 0.2), pantsMat);
      lThighMesh.position.y = -0.21;
      leftThigh.add(lThighMesh);

      const leftShin = new THREE.Group();
      leftShin.position.set(0, -0.42, 0);
      const lShinMesh = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.42, 0.18), pantsMat);
      lShinMesh.position.y = -0.21;
      leftShin.add(lShinMesh);
      leftThigh.add(leftShin);
      charMesh.add(leftThigh);

      const rightThigh = new THREE.Group();
      rightThigh.position.set(0.16, 0.6, 0);
      const rThighMesh = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.42, 0.2), pantsMat);
      rThighMesh.position.y = -0.21;
      rightThigh.add(rThighMesh);

      const rightShin = new THREE.Group();
      rightShin.position.set(0, -0.42, 0);
      const rShinMesh = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.42, 0.18), pantsMat);
      rShinMesh.position.y = -0.21;
      rightShin.add(rShinMesh);
      rightThigh.add(rightShin);
      charMesh.add(rightThigh);

      agentGroup.add(charMesh);

      // Initial Speech Bubble
      const initialText = STATE_SPEECHES[agentId].WORKING;
      const bTex = createBubbleTexture(data.name, data.role, initialText, data.color);
      const bSprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: bTex, transparent: true }));
      bSprite.scale.set(2.6, 0.92, 1.0);
      bSprite.position.set(0, 3.2, 0);
      agentGroup.add(bSprite);

      clickableObjects.push(torso);
      clickableObjects.push(head);

      scene.add(agentGroup);

      agentsList.push({
        id: agentId,
        name: data.name,
        role: data.role,
        color: data.color,
        accentHex: data.accentHex,
        homePos: homeVec,
        currentPos: homeVec.clone(),
        targetPos: homeVec.clone(),
        state: 'WORKING',
        stateTimer: 250 + Math.random() * 250,
        group: agentGroup,
        charMesh,
        torso,
        head: headGroup,
        leftArm,
        rightArm,
        leftThigh,
        rightThigh,
        leftShin,
        rightShin,
        bubbleSprite: bSprite,
        currentText: initialText,
        isSeated: true,
      });
    });

    // RAYCASTER DRAG VS CLICK
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();
    let pointerDownPos = { x: 0, y: 0 };

    const handlePointerDown = (e: MouseEvent) => {
      pointerDownPos = { x: e.clientX, y: e.clientY };
    };

    const handlePointerUp = (e: MouseEvent) => {
      const dist = Math.hypot(e.clientX - pointerDownPos.x, e.clientY - pointerDownPos.y);
      if (dist > 5) return;

      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(clickableObjects, true);

      if (intersects.length > 0) {
        let current: THREE.Object3D | null = intersects[0].object;
        while (current && !current.userData.agentId) {
          current = current.parent;
        }
        if (current && current.userData.agentId) {
          onSelectAgent(current.userData.agentId);
        }
      } else {
        onSelectAgent(null);
      }
    };

    renderer.domElement.addEventListener('pointerdown', handlePointerDown);
    renderer.domElement.addEventListener('pointerup', handlePointerUp);

    const handleResize = () => {
      if (!mountRef.current) return;
      width = mountRef.current.clientWidth || window.innerWidth;
      height = mountRef.current.clientHeight || window.innerHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };
    window.addEventListener('resize', handleResize);

    // 60 FPS RENDER LOOP + PRECISION DOCKING SIMULATION
    let animId: number;
    let t = 0;

    const animate = () => {
      animId = requestAnimationFrame(animate);
      t += 0.02;

      if (isTransitioning.current) {
        camera.position.lerp(targetCamPos.current, 0.06);
        controls.target.lerp(targetCamLook.current, 0.06);
        if (camera.position.distanceTo(targetCamPos.current) < 0.15) {
          isTransitioning.current = false;
        }
      }
      controls.update();

      // SIMULATE AGENTS (Safe Waypoint Navigation, Strict Chair Snapping, Zero Slanted Sitting)
      agentsList.forEach((agent, i) => {
        agent.stateTimer -= 1;

        if (agent.stateTimer <= 0) {
          if (agent.state === 'WORKING') {
            // Pick a break destination
            const roll = Math.random();
            let nextState: AgentState = 'MEETING';
            if (roll < 0.25) nextState = 'COFFEE';
            else if (roll < 0.50) nextState = 'GAMING';
            else if (roll < 0.75) nextState = 'DINING';
            else if (roll < 0.90) nextState = 'GYM';
            else nextState = 'MEETING';

            const slot = DOCK_SLOTS[nextState][i % 4];
            agent.state = 'WALKING';
            agent.isSeated = false;
            agent.stateTimer = 600;

            // Plan multi-step waypoints so agent doesn't cut through walls
            const pathQueue: THREE.Vector3[] = [];
            // Step out of desk to aisle
            pathQueue.push(new THREE.Vector3(agent.homePos.x, 0, agent.homePos.z + 1.2));
            // Center room aisle
            pathQueue.push(new THREE.Vector3(0, 0, 0));
            // Door / Approach waypoints
            if (slot.doorWaypoints) {
              slot.doorWaypoints.forEach(wp => pathQueue.push(wp.clone()));
            }
            // Final exact slot
            pathQueue.push(slot.pos.clone());

            agentPathQueues[agent.id] = pathQueue;
            agentTargetYaws[agent.id] = slot.yaw;
            agent.targetPos.copy(pathQueue[0]);

            // Set Speech immediately for intent
            const newText = STATE_SPEECHES[agent.id][nextState];
            agent.currentText = newText;
            const newTex = createBubbleTexture(agent.name, agent.role, newText, agent.color);
            agent.bubbleSprite.material.map = newTex;
            agent.bubbleSprite.material.needsUpdate = true;
          } else if (agent.state === 'WALKING') {
            // Handled when path is complete
          } else {
            // Return to home workstation desk
            agent.state = 'WALKING';
            agent.isSeated = false;
            agent.stateTimer = 600;

            const pathQueue: THREE.Vector3[] = [];
            // Step out from current position to hallway
            pathQueue.push(new THREE.Vector3(0, 0, 0));
            pathQueue.push(new THREE.Vector3(agent.homePos.x, 0, agent.homePos.z + 1.2));
            pathQueue.push(agent.homePos.clone());

            agentPathQueues[agent.id] = pathQueue;
            agentTargetYaws[agent.id] = 0; // face desk strictly forward!
            agent.targetPos.copy(pathQueue[0]);

            const newText = STATE_SPEECHES[agent.id].WORKING;
            agent.currentText = newText;
            const newTex = createBubbleTexture(agent.name, agent.role, newText, agent.color);
            agent.bubbleSprite.material.map = newTex;
            agent.bubbleSprite.material.needsUpdate = true;
          }
        }

        // MOVEMENT & PRECISE SEATING DOCKING
        if (agent.state === 'WALKING') {
          const queue = agentPathQueues[agent.id];
          if (queue && queue.length > 0) {
            const currentWaypoint = queue[0];
            const moveDir = new THREE.Vector3().subVectors(currentWaypoint, agent.currentPos);
            const dist = moveDir.length();

            if (dist > 0.12) {
              moveDir.normalize();
              agent.currentPos.addScaledVector(moveDir, 0.05);
              agent.group.position.copy(agent.currentPos);

              // Smoothly turn towards travel heading
              const targetYaw = Math.atan2(moveDir.x, moveDir.z);
              let diff = targetYaw - agent.group.rotation.y;
              while (diff < -Math.PI) diff += Math.PI * 2;
              while (diff > Math.PI) diff -= Math.PI * 2;
              agent.group.rotation.y += diff * 0.15;

              // Standing walk cycle animation
              const walkSpeed = 9.0;
              agent.leftThigh.rotation.x = Math.sin(t * walkSpeed) * 0.55;
              agent.rightThigh.rotation.x = -Math.sin(t * walkSpeed) * 0.55;
              agent.leftShin.rotation.x = Math.max(0, -Math.sin(t * walkSpeed) * 0.5);
              agent.rightShin.rotation.x = Math.max(0, Math.sin(t * walkSpeed) * 0.5);

              agent.leftArm.rotation.x = -Math.sin(t * walkSpeed) * 0.45;
              agent.rightArm.rotation.x = Math.sin(t * walkSpeed) * 0.45;
              agent.charMesh.position.y = Math.abs(Math.sin(t * walkSpeed)) * 0.08;
            } else {
              // Advance to next waypoint
              queue.shift();
              if (queue.length === 0) {
                // ARRIVED AT DESTINATION: PRECISE DOCKING!
                agent.group.position.copy(currentWaypoint);
                agent.currentPos.copy(currentWaypoint);

                // STRICT YAW ALIGNMENT (Zero slanted rotation!)
                agent.group.rotation.y = agentTargetYaws[agent.id];

                // Determine active resting state based on position
                if (currentWaypoint.distanceTo(agent.homePos) < 0.2) {
                  agent.state = 'WORKING';
                  agent.isSeated = true;
                  agent.stateTimer = 450 + Math.random() * 250;
                } else if (currentWaypoint.z < -5.5 && currentWaypoint.x > 6.0) {
                  agent.state = 'MEETING';
                  agent.isSeated = true;
                  agent.stateTimer = 450 + Math.random() * 200;
                } else if (currentWaypoint.z > 6.5 && currentWaypoint.x < -6.0) {
                  agent.state = 'GAMING';
                  agent.isSeated = true;
                  agent.stateTimer = 450 + Math.random() * 200;
                } else if (Math.abs(currentWaypoint.z) < 2.0 && currentWaypoint.x < -8.0) {
                  agent.state = 'DINING';
                  agent.isSeated = true;
                  agent.stateTimer = 450 + Math.random() * 200;
                } else if (currentWaypoint.x > 7.0 && currentWaypoint.z > 5.0) {
                  agent.state = 'GYM';
                  agent.isSeated = false;
                  agent.stateTimer = 400 + Math.random() * 200;
                } else {
                  agent.state = 'COFFEE';
                  agent.isSeated = false;
                  agent.stateTimer = 400 + Math.random() * 200;
                }
              }
            }
          }
        } else if (agent.isSeated) {
          // STRICT CLEAN SEATING POSTURE (No tilt, thighs horizontal 90deg, shins vertical 90deg)
          agent.charMesh.position.y = 0;
          agent.group.rotation.y = agentTargetYaws[agent.id]; // Locked orientation!

          // Natural Sitting: Thighs forward (+X 90 deg), Shins down to floor (-X 90 deg)
          agent.leftThigh.rotation.x = Math.PI / 2;
          agent.rightThigh.rotation.x = Math.PI / 2;
          agent.leftShin.rotation.x = -Math.PI / 2;
          agent.rightShin.rotation.x = -Math.PI / 2;

          if (agent.state === 'WORKING') {
            agent.leftArm.rotation.x = 0.5 + Math.sin(t * 10 + i) * 0.15;
            agent.rightArm.rotation.x = 0.5 + Math.cos(t * 10 + i * 1.5) * 0.15;
            agent.head.rotation.y = Math.sin(t * 0.8 + i) * 0.08;
          } else if (agent.state === 'GAMING') {
            agent.leftArm.rotation.x = 0.75 + Math.sin(t * 4) * 0.05;
            agent.rightArm.rotation.x = 0.75 + Math.cos(t * 4) * 0.05;
          } else if (agent.state === 'DINING') {
            agent.rightArm.rotation.x = 0.6 + Math.sin(t * 3) * 0.2;
            agent.leftArm.rotation.x = 0.4;
          } else if (agent.state === 'MEETING') {
            agent.head.rotation.y = Math.sin(t * 1.2) * 0.15;
            agent.leftArm.rotation.x = 0.4;
            agent.rightArm.rotation.x = 0.4;
          }
        } else if (agent.state === 'GYM') {
          // Jogging on treadmill
          agent.group.rotation.y = agentTargetYaws[agent.id];
          const jogSpeed = 12.0;
          agent.leftThigh.rotation.x = Math.sin(t * jogSpeed) * 0.6;
          agent.rightThigh.rotation.x = -Math.sin(t * jogSpeed) * 0.6;
          agent.leftShin.rotation.x = Math.max(0, Math.sin(t * jogSpeed) * 0.7);
          agent.rightShin.rotation.x = Math.max(0, -Math.sin(t * jogSpeed) * 0.7);
          agent.leftArm.rotation.x = -Math.sin(t * jogSpeed) * 0.6;
          agent.rightArm.rotation.x = Math.sin(t * jogSpeed) * 0.6;
          agent.charMesh.position.y = Math.abs(Math.sin(t * jogSpeed)) * 0.1;
        } else if (agent.state === 'COFFEE') {
          // Standing at coffee bar
          agent.group.rotation.y = agentTargetYaws[agent.id];
          agent.charMesh.position.y = 0;
          agent.leftThigh.rotation.x = 0;
          agent.rightThigh.rotation.x = 0;
          agent.leftShin.rotation.x = 0;
          agent.rightShin.rotation.x = 0;
          agent.rightArm.rotation.x = 0.6 + Math.sin(t * 2) * 0.2;
          agent.leftArm.rotation.x = 0.1;
        }

        // Float speech bubble smoothly
        agent.bubbleSprite.position.y = 3.2 + Math.sin(t * 2 + i) * 0.06;
      });

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
      renderer.domElement.removeEventListener('pointerdown', handlePointerDown);
      renderer.domElement.removeEventListener('pointerup', handlePointerUp);
      controls.dispose();
      renderer.dispose();
      if (mountRef.current && renderer.domElement) {
        mountRef.current.removeChild(renderer.domElement);
      }
    };
  }, [onSelectAgent]);

  useEffect(() => {
    const POD_POSITIONS: Record<string, [number, number, number]> = {
      gajahmada: [-1.8, 0, -2.5],
      robert: [2.8, 0, -2.5],
      talia: [-1.8, 0, 2.8],
      putra: [2.8, 0, 2.8],
    };

    if (selectedAgentId && POD_POSITIONS[selectedAgentId]) {
      const [ax, ay, az] = POD_POSITIONS[selectedAgentId];
      targetCamPos.current.set(ax + 2.5, ay + 3.2, az + 4.8);
      targetCamLook.current.set(ax, ay + 1.1, az);
      isTransitioning.current = true;
    } else {
      targetCamPos.current.set(18, 22, 26);
      targetCamLook.current.set(0, 1.0, 0);
      isTransitioning.current = true;
    }
  }, [selectedAgentId]);

  return <div ref={mountRef} className="w-full h-full cursor-grab active:cursor-grabbing" />;
}
