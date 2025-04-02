import { useRef, useEffect } from 'preact/hooks';

// Initially create an empty component that just renders a div
// This allows us to ensure it doesn't crash the entire app
export function HeroVisual() {
  const containerRef = useRef(null);
  const animationRef = useRef(null);
  const mouseRef = useRef({ x: 0.5, y: 0.5 }); // Store smoothed mouse position
  const lastMouseRef = useRef({ x: 0.5, y: 0.5 }); // For interpolation
  const isMouseOverRef = useRef(false); // Track if mouse is over the canvas
  const actualMouseRef = useRef({ x: 0.5, y: 0.5 }); // Track actual mouse position
  const mousePresenceRef = useRef(0.0); // Mouse presence factor (0 = absent, 1 = present)
  
  useEffect(() => {
    // Dynamically import Three.js to prevent it from blocking initial render
    const setupVisual = async () => {
      try {
        // Import dependencies
        const THREE = await import('three');
        
        // If container is gone, don't continue
        if (!containerRef.current) return;
        
        // Clear any previous content
        while (containerRef.current.firstChild) {
          containerRef.current.removeChild(containerRef.current.firstChild);
        }
        
        // Create renderer
        const renderer = new THREE.WebGLRenderer({ 
          antialias: true, 
          alpha: true,
          preserveDrawingBuffer: true 
        });
        renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)); // Limit pixel ratio for performance
        
        // Use precise hex values to match CSS background
        const bgColor = new THREE.Color('#191919');
        renderer.setClearColor(bgColor, 1);
        containerRef.current.appendChild(renderer.domElement);
        
        // Scene setup
        const scene = new THREE.Scene();
        const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 10);
        camera.position.z = 1;
        
        // Create shader material
        const shaderMaterial = new THREE.ShaderMaterial({
          vertexShader: `
            varying vec2 vUv;
            void main() {
              vUv = uv;
              gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }
          `,
          fragmentShader: `
            varying vec2 vUv;
            uniform vec2 uResolution;
            uniform vec2 uMouse;
            uniform float uTime;
            uniform float uMousePresence;
            
            // Simple hash function for random values
            float hash(vec2 p) {
              p = fract(p * vec2(123.34, 456.21));
              p += dot(p, p + 42.32);
              return fract(p.x * p.y);
            }
            
            // Smoothed noise function
            float noise(vec2 p) {
              vec2 i = floor(p);
              vec2 f = fract(p);
              f = f * f * (3.0 - 2.2 * f); // Smooth interpolation
              
              float a = hash(i);
              float b = hash(i + vec2(1.0, 0.0));
              float c = hash(i + vec2(0.0, 1.0));
              float d = hash(i + vec2(1.0, 1.0));
              
              return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
            }
            
            // Pixelate coordinates to create blocky effect - but with smoother edges
            vec2 pixelate(vec2 uv, float pixelSize) {
              // Apply a slight dithering to soften the pixel edges
              uv += noise(uv * 1000.0) * 0.25;
              return floor(uv * pixelSize) / pixelSize;
            }
            
            // SDF for the abstract angle bracket shape '<'
            float sdfAngleBracket(vec2 uv) {
              // Center and scale UVs, maybe adjust aspect ratio slightly if needed
              vec2 st = (uv - 0.7) * vec2(1.8, 1.8); 
              
              // Vertical symmetry
              float ay = abs(st.y);
              
              // Define the sloping line for the bracket shape
              // Slope determines the angle, offset shifts it horizontally
              float slope = 0.9; // Adjust for angle sharpness
              float offset = 0.65; // Adjust horizontal position
              float lineX = ay * slope - offset;
              
              // Distance to the sloped line
              float d = st.x - lineX; // Use signed distance for one side
              
              // Define thickness
              float thickness = 0.25; // Adjust thickness
              d = abs(d) - thickness * 0.5; // Center thickness around the line
              
              // Vertical bounds (smoothly fade near top/bottom)
              float vertBound = 0.8;
              d = max(d, ay - vertBound); // Hard cut vertically
              
              // Horizontal bounds (cut off arms far left/right) - Optional
               d = max(d, abs(st.x) - 0.8); 
              
              return d;
            }
            
            // Smooth warp function
            vec2 warp(vec2 uv, vec2 mouse, float time, float mousePresence) {
              float dist = distance(uv, mouse);
              
              // Create a smooth falloff for the warping effect - fixed by using proper values
              float influence = smoothstep(0.5, 0.0, dist);
              
              // Ambient warping - subtle flowing waves using multiple sine waves
              float ambientWaveX = sin(uv.y * 3.0 + time * 0.3) * cos(uv.x * 2.5 - time * 1.2) * 0.00075;
              float ambientWaveY = cos(uv.x * 2.7 + time * 0.4) * sin(uv.y * 3.5 + time * 1.3) * 0.00075;
              vec2 ambientOffset = vec2(ambientWaveX, ambientWaveY);
              
              // Mouse-based warping
              // Slow, gentle ripples
              float angle = atan(uv.y - mouse.y, uv.x - mouse.x);
              float waveIntensity = 0.01 + 0.002 * sin(time); // Slightly increased intensity
              
              // Create a smooth radial wave
              float radialWave = sin(dist * 10.0 - time * 0.08) * waveIntensity;
              
              // Apply directional warping
              vec2 mouseOffset = vec2(
                cos(angle) * radialWave,
                sin(angle) * radialWave
              );
              
              // Apply mouse presence factor to gradually fade mouse effect
              return uv + mouseOffset * influence * mousePresence + ambientOffset;
            }
            
            void main() {
              vec2 uv = vUv;
              
              // Use smooth warping based on mouse position
              uv = warp(uv, uMouse, uTime * 0.15, uMousePresence); // Slowed down time factor
              
              // Pixelate the UV coordinates at a good resolution
              // but with different values for the main shape and the rest
              float pixelBase = 60.0;
              vec2 pix_uv = pixelate(uv, pixelBase);
              
              // Calculate shape with smooth border
              float shapeDist = sdfAngleBracket(pix_uv);
              float shape = smoothstep(0.02, -0.2, shapeDist);
              
              // Match exact app background color (#191919 = 25/255 = ~0.098)
              vec3 bgColor = vec3(0.098, 0.098, 0.098);
              vec3 shapeColor = vec3(1.0, 1.0, 1.0); // White
              
              // Final color is a mix based on the shape SDF
              vec3 color = mix(bgColor, shapeColor, shape);
              
              gl_FragColor = vec4(color, 1.0);
            }
          `,
          uniforms: {
            uTime: { value: 0.0 },
            uResolution: { value: new THREE.Vector2(
              containerRef.current.clientWidth * renderer.getPixelRatio(),
              containerRef.current.clientHeight * renderer.getPixelRatio()
            )},
            uMouse: { value: new THREE.Vector2(0.5, 0.5) },
            uMousePresence: { value: 0.0 }
          }
        });
        
        // Create mesh
        const geometry = new THREE.PlaneGeometry(2, 2);
        const mesh = new THREE.Mesh(geometry, shaderMaterial);
        scene.add(mesh);
        
        // Cache the bounding rect to avoid layout thrashing
        let containerRect = containerRef.current.getBoundingClientRect();
        
        // Update cached bounds when resizing or scrolling
        const updateBounds = () => {
          if (!containerRef.current) return;
          containerRect = containerRef.current.getBoundingClientRect();
        };
        
        // Handle both pointer and touch events with a common function
        const updateMousePosition = (clientX, clientY) => {
          // Account for scrolling position to get correct coordinates
          const scrollX = window.scrollX || window.pageXOffset;
          const scrollY = window.scrollY || window.pageYOffset;
          
          // Calculate position relative to the element, accounting for scroll
          const elementX = clientX - containerRect.left - scrollX + window.scrollX;
          const elementY = clientY - containerRect.top - scrollY + window.scrollY;
          
          const normalizedX = elementX / containerRect.width;
          const normalizedY = 1.0 - (elementY / containerRect.height);
          
          // Update actual mouse position always
          actualMouseRef.current.x = normalizedX;
          actualMouseRef.current.y = normalizedY;
          
          // Only update target position directly if mouse is over
          if (isMouseOverRef.current) {
            lastMouseRef.current.x = normalizedX;
            lastMouseRef.current.y = normalizedY;
          }
        };
        
        // Mouse tracking with improved event handlers
        const handlePointerMove = (event) => {
          event.preventDefault();
          updateMousePosition(event.clientX, event.clientY);
        };
        
        // Touch event handling
        const handleTouchMove = (event) => {
          event.preventDefault();
          if (event.touches.length > 0) {
            updateMousePosition(event.touches[0].clientX, event.touches[0].clientY);
          }
        };
        
        // Handle mouse hovering above the canvas even without movement
        const handlePointerHover = (event) => {
          updateMousePosition(event.clientX, event.clientY);
        };
        
        // Handle mouse entering the canvas
        const handlePointerEnter = (event) => {
          isMouseOverRef.current = true;
          updateMousePosition(event.clientX, event.clientY);
        };
        
        // Handle mouse leaving the canvas - don't immediately reset
        const handlePointerLeave = () => {
          isMouseOverRef.current = false;
          // Keep the last mouse position when leaving - no reset
        };
        
        // Add scroll event listener to update bounds when scrolling
        window.addEventListener('scroll', updateBounds, { passive: true });
        
        // Add all event listeners
        containerRef.current.addEventListener('pointermove', handlePointerMove, { passive: false });
        containerRef.current.addEventListener('touchmove', handleTouchMove, { passive: false });
        containerRef.current.addEventListener('pointerleave', handlePointerLeave);
        containerRef.current.addEventListener('pointerenter', handlePointerEnter);
        containerRef.current.addEventListener('pointerhover', handlePointerHover);
        
        // Handle resize
        const handleResize = () => {
          if (!containerRef.current) return;
          
          const width = containerRef.current.clientWidth;
          const height = containerRef.current.clientHeight;
          
          renderer.setSize(width, height);
          shaderMaterial.uniforms.uResolution.value.set(
            width * renderer.getPixelRatio(),
            height * renderer.getPixelRatio()
          );
          
          // Update the cached bounds
          updateBounds();
        };
        
        window.addEventListener('resize', handleResize);
        
        // Animation loop with improved mouse interpolation
        const animate = (time) => {
          if (!containerRef.current) return;
          
          // Smoothly transition mouse presence factor
          if (isMouseOverRef.current) {
            mousePresenceRef.current += (1.0 - mousePresenceRef.current) * 0.1;
          } else {
            mousePresenceRef.current += (0.0 - mousePresenceRef.current) * 0.1;
          }
          
          // Update shader uniform for mouse presence
          shaderMaterial.uniforms.uMousePresence.value = mousePresenceRef.current;
          
          if (isMouseOverRef.current) {
            // When mouse is over canvas, smoothly transition to actual mouse position
            lastMouseRef.current.x = actualMouseRef.current.x;
            lastMouseRef.current.y = actualMouseRef.current.y;
            
            // Fast interpolation for responsive feeling
            mouseRef.current.x += (lastMouseRef.current.x - mouseRef.current.x) ;
            mouseRef.current.y += (lastMouseRef.current.y - mouseRef.current.y) ;
          } else {
            // When mouse leaves, keep the last position but fade out the effect
            // No need to move the position back to center
          }
          
          shaderMaterial.uniforms.uTime.value = time * 0.001;
          shaderMaterial.uniforms.uMouse.value.set(mouseRef.current.x, mouseRef.current.y);
          
          renderer.render(scene, camera);
          animationRef.current = requestAnimationFrame(animate);
        };
        
        animate(0);
        
        // Cleanup function
        return () => {
          cancelAnimationFrame(animationRef.current);
          window.removeEventListener('resize', handleResize);
          window.removeEventListener('scroll', updateBounds);
          if (containerRef.current) {
            containerRef.current.removeEventListener('pointermove', handlePointerMove);
            containerRef.current.removeEventListener('touchmove', handleTouchMove);
            containerRef.current.removeEventListener('pointerleave', handlePointerLeave);
            containerRef.current.removeEventListener('pointerenter', handlePointerEnter);
            containerRef.current.removeEventListener('pointerhover', handlePointerHover);
          }
          renderer.dispose();
          geometry.dispose();
          shaderMaterial.dispose();
        };
      } catch (error) {
        console.error('Failed to initialize WebGL visual:', error);
        // Fallback to a simple div or image if needed
      }
    };
    
    setupVisual();
    
    // Cleanup
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);
  
  return (
    <div 
      ref={containerRef} 
      className="hero-visual__container"
      style={{ 
        width: '100%', 
        height: '100%', 
        backgroundColor: '#191919' // Explicitly set matching background color
      }}
    />
  );
} 