import React, { useRef, useEffect, useState, useCallback } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { ModelViewerProps, MockBIMElement } from '../types';

const HIGHLIGHT_COLORS = {
  selected: 0x00ff00,      // Green for selected
  preview: 0xffff00,       // Yellow for hover preview
  result: 0x00ffff,        // Cyan for query results
  space: 0x4a90e2,         // Blue for spaces
  element: 0x50e3c2,       // Teal for elements
  system: 0xe25050,        // Red for systems
  pipe: 0x9b59b6,          // Purple for pipes
};

const ModelViewer: React.FC<ModelViewerProps> = ({
  elements,
  selectedElements,
  highlightedElements,
  hoveredElement,
  onElementClick,
  onElementHover,
  paneState,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const elementMeshesRef = useRef<Map<string, THREE.Mesh>>(new Map());
  const highlightBoxesRef = useRef<Map<string, THREE.Mesh>>(new Map());
  const [isAnimating, setIsAnimating] = useState(false);

  // Initialize Three.js scene
  useEffect(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight;

    // Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf0f0f0);
    scene.fog = new THREE.Fog(0xf0f0f0, 10, 100);
    sceneRef.current = scene;

    // Camera
    const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    camera.position.set(10, 10, 10);
    camera.lookAt(0, 0, 0);
    cameraRef.current = camera;

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.minDistance = 2;
    controls.maxDistance = 50;
    controlsRef.current = controls;

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(10, 10, 5);
    directionalLight.castShadow = true;
    scene.add(directionalLight);

    // Grid helper
    const gridHelper = new THREE.GridHelper(20, 20, 0xaaaaaa, 0x555555);
    gridHelper.position.y = -0.5;
    scene.add(gridHelper);

    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    // Handle resize
    const handleResize = () => {
      if (!containerRef.current) return;
      const newWidth = containerRef.current.clientWidth;
      const newHeight = containerRef.current.clientHeight;
      camera.aspect = newWidth / newHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(newWidth, newHeight);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      container.removeChild(renderer.domElement);
      renderer.dispose();
      controls.dispose();
      scene.traverse((obj) => {
        if (obj instanceof THREE.Mesh) {
          obj.geometry.dispose();
          obj.material.dispose();
        }
      });
    };
  }, []);

  // Create geometry for element
  const createElementMesh = useCallback((element: MockBIMElement): THREE.Mesh => {
    const geometry = new THREE.BoxGeometry(
      element.geometry.boundingBox.size[0],
      element.geometry.boundingBox.size[1],
      element.geometry.boundingBox.size[2]
    );

    const material = new THREE.MeshStandardMaterial({
      color: 0x808080,  // Default gray
      roughness: 0.7,
      metalness: 0.3,
    });

    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.fromArray(element.geometry.boundingBox.center);
    mesh.userData.elementId = element.id;
    mesh.castShadow = true;
    mesh.receiveShadow = true;

    return mesh;
  }, []);

  // Create highlight bounding box
  const createHighlightBox = useCallback((element: MockBIMElement, color: number): THREE.Mesh => {
    const size = element.geometry.boundingBox.size;
    const geometry = new THREE.BoxGeometry(size[0] + 0.02, size[1] + 0.02, size[2] + 0.02);
    const material = new THREE.MeshBasicMaterial({
      color,
      transparent: true,
      opacity: 0.3,
      wireframe: true,
    });

    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.fromArray(element.geometry.boundingBox.center);
    mesh.userData.elementId = element.id;

    return mesh;
  }, []);

  // Load elements into scene
  useEffect(() => {
    if (!sceneRef.current) return;

    const scene = sceneRef.current;
    elementMeshesRef.current.clear();
    highlightBoxesRef.current.clear();

    // Clear existing elements
    scene.children = scene.children.filter(
      (child) =>
        child.type === 'AmbientLight' ||
        child.type === 'DirectionalLight' ||
        child.type === 'GridHelper'
    );

    // Add elements
    elements.forEach((element) => {
      const mesh = createElementMesh(element);
      scene.add(mesh);
      elementMeshesRef.current.set(element.id, mesh);

      // Create highlight box (hidden by default)
      const highlightBox = createHighlightBox(element, HIGHLIGHT_COLORS.selected);
      highlightBox.visible = false;
      scene.add(highlightBox);
      highlightBoxesRef.current.set(element.id, highlightBox);
    });

    // Update highlight states
    updateHighlights();
  }, [elements, createElementMesh, createHighlightBox]);

  // Update element colors and highlights
  const updateHighlights = useCallback(() => {
    if (!sceneRef.current) return;

    elementMeshesRef.current.forEach((mesh, elementId) => {
      const material = mesh.material as THREE.MeshStandardMaterial;
      let baseColor = 0x808080;
      let highlightColor: number | null = null;
      let intensity: 'selected' | 'preview' | 'result' | null = null;

      // Check for hover preview first
      if (hoveredElement === elementId) {
        highlightColor = HIGHLIGHT_COLORS.preview;
        intensity = 'preview';
      } else if (selectedElements.has(elementId)) {
        // Check for selected state
        highlightColor = HIGHLIGHT_COLORS.selected;
        intensity = 'selected';
      } else if (highlightedElements.has(elementId)) {
        // Check for other highlights
        const style = highlightedElements.get(elementId)!;
        highlightColor = HIGHLIGHT_COLORS[style.intensity] || HIGHLIGHT_COLORS[style.category];
        intensity = style.intensity;
        baseColor = HIGHLIGHT_COLORS[style.category];
      }

      // Apply color coding
      if (intensity === 'selected') {
        material.color.setHex(0x00ff00);
        material.emissive.setHex(0x003300);
      } else if (intensity === 'preview') {
        material.color.setHex(0xffff00);
        material.emissive.setHex(0x333300);
      } else if (highlightedElements.has(elementId)) {
        material.color.setHex(baseColor);
        material.emissive.setHex(0x000000);
      } else {
        // Default appearance
        material.color.setHex(0x808080);
        material.emissive.setHex(0x000000);
      }

      // Update highlight box
      const highlightBox = highlightBoxesRef.current.get(elementId);
      if (highlightBox) {
        if (highlightColor) {
          highlightBox.visible = true;
          (highlightBox.material as THREE.MeshBasicMaterial).color.setHex(highlightColor);
          highlightBox.material.opacity = intensity === 'selected' ? 0.5 : 0.3;
        } else {
          highlightBox.visible = false;
        }
      }
    });
  }, [selectedElements, highlightedElements, hoveredElement]);

  useEffect(() => {
    updateHighlights();
  }, [updateHighlights]);

  // Camera animation for selected element
  const animateToElement = useCallback((elementId: string) => {
    if (!cameraRef.current || !controlsRef.current || isAnimating) return;

    const element = elements.find((e) => e.id === elementId);
    if (!element) return;

    setIsAnimating(true);
    const camera = cameraRef.current;
    const controls = controlsRef.current;
    const targetPosition = new THREE.Vector3().fromArray(element.geometry.boundingBox.center);
    const currentPosition = camera.position.clone();
    const currentTarget = controls.target.clone();

    // Calculate camera position that faces the element
    const size = element.geometry.boundingBox.size;
    const maxSize = Math.max(...size);
    const distance = maxSize * 3;
    const direction = new THREE.Vector3(1, 1, 1).normalize();
    const newPosition = targetPosition.clone().add(direction.multiplyScalar(distance));
    const newTarget = targetPosition;

    // Animate camera
    const duration = 1000; // 1 second
    const startTime = Date.now();

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easeProgress = 1 - Math.pow(1 - progress, 3); // Ease-out cubic

      camera.position.lerpVectors(currentPosition, newPosition, easeProgress);
      controls.target.lerpVectors(currentTarget, newTarget, easeProgress);
      controls.update();

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        setIsAnimating(false);
      }
    };

    animate();
  }, [elements, isAnimating]);

  // Handle element click
  useEffect(() => {
    if (!containerRef.current || !cameraRef.current) return;

    const container = containerRef.current;
    const camera = cameraRef.current;
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const handleClick = (event: MouseEvent) => {
      // Check if pane is minimized
      if (paneState === 'minimized') return;

      const rect = container.getBoundingClientRect();
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const meshes = Array.from(elementMeshesRef.current.values());
      const intersects = raycaster.intersectObjects(meshes);

      if (intersects.length > 0) {
        const elementId = intersects[0].object.userData.elementId;
        onElementClick(elementId);
        animateToElement(elementId);
      }
    };

    const handleMouseMove = (event: MouseEvent) => {
      // Check if pane is minimized
      if (paneState === 'minimized') return;

      const rect = container.getBoundingClientRect();
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const meshes = Array.from(elementMeshesRef.current.values());
      const intersects = raycaster.intersectObjects(meshes);

      if (intersects.length > 0) {
        const elementId = intersects[0].object.userData.elementId;
        onElementHover(elementId);
        container.style.cursor = 'pointer';
      } else {
        onElementHover(null);
        container.style.cursor = 'default';
      }
    };

    container.addEventListener('click', handleClick);
    container.addEventListener('mousemove', handleMouseMove);

    return () => {
      container.removeEventListener('click', handleClick);
      container.removeEventListener('mousemove', handleMouseMove);
    };
  }, [onElementClick, onElementHover, animateToElement, paneState]);

  // Auto-zoom to selected element
  useEffect(() => {
    if (selectedElements.size > 0) {
      const lastSelected = Array.from(selectedElements).pop();
      if (lastSelected) {
        animateToElement(lastSelected);
      }
    }
  }, [selectedElements, animateToElement]);

  return (
    <div ref={containerRef} style={{ width: '100%', height: '100%', position: 'relative' }}>
      {paneState === 'normal' && (
        <div style={{ position: 'absolute', bottom: 10, left: 10, background: 'rgba(0,0,0,0.7)', padding: '5px 10px', borderRadius: '4px', color: 'white', fontSize: '12px' }}>
          选择: {selectedElements.size} 个元素 | 悬停: {hoveredElement || '无'}
        </div>
      )}
    </div>
  );
};

export default ModelViewer;