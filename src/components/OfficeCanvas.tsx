'use client';

import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { AGENTS } from '@/data/agents';

interface OfficeCanvasProps {
  selectedAgentId: string | null;
  onSelectAgent: (id: string | null) => void;
}

type AgentState = 'WORKING' | 'WALKING' | 'COFFEE' | 'GAMING' | 'MEETING';

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
  leftLeg: THREE.Group;
  rightLeg: THREE.Group;
  bubbleSprite: THREE.Sprite;
  currentText: string;
  isSeated: boolean;
}

export default function OfficeCanvas({ selectedAgentId, onSelectAgent }: OfficeCanvasProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const targetCamPos = useRef(new THREE.Vector3(14, 18, 20));
  const targetCamLook = useRef(new THREE.Vector3(0, 1.0, 0));
  const isTransitioning = useRef(false);

  useEffect(() => {
    if (!mountRef.current) return;

    let width = mountRef.current.clientWidth || window.innerWidth || 1200;
    let height = mountRef.current.clientHeight || window.innerHeight || 800;

    // SCENE
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x181a24);

    // CAMERA (Crisp isometric perspective)
    const camera = new THREE.PerspectiveCamera(34, width / height, 0.1, 1000);
    camera.position.set(14, 18, 20);
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
    controls.maxDistance = 40.0;
    controls.rotateSpeed = 0.8;
    controls.zoomSpeed = 1.0;
    controls.panSpeed = 0.8;
    controlsRef.current = controls;

    controls.addEventListener('start', () => {
      isTransitioning.current = false;
    });

    // LIGHTING
    const hemiLight = new THREE.HemisphereLight(0xfff7ed, 0x334155, 1.3);
    scene.add(hemiLight);

    const sun = new THREE.DirectionalLight(0xffedd5, 1.6);
    sun.position.set(16, 24, 14);
    scene.add(sun);

    const fill = new THREE.DirectionalLight(0x93c5fd, 0.6);
    fill.position.set(-14, 14, -12);
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

    // Meeting Screen Presentation Texture
    const meetCanvas = document.createElement('canvas');
    meetCanvas.width = 512; meetCanvas.height = 280;
    const mCtx = meetCanvas.getContext('2d')!;
    mCtx.fillStyle = '#090d16'; mCtx.fillRect(0, 0, 512, 280);
    mCtx.fillStyle = '#38bdf8'; mCtx.font = 'bold 24px sans-serif';
    mCtx.fillText('DIGITAS // WEEKLY ALL-HANDS SYNC', 24, 40);
    mCtx.fillStyle = '#94a3b8'; mCtx.font = '16px sans-serif';
    ['Q4 Growth: +142% Organic Inbound Traffic', 'Average Client Response Time: < 3 Minutes', 'SEO Article Indexation Rate: 99.4%', 'Goal: Expand Notary & Corporate Services'].forEach((l, i) => mCtx.fillText(l, 24, 85 + i * 36));
    const meetTex = new THREE.CanvasTexture(meetCanvas);

    // Gaming TV Screen Texture (FIFA / Tekken)
    const tvCanvas = document.createElement('canvas');
    tvCanvas.width = 512; tvCanvas.height = 280;
    const tvCtx = tvCanvas.getContext('2d')!;
    tvCtx.fillStyle = '#052e16'; tvCtx.fillRect(0, 0, 512, 280);
    tvCtx.fillStyle = '#22c55e'; tvCtx.font = 'bold 28px sans-serif';
    tvCtx.fillText('★ PS5 GAME MATCH IN PROGRESS ★', 24, 45);
    tvCtx.fillStyle = '#ffffff'; tvCtx.font = 'bold 22px sans-serif';
    tvCtx.fillText('SCORE: AGENTS 3 - 1 BUGS', 110, 110);
    tvCtx.fillStyle = '#fbbf24'; tvCtx.font = '18px sans-serif';
    tvCtx.fillText('MATCH TIME: 88:14 // CASUAL BREAK', 90, 160);
    const tvTex = new THREE.CanvasTexture(tvCanvas);

    // DYNAMIC SPEECH BUBBLE GENERATOR
    const createBubbleTexture = (name: string, role: string, text: string, colorHex: string) => {
      const bCanvas = document.createElement('canvas');
      bCanvas.width = 512; bCanvas.height = 190;
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
      bCtx.fillText('STATUS: REAL-TIME AUTONOMOUS', 36, 126);

      const tex = new THREE.CanvasTexture(bCanvas);
      tex.needsUpdate = true;
      return tex;
    };

    // --- EXPANDED STARTUP OFFICE ARCHITECTURE ---
    const roomW = 28;
    const roomD = 24;

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

    // 1. ZONA 1: RUANG MEETING KACA (North-East Corner: x: 7.5, z: -6.5)
    const meetGroup = new THREE.Group();
    meetGroup.position.set(7.5, 0, -6.5);

    // Frosted Glass Partition Walls
    const glassMat = new THREE.MeshStandardMaterial({
      color: 0xbae6fd,
      transparent: true,
      opacity: 0.35,
      roughness: 0.1,
    });
    const meetWallFront = new THREE.Mesh(new THREE.BoxGeometry(8.5, 4.5, 0.08), glassMat);
    meetWallFront.position.set(0, 2.25, 4.0);
    meetGroup.add(meetWallFront);

    const meetWallSide = new THREE.Mesh(new THREE.BoxGeometry(0.08, 4.5, 8.0), glassMat);
    meetWallSide.position.set(-4.25, 2.25, 0);
    meetGroup.add(meetWallSide);

    // Dark Aluminum Door Frame & Headers
    const metalMullion = new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.8 });
    const m1 = new THREE.Mesh(new THREE.BoxGeometry(0.12, 4.5, 0.12), metalMullion);
    m1.position.set(-4.25, 2.25, 4.0);
    meetGroup.add(m1);

    // Large Oak Conference Table
    const confTable = new THREE.Mesh(
      new THREE.BoxGeometry(4.8, 0.1, 2.4),
      new THREE.MeshStandardMaterial({ color: 0xb45309, roughness: 0.3 })
    );
    confTable.position.set(0, 1.05, 0);
    meetGroup.add(confTable);

    // Conference Table Legs
    [[-2.0, -0.9], [2.0, -0.9], [-2.0, 0.9], [2.0, 0.9]].forEach(([lx, lz]) => {
      const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 1.0, 12), metalMullion);
      leg.position.set(lx, 0.55, lz);
      meetGroup.add(leg);
    });

    // 4 Executive Chairs around Conference Table
    const confChairMat = new THREE.MeshStandardMaterial({ color: 0x1e293b });
    const addConfChair = (cx: number, cz: number, ry: number) => {
      const c = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.8, 0.65), confChairMat);
      c.position.set(cx, 0.85, cz);
      c.rotation.y = ry;
      meetGroup.add(c);
    };
    addConfChair(-1.3, -1.5, 0);
    addConfChair(1.3, -1.5, 0);
    addConfChair(-1.3, 1.5, Math.PI);
    addConfChair(1.3, 1.5, Math.PI);

    // Presentation Display Screen on Wall
    const presFrame = new THREE.Mesh(
      new THREE.BoxGeometry(3.2, 1.8, 0.08),
      new THREE.MeshStandardMaterial({ color: 0x090d16 })
    );
    presFrame.position.set(0, 2.8, -4.8);
    meetGroup.add(presFrame);

    const presScreen = new THREE.Mesh(
      new THREE.PlaneGeometry(3.1, 1.7),
      new THREE.MeshBasicMaterial({ map: meetTex })
    );
    presScreen.position.set(0, 2.8, -4.75);
    meetGroup.add(presScreen);

    scene.add(meetGroup);

    // 2. ZONA 2: PANTRY & COFFEE BAR STATION (North-West Corner: x: -8.5, z: -7.5)
    const pantryGroup = new THREE.Group();
    pantryGroup.position.set(-8.5, 0, -7.5);

    // Modern Kitchen Bar Counter (Wood top & White marble front)
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

    // Espresso Coffee Machine (Stainless steel + black casing)
    const espMachine = new THREE.Mesh(
      new THREE.BoxGeometry(1.2, 0.75, 0.8),
      new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.8, roughness: 0.2 })
    );
    espMachine.position.set(-1.4, 1.55, 0.1);
    pantryGroup.add(espMachine);

    // Espresso Portafilter & LED status
    const espLight = new THREE.Mesh(
      new THREE.BoxGeometry(0.12, 0.06, 0.02),
      new THREE.MeshBasicMaterial({ color: 0x10b981 })
    );
    espLight.position.set(-1.4, 1.8, 0.51);
    pantryGroup.add(espLight);

    // Water Cooler Dispenser
    const cooler = new THREE.Mesh(
      new THREE.CylinderGeometry(0.35, 0.35, 1.5, 16),
      new THREE.MeshStandardMaterial({ color: 0xe2e8f0 })
    );
    cooler.position.set(1.8, 0.75, 0);
    pantryGroup.add(cooler);

    const jug = new THREE.Mesh(
      new THREE.CylinderGeometry(0.28, 0.28, 0.7, 16),
      new THREE.MeshStandardMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.6 })
    );
    jug.position.set(1.8, 1.8, 0);
    pantryGroup.add(jug);

    // Mugs row
    [0xef4444, 0x3b82f6, 0xf59e0b, 0x10b981].forEach((col, idx) => {
      const cmug = new THREE.Mesh(
        new THREE.CylinderGeometry(0.08, 0.07, 0.16, 12),
        new THREE.MeshStandardMaterial({ color: col, roughness: 0.2 })
      );
      cmug.position.set(-0.2 + idx * 0.3, 1.25, 0.2);
      pantryGroup.add(cmug);
    });

    scene.add(pantryGroup);

    // 3. ZONA 3: GAMING & BREAKOUT LOUNGE (South-West Corner: x: -8.5, z: 6.5)
    const loungeGroup = new THREE.Group();
    loungeGroup.position.set(-8.5, 0, 6.5);

    // Large Fabric L-Sofa
    const sofaMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.8 });
    const sofaMain = new THREE.Mesh(new THREE.BoxGeometry(4.6, 0.5, 1.5), sofaMat);
    sofaMain.position.set(0, 0.3, 0);
    loungeGroup.add(sofaMain);

    const sofaBack = new THREE.Mesh(new THREE.BoxGeometry(4.6, 0.85, 0.35), sofaMat);
    sofaBack.position.set(0, 0.9, -0.6);
    loungeGroup.add(sofaBack);

    // Cushions
    const c1 = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.5, 0.2), new THREE.MeshStandardMaterial({ color: 0xf59e0b }));
    c1.position.set(-1.6, 0.7, -0.4);
    loungeGroup.add(c1);

    const c2 = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.5, 0.2), new THREE.MeshStandardMaterial({ color: 0x38bdf8 }));
    c2.position.set(1.6, 0.7, -0.4);
    loungeGroup.add(c2);

    // Coffee Table with PS5 Console
    const cTable = new THREE.Mesh(
      new THREE.BoxGeometry(2.4, 0.35, 1.2),
      new THREE.MeshStandardMaterial({ color: 0xfef08a, roughness: 0.4 })
    );
    cTable.position.set(0, 0.2, 1.6);
    loungeGroup.add(cTable);

    // PS5 Console (White curve body + blue light)
    const ps5 = new THREE.Mesh(
      new THREE.BoxGeometry(0.45, 0.1, 0.3),
      new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.2 })
    );
    ps5.position.set(-0.6, 0.42, 1.6);
    loungeGroup.add(ps5);

    const ps5Light = new THREE.Mesh(
      new THREE.BoxGeometry(0.46, 0.02, 0.02),
      new THREE.MeshBasicMaterial({ color: 0x3b82f6 })
    );
    ps5Light.position.set(-0.6, 0.44, 1.76);
    loungeGroup.add(ps5Light);

    // Wall Hanging TV Screen facing sofa
    const tvFrame = new THREE.Mesh(
      new THREE.BoxGeometry(3.0, 1.7, 0.08),
      new THREE.MeshStandardMaterial({ color: 0x090d16 })
    );
    tvFrame.position.set(0, 2.2, 4.2);
    loungeGroup.add(tvFrame);

    const tvScreen = new THREE.Mesh(
      new THREE.PlaneGeometry(2.9, 1.6),
      new THREE.MeshBasicMaterial({ map: tvTex })
    );
    tvScreen.position.set(0, 2.2, 4.15);
    tvScreen.rotation.y = Math.PI;
    loungeGroup.add(tvScreen);

    scene.add(loungeGroup);

    // 4. ZONA 4: OPEN WORKSTATIONS (Center Hub)
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

      // Rug
      const rug = new THREE.Mesh(
        new THREE.BoxGeometry(3.6, 0.02, 3.2),
        new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.9 })
      );
      rug.position.y = 0.01;
      rug.userData = { agentId };
      podGroup.add(rug);
      clickableObjects.push(rug);

      // Desk
      const desk = new THREE.Mesh(
        new THREE.BoxGeometry(2.5, 0.1, 1.3),
        new THREE.MeshStandardMaterial({ color: 0xfef3c7, roughness: 0.3 })
      );
      desk.position.set(0, 1.05, 0);
      desk.userData = { agentId };
      podGroup.add(desk);
      clickableObjects.push(desk);

      // Desk Legs
      const legMat = new THREE.MeshStandardMaterial({ color: 0x18181b, metalness: 0.8 });
      [[-1.1, -0.5], [1.1, -0.5], [-1.1, 0.5], [1.1, 0.5]].forEach(([lx, lz]) => {
        const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 1.0, 12), legMat);
        leg.position.set(lx, 0.55, lz);
        podGroup.add(leg);
      });

      // Laptop / Monitors per Agent
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

      // Empty Chair at desk
      const chair = new THREE.Mesh(new THREE.BoxGeometry(0.75, 0.85, 0.65), new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.7 }));
      chair.position.set(0, 0.85, 0.95);
      podGroup.add(chair);

      scene.add(podGroup);
    };

    Object.keys(AGENTS).forEach(buildWorkstation);

    // --- AUTONOMOUS AGENT SIMULATOR WITH WAYPOINTS & WALKING ---
    const agentsList: AgentSim[] = [];

    // WAYPOINT LOCATIONS
    const WAYPOINTS = {
      COFFEE: new THREE.Vector3(-8.5, 0, -5.8),
      GAMING: new THREE.Vector3(-8.5, 0, 6.2),
      MEETING: [
        new THREE.Vector3(6.5, 0, -6.5),
        new THREE.Vector3(8.5, 0, -6.5),
        new THREE.Vector3(6.5, 0, -5.0),
        new THREE.Vector3(8.5, 0, -5.0),
      ],
    };

    // DYNAMIC SPEECHES PER STATE
    const STATE_SPEECHES: Record<string, Record<AgentState, string>> = {
      gajahmada: {
        WORKING: 'Cluster nominal. 4 agents online & orchestrating.',
        WALKING: 'Menuju lokasi berikutnya...',
        COFFEE: 'Espresso shot dulu, persiapan strategi sore.',
        GAMING: 'Push rank FIFA sejenak, refreshing otak.',
        MEETING: 'Review sprint: roadmap kuartal tuntas.',
      },
      robert: {
        WORKING: 'SERP audit: 5 competitor keyword gaps ready.',
        WALKING: 'Jalan santai ambil data...',
        COFFEE: 'Coffee break sambil pantau algoritma Google.',
        GAMING: 'Istirahat bentar, main game bareng tim.',
        MEETING: 'Presentasi laporan SEO kompetitor mingguan.',
      },
      talia: {
        WORKING: 'Slot 8/8 draft selesai & push ke Indexing API.',
        WALKING: 'Peregangan sejenak ke pantry...',
        COFFEE: 'Teh hangat biar inspirasi nulis mengalir deras.',
        GAMING: 'Santai di sofa baca feedback artikel.',
        MEETING: 'Pemaparan matriks keterbacaan konten & UU.',
      },
      putra: {
        WORKING: 'WhatsApp live: 5 leads inbound dikonfirmasi.',
        WALKING: 'Ambil minum sebelum follow-up klien...',
        COFFEE: 'Isi tenaga dulu, chat calon klien lancar jaya.',
        GAMING: 'Break time main stick PS di lounge.',
        MEETING: 'Laporan konversi invoice & CS WhatsApp.',
      },
    };

    // BUILD DYNAMIC BIPEDAL WALKING AGENTS
    Object.keys(AGENTS).forEach((agentId, idx) => {
      const data = AGENTS[agentId];
      const [hx, hy, hz] = POD_POSITIONS[agentId];
      const homeVec = new THREE.Vector3(hx, 0, hz + 0.95);

      const agentGroup = new THREE.Group();
      agentGroup.position.copy(homeVec);
      agentGroup.userData = { agentId };

      const charMesh = new THREE.Group();

      // Hips / Pants
      const pantsMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.8 });
      const hips = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.22, 0.4), pantsMat);
      hips.position.y = 0.85;
      charMesh.add(hips);

      // Torso
      const shirtMat = new THREE.MeshStandardMaterial({ color: data.accentHex, roughness: 0.6 });
      const torso = new THREE.Mesh(new THREE.BoxGeometry(0.54, 0.65, 0.36), shirtMat);
      torso.position.y = 1.25;
      charMesh.add(torso);

      // Head
      const headGroup = new THREE.Group();
      headGroup.position.y = 1.75;
      const skinMat = new THREE.MeshStandardMaterial({ color: 0xffdfba, roughness: 0.4 });
      const head = new THREE.Mesh(new THREE.BoxGeometry(0.36, 0.36, 0.36), skinMat);
      headGroup.add(head);

      // Hair
      const hairMat = new THREE.MeshStandardMaterial({ color: idx === 1 ? 0x451a03 : 0x18181b, roughness: 0.5 });
      const hair = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.14, 0.4), hairMat);
      hair.position.y = 0.22;
      headGroup.add(hair);

      charMesh.add(headGroup);

      // Arms
      const leftArm = new THREE.Group();
      leftArm.position.set(-0.35, 1.45, 0);
      const lArmMesh = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.5, 0.14), shirtMat);
      lArmMesh.position.y = -0.25;
      leftArm.add(lArmMesh);
      charMesh.add(leftArm);

      const rightArm = new THREE.Group();
      rightArm.position.set(0.35, 1.45, 0);
      const rArmMesh = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.5, 0.14), shirtMat);
      rArmMesh.position.y = -0.25;
      rightArm.add(rArmMesh);
      charMesh.add(rightArm);

      // Legs
      const leftLeg = new THREE.Group();
      leftLeg.position.set(-0.16, 0.8, 0);
      const lLegMesh = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.75, 0.2), pantsMat);
      lLegMesh.position.y = -0.375;
      leftLeg.add(lLegMesh);
      charMesh.add(leftLeg);

      const rightLeg = new THREE.Group();
      rightLeg.position.set(0.16, 0.8, 0);
      const rLegMesh = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.75, 0.2), pantsMat);
      rLegMesh.position.y = -0.375;
      rightLeg.add(rLegMesh);
      charMesh.add(rightLeg);

      agentGroup.add(charMesh);

      // Initial Bubble
      const initialText = STATE_SPEECHES[agentId].WORKING;
      const bTex = createBubbleTexture(data.name, data.role, initialText, data.color);
      const bSprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: bTex, transparent: true }));
      bSprite.scale.set(3.4, 1.25, 1.0);
      bSprite.position.set(0, 2.7, 0);
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
        stateTimer: 200 + Math.random() * 300,
        group: agentGroup,
        charMesh,
        torso,
        head: headGroup,
        leftArm,
        rightArm,
        leftLeg,
        rightLeg,
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

    // RESIZE
    const handleResize = () => {
      if (!mountRef.current) return;
      width = mountRef.current.clientWidth || window.innerWidth;
      height = mountRef.current.clientHeight || window.innerHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };
    window.addEventListener('resize', handleResize);

    // 60 FPS RENDER LOOP + AGENT BEHAVIOR STATE MACHINE
    let animId: number;
    let t = 0;

    const animate = () => {
      animId = requestAnimationFrame(animate);
      t += 0.02;

      // Camera lerp
      if (isTransitioning.current) {
        camera.position.lerp(targetCamPos.current, 0.06);
        controls.target.lerp(targetCamLook.current, 0.06);
        if (camera.position.distanceTo(targetCamPos.current) < 0.15) {
          isTransitioning.current = false;
        }
      }
      controls.update();

      // SIMULATE AGENTS (Walking, Taking Breaks, Changing Speech)
      agentsList.forEach((agent, i) => {
        agent.stateTimer -= 1;

        // STATE TRANSITION LOGIC
        if (agent.stateTimer <= 0) {
          if (agent.state === 'WORKING') {
            // Decide break destination randomly
            const roll = Math.random();
            if (roll < 0.35) {
              agent.state = 'WALKING';
              agent.targetPos.copy(WAYPOINTS.COFFEE);
              agent.targetPos.x += (Math.random() - 0.5) * 1.5;
            } else if (roll < 0.70) {
              agent.state = 'WALKING';
              agent.targetPos.copy(WAYPOINTS.GAMING);
              agent.targetPos.x += (Math.random() - 0.5) * 1.5;
            } else {
              agent.state = 'WALKING';
              agent.targetPos.copy(WAYPOINTS.MEETING[i % 4]);
            }
            agent.stateTimer = 500;
            agent.isSeated = false;
          } else if (agent.state === 'WALKING') {
            // Arrived at destination -> enter specific break state
            if (agent.targetPos.distanceTo(WAYPOINTS.COFFEE) < 3.0) {
              agent.state = 'COFFEE';
              agent.stateTimer = 400 + Math.random() * 200;
            } else if (agent.targetPos.distanceTo(WAYPOINTS.GAMING) < 3.0) {
              agent.state = 'GAMING';
              agent.stateTimer = 450 + Math.random() * 200;
              agent.isSeated = true;
            } else {
              agent.state = 'MEETING';
              agent.stateTimer = 400 + Math.random() * 200;
              agent.isSeated = true;
            }
          } else {
            // Return to home desk
            agent.state = 'WALKING';
            agent.targetPos.copy(agent.homePos);
            agent.stateTimer = 500;
            agent.isSeated = false;
          }

          // Update Dynamic Speech Bubble Texture
          const newText = STATE_SPEECHES[agent.id][agent.state];
          if (newText !== agent.currentText) {
            agent.currentText = newText;
            const newTex = createBubbleTexture(agent.name, agent.role, newText, agent.color);
            agent.bubbleSprite.material.map = newTex;
            agent.bubbleSprite.material.needsUpdate = true;
          }
        }

        // PHYSICAL MOVEMENT & ANIMATION
        if (agent.state === 'WALKING') {
          const moveDir = new THREE.Vector3().subVectors(agent.targetPos, agent.currentPos);
          const dist = moveDir.length();

          if (dist > 0.15) {
            moveDir.normalize();
            agent.currentPos.addScaledVector(moveDir, 0.045);
            agent.group.position.copy(agent.currentPos);

            // Rotate towards walking direction
            agent.group.rotation.y = Math.atan2(moveDir.x, moveDir.z);

            // Walk Cycle Swing
            const walkSpeed = 8.0;
            agent.leftLeg.rotation.x = Math.sin(t * walkSpeed) * 0.55;
            agent.rightLeg.rotation.x = -Math.sin(t * walkSpeed) * 0.55;
            agent.leftArm.rotation.x = -Math.sin(t * walkSpeed) * 0.45;
            agent.rightArm.rotation.x = Math.sin(t * walkSpeed) * 0.45;
            agent.charMesh.position.y = Math.abs(Math.sin(t * walkSpeed)) * 0.08;
          } else {
            // Reached target
            agent.stateTimer = 0; // Trigger next state immediately
            agent.leftLeg.rotation.x = 0;
            agent.rightLeg.rotation.x = 0;
          }
        } else if (agent.state === 'WORKING') {
          // Reset orientation facing desk
          agent.group.rotation.y = 0;
          agent.charMesh.position.y = -0.15; // seated pose

          // Typing animation
          agent.leftArm.rotation.x = 0.5 + Math.sin(t * 10 + i) * 0.15;
          agent.rightArm.rotation.x = 0.5 + Math.cos(t * 10 + i * 1.5) * 0.15;
          agent.head.rotation.y = Math.sin(t * 0.8 + i) * 0.08;
        } else if (agent.state === 'GAMING') {
          agent.group.rotation.y = Math.PI; // Face TV
          agent.charMesh.position.y = -0.18; // Seated on sofa

          // Holding PS5 Controller
          agent.leftArm.rotation.x = 0.8 + Math.sin(t * 4) * 0.05;
          agent.rightArm.rotation.x = 0.8 + Math.cos(t * 4) * 0.05;
        } else if (agent.state === 'COFFEE') {
          agent.group.rotation.y = -Math.PI / 2; // Face bar
          agent.charMesh.position.y = 0;

          // Holding coffee cup to mouth occasionally
          agent.rightArm.rotation.x = 0.6 + Math.sin(t * 2) * 0.2;
          agent.leftArm.rotation.x = 0.1;
        } else if (agent.state === 'MEETING') {
          agent.group.rotation.y = Math.PI / 2;
          agent.charMesh.position.y = -0.15;
          agent.head.rotation.y = Math.sin(t * 1.2) * 0.15; // looking around table
        }

        // Float speech bubble gently
        agent.bubbleSprite.position.y = 2.7 + Math.sin(t * 2 + i) * 0.08;
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

  // CAMERA POSITIONING ON AGENT SELECTION
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
      // Helicopter Full Office View
      targetCamPos.current.set(14, 18, 20);
      targetCamLook.current.set(0, 1.0, 0);
      isTransitioning.current = true;
    }
  }, [selectedAgentId]);

  return <div ref={mountRef} className="w-full h-full cursor-grab active:cursor-grabbing" />;
}
