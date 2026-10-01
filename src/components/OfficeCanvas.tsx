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
  const targetCamPos = useRef(new THREE.Vector3(0, 15, 20));
  const targetCamLook = useRef(new THREE.Vector3(0, 0, 0));

  useEffect(() => {
    if (!mountRef.current) return;

    // MEASURE REAL CONTAINER DIMENSIONS
    let width = mountRef.current.clientWidth || window.innerWidth || 1200;
    let height = mountRef.current.clientHeight || window.innerHeight || 800;

    // SCENE SETUP
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0b0d14);

    // CAMERA (Isometric angle)
    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 1000);
    camera.position.set(0, 15, 20);
    camera.lookAt(0, 0, 0);

    // RENDERER - SAFE WEBGL (Disable complex shadows that cause GL_INVALID_FRAMEBUFFER_OPERATION)
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      powerPreference: 'high-performance',
      alpha: false,
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));

    mountRef.current.appendChild(renderer.domElement);

    // BRIGHT & VIBRANT LIGHTING
    const hemiLight = new THREE.HemisphereLight(0xffffff, 0x1e293b, 1.2);
    scene.add(hemiLight);

    const dirLight1 = new THREE.DirectionalLight(0xffffff, 1.5);
    dirLight1.position.set(15, 25, 15);
    scene.add(dirLight1);

    const dirLight2 = new THREE.DirectionalLight(0x38bdf8, 0.8);
    dirLight2.position.set(-15, 15, -10);
    scene.add(dirLight2);

    // FLOOR (Tech Grid Platform)
    const floorGeo = new THREE.BoxGeometry(26, 0.4, 26);
    const floorMat = new THREE.MeshStandardMaterial({
      color: 0x111625,
      roughness: 0.6,
      metalness: 0.2,
    });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.position.y = -0.2;
    scene.add(floor);

    // FLOOR GRID LINES
    const grid = new THREE.GridHelper(26, 26, 0x3b82f6, 0x1e293b);
    grid.position.y = 0.02;
    scene.add(grid);

    // PERIMETER NEON BORDER
    const borderGeo = new THREE.BoxGeometry(26.2, 0.1, 0.15);
    const borderMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8 });
    const b1 = new THREE.Mesh(borderGeo, borderMat);
    b1.position.set(0, 0.05, 13);
    scene.add(b1);
    const b2 = new THREE.Mesh(borderGeo, borderMat);
    b2.position.set(0, 0.05, -13);
    scene.add(b2);

    const borderSideGeo = new THREE.BoxGeometry(0.15, 0.1, 26.2);
    const b3 = new THREE.Mesh(borderSideGeo, borderMat);
    b3.position.set(13, 0.05, 0);
    scene.add(b3);
    const b4 = new THREE.Mesh(borderSideGeo, borderMat);
    b4.position.set(-13, 0.05, 0);
    scene.add(b4);

    // INTERACTIVE OBJECTS & ANIMATION LIST
    const clickableObjects: THREE.Object3D[] = [];
    const rotatingObjects: THREE.Object3D[] = [];
    const pulsingMeshes: { mesh: THREE.Mesh; baseScale: number }[] = [];

    // BUILD WORKSTATION POD PER AGENT
    const createPod = (agentId: string) => {
      const data = AGENTS[agentId];
      const [px, py, pz] = data.podCoordinates;
      const podGroup = new THREE.Group();
      podGroup.position.set(px, py, pz);
      podGroup.userData = { agentId };

      // CYLINDER BASE POD
      const baseGeo = new THREE.CylinderGeometry(2.4, 2.5, 0.25, 32);
      const baseMat = new THREE.MeshStandardMaterial({
        color: 0x1a2133,
        roughness: 0.3,
        metalness: 0.5,
      });
      const baseMesh = new THREE.Mesh(baseGeo, baseMat);
      baseMesh.position.y = 0.125;
      baseMesh.userData = { agentId };
      podGroup.add(baseMesh);
      clickableObjects.push(baseMesh);

      // ACCENT NEON RING
      const ringGeo = new THREE.RingGeometry(2.0, 2.3, 32);
      const ringMat = new THREE.MeshBasicMaterial({
        color: data.accentHex,
        side: THREE.DoubleSide,
      });
      const ring = new THREE.Mesh(ringGeo, ringMat);
      ring.rotation.x = -Math.PI / 2;
      ring.position.y = 0.26;
      podGroup.add(ring);

      // MAIN DESK
      const deskGeo = new THREE.BoxGeometry(2.2, 0.1, 1.2);
      const deskMat = new THREE.MeshStandardMaterial({
        color: 0x273147,
        roughness: 0.3,
      });
      const desk = new THREE.Mesh(deskGeo, deskMat);
      desk.position.set(0, 1.0, 0);
      desk.userData = { agentId };
      podGroup.add(desk);
      clickableObjects.push(desk);

      // DESK LEGS (Metal Chrome)
      const legGeo = new THREE.CylinderGeometry(0.04, 0.04, 0.95);
      const legMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.8 });
      [[-0.95, -0.45], [0.95, -0.45], [-0.95, 0.45], [0.95, 0.45]].forEach(([lx, lz]) => {
        const leg = new THREE.Mesh(legGeo, legMat);
        leg.position.set(lx, 0.5, lz);
        podGroup.add(leg);
      });

      // ERGONOMIC CHAIR
      const chairGroup = new THREE.Group();
      chairGroup.position.set(0, 0, 0.9);
      const seatGeo = new THREE.BoxGeometry(0.7, 0.1, 0.7);
      const seatMat = new THREE.MeshStandardMaterial({ color: 0x0f172a });
      const seat = new THREE.Mesh(seatGeo, seatMat);
      seat.position.y = 0.65;
      chairGroup.add(seat);

      const backGeo = new THREE.BoxGeometry(0.7, 0.75, 0.1);
      const back = new THREE.Mesh(backGeo, seatMat);
      back.position.set(0, 1.05, 0.3);
      chairGroup.add(back);

      const standGeo = new THREE.CylinderGeometry(0.06, 0.06, 0.65);
      const stand = new THREE.Mesh(standGeo, legMat);
      stand.position.y = 0.325;
      chairGroup.add(stand);
      podGroup.add(chairGroup);

      // CHARACTER FIGURE (Stylized Minimal Low-Poly Avatar)
      const avatarGroup = new THREE.Group();
      avatarGroup.position.set(0, 0.7, 0.7);

      // Body / Torso
      const torsoGeo = new THREE.BoxGeometry(0.5, 0.65, 0.35);
      const torsoMat = new THREE.MeshStandardMaterial({ color: data.accentHex });
      const torso = new THREE.Mesh(torsoGeo, torsoMat);
      torso.position.y = 0.55;
      avatarGroup.add(torso);

      // Head
      const headGeo = new THREE.SphereGeometry(0.2, 16, 16);
      const headMat = new THREE.MeshStandardMaterial({ color: 0xfde047 });
      const head = new THREE.Mesh(headGeo, headMat);
      head.position.y = 1.05;
      avatarGroup.add(head);

      podGroup.add(avatarGroup);

      // SPECIFIC WORK GEAR PER AGENT
      if (agentId === 'gajahmada') {
        // Holographic Wireframe Command Globe
        const globeGeo = new THREE.SphereGeometry(0.42, 16, 16);
        const globeMat = new THREE.MeshBasicMaterial({
          color: 0xf59e0b,
          wireframe: true,
        });
        const globe = new THREE.Mesh(globeGeo, globeMat);
        globe.position.set(0, 1.6, -0.1);
        podGroup.add(globe);
        rotatingObjects.push(globe);

        // Server Rack in background
        const rackGeo = new THREE.BoxGeometry(1.0, 2.2, 0.6);
        const rackMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.5 });
        const rack = new THREE.Mesh(rackGeo, rackMat);
        rack.position.set(1.6, 1.1, -0.6);
        podGroup.add(rack);

        // Server LED lights
        for (let l = 0; l < 6; l++) {
          const led = new THREE.Mesh(
            new THREE.BoxGeometry(0.08, 0.05, 0.02),
            new THREE.MeshBasicMaterial({ color: l % 2 === 0 ? 0x10b981 : 0x38bdf8 })
          );
          led.position.set(1.2, 0.4 + l * 0.3, -0.28);
          podGroup.add(led);
        }
      } else if (agentId === 'robert') {
        // Dual Ultrawide Monitors
        const monMat = new THREE.MeshBasicMaterial({ color: 0x1e3a8a });
        const mon1 = new THREE.Mesh(new THREE.BoxGeometry(0.85, 0.5, 0.04), monMat);
        mon1.position.set(-0.5, 1.45, -0.25);
        mon1.rotation.y = 0.25;
        podGroup.add(mon1);

        const mon2 = new THREE.Mesh(new THREE.BoxGeometry(0.85, 0.5, 0.04), monMat);
        mon2.position.set(0.5, 1.45, -0.25);
        mon2.rotation.y = -0.25;
        podGroup.add(mon2);
      } else if (agentId === 'talia') {
        // Laptop & Books
        const laptop = new THREE.Mesh(
          new THREE.BoxGeometry(0.5, 0.02, 0.35),
          new THREE.MeshStandardMaterial({ color: 0xe2e8f0, metalness: 0.8 })
        );
        laptop.position.set(0, 1.06, 0.05);
        podGroup.add(laptop);

        const screen = new THREE.Mesh(
          new THREE.BoxGeometry(0.5, 0.35, 0.02),
          new THREE.MeshBasicMaterial({ color: 0xf43f5e })
        );
        screen.position.set(0, 1.25, -0.12);
        screen.rotation.x = -0.15;
        podGroup.add(screen);

        // Books Stack
        for (let b = 0; b < 3; b++) {
          const book = new THREE.Mesh(
            new THREE.BoxGeometry(0.4, 0.07, 0.28),
            new THREE.MeshStandardMaterial({ color: b === 0 ? 0x881337 : b === 1 ? 0x0284c7 : 0xd97706 })
          );
          book.position.set(-0.75, 1.05 + b * 0.07, -0.1);
          book.rotation.y = b * 0.2;
          podGroup.add(book);
        }
      } else if (agentId === 'putra') {
        // Tablet + Pulsing WhatsApp Orb
        const tablet = new THREE.Mesh(
          new THREE.BoxGeometry(0.6, 0.03, 0.45),
          new THREE.MeshBasicMaterial({ color: 0x065f46 })
        );
        tablet.position.set(0, 1.05, 0.0);
        tablet.rotation.x = 0.2;
        podGroup.add(tablet);

        const waOrb = new THREE.Mesh(
          new THREE.SphereGeometry(0.18, 16, 16),
          new THREE.MeshBasicMaterial({ color: 0x10b981 })
        );
        waOrb.position.set(0.7, 1.35, 0.1);
        podGroup.add(waOrb);
        pulsingMeshes.push({ mesh: waOrb, baseScale: 1.0 });
      }

      // FLOATING HOLOGRAM OCTAHEDRON BEACON
      const beaconGeo = new THREE.OctahedronGeometry(0.3, 0);
      const beaconMat = new THREE.MeshBasicMaterial({
        color: data.accentHex,
        wireframe: true,
      });
      const beacon = new THREE.Mesh(beaconGeo, beaconMat);
      beacon.position.set(0, 2.6, 0);
      podGroup.add(beacon);
      rotatingObjects.push(beacon);
      pulsingMeshes.push({ mesh: beacon, baseScale: 1.0 });

      scene.add(podGroup);
    };

    // GENERATE ALL 4 PODS
    Object.keys(AGENTS).forEach(createPod);

    // CLICK HANDLER (Raycaster)
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

    // RESIZE HANDLER
    const handleResize = () => {
      if (!mountRef.current) return;
      width = mountRef.current.clientWidth || window.innerWidth;
      height = mountRef.current.clientHeight || window.innerHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };
    window.addEventListener('resize', handleResize);

    // RENDER LOOP
    let animId: number;
    let t = 0;

    const animate = () => {
      animId = requestAnimationFrame(animate);
      t += 0.02;

      // Smooth Camera Lerp
      camera.position.lerp(targetCamPos.current, 0.05);

      const lookTarget = targetCamLook.current;
      camera.lookAt(
        camera.position.x + (lookTarget.x - camera.position.x) * 0.05,
        camera.position.y + (lookTarget.y - camera.position.y) * 0.05,
        camera.position.z + (lookTarget.z - camera.position.z) * 0.05
      );

      // Rotate beacons & globes
      rotatingObjects.forEach((obj, idx) => {
        obj.rotation.y = t * (0.8 + idx * 0.2);
        obj.rotation.x = Math.sin(t + idx) * 0.2;
      });

      // Pulse glows
      pulsingMeshes.forEach(({ mesh, baseScale }) => {
        const s = baseScale + Math.sin(t * 2.5) * 0.12;
        mesh.scale.set(s, s, s);
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

  // CAMERA TARGET SWITCH ON SELECTION
  useEffect(() => {
    if (selectedAgentId && AGENTS[selectedAgentId]) {
      const [ax, ay, az] = AGENTS[selectedAgentId].podCoordinates;
      targetCamPos.current.set(ax + 0.6, ay + 4.2, az + 6.0);
      targetCamLook.current.set(ax, ay + 1.2, az);
    } else {
      targetCamPos.current.set(0, 15, 20);
      targetCamLook.current.set(0, 0, 0);
    }
  }, [selectedAgentId]);

  return <div ref={mountRef} className="w-full h-full cursor-grab active:cursor-grabbing" />;
}
