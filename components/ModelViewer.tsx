import React, { useRef, useEffect, useCallback, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { PaneState, BIMElement, HighlightStyle } from '../types';

interface ModelViewerProps {
  elements: BIMElement[];
  selectedElements: Set<string>;
  highlightedElements: Map<string, HighlightStyle>;
  hoveredElement: string | null;
  onElementClick: (elementId: string) => void;
  onElementHover: (elementId: string | null) => void;
  paneState: PaneState;
  speckleUrl?: string;
}

const MODEL_COLOR = new THREE.Color(0x3b82f6);
const SELECTED_COLOR = new THREE.Color(0xef4444);
const HIGHLIGHT_COLOR = new THREE.Color(0x22c55e);
const HOVER_COLOR = new THREE.Color(0xf59e0b);
const BOUNDING_BOX_COLOR = new THREE.Color(0xff0000);

const colorMap: Record<string, THREE.Color> = {
  space: new THREE.Color(0x3b82f6),
  element: new THREE.Color(0x8b5cf6),
  system: new THREE.Color(0x10b981),
  pipe: new THREE.Color(0xf97316),
};

const intensityMap: Record<string, number> = {
  preview: 0.5,
  selected: 1.0,
  result: 0.75,
};

export const ModelViewer: React.FC<ModelViewerProps> = ({
  elements,
  selectedElements,
  highlightedElements,
  hoveredElement,
  onElementClick,
  onElementHover,
  paneState,
  speckleUrl,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const raycasterRef = useRef<THREE.Raycaster>(new THREE.Raycaster());
  const mouseRef = useRef<THREE.Vector2>(new THREE.Vector2());
  const elementMeshesRef = useRef<Map<string, THREE.Mesh>>(new Map());
  const boundingBoxHelpersRef = useRef<Map<string, THREE.Box3Helper>>(new Map());
  const animationIdRef = useRef<number>(0);
  
  const [isFocusing, setIsFocusing] = useState(false);
  const [focusProgress, setFocusProgress] = useState(0);

  useEffect(() => {
    if (!containerRef.current || !canvasRef.current) return;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf8fafc);
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(
      75,
      containerRef.current.clientWidth / containerRef.current.clientHeight,
      0.1,
      1000
    );
    camera.position.set(10, 10, 10);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({
      canvas: canvasRef.current,
      antialias: true,
    });
    renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    rendererRef.current = renderer;

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.minDistance = 2;
    controls.maxDistance = 50;
    controlsRef.current = controls;

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(10, 20, 5);
    scene.add(directionalLight);

    const gridHelper = new THREE.GridHelper(50, 50, 0x94a3b8, 0xe2e8f0);
    scene.add(gridHelper);

    const animate = () => {
      animationIdRef.current = requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      if (!containerRef.current || !camera || !renderer) return;
      camera.aspect = containerRef.current.clientWidth / containerRef.current.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationIdRef.current);
      controls.dispose();
      renderer.dispose();
    };
  }, []);

  useEffect(() => {
    if (!sceneRef.current) return;

    elementMeshesRef.current.forEach(mesh => {
      sceneRef.current?.remove(mesh);
    });
    elementMeshesRef.current.clear();

    boundingBoxHelpersRef.current.forEach(helper => {
      sceneRef.current?.remove(helper);
    });
    boundingBoxHelpersRef.current.clear();

    const geometry = new THREE.BoxGeometry(1, 1, 1);
    const edgeGeometry = new THREE.EdgesGeometry(geometry);

    elements.forEach(element => {
      const color = getElementColor(element.id);
      const material = new THREE.MeshLambertMaterial({ color });
      const mesh = new THREE.Mesh(geometry, material);
      mesh.position.set(
        element.geometry.position[0],
        element.geometry.position[1],
        element.geometry.position[2]
      );
      mesh.userData.elementId = element.id;
      mesh.userData.element = element;

      sceneRef.current?.add(mesh);
      elementMeshesRef.current.set(element.id, mesh);

      if (selectedElements.has(element.id)) {
        const boundingBox = new THREE.Box3();
        boundingBox.setFromObject(mesh);
        const boxHelper = new THREE.Box3Helper(boundingBox, BOUNDING_BOX_COLOR);
        boxHelper.userData.elementId = element.id;
        sceneRef.current?.add(boxHelper);
        boundingBoxHelpersRef.current.set(element.id, boxHelper);
      }
    });
  }, [elements]);

  useEffect(() => {
    elementMeshesRef.current.forEach((mesh, elementId) => {
      const color = getElementColor(elementId);
      mesh.material.color.copy(color);
    });

    boundingBoxHelpersRef.current.forEach(helper => {
      sceneRef.current?.remove(helper);
    });
    boundingBoxHelpersRef.current.clear();

    selectedElements.forEach(elementId => {
      const mesh = elementMeshesRef.current.get(elementId);
      if (mesh && sceneRef.current) {
        const boundingBox = new THREE.Box3();
        boundingBox.setFromObject(mesh);
        const boxHelper = new THREE.Box3Helper(boundingBox, BOUNDING_BOX_COLOR);
        boxHelper.userData.elementId = elementId;
        sceneRef.current.add(boxHelper);
        boundingBoxHelpersRef.current.set(elementId, boxHelper);
      }
    });
  }, [selectedElements, highlightedElements, hoveredElement]);

  const getElementColor = useCallback((elementId: string): THREE.Color => {
    if (selectedElements.has(elementId)) {
      return SELECTED_COLOR.clone();
    }
    
    if (hoveredElement === elementId) {
      return HOVER_COLOR.clone();
    }

    const highlightStyle = highlightedElements.get(elementId);
    if (highlightStyle) {
      const baseColor = colorMap[highlightStyle.category] || MODEL_COLOR;
      const intensity = intensityMap[highlightStyle.intensity] || 1.0;
      return baseColor.clone().multiplyScalar(intensity);
    }

    return MODEL_COLOR.clone();
  }, [selectedElements, highlightedElements, hoveredElement]);

  useEffect(() => {
    if (selectedElements.size > 0 && elements.length > 0) {
      const selectedIds = Array.from(selectedElements);
      const firstSelected = elements.find(e => e.id === selectedIds[0]);
      if (firstSelected && cameraRef.current && controlsRef.current) {
        focusOnElement(firstSelected);
      }
    }
  }, [selectedElements, elements]);

  const focusOnElement = useCallback((element: BIMElement) => {
    if (!cameraRef.current || !controlsRef.current) return;

    setIsFocusing(true);
    setFocusProgress(0);

    const camera = cameraRef.current;
    const controls = controlsRef.current;
    const targetPosition = new THREE.Vector3(
      element.geometry.position[0],
      element.geometry.position[1],
      element.geometry.position[2]
    );

    const startPosition = camera.position.clone();
    const startRotation = camera.quaternion.clone();
    const startTarget = controls.target.clone();

    const duration = 500;
    const startTime = Date.now();

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = easeInOutCubic(progress);

      setFocusProgress(progress);

      camera.position.lerpVectors(startPosition, targetPosition.clone().add(new THREE.Vector3(5, 5, 5)), eased);
      camera.quaternion.slerp(startRotation, 1 - eased);
      controls.target.lerpVectors(startTarget, targetPosition, eased);
      controls.update();

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        setIsFocusing(false);
      }
    };

    animate();
  }, []);

  const easeInOutCubic = (t: number): number => {
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  };

  const handleMouseMove = useCallback((event: React.MouseEvent) => {
    if (!containerRef.current || !cameraRef.current || !canvasRef.current) return;

    const rect = canvasRef.current.getBoundingClientRect();
    mouseRef.current.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    mouseRef.current.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    raycasterRef.current.setFromCamera(mouseRef.current, cameraRef.current);
    const intersects = raycasterRef.current.intersectObjects(
      Array.from(elementMeshesRef.current.values()),
      false
    );

    if (intersects.length > 0) {
      const mesh = intersects[0].object as THREE.Mesh;
      const elementId = mesh.userData.elementId;
      if (elementId) {
        onElementHover(elementId);
        canvasRef.current.style.cursor = 'pointer';
      }
    } else {
      onElementHover(null);
      canvasRef.current.style.cursor = 'default';
    }
  }, [onElementHover]);

  const handleClick = useCallback((event: React.MouseEvent) => {
    if (!containerRef.current || !cameraRef.current || !canvasRef.current) return;

    const rect = canvasRef.current.getBoundingClientRect();
    mouseRef.current.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    mouseRef.current.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    raycasterRef.current.setFromCamera(mouseRef.current, cameraRef.current);
    const intersects = raycasterRef.current.intersectObjects(
      Array.from(elementMeshesRef.current.values()),
      false
    );

    if (intersects.length > 0) {
      const mesh = intersects[0].object as THREE.Mesh;
      const elementId = mesh.userData.elementId;
      if (elementId) {
        onElementClick(elementId);
      }
    }
  }, [onElementClick]);

  const handleDoubleClick = useCallback((event: React.MouseEvent) => {
    event.preventDefault();
  }, []);

  const isMinimized = paneState === 'minimized';
  const isMaximized = paneState === 'maximized';

  if (isMinimized) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-slate-100 rounded-xl border border-slate-200">
        <div className="text-slate-400 text-sm font-medium">Model Viewer - Minimized</div>
      </div>
    );
  }

  return (
    <div 
      ref={containerRef}
      className={`relative w-full h-full rounded-xl overflow-hidden border border-slate-200 shadow-inner ${
        isMaximized ? '' : ''
      }`}
    >
      {speckleUrl ? (
        <iframe
          title="Speckle Viewer"
          src={speckleUrl}
          width="100%"
          height="100%"
          frameBorder="0"
          className="absolute inset-0"
          style={{ pointerEvents: 'none' }}
        ></iframe>
      ) : (
        <canvas
          ref={canvasRef}
          onMouseMove={handleMouseMove}
          onClick={handleClick}
          onDoubleClick={handleDoubleClick}
          className="absolute inset-0"
        />
      )}

      <canvas
        ref={canvasRef}
        onMouseMove={handleMouseMove}
        onClick={handleClick}
        onDoubleClick={handleDoubleClick}
        className="absolute inset-0"
      />

      {isFocusing && (
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-white/90 backdrop-blur-sm px-4 py-2 rounded-full shadow-lg border border-slate-200 z-10">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></div>
            <span className="text-sm font-medium text-slate-700">
              Focusing... {Math.round(focusProgress * 100)}%
            </span>
          </div>
        </div>
      )}

      <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-full shadow-sm border border-slate-200 z-10 flex items-center gap-2">
        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
        <span className="text-xs font-semibold text-slate-700">
          {elements.length} Elements
        </span>
      </div>

      {hoveredElement && (
        <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm px-4 py-2 rounded-lg shadow-lg border border-slate-200 z-10">
          <p className="text-xs text-slate-500 uppercase font-bold tracking-wider">Hovering</p>
          <p className="text-sm font-semibold text-slate-800">
            {elements.find(e => e.id === hoveredElement)?.name || hoveredElement}
          </p>
        </div>
      )}
    </div>
  );
};

export default ModelViewer;
