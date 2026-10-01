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
  const targetCamPos = useRef(new THREE.Vector3(0, 14, 18));
  const targetCamLook = useRef(new THREE.Vector3(0, 0, 0));

  useEffect(() => {
    if (!mountRef.current) return;

    // SCENE SETUP
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x090a10);
    scene.fog = new THREE.FogExp2(0x090a10, 0.025);

    const width = mountRef.current.clientWidth;
    const height = mountRef.current.clientHeight;

    // CAMERA (Isometric-like perspective)
    const camera = new THREE.PerspectiveCamera(38, width / height, 0.1, 1000);
    camera.position.set(0, 14, 18);
    camera.lookAt(0, 0, 0);

    // RENDERER
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;

    mountRef.current.appendChild(renderer.domElement);

    // LIGHTING
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.85);
    scene.add(ambientLight);

    const mainDirectional = new THREE.DirectionalLight(0xe2e8f0, 1.4);
    mainDirectional.position.set(12, 20, 10);
    mainDirectional.castShadow = true;
    mainDirectional.shadow.mapSize.width = 2048;
    mainDirectional.shadow.mapSize.height = 2048;
    mainDirectional.shadow.camera.near = 0.5;
    mainDirectional.shadow.camera.far = 50;
    mainDirectional.shadow.bias = -0.0005;
    scene.add(mainDirectional);

    // BLUE AMBIENT ACCENT LIGHT
    const bluePoint = new THREE.PointLight(0x38bdf8, 2.5, 25);
    bluePoint.position.set(0, 5, 0);
    scene.add(bluePoint);

    // ROOM FLOOR (Dark obsidian concrete)
    const floorGeo = new THREE.PlaneGeometry(32, 32);
    const floorMat = new THREE.MeshStandardMaterial({
      color: 0x0f1118,
      roughness: 0.7,
      metalness: 0.2,
    });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    scene.add(floor);

    // GRID ACCENT ON FLOOR
    const gridHelper = new THREE.GridHelper(30, 30, 0x1e293b, 0x131926);
    gridHelper.position.y = 0.01;
    scene.add(gridHelper);

    // GLASS RAILING / PERIMETER WALLS (Translucent)
    const wallMat = new THREE.MeshPhysicalMaterial({
      color: 0x334155,
      transparent: true,
      opacity: 0.25,
      roughness: 0.1,
      transmission: 0.6,
      thickness: 0.5,
    });

    const createBorder = (w: number, h: number, d: number, x: number, y: number, z: number) => {
      const g = new THREE.BoxGeometry(w, h, d);
      const m = new THREE.Mesh(g, wallMat);
      m.position.set(x, y, z);
      scene.add(m);
    };
    createBorder(30, 1.2, 0.2, 0, 0.6, -15);
    createBorder(30, 1.2, 0.2, 0, 0.6, 15);
    createBorder(0.2, 1.2, 30, -15, 0.6, 0);
    createBorder(0.2, 1.2, 30, 15, 0.6, 0);

    // INTERACTIVE OBJECTS MAP
    const clickableObjects: THREE.Object3D[] = [];
    const pulsingMeshes: { mesh: THREE.Mesh; baseScale: number }[] = [];
    const rotatingObjects: THREE.Object3D[] = [];

    // HELPER: BUILD WORKSTATION POD
    const createPod = (agentId: string) => {
      const data = AGENTS[agentId];
      const [px, py, pz] = data.podCoordinates;
      const podGroup = new THREE.Group();
      podGroup.position.set(px, py, pz);
      podGroup.userData = { agentId };

      // POD BASE PLATFORM (Raised circular disc)
      const baseGeo = new THREE.CylinderGeometry(2.4, 2.6, 0.15, 32);
      const baseMat = new THREE.MeshStandardMaterial({
        color: 0x181c27,
        roughness: 0.4,
        metalness: 0.5,
      });
      const baseMesh = new THREE.Mesh(baseGeo, baseMat);
      baseMesh.position.y = 0.075;
      baseMesh.receiveShadow = true;
      baseMesh.userData = { agentId };
      podGroup.add(baseMesh);
      clickableObjects.push(baseMesh);

      // ACCENT NEON RING
      const ringGeo = new THREE.RingGeometry(2.1, 2.25, 32);
      const ringMat = new THREE.MeshBasicMaterial({
        color: data.accentHex,
        side: THREE.DoubleSide,
      });
      const ringMesh = new THREE.Mesh(ringGeo, ringMat);
      ringMesh.rotation.x = -Math.PI / 2;
      ringMesh.position.y = 0.16;
      podGroup.add(ringMesh);

      // DESK
      const deskGeo = new THREE.BoxGeometry(2.2, 0.08, 1.1);
      const deskMat = new THREE.MeshStandardMaterial({
        color: 0x222736,
        roughness: 0.3,
        metalness: 0.4,
      });
      const desk = new THREE.Mesh(deskGeo, deskMat);
      desk.position.set(0, 0.9, 0);
      desk.castShadow = true;
      desk.receiveShadow = true;
      desk.userData = { agentId };
      podGroup.add(desk);
      clickableObjects.push(desk);

      // DESK LEGS (Metal)
      const legGeo = new THREE.CylinderGeometry(0.04, 0.04, 0.85);
      const legMat = new THREE.MeshStandardMaterial({ color: 0x475569, metalness: 0.8 });
      [[-0.95, -0.45], [0.95, -0.45], [-0.95, 0.45], [0.95, 0.45]].forEach(([lx, lz]) => {
        const leg = new THREE.Mesh(legGeo, legMat);
        leg.position.set(lx, 0.45, lz);
        leg.castShadow = true;
        podGroup.add(leg);
      });

      // ERGONOMIC CHAIR
      const chairGroup = new THREE.Group();
      chairGroup.position.set(0, 0, 0.9);

      const seatGeo = new THREE.BoxGeometry(0.65, 0.08, 0.65);
      const seatMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.8 });
      const seat = new THREE.Mesh(seatGeo, seatMat);
      seat.position.y = 0.55;
      chairGroup.add(seat);

      const backGeo = new THREE.BoxGeometry(0.65, 0.7, 0.08);
      const back = new THREE.Mesh(backGeo, seatMat);
      back.position.set(0, 0.9, 0.3);
      chairGroup.add(back);

      const standGeo = new THREE.CylinderGeometry(0.05, 0.05, 0.55);
      const stand = new THREE.Mesh(standGeo, legMat);
      stand.position.y = 0.275;
      chairGroup.add(stand);
      podGroup.add(chairGroup);

      // SPECIAL GEAR PER AGENT POD
      if (agentId === 'gajahmada') {
        // Holographic Rotating Wireframe Globe on Desk
        const globeGeo = new THREE.SphereGeometry(0.35, 16, 16);
        const globeMat = new THREE.MeshBasicMaterial({
          color: 0xf59e0b,
          wireframe: true,
          transparent: true,
          opacity: 0.85,
        });
        const globe = new THREE.Mesh(globeGeo, globeMat);
        globe.position.set(0, 1.45, -0.1);
        podGroup.add(globe);
        rotatingObjects.push(globe);

        // Mini Server Rack Behind Desk
        const rackGeo = new THREE.BoxGeometry(0.9, 2.0, 0.6);
        const rackMat = new THREE.MeshStandardMaterial({ color: 0x0b0f19, roughness: 0.5 });
        const rack = new THREE.Mesh(rackGeo, rackMat);
        rack.position.set(1.5, 1.0, -0.8);
        rack.castShadow = true;
        podGroup.add(rack);

        // Blinking LED dots on rack
        for (let r = 0; r < 5; r++) {
          const ledGeo = new THREE.SphereGeometry(0.03, 8, 8);
          const ledMat = new THREE.MeshBasicMaterial({ color: r % 2 === 0 ? 0x10b981 : 0x38bdf8 });
          const led = new THREE.Mesh(ledGeo, ledMat);
          led.position.set(1.15, 0.5 + r * 0.3, -0.48);
          podGroup.add(led);
        }
      } else if (agentId === 'robert') {
        // Dual Curved Ultrawide Monitors
        const monGeo = new THREE.BoxGeometry(0.9, 0.55, 0.04);
        const monMat = new THREE.MeshStandardMaterial({ color: 0x090d16 });
        const mon1 = new THREE.Mesh(monGeo, monMat);
        mon1.position.set(-0.5, 1.3, -0.2);
        mon1.rotation.y = 0.2;
        podGroup.add(mon1);

        const screenGeo = new THREE.PlaneGeometry(0.85, 0.5);
        const screenMat = new THREE.MeshBasicMaterial({ color: 0x1e3a8a });
        const screen1 = new THREE.Mesh(screenGeo, screenMat);
        screen1.position.set(-0.5, 1.3, -0.17);
        screen1.rotation.y = 0.2;
        podGroup.add(screen1);

        const mon2 = new THREE.Mesh(monGeo, monMat);
        mon2.position.set(0.5, 1.3, -0.2);
        mon2.rotation.y = -0.2;
        podGroup.add(mon2);

        const screen2 = new THREE.Mesh(screenGeo, new THREE.MeshBasicMaterial({ color: 0x0369a1 }));
        screen2.position.set(0.5, 1.3, -0.17);
        screen2.rotation.y = -0.2;
        podGroup.add(screen2);
      } else if (agentId === 'talia') {
        // Laptop + Coffee Mug + Stack of Reference Books
        const laptopBaseGeo = new THREE.BoxGeometry(0.45, 0.02, 0.35);
        const laptopMat = new THREE.MeshStandardMaterial({ color: 0xd1d5db, metalness: 0.8 });
        const laptop = new THREE.Mesh(laptopBaseGeo, laptopMat);
        laptop.position.set(0, 0.95, 0.05);
        podGroup.add(laptop);

        const laptopScreen = new THREE.Mesh(
          new THREE.BoxGeometry(0.45, 0.32, 0.02),
          new THREE.MeshBasicMaterial({ color: 0xf43f5e })
        );
        laptopScreen.position.set(0, 1.12, -0.12);
        laptopScreen.rotation.x = -0.15;
        podGroup.add(laptopScreen);

        // Book Stack
        for (let b = 0; b < 3; b++) {
          const book = new THREE.Mesh(
            new THREE.BoxGeometry(0.35, 0.06, 0.25),
            new THREE.MeshStandardMaterial({ color: b === 0 ? 0x9f1239 : b === 1 ? 0x1e293b : 0xd97706 })
          );
          book.position.set(-0.7, 0.95 + b * 0.06, -0.1);
          book.rotation.y = b * 0.15;
          podGroup.add(book);
        }

        // Coffee Mug
        const mug = new THREE.Mesh(
          new THREE.CylinderGeometry(0.07, 0.06, 0.12, 12),
          new THREE.MeshStandardMaterial({ color: 0xffffff })
        );
        mug.position.set(0.7, 1.0, 0.1);
        podGroup.add(mug);
      } else if (agentId === 'putra') {
        // Multi-device Communication Hub: iPad/Tablet + Phone
        const tablet = new THREE.Mesh(
          new THREE.BoxGeometry(0.55, 0.03, 0.4),
          new THREE.MeshBasicMaterial({ color: 0x059669 })
        );
        tablet.position.set(0, 0.94, -0.05);
        tablet.rotation.x = 0.2;
        podGroup.add(tablet);

        // Glowing WhatsApp Status Indicator
        const waOrb = new THREE.Mesh(
          new THREE.SphereGeometry(0.12, 16, 16),
          new THREE.MeshBasicMaterial({ color: 0x10b981 })
        );
        waOrb.position.set(0.65, 1.25, 0.1);
        podGroup.add(waOrb);
        pulsingMeshes.push({ mesh: waOrb, baseScale: 1.0 });
      }

      // FLOATING IDENTIFIER BEACON / HOLOGRAM NAME TAG
      const beaconGeo = new THREE.OctahedronGeometry(0.25, 0);
      const beaconMat = new THREE.MeshBasicMaterial({
        color: data.accentHex,
        wireframe: true,
      });
      const beacon = new THREE.Mesh(beaconGeo, beaconMat);
      beacon.position.set(0, 2.3, 0);
      podGroup.add(beacon);
      rotatingObjects.push(beacon);
      pulsingMeshes.push({ mesh: beacon, baseScale: 1.0 });

      scene.add(podGroup);
    };

    // GENERATE ALL 4 AGENT PODS
    Object.keys(AGENTS).forEach(createPod);

    // RAYCASTING (Click & Hover Interaction)
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
      const w = mountRef.current.clientWidth;
      const h = mountRef.current.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    // ANIMATION LOOP
    let animationFrameId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      // Smooth Camera Interpolation (Lerp)
      camera.position.lerp(targetCamPos.current, 0.055);
      
      const currentLook = new THREE.Vector3();
      camera.getWorldDirection(currentLook);
      camera.lookAt(
        camera.position.x + (targetCamLook.current.x - camera.position.x) * 0.055,
        camera.position.y + (targetCamLook.current.y - camera.position.y) * 0.055,
        camera.position.z + (targetCamLook.current.z - camera.position.z) * 0.055
      );

      // Rotate decorative meshes
      rotatingObjects.forEach((obj, idx) => {
        obj.rotation.y = elapsedTime * (0.8 + idx * 0.2);
        obj.rotation.x = Math.sin(elapsedTime + idx) * 0.2;
      });

      // Pulse meshes (beacon / signals)
      pulsingMeshes.forEach(({ mesh, baseScale }) => {
        const s = baseScale + Math.sin(elapsedTime * 3) * 0.15;
        mesh.scale.set(s, s, s);
      });

      renderer.render(scene, camera);
    };

    animate();

    // CLEANUP
    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      renderer.domElement.removeEventListener('pointerdown', handlePointerDown);
      renderer.dispose();
      if (mountRef.current && renderer.domElement) {
        mountRef.current.removeChild(renderer.domElement);
      }
    };
  }, [onSelectAgent]);

  // UPDATE CAMERA TARGET ON AGENT SELECTION
  useEffect(() => {
    if (selectedAgentId && AGENTS[selectedAgentId]) {
      const [ax, ay, az] = AGENTS[selectedAgentId].podCoordinates;
      targetCamPos.current.set(ax + 0.5, ay + 3.8, az + 5.5);
      targetCamLook.current.set(ax, ay + 1.1, az);
    } else {
      // DEFAULT OVERVIEW PERSPECTIVE
      targetCamPos.current.set(0, 14, 18);
      targetCamLook.current.set(0, 0, 0);
    }
  }, [selectedAgentId]);

  return <div ref={mountRef} className="w-full h-full cursor-grab active:cursor-grabbing" />;
}
