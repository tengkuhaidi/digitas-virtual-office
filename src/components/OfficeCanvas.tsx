'use client';

import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { AGENTS } from '@/data/agents';

interface OfficeCanvasProps {
  selectedAgentId: string | null;
  onSelectAgent: (id: string | null) => void;
}

export default function OfficeCanvas({ selectedAgentId, onSelectAgent }: OfficeCanvasProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const targetCamPos = useRef(new THREE.Vector3(12, 14, 18));
  const targetCamLook = useRef(new THREE.Vector3(0, 1.2, 0));

  useEffect(() => {
    if (!mountRef.current) return;

    let width = mountRef.current.clientWidth || window.innerWidth || 1200;
    let height = mountRef.current.clientHeight || window.innerHeight || 800;

    // SCENE
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0a0c16);
    scene.fog = new THREE.FogExp2(0x0a0c16, 0.022);

    // CAMERA (Smooth isometric 3/4 perspective)
    const camera = new THREE.PerspectiveCamera(38, width / height, 0.1, 1000);
    camera.position.set(14, 16, 20);
    camera.lookAt(0, 1.2, 0);

    // RENDERER
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      powerPreference: 'high-performance',
      alpha: false,
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    mountRef.current.appendChild(renderer.domElement);

    // AMBIENT & LIGHTING
    const hemiLight = new THREE.HemisphereLight(0xffffff, 0x1e293b, 1.2);
    scene.add(hemiLight);

    const dirLight1 = new THREE.DirectionalLight(0xfff7ed, 1.6);
    dirLight1.position.set(18, 25, 14);
    scene.add(dirLight1);

    const dirLight2 = new THREE.DirectionalLight(0x38bdf8, 0.9);
    dirLight2.position.set(-16, 18, -12);
    scene.add(dirLight2);

    // --- PROCEDURAL DYNAMIC CANVAS TEXTURES ---

    // 1. Monitor Code Feed Texture
    const codeCanvas = document.createElement('canvas');
    codeCanvas.width = 512;
    codeCanvas.height = 256;
    const codeCtx = codeCanvas.getContext('2d')!;
    const codeTex = new THREE.CanvasTexture(codeCanvas);

    // 2. SEO Chart / Analytics Texture
    const chartCanvas = document.createElement('canvas');
    chartCanvas.width = 512;
    chartCanvas.height = 256;
    const chartCtx = chartCanvas.getContext('2d')!;
    const chartTex = new THREE.CanvasTexture(chartCanvas);

    // 3. Editorial Text / Blog Draft Texture
    const textCanvas = document.createElement('canvas');
    textCanvas.width = 512;
    textCanvas.height = 256;
    const textCtx = textCanvas.getContext('2d')!;
    const textTex = new THREE.CanvasTexture(textCanvas);

    // 4. WhatsApp Chat Feed Texture
    const waCanvas = document.createElement('canvas');
    waCanvas.width = 512;
    waCanvas.height = 256;
    const waCtx = waCanvas.getContext('2d')!;
    const waTex = new THREE.CanvasTexture(waCanvas);

    // --- ENVIRONMENT ARCHITECTURE ---

    // Raised Flooring Stage (Architectural Podium)
    const floorGeo = new THREE.BoxGeometry(25, 0.6, 25);
    const floorMat = new THREE.MeshStandardMaterial({
      color: 0x131826,
      roughness: 0.5,
      metalness: 0.2,
    });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.position.y = -0.3;
    scene.add(floor);

    // Subtle Wood Flooring Inset in Central Area
    const woodCenterGeo = new THREE.BoxGeometry(15, 0.02, 15);
    const woodMat = new THREE.MeshStandardMaterial({
      color: 0x1e2433,
      roughness: 0.4,
    });
    const woodCenter = new THREE.Mesh(woodCenterGeo, woodMat);
    woodCenter.position.y = 0.01;
    scene.add(woodCenter);

    // Technical Blueprint Grid
    const grid = new THREE.GridHelper(25, 25, 0x38bdf8, 0x1e293b);
    grid.position.y = 0.02;
    scene.add(grid);

    // Architectural Perimeter Neon Trims
    const trimMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8 });
    const createTrim = (w: number, d: number, x: number, z: number) => {
      const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, 0.08, d), trimMat);
      mesh.position.set(x, 0.04, z);
      scene.add(mesh);
    };
    createTrim(25.2, 0.15, 0, 12.5);
    createTrim(25.2, 0.15, 0, -12.5);
    createTrim(0.15, 25.2, 12.5, 0);
    createTrim(0.15, 25.2, -12.5, 0);

    // Glass Partition / Background Office Walls (L-shape rear)
    const wallMat = new THREE.MeshPhysicalMaterial({
      color: 0x1e293b,
      transparent: true,
      opacity: 0.25,
      roughness: 0.1,
      transmission: 0.6,
      thickness: 0.5,
    });
    const backWall = new THREE.Mesh(new THREE.BoxGeometry(25, 4.5, 0.2), wallMat);
    backWall.position.set(0, 2.25, -12.4);
    scene.add(backWall);

    const leftWall = new THREE.Mesh(new THREE.BoxGeometry(0.2, 4.5, 25), wallMat);
    leftWall.position.set(-12.4, 2.25, 0);
    scene.add(leftWall);

    // Architectural Wall Mullions
    const mullionMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, metalness: 0.8 });
    for (let x = -10; x <= 10; x += 5) {
      const m = new THREE.Mesh(new THREE.BoxGeometry(0.15, 4.5, 0.3), mullionMat);
      m.position.set(x, 2.25, -12.35);
      scene.add(m);
    }

    // Modern Office Plants (Biophilic decor in corners)
    const createOfficePlant = (px: number, pz: number) => {
      const plantGroup = new THREE.Group();
      plantGroup.position.set(px, 0, pz);

      // Ceramic Planter Pot
      const potMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.3 });
      const pot = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.35, 1.1, 16), potMat);
      pot.position.y = 0.55;
      plantGroup.add(pot);

      // Soil
      const soil = new THREE.Mesh(
        new THREE.CylinderGeometry(0.48, 0.48, 0.1, 16),
        new THREE.MeshStandardMaterial({ color: 0x27272a })
      );
      soil.position.y = 1.05;
      plantGroup.add(soil);

      // Lush Leaves
      const leafMat = new THREE.MeshStandardMaterial({ color: 0x10b981, roughness: 0.6 });
      for (let i = 0; i < 7; i++) {
        const leaf = new THREE.Mesh(new THREE.ConeGeometry(0.22, 1.1, 5), leafMat);
        const angle = (i / 7) * Math.PI * 2;
        leaf.position.set(Math.cos(angle) * 0.25, 1.4, Math.sin(angle) * 0.25);
        leaf.rotation.x = Math.sin(angle) * 0.45;
        leaf.rotation.z = -Math.cos(angle) * 0.45;
        plantGroup.add(leaf);
      }
      scene.add(plantGroup);
    };

    createOfficePlant(-10.5, -10.5);
    createOfficePlant(10.5, -10.5);
    createOfficePlant(-10.5, 10.5);

    // Water Cooler & Refreshment Station (Corner lounge feel)
    const coolerGroup = new THREE.Group();
    coolerGroup.position.set(10.5, 0, 8.5);
    const coolerBase = new THREE.Mesh(
      new THREE.BoxGeometry(0.8, 1.4, 0.8),
      new THREE.MeshStandardMaterial({ color: 0xe2e8f0, roughness: 0.2 })
    );
    coolerBase.position.y = 0.7;
    coolerGroup.add(coolerBase);

    const waterBottle = new THREE.Mesh(
      new THREE.CylinderGeometry(0.3, 0.3, 0.7, 16),
      new THREE.MeshPhysicalMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.6, roughness: 0.1 })
    );
    waterBottle.position.y = 1.75;
    coolerGroup.add(waterBottle);
    scene.add(coolerGroup);

    // --- REFINED CHARACTER VOXEL GENERATOR ---

    interface CharacterJoints {
      group: THREE.Group;
      torso: THREE.Mesh;
      head: THREE.Group;
      leftArm: THREE.Group;
      rightArm: THREE.Group;
      typeSpeed: number;
    }

    const characters: CharacterJoints[] = [];
    const clickableObjects: THREE.Object3D[] = [];
    const rotatingObjects: THREE.Object3D[] = [];
    const floatingBadges: { badge: THREE.Group; initialY: number; freq: number }[] = [];

    const buildDetailedAgent = (agentId: string) => {
      const data = AGENTS[agentId];
      const [px, py, pz] = data.podCoordinates;
      const podGroup = new THREE.Group();
      podGroup.position.set(px, py, pz);
      podGroup.userData = { agentId };

      // 1. Pod Circle Platform with Edge Bevel & Glowing Trim
      const podBase = new THREE.Mesh(
        new THREE.CylinderGeometry(2.6, 2.7, 0.2, 32),
        new THREE.MeshStandardMaterial({ color: 0x182032, roughness: 0.3, metalness: 0.4 })
      );
      podBase.position.y = 0.1;
      podBase.userData = { agentId };
      podGroup.add(podBase);
      clickableObjects.push(podBase);

      const podRing = new THREE.Mesh(
        new THREE.RingGeometry(2.35, 2.58, 32),
        new THREE.MeshBasicMaterial({ color: data.accentHex, side: THREE.DoubleSide })
      );
      podRing.rotation.x = -Math.PI / 2;
      podRing.position.y = 0.21;
      podGroup.add(podRing);

      // 2. High-End Executive Work Desk
      const deskGroup = new THREE.Group();
      const deskTop = new THREE.Mesh(
        new THREE.BoxGeometry(2.5, 0.1, 1.3),
        new THREE.MeshStandardMaterial({ color: 0x222a3d, roughness: 0.2 })
      );
      deskTop.position.set(0, 1.05, 0);
      deskTop.userData = { agentId };
      deskGroup.add(deskTop);
      clickableObjects.push(deskTop);

      // Desk Mat / Pad
      const deskPad = new THREE.Mesh(
        new THREE.BoxGeometry(1.6, 0.015, 0.7),
        new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.7 })
      );
      deskPad.position.set(0, 1.11, 0.15);
      deskGroup.add(deskPad);

      // Sleek Steel Desk Legs
      const metalLegMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.85, roughness: 0.2 });
      [[-1.1, -0.5], [1.1, -0.5], [-1.1, 0.5], [1.1, 0.5]].forEach(([lx, lz]) => {
        const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 1.0, 12), metalLegMat);
        leg.position.set(lx, 0.55, lz);
        deskGroup.add(leg);
      });

      // Desk Privacy Acoustic Baffle Panel (Front baffle)
      const baffle = new THREE.Mesh(
        new THREE.BoxGeometry(2.3, 0.6, 0.04),
        new THREE.MeshStandardMaterial({ color: data.accentHex, roughness: 0.8 })
      );
      baffle.position.set(0, 0.9, -0.6);
      deskGroup.add(baffle);

      // Keyboard & Mouse
      const kb = new THREE.Mesh(
        new THREE.BoxGeometry(0.65, 0.02, 0.25),
        new THREE.MeshStandardMaterial({ color: 0x334155 })
      );
      kb.position.set(-0.1, 1.12, 0.28);
      deskGroup.add(kb);

      const mouse = new THREE.Mesh(
        new THREE.BoxGeometry(0.1, 0.025, 0.16),
        new THREE.MeshStandardMaterial({ color: 0x64748b })
      );
      mouse.position.set(0.42, 1.12, 0.28);
      deskGroup.add(mouse);

      // Modern Ceramic Coffee Mug
      const mugMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.2 });
      const mug = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.07, 0.16, 12), mugMat);
      mug.position.set(-0.95, 1.18, 0.35);
      deskGroup.add(mug);

      podGroup.add(deskGroup);

      // 3. Ergonomic Mesh Task Chair
      const chairGroup = new THREE.Group();
      chairGroup.position.set(0, 0, 1.0);
      const chairMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.4 });

      // Star Base with Casters
      const starBase = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.4, 0.05, 5), metalLegMat);
      starBase.position.y = 0.12;
      chairGroup.add(starBase);

      const gasLift = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.45, 12), metalLegMat);
      gasLift.position.y = 0.35;
      chairGroup.add(gasLift);

      // Cushioned Seat & Mesh Back
      const seat = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.12, 0.75), chairMat);
      seat.position.y = 0.65;
      chairGroup.add(seat);

      const backrest = new THREE.Mesh(new THREE.BoxGeometry(0.72, 0.85, 0.08), chairMat);
      backrest.position.set(0, 1.15, 0.32);
      backrest.rotation.x = 0.08;
      chairGroup.add(backrest);

      // Armrests
      const arm1 = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.04, 0.4), metalLegMat);
      arm1.position.set(-0.42, 0.92, 0.1);
      chairGroup.add(arm1);
      const arm2 = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.04, 0.4), metalLegMat);
      arm2.position.set(0.42, 0.92, 0.1);
      chairGroup.add(arm2);

      podGroup.add(chairGroup);

      // 4. Stylized Voxel Character (Sitting, typing, looking at screens)
      const charGroup = new THREE.Group();
      charGroup.position.set(0, 0.72, 0.85);

      // Pants / Lower Body
      const pantsMat = new THREE.MeshStandardMaterial({ color: 0x1e293b });
      const hips = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.25, 0.45), pantsMat);
      hips.position.y = 0.12;
      charGroup.add(hips);

      // Thighs reaching forward to desk
      const thighs = new THREE.Mesh(new THREE.BoxGeometry(0.48, 0.2, 0.5), pantsMat);
      thighs.position.set(0, 0.22, -0.32);
      charGroup.add(thighs);

      // Torso / Shirt with Agent Accent Color
      const shirtMat = new THREE.MeshStandardMaterial({
        color: data.accentHex,
        roughness: 0.6,
      });
      const torso = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.68, 0.36), shirtMat);
      torso.position.y = 0.58;
      charGroup.add(torso);

      // Head & Hair
      const headGroup = new THREE.Group();
      headGroup.position.set(0, 1.15, 0);

      const skinMat = new THREE.MeshStandardMaterial({ color: 0xffdfba, roughness: 0.4 });
      const head = new THREE.Mesh(new THREE.BoxGeometry(0.38, 0.38, 0.38), skinMat);
      headGroup.add(head);

      // Eyes (Stylized glasses / friendly eyes)
      const eyeMat = new THREE.MeshBasicMaterial({ color: 0x0f172a });
      const eyeL = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.06, 0.02), eyeMat);
      eyeL.position.set(-0.1, 0.02, -0.195);
      headGroup.add(eyeL);
      const eyeR = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.06, 0.02), eyeMat);
      eyeR.position.set(0.1, 0.02, -0.195);
      headGroup.add(eyeR);

      // Character-Specific Hair & Headpieces
      if (agentId === 'gajahmada') {
        // Blangkon / Traditional Crown Topknot (Deep Bronze & Gold)
        const crownMat = new THREE.MeshStandardMaterial({ color: 0xb45309, metalness: 0.5 });
        const crown = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.24, 0.18, 16), crownMat);
        crown.position.y = 0.26;
        headGroup.add(crown);

        const goldBand = new THREE.Mesh(
          new THREE.TorusGeometry(0.24, 0.04, 8, 24),
          new THREE.MeshStandardMaterial({ color: 0xf59e0b, metalness: 0.9 })
        );
        goldBand.rotation.x = Math.PI / 2;
        goldBand.position.y = 0.18;
        headGroup.add(goldBand);
      } else if (agentId === 'robert') {
        // British Classic Slick Brown Hair & Glasses
        const hairMat = new THREE.MeshStandardMaterial({ color: 0x451a03 });
        const hair = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.14, 0.42), hairMat);
        hair.position.y = 0.22;
        headGroup.add(hair);

        // Spectacles Bridge
        const glassesFrame = new THREE.Mesh(
          new THREE.BoxGeometry(0.32, 0.08, 0.04),
          new THREE.MeshStandardMaterial({ color: 0x1e3a8a, metalness: 0.8 })
        );
        glassesFrame.position.set(0, 0.02, -0.2);
        headGroup.add(glassesFrame);
      } else if (agentId === 'talia') {
        // Long Brunette Ponytail / Academic Style
        const hairMat = new THREE.MeshStandardMaterial({ color: 0x292524 });
        const hairTop = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.16, 0.42), hairMat);
        hairTop.position.y = 0.22;
        headGroup.add(hairTop);

        const ponytail = new THREE.Mesh(new THREE.BoxGeometry(0.15, 0.45, 0.18), hairMat);
        ponytail.position.set(0, -0.05, 0.26);
        ponytail.rotation.x = -0.2;
        headGroup.add(ponytail);
      } else if (agentId === 'putra') {
        // Modern Crop Fade & Headset with Mic
        const hairMat = new THREE.MeshStandardMaterial({ color: 0x171717 });
        const hair = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.12, 0.4), hairMat);
        hair.position.y = 0.22;
        headGroup.add(hair);

        // Headset Band
        const headsetMat = new THREE.MeshStandardMaterial({ color: 0x10b981, metalness: 0.7 });
        const band = new THREE.Mesh(new THREE.TorusGeometry(0.24, 0.035, 8, 24, Math.PI), headsetMat);
        band.position.set(0, 0.16, 0);
        headGroup.add(band);

        // Ear cups
        const earL = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.06, 12), headsetMat);
        earL.rotation.z = Math.PI / 2;
        earL.position.set(-0.21, 0.05, 0);
        headGroup.add(earL);

        // Boom mic
        const mic = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 0.25, 8), headsetMat);
        mic.rotation.x = Math.PI / 3;
        mic.position.set(-0.2, -0.05, -0.15);
        headGroup.add(mic);
      }

      charGroup.add(headGroup);

      // Typing Arms (Shoulder & Forearm joints)
      const armMat = shirtMat;
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
        group: charGroup,
        torso,
        head: headGroup,
        leftArm,
        rightArm,
        typeSpeed: 10 + Math.random() * 5,
      });

      // 5. Work Equipment & Animated Displays per Agent
      if (agentId === 'gajahmada') {
        // Holographic Rotating Wireframe Orchestration Globe
        const globeGroup = new THREE.Group();
        globeGroup.position.set(0, 1.8, -0.1);

        const globeInner = new THREE.Mesh(
          new THREE.SphereGeometry(0.48, 18, 18),
          new THREE.MeshBasicMaterial({ color: 0xf59e0b, wireframe: true, transparent: true, opacity: 0.85 })
        );
        globeGroup.add(globeInner);

        const orbitRing = new THREE.Mesh(
          new THREE.RingGeometry(0.65, 0.72, 32),
          new THREE.MeshBasicMaterial({ color: 0xfde047, side: THREE.DoubleSide })
        );
        orbitRing.rotation.x = Math.PI / 3;
        globeGroup.add(orbitRing);
        podGroup.add(globeGroup);
        rotatingObjects.push(globeGroup);

        // Master Terminal Monitor with Live Code Feed
        const monFrame = new THREE.Mesh(
          new THREE.BoxGeometry(1.2, 0.75, 0.05),
          new THREE.MeshStandardMaterial({ color: 0x0f172a, metalness: 0.9 })
        );
        monFrame.position.set(0, 1.5, -0.45);
        podGroup.add(monFrame);

        const monScreen = new THREE.Mesh(
          new THREE.PlaneGeometry(1.15, 0.7),
          new THREE.MeshBasicMaterial({ map: codeTex })
        );
        monScreen.position.set(0, 1.5, -0.42);
        podGroup.add(monScreen);

        // Rack Server with Flashing Node LEDs
        const serverRack = new THREE.Mesh(
          new THREE.BoxGeometry(1.0, 2.4, 0.7),
          new THREE.MeshStandardMaterial({ color: 0x090d16, roughness: 0.6, metalness: 0.8 })
        );
        serverRack.position.set(1.8, 1.2, -0.5);
        podGroup.add(serverRack);

        for (let r = 0; r < 8; r++) {
          const slot = new THREE.Mesh(
            new THREE.BoxGeometry(0.88, 0.18, 0.02),
            new THREE.MeshStandardMaterial({ color: 0x1e293b })
          );
          slot.position.set(1.8, 0.4 + r * 0.24, -0.14);
          podGroup.add(slot);

          const led = new THREE.Mesh(
            new THREE.BoxGeometry(0.06, 0.04, 0.02),
            new THREE.MeshBasicMaterial({ color: r % 2 === 0 ? 0x10b981 : 0x38bdf8 })
          );
          led.position.set(1.4, 0.4 + r * 0.24, -0.12);
          podGroup.add(led);
        }
      } else if (agentId === 'robert') {
        // Dual Curved Ultrawide Monitors with SEO Analytics
        const standMat = new THREE.MeshStandardMaterial({ color: 0x64748b, metalness: 0.9 });
        const monStand = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.5, 12), standMat);
        monStand.position.set(0, 1.3, -0.4);
        podGroup.add(monStand);

        const monFrame1 = new THREE.Mesh(
          new THREE.BoxGeometry(1.1, 0.65, 0.04),
          new THREE.MeshStandardMaterial({ color: 0x0f172a })
        );
        monFrame1.position.set(-0.6, 1.55, -0.32);
        monFrame1.rotation.y = 0.25;
        podGroup.add(monFrame1);

        const screen1 = new THREE.Mesh(
          new THREE.PlaneGeometry(1.05, 0.6),
          new THREE.MeshBasicMaterial({ map: chartTex })
        );
        screen1.position.set(-0.6, 1.55, -0.29);
        screen1.rotation.y = 0.25;
        podGroup.add(screen1);

        const monFrame2 = new THREE.Mesh(
          new THREE.BoxGeometry(1.1, 0.65, 0.04),
          new THREE.MeshStandardMaterial({ color: 0x0f172a })
        );
        monFrame2.position.set(0.6, 1.55, -0.32);
        monFrame2.rotation.y = -0.25;
        podGroup.add(monFrame2);

        const screen2 = new THREE.Mesh(
          new THREE.PlaneGeometry(1.05, 0.6),
          new THREE.MeshBasicMaterial({ map: chartTex })
        );
        screen2.position.set(0.6, 1.55, -0.29);
        screen2.rotation.y = -0.25;
        podGroup.add(screen2);
      } else if (agentId === 'talia') {
        // Modern Laptop + Second Portrait Screen for Longform Writing
        const laptopBase = new THREE.Mesh(
          new THREE.BoxGeometry(0.6, 0.03, 0.42),
          new THREE.MeshStandardMaterial({ color: 0xe2e8f0, metalness: 0.9 })
        );
        laptopBase.position.set(-0.25, 1.12, 0.05);
        podGroup.add(laptopBase);

        const laptopScreen = new THREE.Mesh(
          new THREE.PlaneGeometry(0.58, 0.38),
          new THREE.MeshBasicMaterial({ map: textTex })
        );
        laptopScreen.position.set(-0.25, 1.35, -0.15);
        laptopScreen.rotation.x = -0.18;
        podGroup.add(laptopScreen);

        // Portrait 4K Monitor for Proofreading
        const portraitFrame = new THREE.Mesh(
          new THREE.BoxGeometry(0.55, 0.95, 0.04),
          new THREE.MeshStandardMaterial({ color: 0x0f172a })
        );
        portraitFrame.position.set(0.65, 1.6, -0.15);
        portraitFrame.rotation.y = -0.3;
        podGroup.add(portraitFrame);

        const portraitScreen = new THREE.Mesh(
          new THREE.PlaneGeometry(0.5, 0.9),
          new THREE.MeshBasicMaterial({ map: textTex })
        );
        portraitScreen.position.set(0.65, 1.6, -0.12);
        portraitScreen.rotation.y = -0.3;
        podGroup.add(portraitScreen);

        // Stack of Linguistics & Law Textbooks
        const books = [0xbe123c, 0x0369a1, 0xb45309];
        books.forEach((col, idx) => {
          const book = new THREE.Mesh(
            new THREE.BoxGeometry(0.42, 0.08, 0.3),
            new THREE.MeshStandardMaterial({ color: col, roughness: 0.5 })
          );
          book.position.set(-0.95, 1.15 + idx * 0.085, -0.15);
          book.rotation.y = idx * 0.2;
          podGroup.add(book);
        });
      } else if (agentId === 'putra') {
        // Multi-Device Customer Communications Setup
        const monFrame = new THREE.Mesh(
          new THREE.BoxGeometry(1.2, 0.75, 0.05),
          new THREE.MeshStandardMaterial({ color: 0x0f172a })
        );
        monFrame.position.set(0, 1.55, -0.3);
        podGroup.add(monFrame);

        const monScreen = new THREE.Mesh(
          new THREE.PlaneGeometry(1.15, 0.7),
          new THREE.MeshBasicMaterial({ map: waTex })
        );
        monScreen.position.set(0, 1.55, -0.27);
        podGroup.add(monScreen);

        // Standing Tablet & Pulsing WhatsApp Signal Orb
        const tablet = new THREE.Mesh(
          new THREE.BoxGeometry(0.45, 0.32, 0.03),
          new THREE.MeshBasicMaterial({ color: 0x064e3b })
        );
        tablet.position.set(-0.75, 1.25, 0.15);
        tablet.rotation.y = 0.5;
        tablet.rotation.x = -0.2;
        podGroup.add(tablet);

        const waSphere = new THREE.Mesh(
          new THREE.SphereGeometry(0.18, 16, 16),
          new THREE.MeshBasicMaterial({ color: 0x10b981 })
        );
        waSphere.position.set(0.85, 1.45, 0.1);
        podGroup.add(waSphere);
      }

      // 6. Overhead Glowing Nameplate / Badge
      const badgeGroup = new THREE.Group();
      badgeGroup.position.set(0, 3.1, 0);

      const beaconMesh = new THREE.Mesh(
        new THREE.OctahedronGeometry(0.28, 0),
        new THREE.MeshBasicMaterial({ color: data.accentHex, wireframe: true })
      );
      badgeGroup.add(beaconMesh);
      rotatingObjects.push(beaconMesh);

      // Halo ring around beacon
      const halo = new THREE.Mesh(
        new THREE.TorusGeometry(0.45, 0.02, 8, 32),
        new THREE.MeshBasicMaterial({ color: data.accentHex })
      );
      halo.rotation.x = Math.PI / 2;
      badgeGroup.add(halo);

      podGroup.add(badgeGroup);
      floatingBadges.push({ badge: badgeGroup, initialY: 3.1, freq: 1.5 + Math.random() });

      scene.add(podGroup);
    };

    // GENERATE ALL AGENT PODS
    Object.keys(AGENTS).forEach(buildDetailedAgent);

    // CLICK LISTENER (Raycaster)
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const handlePointerDown = (e: MouseEvent) => {
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
      }
    };
    renderer.domElement.addEventListener('pointerdown', handlePointerDown);

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

    // REAL-TIME CANVAS TEXTURE UPDATER
    let frameCount = 0;
    const updateScreens = () => {
      frameCount++;
      const now = Date.now() * 0.002;

      // 1. Code Screen (Gajah Mada)
      if (frameCount % 4 === 0) {
        codeCtx.fillStyle = '#0a0e17';
        codeCtx.fillRect(0, 0, 512, 256);
        codeCtx.fillStyle = '#f59e0b';
        codeCtx.font = 'bold 22px monospace';
        codeCtx.fillText('> GAJAH MADA // MASTER ORCHESTRATION', 20, 36);

        codeCtx.font = '16px monospace';
        codeCtx.fillStyle = '#38bdf8';
        const lines = [
          `[CLUSTER] HEALTH: NOMINAL // UPTIME 99.99%`,
          `[CRON] TALIA_8X_PUB: RUNNING (PID 8412)`,
          `[CRON] ROBERT_BRIEF: SCHEDULED 07:00 WIB`,
          `[GATEWAY] BAILEYS PORT 3000: CONNECTED`,
          `[TELEMETRY] CPU: 14% | MEM: 3.2GB / 16GB`,
          `> DISPATCH TASK TO AGENTS... OK`,
        ];
        lines.forEach((l, idx) => {
          codeCtx.fillText(l, 20, 75 + idx * 28);
        });
        codeTex.needsUpdate = true;
      }

      // 2. SEO Chart Screen (Robert)
      if (frameCount % 6 === 0) {
        chartCtx.fillStyle = '#091322';
        chartCtx.fillRect(0, 0, 512, 256);
        chartCtx.fillStyle = '#3b82f6';
        chartCtx.font = 'bold 22px sans-serif';
        chartCtx.fillText('ROBERT // SERP COMPETITOR INTELLIGENCE', 20, 36);

        // Draw animated bar graph
        const bars = [45, 68, 88, 55, 92, 78, 98, 84];
        bars.forEach((val, idx) => {
          const h = (val * (0.8 + Math.sin(now + idx) * 0.2)) * 1.3;
          chartCtx.fillStyle = idx === 6 ? '#60a5fa' : '#1e40af';
          chartCtx.fillRect(35 + idx * 56, 220 - h, 42, h);
        });
        chartTex.needsUpdate = true;
      }

      // 3. Editorial Screen (Talia)
      if (frameCount % 6 === 0) {
        textCtx.fillStyle = '#1c0f1a';
        textCtx.fillRect(0, 0, 512, 256);
        textCtx.fillStyle = '#f43f5e';
        textCtx.font = 'bold 22px sans-serif';
        textCtx.fillText('TALIA // HEADLESS WP AUTO-PUBLISHER', 20, 36);

        textCtx.fillStyle = '#fecdd3';
        textCtx.font = '15px sans-serif';
        const tLines = [
          'Draft: "Syarat Lengkap Pendirian PT PMA 2026"',
          'Kategori: Legalitas Usaha, PMA, BKPM',
          'Readability Index: 92/100 (Flesch-Kincaid ID)',
          'Instant Indexing: PUSHED TO GOOGLE API [200 OK]',
          'Status: 8/8 Slots Published Today',
        ];
        tLines.forEach((l, idx) => {
          textCtx.fillText(l, 20, 80 + idx * 30);
        });
        textTex.needsUpdate = true;
      }

      // 4. WhatsApp Screen (Putra)
      if (frameCount % 5 === 0) {
        waCtx.fillStyle = '#052e16';
        waCtx.fillRect(0, 0, 512, 256);
        waCtx.fillStyle = '#34d399';
        waCtx.font = 'bold 22px sans-serif';
        waCtx.fillText('PUTRA // LEAD INBOUND & CS GATEWAY', 20, 36);

        waCtx.fillStyle = '#a7f3d0';
        waCtx.font = '15px sans-serif';
        const waLines = [
          '[+62 812-98**-****] "Halo, biaya urus PT Perorangan?"',
          '[CS REPLY] "Halo Bapak/Ibu! Estimasi 1-2 hari kerja..."',
          '[INVOICE NINJA] Draft PDF Generated #INV-2026-089',
          '[PIPELINE] Leads Database Synced: 5 Outreach Active',
        ];
        waLines.forEach((l, idx) => {
          waCtx.fillText(l, 20, 85 + idx * 32);
        });
        waTex.needsUpdate = true;
      }
    };

    // ANIMATION RENDER LOOP
    let animId: number;
    let t = 0;

    const animate = () => {
      animId = requestAnimationFrame(animate);
      t += 0.02;

      // Update Screen Textures
      updateScreens();

      // Camera Lerp
      camera.position.lerp(targetCamPos.current, 0.04);
      const lookTarget = targetCamLook.current;
      camera.lookAt(
        camera.position.x + (lookTarget.x - camera.position.x) * 0.04,
        camera.position.y + (lookTarget.y - camera.position.y) * 0.04,
        camera.position.z + (lookTarget.z - camera.position.z) * 0.04
      );

      // Animate Characters (Typing hands & subtle breathing)
      characters.forEach((char, idx) => {
        const speed = char.typeSpeed;
        char.leftArm.rotation.x = Math.sin(t * speed + idx) * 0.12;
        char.rightArm.rotation.x = Math.cos(t * speed + idx * 1.5) * 0.12;
        char.head.rotation.y = Math.sin(t * 0.8 + idx) * 0.1;
        char.torso.position.y = 0.58 + Math.sin(t * 1.5 + idx) * 0.015;
      });

      // Rotate Globes & Holographic Beacons
      rotatingObjects.forEach((obj, idx) => {
        obj.rotation.y = t * (0.6 + idx * 0.15);
      });

      // Float Overhead Badges
      floatingBadges.forEach(({ badge, initialY, freq }) => {
        badge.position.y = initialY + Math.sin(t * freq) * 0.12;
      });

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
      renderer.domElement.removeEventListener('pointerdown', handlePointerDown);
      renderer.dispose();
      if (mountRef.current && renderer.domElement) {
        mountRef.current.removeChild(renderer.domElement);
      }
    };
  }, [onSelectAgent]);

  // CAMERA POSITIONING PER SELECTION
  useEffect(() => {
    if (selectedAgentId && AGENTS[selectedAgentId]) {
      const [ax, ay, az] = AGENTS[selectedAgentId].podCoordinates;
      targetCamPos.current.set(ax + 2.5, ay + 3.2, az + 5.2);
      targetCamLook.current.set(ax, ay + 1.2, az);
    } else {
      // Isometric High Overview
      targetCamPos.current.set(13, 16, 19);
      targetCamLook.current.set(0, 1.2, 0);
    }
  }, [selectedAgentId]);

  return <div ref={mountRef} className="w-full h-full cursor-grab active:cursor-grabbing" />;
}
