import { useRef, useEffect } from 'preact/hooks';

// Initially create an empty component that just renders a div
// This allows us to ensure it doesn't crash the entire app
export function HeroVisual() {
  const containerRef = useRef(null);
  const animationRef = useRef(null);
  const mouseRef = useRef({ x: 0.5, y: 0.5 }); // Store smoothed mouse position
  const lastMouseRef = useRef({ x: 0.5, y: 0.5 }); // For interpolation
  
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
        renderer.setClearColor(0x191919, 1); // Set background to #191919
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
            vec2 warp(vec2 uv, vec2 mouse, float time) {
              float dist = distance(uv, mouse);
              
              // Create a smooth falloff for the warping effect - fixed by using proper values
              float influence = smoothstep(0.5, 0.0, dist);
              
              // Add automatic ambient warping when mouse is far away
              float ambientStrength = smoothstep(0.0, 0.7, dist); // Inverse of influence
              
              // Ambient warping - subtle flowing waves using multiple sine waves
              float ambientWaveX = sin(uv.y * 3.0 + time * 0.03) * cos(uv.x * 2.5 - time * 0.02) * 0.005;
              float ambientWaveY = cos(uv.x * 2.7 + time * 0.04) * sin(uv.y * 3.5 + time * 0.03) * 0.005;
              vec2 ambientOffset = vec2(ambientWaveX, ambientWaveY);
              
              // Mouse-based warping
              // Slow, gentle ripples
              float angle = atan(uv.y - mouse.y, uv.x - mouse.x);
              float waveIntensity = 0.012 + 0.003 * sin(time); // Slightly increased intensity
              
              // Create a smooth radial wave
              float radialWave = sin(dist * 10.0 - time * 0.08) * waveIntensity;
              
              // Apply directional warping
              vec2 mouseOffset = vec2(
                cos(angle) * radialWave,
                sin(angle) * radialWave
              );
              
              // Combine both warp effects with appropriate influence
              return uv + mouseOffset * influence + ambientOffset * ambientStrength;
            }
            
            void main() {
              vec2 uv = vUv;
              
              // Use smooth warping based on mouse position
              uv = warp(uv, uMouse, uTime * 0.15); // Slowed down time factor
              
              // Pixelate the UV coordinates at a good resolution
              // but with different values for the main shape and the rest
              float pixelBase = 60.0;
              vec2 pix_uv = pixelate(uv, pixelBase);
              
              // Calculate shape with smooth border
              float shapeDist = sdfAngleBracket(pix_uv);
              float shape = smoothstep(0.02, -0.2, shapeDist);
              
              vec3 bgColor = vec3(0.115, 0.115, 0.115); 
              vec3 shapeColor = vec3(1.0, 1.0, 1.0); // White
              
              // Final color is a mix based on the shape SDF
              // No particles included
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
            uMouse: { value: new THREE.Vector2(0.5, 0.5) }
          }
        });
        
        // Create mesh
        const geometry = new THREE.PlaneGeometry(2, 2);
        const mesh = new THREE.Mesh(geometry, shaderMaterial);
        scene.add(mesh);
        
        // Cache the bounding rect to avoid layout thrashing
        let containerRect = containerRef.current.getBoundingClientRect();
        
        // Update cached bounds when resizing
        const updateBounds = () => {
          if (!containerRef.current) return;
          containerRect = containerRef.current.getBoundingClientRect();
        };
        
        // Handle both pointer and touch events with a common function
        const updateMousePosition = (clientX, clientY) => {
          lastMouseRef.current.x = (clientX - containerRect.left) / containerRect.width;
          lastMouseRef.current.y = 1.0 - (clientY - containerRect.top) / containerRect.height;
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
        
        // Add all event listeners
        containerRef.current.addEventListener('pointermove', handlePointerMove, { passive: false });
        containerRef.current.addEventListener('touchmove', handleTouchMove, { passive: false });
        
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
          
          // Increase interpolation factor for more responsive movement (0.25 vs original 0.08)
          mouseRef.current.x += (lastMouseRef.current.x - mouseRef.current.x) * 0.25;
          mouseRef.current.y += (lastMouseRef.current.y - mouseRef.current.y) * 0.25;
          
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
          if (containerRef.current) {
            containerRef.current.removeEventListener('pointermove', handlePointerMove);
            containerRef.current.removeEventListener('touchmove', handleTouchMove);
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
      style={{ width: '100%', height: '100%' }}
    />
  );
} 