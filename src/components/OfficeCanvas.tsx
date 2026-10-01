'use client';

import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { AGENTS } from '@/data/agents';

interface OfficeCanvasProps {
  selectedAgentId: string | null;
  onSelectAgent: (id: string | null) => void;
}

export default function OfficeCanvas({ selectedAgentId, onSelectAgent }: OfficeCanvasProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const targetCamPos = useRef(new THREE.Vector3(13, 15, 17));
  const targetCamLook = useRef(new THREE.Vector3(0, 1.0, 0));
  const isTransitioning = useRef(false);

  useEffect(() => {
    if (!mountRef.current) return;

    let width = mountRef.current.clientWidth || window.innerWidth || 1200;
    let height = mountRef.current.clientHeight || window.innerHeight || 800;

    // SCENE
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x181a24);

    // CAMERA (Orthographic-feel Perspective)
    const camera = new THREE.PerspectiveCamera(34, width / height, 0.1, 1000);
    camera.position.set(13, 15, 17);
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

    // ORBIT CONTROLS (PAN, ROTATE, ZOOM, TOUCH PINCH)
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.target.set(0, 1.0, 0);
    controls.maxPolarAngle = Math.PI / 2.05; // Do not go below floor
    controls.minDistance = 4.0;              // Max zoom in
    controls.maxDistance = 35.0;             // Max helicopter zoom out
    controls.rotateSpeed = 0.8;
    controls.zoomSpeed = 1.0;
    controls.panSpeed = 0.8;
    controlsRef.current = controls;

    // When user manually interacts (drag/rotate/zoom), stop auto-transition lerp
    controls.addEventListener('start', () => {
      isTransitioning.current = false;
    });

    // LIGHTING: Cozy Warm Startup Studio Lighting
    const hemiLight = new THREE.HemisphereLight(0xfff7ed, 0x334155, 1.4);
    scene.add(hemiLight);

    const mainSun = new THREE.DirectionalLight(0xffedd5, 1.6);
    mainSun.position.set(14, 20, 12);
    scene.add(mainSun);

    const softFill = new THREE.DirectionalLight(0x93c5fd, 0.6);
    softFill.position.set(-12, 12, -10);
    scene.add(softFill);

    // --- BAKED STATIC TEXTURES (RENDER ONCE) ---

    // 1. Gajah Mada Code Terminal
    const codeCanvas = document.createElement('canvas');
    codeCanvas.width = 512;
    codeCanvas.height = 256;
    const cCtx = codeCanvas.getContext('2d')!;
    cCtx.fillStyle = '#0f172a';
    cCtx.fillRect(0, 0, 512, 256);
    cCtx.fillStyle = '#f59e0b';
    cCtx.font = 'bold 22px monospace';
    cCtx.fillText('GAJAH MADA // CLUSTER ORCHESTRATION', 20, 36);
    cCtx.fillStyle = '#38bdf8';
    cCtx.font = '16px monospace';
    [
      '[HERMES AGENT] 4 Subagents Operational',
      '[CRON] Talia 8x Auto-Publisher: 200 OK',
      '[CRON] Robert Competitor Brief: Active',
      '[GATEWAY] Baileys WhatsApp Port 3000: UP',
      '[SYSTEM] CPU: 12% | Latency: 18ms',
      '> Status: All systems healthy and green',
    ].forEach((line, i) => cCtx.fillText(line, 20, 75 + i * 28));
    const codeTex = new THREE.CanvasTexture(codeCanvas);

    // 2. Robert SEO Analytics
    const chartCanvas = document.createElement('canvas');
    chartCanvas.width = 512;
    chartCanvas.height = 256;
    const chCtx = chartCanvas.getContext('2d')!;
    chCtx.fillStyle = '#0f172a';
    chCtx.fillRect(0, 0, 512, 256);
    chCtx.fillStyle = '#3b82f6';
    chCtx.font = 'bold 22px sans-serif';
    chCtx.fillText('ROBERT // SERP COMPETITOR AUDIT', 20, 36);
    const bars = [40, 65, 80, 50, 92, 75, 96, 85];
    bars.forEach((val, i) => {
      chCtx.fillStyle = i === 6 ? '#60a5fa' : '#2563eb';
      chCtx.fillRect(35 + i * 56, 220 - val * 1.3, 42, val * 1.3);
    });
    const chartTex = new THREE.CanvasTexture(chartCanvas);

    // 3. Talia Editorial Writing
    const textCanvas = document.createElement('canvas');
    textCanvas.width = 512;
    textCanvas.height = 256;
    const tCtx = textCanvas.getContext('2d')!;
    tCtx.fillStyle = '#1e1124';
    tCtx.fillRect(0, 0, 512, 256);
    tCtx.fillStyle = '#f43f5e';
    tCtx.font = 'bold 22px sans-serif';
    tCtx.fillText('TALIA // HEADLESS WP ARTICLE DRAFT', 20, 36);
    tCtx.fillStyle = '#fecdd3';
    tCtx.font = '16px sans-serif';
    [
      'Draft: "Panduan Lengkap Legalitas PT PMA 2026"',
      'UU Cipta Kerja & Regulasi BKPM Terkini',
      'Skor Keterbacaan: 94/100 (Sastra & Linguistik UI)',
      'Google Instant Indexing: Dispatched',
      'Slot Harian: 8 dari 8 Artikel Terbit',
    ].forEach((line, i) => tCtx.fillText(line, 20, 80 + i * 30));
    const textTex = new THREE.CanvasTexture(textCanvas);

    // 4. Putra WhatsApp CRM
    const waCanvas = document.createElement('canvas');
    waCanvas.width = 512;
    waCanvas.height = 256;
    const wCtx = waCanvas.getContext('2d')!;
    wCtx.fillStyle = '#062817';
    wCtx.fillRect(0, 0, 512, 256);
    wCtx.fillStyle = '#10b981';
    wCtx.font = 'bold 22px sans-serif';
    wCtx.fillText('PUTRA // WHATSAPP CLIENT CS & CRM', 20, 36);
    wCtx.fillStyle = '#a7f3d0';
    wCtx.font = '16px sans-serif';
    [
      '[+62 812-****-****] "Halo, berapa biaya PT Perorangan?"',
      '[PUTRA] "Halo! Estimasi 1-2 hari kerja tuntas..."',
      '[INVOICE NINJA] Generated Draft #INV-2026-089',
      '[LEADS ENGINE] Outreach Batch 5 Prospected',
    ].forEach((line, i) => wCtx.fillText(line, 20, 85 + i * 32));
    const waTex = new THREE.CanvasTexture(waCanvas);

    // 5. Speech Bubble Sprite Texture
    const createBubbleTexture = (name: string, role: string, text: string, colorHex: string) => {
      const bCanvas = document.createElement('canvas');
      bCanvas.width = 512;
      bCanvas.height = 190;
      const bCtx = bCanvas.getContext('2d')!;

      bCtx.fillStyle = '#ffffff';
      bCtx.shadowColor = 'rgba(0, 0, 0, 0.25)';
      bCtx.shadowBlur = 12;
      bCtx.shadowOffsetY = 6;
      
      const x = 16, y = 16, w = 480, h = 130, r = 20;
      bCtx.beginPath();
      bCtx.moveTo(x + r, y);
      bCtx.lineTo(x + w - r, y);
      bCtx.quadraticCurveTo(x + w, y, x + w, y + r);
      bCtx.lineTo(x + w, y + h - r);
      bCtx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
      bCtx.lineTo(x + w / 2 + 15, y + h);
      bCtx.lineTo(x + w / 2, y + h + 22);
      bCtx.lineTo(x + w / 2 - 15, y + h);
      bCtx.lineTo(x + r, y + h);
      bCtx.quadraticCurveTo(x, y + h, x, y + h - r);
      bCtx.lineTo(x, y + r);
      bCtx.quadraticCurveTo(x, y, x + r, y);
      bCtx.closePath();
      bCtx.fill();

      bCtx.shadowColor = 'transparent';

      bCtx.fillStyle = colorHex;
      bCtx.font = 'bold 22px system-ui, sans-serif';
      bCtx.fillText(`● ${name.toUpperCase()}  //  ${role.toUpperCase()}`, 36, 55);

      bCtx.fillStyle = '#1e293b';
      bCtx.font = '500 20px system-ui, sans-serif';
      bCtx.fillText(`"${text}"`, 36, 95);

      bCtx.fillStyle = '#64748b';
      bCtx.font = 'bold 13px system-ui, sans-serif';
      bCtx.fillText('STATUS: OPERATING IN REAL-TIME', 36, 126);

      const tex = new THREE.CanvasTexture(bCanvas);
      tex.needsUpdate = true;
      return tex;
    };

    // --- COZY STARTUP OFFICE ARCHITECTURE ---

    const roomSize = 22;
    const floorGeo = new THREE.BoxGeometry(roomSize, 0.4, roomSize);
    const woodFloorMat = new THREE.MeshStandardMaterial({
      color: 0xd97706,
      roughness: 0.35,
    });
    const floor = new THREE.Mesh(floorGeo, woodFloorMat);
    floor.position.y = -0.2;
    scene.add(floor);

    // Floor Baseboard Trims
    const baseboardMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.5 });
    const createBaseboard = (w: number, d: number, x: number, z: number) => {
      const b = new THREE.Mesh(new THREE.BoxGeometry(w, 0.35, d), baseboardMat);
      b.position.set(x, 0.17, z);
      scene.add(b);
    };
    createBaseboard(roomSize, 0.12, 0, -roomSize / 2 + 0.06);
    createBaseboard(0.12, roomSize, -roomSize / 2 + 0.06, 0);

    // Walls
    const wallMat = new THREE.MeshStandardMaterial({ color: 0xf1f5f9, roughness: 0.6 });
    const backWall = new THREE.Mesh(new THREE.BoxGeometry(roomSize, 6.0, 0.3), wallMat);
    backWall.position.set(0, 3.0, -roomSize / 2);
    scene.add(backWall);

    const leftWall = new THREE.Mesh(new THREE.BoxGeometry(0.3, 6.0, roomSize), wallMat);
    leftWall.position.set(-roomSize / 2, 3.0, 0);
    scene.add(leftWall);

    // Whiteboard / Kanban Board
    const wbGroup = new THREE.Group();
    wbGroup.position.set(0, 3.5, -roomSize / 2 + 0.2);
    const wbFrame = new THREE.Mesh(
      new THREE.BoxGeometry(7.0, 3.0, 0.06),
      new THREE.MeshStandardMaterial({ color: 0xe2e8f0, roughness: 0.2 })
    );
    wbGroup.add(wbFrame);

    const wbBoard = new THREE.Mesh(
      new THREE.BoxGeometry(6.7, 2.7, 0.02),
      new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.1 })
    );
    wbBoard.position.z = 0.04;
    wbGroup.add(wbBoard);

    const stickyColors = [0xfef08a, 0xbae6fd, 0xfbcfe8, 0xbbf7d0];
    for (let c = 0; c < 4; c++) {
      for (let r = 0; r < 3; r++) {
        const sticky = new THREE.Mesh(
          new THREE.BoxGeometry(0.4, 0.4, 0.02),
          new THREE.MeshStandardMaterial({ color: stickyColors[(c + r) % 4] })
        );
        sticky.position.set(-2.4 + c * 1.6 + (r % 2) * 0.1, 0.8 - r * 0.65, 0.06);
        wbGroup.add(sticky);
      }
    }
    scene.add(wbGroup);

    // Motivational Poster
    const poster = new THREE.Mesh(
      new THREE.BoxGeometry(0.04, 2.8, 2.0),
      new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.3 })
    );
    poster.position.set(-roomSize / 2 + 0.2, 3.5, -4.5);
    scene.add(poster);

    // Large Studio Window
    const windowFrame = new THREE.Mesh(
      new THREE.BoxGeometry(0.06, 3.8, 5.5),
      new THREE.MeshStandardMaterial({ color: 0x334155 })
    );
    windowFrame.position.set(-roomSize / 2 + 0.2, 3.6, 3.5);
    scene.add(windowFrame);

    const windowGlass = new THREE.Mesh(
      new THREE.BoxGeometry(0.02, 3.6, 5.3),
      new THREE.MeshStandardMaterial({ color: 0xbae6fd, roughness: 0.1 })
    );
    windowGlass.position.set(-roomSize / 2 + 0.22, 3.6, 3.5);
    scene.add(windowGlass);

    // Lounge Area
    const sofaGroup = new THREE.Group();
    sofaGroup.position.set(-7.5, 0, 7.5);
    sofaGroup.rotation.y = Math.PI / 4;

    const sofaMat = new THREE.MeshStandardMaterial({ color: 0x475569, roughness: 0.8 });
    const sofaBase = new THREE.Mesh(new THREE.BoxGeometry(3.6, 0.45, 1.4), sofaMat);
    sofaBase.position.y = 0.3;
    sofaGroup.add(sofaBase);

    const sofaBack = new THREE.Mesh(new THREE.BoxGeometry(3.6, 0.8, 0.35), sofaMat);
    sofaBack.position.set(0, 0.85, -0.52);
    sofaGroup.add(sofaBack);

    const cMat1 = new THREE.MeshStandardMaterial({ color: 0xf59e0b });
    const cMat2 = new THREE.MeshStandardMaterial({ color: 0x38bdf8 });
    const c1 = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.5, 0.2), cMat1);
    c1.position.set(-1.3, 0.7, -0.35);
    c1.rotation.z = 0.15;
    sofaGroup.add(c1);

    const c2 = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.5, 0.2), cMat2);
    c2.position.set(1.3, 0.7, -0.35);
    c2.rotation.z = -0.15;
    sofaGroup.add(c2);

    scene.add(sofaGroup);

    const coffeeTable = new THREE.Mesh(
      new THREE.CylinderGeometry(0.9, 0.9, 0.45, 24),
      new THREE.MeshStandardMaterial({ color: 0xfde68a, roughness: 0.4 })
    );
    coffeeTable.position.set(-5.5, 0.22, 5.5);
    scene.add(coffeeTable);

    // Potted Plants
    const createPottedMonstera = (px: number, pz: number) => {
      const plantGroup = new THREE.Group();
      plantGroup.position.set(px, 0, pz);

      const pot = new THREE.Mesh(
        new THREE.CylinderGeometry(0.55, 0.4, 0.9, 16),
        new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.3 })
      );
      pot.position.y = 0.45;
      plantGroup.add(pot);

      const soil = new THREE.Mesh(
        new THREE.CylinderGeometry(0.5, 0.5, 0.1, 16),
        new THREE.MeshStandardMaterial({ color: 0x3f2e18 })
      );
      soil.position.y = 0.88;
      plantGroup.add(soil);

      const leafMat = new THREE.MeshStandardMaterial({ color: 0x15803d, roughness: 0.5 });
      for (let i = 0; i < 7; i++) {
        const leaf = new THREE.Mesh(new THREE.ConeGeometry(0.3, 1.2, 5), leafMat);
        const ang = (i / 7) * Math.PI * 2;
        leaf.position.set(Math.cos(ang) * 0.3, 1.3, Math.sin(ang) * 0.3);
        leaf.rotation.x = Math.sin(ang) * 0.4;
        leaf.rotation.z = -Math.cos(ang) * 0.4;
        plantGroup.add(leaf);
      }
      scene.add(plantGroup);
    };

    createPottedMonstera(-9.5, -9.2);
    createPottedMonstera(9.2, -9.2);
    createPottedMonstera(9.2, 9.2);

    // --- AGENT WORKSTATIONS & CASUAL AVATARS ---

    interface CharacterJoints {
      torso: THREE.Mesh;
      head: THREE.Group;
      leftArm: THREE.Group;
      rightArm: THREE.Group;
      typeSpeed: number;
    }

    const characters: CharacterJoints[] = [];
    const clickableObjects: THREE.Object3D[] = [];
    const speechSprites: { sprite: THREE.Sprite; initialY: number; freq: number }[] = [];

    const SPEECHES: Record<string, string> = {
      gajahmada: 'Cluster online. Coordinating 4 agents autonomously.',
      robert: 'SERP audit ready: 5 competitor keyword gaps discovered.',
      talia: '8/8 articles written & published to Google Indexing API.',
      putra: 'WhatsApp live: 5 inbound business leads qualified.',
    };

    const POD_POSITIONS: Record<string, [number, number, number]> = {
      gajahmada: [0, 0, -2.5],
      robert: [5.2, 0, -2.5],
      talia: [-5.2, 0, -2.5],
      putra: [0, 0, 4.2],
    };

    const buildCasualAgentWorkstation = (agentId: string) => {
      const data = AGENTS[agentId];
      const [px, py, pz] = POD_POSITIONS[agentId] || data.podCoordinates;
      const podGroup = new THREE.Group();
      podGroup.position.set(px, py, pz);
      podGroup.userData = { agentId };

      // Wool Zone Rug
      const rugMat = new THREE.MeshStandardMaterial({
        color: 0x334155,
        roughness: 0.9,
      });
      const rug = new THREE.Mesh(new THREE.BoxGeometry(3.8, 0.02, 3.4), rugMat);
      rug.position.y = 0.01;
      rug.userData = { agentId };
      podGroup.add(rug);
      clickableObjects.push(rug);

      const rugTrim = new THREE.Mesh(
        new THREE.RingGeometry(1.9, 1.98, 32),
        new THREE.MeshBasicMaterial({ color: data.accentHex, side: THREE.DoubleSide })
      );
      rugTrim.rotation.x = -Math.PI / 2;
      rugTrim.position.y = 0.025;
      podGroup.add(rugTrim);

      // Light Birch Wooden Desk
      const deskTopMat = new THREE.MeshStandardMaterial({
        color: 0xfef3c7,
        roughness: 0.3,
      });
      const desk = new THREE.Mesh(new THREE.BoxGeometry(2.6, 0.1, 1.3), deskTopMat);
      desk.position.set(0, 1.05, 0);
      desk.userData = { agentId };
      podGroup.add(desk);
      clickableObjects.push(desk);

      // Desk Legs
      const legMat = new THREE.MeshStandardMaterial({ color: 0x18181b, metalness: 0.8, roughness: 0.3 });
      [[-1.15, -0.5], [1.15, -0.5], [-1.15, 0.5], [1.15, 0.5]].forEach(([lx, lz]) => {
        const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 1.0, 12), legMat);
        leg.position.set(lx, 0.55, lz);
        podGroup.add(leg);
      });

      // Desk Mat & Laptop
      const deskMat = new THREE.Mesh(
        new THREE.BoxGeometry(1.6, 0.015, 0.75),
        new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.8 })
      );
      deskMat.position.set(0, 1.11, 0.15);
      podGroup.add(deskMat);

      const kb = new THREE.Mesh(
        new THREE.BoxGeometry(0.65, 0.02, 0.25),
        new THREE.MeshStandardMaterial({ color: 0xe2e8f0, metalness: 0.85 })
      );
      kb.position.set(0, 1.12, 0.28);
      podGroup.add(kb);

      const mouse = new THREE.Mesh(
        new THREE.BoxGeometry(0.1, 0.03, 0.15),
        new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.2 })
      );
      mouse.position.set(0.5, 1.12, 0.28);
      podGroup.add(mouse);

      const mug = new THREE.Mesh(
        new THREE.CylinderGeometry(0.08, 0.07, 0.16, 12),
        new THREE.MeshStandardMaterial({ color: 0xfacc15, roughness: 0.2 })
      );
      mug.position.set(-0.95, 1.18, 0.35);
      podGroup.add(mug);

      // Ergonomic Chair
      const chairGroup = new THREE.Group();
      chairGroup.position.set(0, 0, 0.95);

      const starBase = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.35, 0.06, 5), legMat);
      starBase.position.y = 0.12;
      chairGroup.add(starBase);

      const piston = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.45, 12), legMat);
      piston.position.y = 0.35;
      chairGroup.add(piston);

      const seatMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.7 });
      const seat = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.12, 0.75), seatMat);
      seat.position.y = 0.62;
      chairGroup.add(seat);

      const backrest = new THREE.Mesh(new THREE.BoxGeometry(0.72, 0.85, 0.08), seatMat);
      backrest.position.set(0, 1.15, 0.34);
      backrest.rotation.x = 0.1;
      chairGroup.add(backrest);

      podGroup.add(chairGroup);

      // Casual Startup Character
      const charGroup = new THREE.Group();
      charGroup.position.set(0, 0.72, 0.82);

      const pantsColor = agentId === 'gajahmada' ? 0x1e293b : agentId === 'robert' ? 0x1e3a5f : 0x334155;
      const pantsMat = new THREE.MeshStandardMaterial({ color: pantsColor, roughness: 0.8 });
      const hips = new THREE.Mesh(new THREE.BoxGeometry(0.52, 0.24, 0.46), pantsMat);
      hips.position.y = 0.12;
      charGroup.add(hips);

      const thighs = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.22, 0.52), pantsMat);
      thighs.position.set(0, 0.22, -0.32);
      charGroup.add(thighs);

      const topMat = new THREE.MeshStandardMaterial({
        color: data.accentHex,
        roughness: 0.7,
      });
      const torso = new THREE.Mesh(new THREE.BoxGeometry(0.56, 0.68, 0.38), topMat);
      torso.position.y = 0.58;
      charGroup.add(torso);

      const collar = new THREE.Mesh(
        new THREE.BoxGeometry(0.24, 0.08, 0.04),
        new THREE.MeshStandardMaterial({ color: 0xffffff })
      );
      collar.position.set(0, 0.92, -0.19);
      charGroup.add(collar);

      const headGroup = new THREE.Group();
      headGroup.position.set(0, 1.15, 0);

      const skinMat = new THREE.MeshStandardMaterial({ color: 0xffdfba, roughness: 0.4 });
      const head = new THREE.Mesh(new THREE.BoxGeometry(0.38, 0.38, 0.38), skinMat);
      headGroup.add(head);

      const eyeWhite = new THREE.MeshBasicMaterial({ color: 0xffffff });
      const pupil = new THREE.MeshBasicMaterial({ color: 0x0f172a });
      const createEye = (x: number) => {
        const ew = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.06, 0.02), eyeWhite);
        ew.position.set(x, 0.03, -0.192);
        const p = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.04, 0.02), pupil);
        p.position.set(x > 0 ? 0.015 : -0.015, 0, -0.005);
        ew.add(p);
        return ew;
      };
      headGroup.add(createEye(-0.1));
      headGroup.add(createEye(0.1));

      if (agentId === 'gajahmada') {
        const hairMat = new THREE.MeshStandardMaterial({ color: 0x18181b, roughness: 0.4 });
        const hairTop = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.16, 0.42), hairMat);
        hairTop.position.y = 0.22;
        headGroup.add(hairTop);

        const topknot = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 0.16, 12), hairMat);
        topknot.position.y = 0.36;
        headGroup.add(topknot);

        const goldRing = new THREE.Mesh(
          new THREE.TorusGeometry(0.14, 0.025, 8, 16),
          new THREE.MeshStandardMaterial({ color: 0xf59e0b, metalness: 0.9 })
        );
        goldRing.rotation.x = Math.PI / 2;
        goldRing.position.y = 0.32;
        headGroup.add(goldRing);
      } else if (agentId === 'robert') {
        const hairMat = new THREE.MeshStandardMaterial({ color: 0x451a03, roughness: 0.6 });
        const hair = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.14, 0.42), hairMat);
        hair.position.y = 0.22;
        headGroup.add(hair);

        const glasses = new THREE.Mesh(
          new THREE.BoxGeometry(0.32, 0.08, 0.04),
          new THREE.MeshStandardMaterial({ color: 0x0f172a, metalness: 0.7 })
        );
        glasses.position.set(0, 0.03, -0.2);
        headGroup.add(glasses);
      } else if (agentId === 'talia') {
        const hairMat = new THREE.MeshStandardMaterial({ color: 0x292524, roughness: 0.5 });
        const hairTop = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.16, 0.42), hairMat);
        hairTop.position.y = 0.22;
        headGroup.add(hairTop);

        const ponytail = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.45, 0.16), hairMat);
        ponytail.position.set(0, -0.05, 0.26);
        ponytail.rotation.x = -0.25;
        headGroup.add(ponytail);
      } else if (agentId === 'putra') {
        const hairMat = new THREE.MeshStandardMaterial({ color: 0x171717, roughness: 0.6 });
        const hair = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.12, 0.4), hairMat);
        hair.position.y = 0.22;
        headGroup.add(hair);

        const hpMat = new THREE.MeshStandardMaterial({ color: 0x10b981, metalness: 0.8 });
        const band = new THREE.Mesh(new THREE.TorusGeometry(0.24, 0.04, 8, 24, Math.PI), hpMat);
        band.position.set(0, 0.02, 0.08);
        headGroup.add(band);
      }

      charGroup.add(headGroup);

      const armMat = topMat;
      const leftArm = new THREE.Group();
      leftArm.position.set(-0.35, 0.82, 0);
      const lBicep = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.35, 0.14), armMat);
      lBicep.position.set(0, -0.15, -0.1);
      lBicep.rotation.x = 0.5;
      leftArm.add(lBicep);
      const lHand = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.12, 0.22), skinMat);
      lHand.position.set(0.08, -0.32, -0.32);
      leftArm.add(lHand);
      charGroup.add(leftArm);

      const rightArm = new THREE.Group();
      rightArm.position.set(0.35, 0.82, 0);
      const rBicep = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.35, 0.14), armMat);
      rBicep.position.set(0, -0.15, -0.1);
      rBicep.rotation.x = 0.5;
      rightArm.add(rBicep);
      const rHand = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.12, 0.22), skinMat);
      rHand.position.set(-0.08, -0.32, -0.32);
      rightArm.add(rHand);
      charGroup.add(rightArm);

      podGroup.add(charGroup);

      characters.push({
        torso,
        head: headGroup,
        leftArm,
        rightArm,
        typeSpeed: 9 + Math.random() * 4,
      });

      // Individual Screens
      if (agentId === 'gajahmada') {
        const monFrame = new THREE.Mesh(
          new THREE.BoxGeometry(1.3, 0.8, 0.05),
          new THREE.MeshStandardMaterial({ color: 0x18181b, metalness: 0.8 })
        );
        monFrame.position.set(0, 1.6, -0.38);
        podGroup.add(monFrame);

        const monScreen = new THREE.Mesh(
          new THREE.PlaneGeometry(1.24, 0.74),
          new THREE.MeshBasicMaterial({ map: codeTex })
        );
        monScreen.position.set(0, 1.6, -0.35);
        podGroup.add(monScreen);
      } else if (agentId === 'robert') {
        const mon1 = new THREE.Mesh(
          new THREE.BoxGeometry(1.05, 0.65, 0.04),
          new THREE.MeshStandardMaterial({ color: 0x18181b })
        );
        mon1.position.set(-0.55, 1.55, -0.32);
        mon1.rotation.y = 0.22;
        podGroup.add(mon1);

        const s1 = new THREE.Mesh(
          new THREE.PlaneGeometry(1.0, 0.6),
          new THREE.MeshBasicMaterial({ map: chartTex })
        );
        s1.position.set(-0.55, 1.55, -0.29);
        s1.rotation.y = 0.22;
        podGroup.add(s1);

        const mon2 = new THREE.Mesh(
          new THREE.BoxGeometry(1.05, 0.65, 0.04),
          new THREE.MeshStandardMaterial({ color: 0x18181b })
        );
        mon2.position.set(0.55, 1.55, -0.32);
        mon2.rotation.y = -0.22;
        podGroup.add(mon2);

        const s2 = new THREE.Mesh(
          new THREE.PlaneGeometry(1.0, 0.6),
          new THREE.MeshBasicMaterial({ map: chartTex })
        );
        s2.position.set(0.55, 1.55, -0.29);
        s2.rotation.y = -0.22;
        podGroup.add(s2);
      } else if (agentId === 'talia') {
        const laptopBase = new THREE.Mesh(
          new THREE.BoxGeometry(0.65, 0.03, 0.45),
          new THREE.MeshStandardMaterial({ color: 0xe2e8f0, metalness: 0.9 })
        );
        laptopBase.position.set(-0.25, 1.12, 0.05);
        podGroup.add(laptopBase);

        const laptopScreen = new THREE.Mesh(
          new THREE.PlaneGeometry(0.62, 0.4),
          new THREE.MeshBasicMaterial({ map: textTex })
        );
        laptopScreen.position.set(-0.25, 1.36, -0.16);
        laptopScreen.rotation.x = -0.18;
        podGroup.add(laptopScreen);

        const books = [0x991b1b, 0x075985, 0xb45309];
        books.forEach((col, idx) => {
          const book = new THREE.Mesh(
            new THREE.BoxGeometry(0.42, 0.08, 0.3),
            new THREE.MeshStandardMaterial({ color: col, roughness: 0.6 })
          );
          book.position.set(-0.95, 1.15 + idx * 0.085, -0.15);
          book.rotation.y = idx * 0.2;
          podGroup.add(book);
        });
      } else if (agentId === 'putra') {
        const monFrame = new THREE.Mesh(
          new THREE.BoxGeometry(1.3, 0.8, 0.05),
          new THREE.MeshStandardMaterial({ color: 0x18181b })
        );
        monFrame.position.set(0, 1.6, -0.35);
        podGroup.add(monFrame);

        const monScreen = new THREE.Mesh(
          new THREE.PlaneGeometry(1.24, 0.74),
          new THREE.MeshBasicMaterial({ map: waTex })
        );
        monScreen.position.set(0, 1.6, -0.32);
        podGroup.add(monScreen);

        const phone = new THREE.Mesh(
          new THREE.BoxGeometry(0.2, 0.35, 0.03),
          new THREE.MeshBasicMaterial({ color: 0x10b981 })
        );
        phone.position.set(0.85, 1.25, 0.2);
        phone.rotation.y = -0.4;
        phone.rotation.x = -0.3;
        podGroup.add(phone);
      }

      // Speech Bubble Billboard
      const bubbleTex = createBubbleTexture(
        data.name,
        data.role,
        SPEECHES[agentId] || 'Processing task...',
        data.color
      );
      const spriteMat = new THREE.SpriteMaterial({
        map: bubbleTex,
        transparent: true,
      });
      const bubbleSprite = new THREE.Sprite(spriteMat);
      bubbleSprite.scale.set(3.4, 1.25, 1.0);
      bubbleSprite.position.set(0, 3.4, 0);
      podGroup.add(bubbleSprite);

      speechSprites.push({ sprite: bubbleSprite, initialY: 3.4, freq: 1.8 + Math.random() });

      scene.add(podGroup);
    };

    Object.keys(AGENTS).forEach(buildCasualAgentWorkstation);

    // CLICK LISTENER (Raycaster distinguishes drag vs click)
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();
    let pointerDownPos = { x: 0, y: 0 };

    const handlePointerDown = (e: MouseEvent) => {
      pointerDownPos = { x: e.clientX, y: e.clientY };
    };

    const handlePointerUp = (e: MouseEvent) => {
      const dist = Math.hypot(e.clientX - pointerDownPos.x, e.clientY - pointerDownPos.y);
      // If pointer moved more than 5px, it was a drag/orbit, not a selection click
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
        // Clicking empty floor resets view to helicopter overview
        onSelectAgent(null);
      }
    };

    renderer.domElement.addEventListener('pointerdown', handlePointerDown);
    renderer.domElement.addEventListener('pointerup', handlePointerUp);

    // RESIZE LISTENER
    const handleResize = () => {
      if (!mountRef.current) return;
      width = mountRef.current.clientWidth || window.innerWidth;
      height = mountRef.current.clientHeight || window.innerHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };
    window.addEventListener('resize', handleResize);

    // 60 FPS RENDER LOOP
    let animId: number;
    let t = 0;

    const animate = () => {
      animId = requestAnimationFrame(animate);
      t += 0.02;

      // Handle Smooth Camera Auto-Lerp if transitioning to selected agent or overview
      if (isTransitioning.current) {
        camera.position.lerp(targetCamPos.current, 0.06);
        controls.target.lerp(targetCamLook.current, 0.06);
        
        // When close enough, hand over control to OrbitControls
        if (camera.position.distanceTo(targetCamPos.current) < 0.1) {
          isTransitioning.current = false;
        }
      }

      controls.update();

      // Typing animation
      characters.forEach((char, idx) => {
        const speed = char.typeSpeed;
        char.leftArm.rotation.x = Math.sin(t * speed + idx) * 0.12;
        char.rightArm.rotation.x = Math.cos(t * speed + idx * 1.4) * 0.12;
        char.head.rotation.y = Math.sin(t * 0.8 + idx) * 0.08;
        char.torso.position.y = 0.58 + Math.sin(t * 1.5 + idx) * 0.012;
      });

      // Subtle Floating Speech Bubbles
      speechSprites.forEach(({ sprite, initialY, freq }) => {
        sprite.position.y = initialY + Math.sin(t * freq) * 0.08;
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

  // CAMERA POSITIONING ON AGENT SELECTION OR OVERVIEW RESET
  useEffect(() => {
    const POD_POSITIONS: Record<string, [number, number, number]> = {
      gajahmada: [0, 0, -2.5],
      robert: [5.2, 0, -2.5],
      talia: [-5.2, 0, -2.5],
      putra: [0, 0, 4.2],
    };

    if (selectedAgentId && POD_POSITIONS[selectedAgentId]) {
      const [ax, ay, az] = POD_POSITIONS[selectedAgentId];
      targetCamPos.current.set(ax + 2.4, ay + 3.0, az + 4.8);
      targetCamLook.current.set(ax, ay + 1.1, az);
      isTransitioning.current = true;
    } else {
      // Warm Isometric Full Room Overview / Helicopter View
      targetCamPos.current.set(13, 15, 17);
      targetCamLook.current.set(0, 1.0, 0);
      isTransitioning.current = true;
    }
  }, [selectedAgentId]);

  return <div ref={mountRef} className="w-full h-full cursor-grab active:cursor-grabbing" />;
}
