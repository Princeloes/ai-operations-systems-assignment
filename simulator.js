/**
 * Rollercoaster Energy Lab Physics Simulator
 * 
 * Implements:
 * - Cubic Bezier track geometry
 * - Energy-based physics solver (Conservation of Energy: Ep + Ek + Eth = E_start)
 * - Interactive canvas rendering with supports, track ties, cart, and labels
 * - Real-time stats display hook
 */

class RollercoasterSimulator {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    this.ctx = this.canvas.getContext('2d');
    
    // Physical Constants
    this.mass = 100.0; // kg
    this.heightScale = 10.0; // pixels per meter
    this.yGround = 230.0; // Y pixel mapping for 0m height
    
    // Sliders & Controls
    this.hStart = 12.0; // m (adjustable 6-18)
    this.frictionCoeff = 0.05; // mu (adjustable 0-0.3)
    this.gravity = 9.8; // m/s^2 (adjustable 5-20)
    
    // Cart State
    this.trackPoints = [];
    this.cartIndex = 0; // index along trackPoints
    this.cartDirection = 1; // 1 = forward, -1 = backward
    this.cartVelocity = 0.0; // m/s
    this.thermalEnergy = 0.0; // Joules
    this.totalMechanicalEnergy = 0.0; // Start potential energy (m * g * hStart)
    
    // Running flags
    this.isPlaying = false;
    this.isCompleted = false;
    this.animationId = null;
    this.lastTime = null;
    
    // Initialize Track Geometry
    this.rebuildTrack();
    
    // Handle Canvas Resizing
    this.resizeCanvas();
    window.addEventListener('resize', () => this.resizeCanvas());
  }
  
  resizeCanvas() {
    // Get display size
    const rect = this.canvas.parentElement.getBoundingClientRect();
    // Support high-resolution displays
    const dpr = window.devicePixelRatio || 1;
    this.canvas.width = rect.width * dpr;
    this.canvas.height = rect.width * (9/16) * dpr; // maintain 16:9
    this.ctx.scale(dpr, dpr);
    this.canvas.style.width = '100%';
    this.canvas.style.height = '100%';
    this.draw();
  }
  
  updateParameters(hStart, friction, gravity) {
    const oldHStart = this.hStart;
    this.hStart = parseFloat(hStart);
    this.frictionCoeff = parseFloat(friction);
    this.gravity = parseFloat(gravity);
    
    // Calculate total starting energy
    this.totalMechanicalEnergy = this.mass * this.gravity * this.hStart;
    
    // Rebuild track if start height changed
    if (this.hStart !== oldHStart || this.trackPoints.length === 0) {
      this.rebuildTrack();
      this.resetSimulation();
    } else {
      this.draw();
    }
  }
  
  cubicBezier(p0, p1, p2, p3, t) {
    const mt = 1.0 - t;
    return (
      mt * mt * mt * p0 +
      3.0 * mt * mt * t * p1 +
      3.0 * mt * t * t * p2 +
      t * t * t * p3
    );
  }
  
  rebuildTrack() {
    this.trackPoints = [];
    
    const yStart = this.yGround - this.hStart * this.heightScale;
    const ySecondPeak = this.yGround - 8.5 * this.heightScale; // fixed 8.5m peak
    const yBrakeZone = this.yGround - 1.8 * this.heightScale; // fixed 1.8m stop height
    
    // Segment 1: First Peak -> Valley -> Second Peak
    // P0: (50, yStart)
    // P1: (200, 270) Control Point (Valley Left)
    // P2: (360, 260) Control Point (Valley Right)
    // P3: (480, ySecondPeak) Peak 2
    const seg1Steps = 180;
    for (let i = 0; i <= seg1Steps; i++) {
      const t = i / seg1Steps;
      const x = this.cubicBezier(50, 200, 360, 480, t);
      const y = this.cubicBezier(yStart, 280, 270, ySecondPeak, t);
      this.trackPoints.push({ x, y });
    }
    
    // Segment 2: Second Peak -> Drop -> Flat Braking Zone
    // P0: (480, ySecondPeak)
    // P1: (540, ySecondPeak) Control Point
    // P2: (640, yBrakeZone + 15) Control Point
    // P3: (750, yBrakeZone) Brake Stop
    const seg2Steps = 120;
    for (let i = 1; i <= seg2Steps; i++) {
      const t = i / seg2Steps;
      const x = this.cubicBezier(480, 540, 640, 750, t);
      const y = this.cubicBezier(ySecondPeak, ySecondPeak, yBrakeZone + 15, yBrakeZone, t);
      this.trackPoints.push({ x, y });
    }
    
    // Compute heights and distances
    let cumulativeDistance = 0.0;
    for (let i = 0; i < this.trackPoints.length; i++) {
      const pt = this.trackPoints[i];
      // Height in meters relative to ground Y
      pt.height = (this.yGround - pt.y) / this.heightScale;
      
      if (i > 0) {
        const prev = this.trackPoints[i - 1];
        const dx = pt.x - prev.x;
        const dy = pt.y - prev.y;
        const segmentLen = Math.sqrt(dx*dx + dy*dy) / this.heightScale; // in meters
        cumulativeDistance += segmentLen;
        pt.distance = cumulativeDistance;
        
        // Slope angle
        pt.slopeAngle = Math.atan2(dy, dx);
      } else {
        pt.distance = 0.0;
        pt.slopeAngle = 0.0;
      }
    }
  }
  
  resetSimulation() {
    this.cartIndex = 0;
    this.cartDirection = 1;
    this.cartVelocity = 0.0;
    this.thermalEnergy = 0.0;
    this.totalMechanicalEnergy = this.mass * this.gravity * this.hStart;
    this.isCompleted = false;
    this.isPlaying = false;
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
    this.lastTime = null;
    this.draw();
    this.updateStats(0.0, this.totalMechanicalEnergy, 0.0);
  }
  
  startSimulation() {
    if (this.isCompleted) {
      this.resetSimulation();
    }
    this.isPlaying = true;
    this.lastTime = null;
    this.animate();
  }
  
  pauseSimulation() {
    this.isPlaying = false;
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
  }
  
  animate(timestamp) {
    if (!this.isPlaying) return;
    
    if (!this.lastTime) {
      this.lastTime = timestamp || performance.now();
    }
    
    // Limit delta time to avoid huge leaps
    const dt = Math.min((timestamp - this.lastTime) / 1000.0, 0.03); // max 30ms step
    this.lastTime = timestamp;
    
    this.physicsStep(dt);
    this.draw();
    
    if (!this.isCompleted && this.isPlaying) {
      this.animationId = requestAnimationFrame((t) => this.animate(t));
    }
  }
  
  physicsStep(dt) {
    if (this.cartIndex >= this.trackPoints.length - 1 && this.cartDirection === 1) {
      // Completed full track
      this.cartIndex = this.trackPoints.length - 1;
      this.cartVelocity = 0;
      this.isCompleted = true;
      this.isPlaying = false;
      this.triggerUICompleteEvent();
      return;
    }
    
    const currentPt = this.trackPoints[this.cartIndex];
    const h = currentPt.height;
    
    // Gravitational Potential Energy Ep = m * g * h
    const Ep = this.mass * this.gravity * h;
    
    // Frictional force: F_f = mu * m * g * cos(theta)
    const theta = currentPt.slopeAngle;
    const frictionForce = this.frictionCoeff * this.mass * this.gravity * Math.abs(Math.cos(theta));
    
    // Calculate the distance step ds based on speed
    // If cart is starting, give it a tiny push down the hill
    let currentSpeed = this.cartVelocity;
    if (currentSpeed === 0 && this.cartIndex === 0) {
      currentSpeed = 0.5; // kickstart
    }
    
    const ds = currentSpeed * dt; // distance in meters
    
    // Accumulate thermal energy lost due to friction: dE_th = F_f * ds
    const dEth = frictionForce * ds;
    this.thermalEnergy += dEth;
    
    // Check energy balance: E_kinetic = E_total - E_potential - E_thermal
    let Ek = this.totalMechanicalEnergy - Ep - this.thermalEnergy;
    
    if (Ek < 0) {
      // Cart has run out of kinetic energy to climb this high!
      // Reverse direction or stop
      Ek = 0;
      this.cartVelocity = 0;
      this.cartDirection = -this.cartDirection; // reverse
      
      // Step backwards slightly to prevent getting stuck
      this.cartIndex += this.cartDirection;
      if (this.cartIndex < 0) {
        this.cartIndex = 0;
        this.cartDirection = 1;
      }
    } else {
      // Speed from Kinetic Energy: Ek = 0.5 * m * v^2 -> v = sqrt(2 * Ek / m)
      this.cartVelocity = Math.sqrt((2.0 * Ek) / this.mass);
      
      // Convert physical speed to track index step
      // Approximate: find the next point that is 'ds' meters away
      let targetIndex = this.cartIndex;
      let distAccumulator = 0.0;
      
      if (this.cartDirection === 1) {
        while (targetIndex < this.trackPoints.length - 1 && distAccumulator < ds) {
          const ptCurrent = this.trackPoints[targetIndex];
          const ptNext = this.trackPoints[targetIndex + 1];
          distAccumulator += (ptNext.distance - ptCurrent.distance);
          targetIndex++;
        }
      } else {
        while (targetIndex > 0 && distAccumulator < ds) {
          const ptCurrent = this.trackPoints[targetIndex];
          const ptPrev = this.trackPoints[targetIndex - 1];
          distAccumulator += (ptCurrent.distance - ptPrev.distance);
          targetIndex--;
        }
      }
      
      this.cartIndex = targetIndex;
      
      // Boundary checks
      if (this.cartIndex <= 0) {
        this.cartIndex = 0;
        this.cartDirection = 1; // bounce back
        this.cartVelocity = 0;
      }
    }
    
    // Call stats updates
    this.updateStats(Ek, Ep, this.thermalEnergy);
  }
  
  updateStats(Ek, Ep, Eth) {
    const total = Ek + Ep + Eth;
    
    // Display numbers formatted
    document.getElementById('val-potential').innerText = `${Ep.toFixed(0)} J`;
    document.getElementById('val-kinetic').innerText = `${Ek.toFixed(0)} J`;
    document.getElementById('val-thermal').innerText = `${Eth.toFixed(0)} J`;
    document.getElementById('val-total').innerText = `${total.toFixed(0)} J`;
    
    // Update visual bars
    const maxEnergy = this.mass * this.gravity * 18.0; // 18m is max starting height
    const percentP = Math.max(0, Math.min(100, (Ep / maxEnergy) * 100));
    const percentK = Math.max(0, Math.min(100, (Ek / maxEnergy) * 100));
    const percentT = Math.max(0, Math.min(100, (Eth / maxEnergy) * 100));
    const percentTot = Math.max(0, Math.min(100, (total / maxEnergy) * 100));
    
    document.getElementById('fill-potential').style.width = `${percentP}%`;
    document.getElementById('fill-kinetic').style.width = `${percentK}%`;
    document.getElementById('fill-thermal').style.width = `${percentT}%`;
    document.getElementById('fill-total').style.width = `${percentTot}%`;
  }
  
  triggerUICompleteEvent() {
    document.getElementById('sim-status-badge').innerText = 'COMPLETED';
    document.getElementById('sim-status-badge').className = 'sim-badge running';
    document.getElementById('sim-play-btn').disabled = false;
    document.getElementById('sim-pause-btn').disabled = true;
    
    // Flash message
    this.ctx.save();
    this.ctx.fillStyle = 'rgba(16, 185, 129, 0.9)';
    this.ctx.font = 'bold 16px Outfit';
    this.ctx.textAlign = 'center';
    this.ctx.shadowBlur = 8;
    this.ctx.shadowColor = '#10B981';
    this.ctx.fillText('Simulation Complete - Brake applied', 400, 50);
    this.ctx.restore();
  }
  
  draw() {
    const w = this.canvas.width / (window.devicePixelRatio || 1);
    const h = this.canvas.height / (window.devicePixelRatio || 1);
    
    // Clear canvas
    this.ctx.clearRect(0, 0, w, h);
    
    // Draw Grid Lines (Engineering theme)
    this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.02)';
    this.ctx.lineWidth = 1;
    const gridSize = 40;
    for (let x = 0; x < w; x += gridSize) {
      this.ctx.beginPath();
      this.ctx.moveTo(x, 0);
      this.ctx.lineTo(x, h);
      this.ctx.stroke();
    }
    for (let y = 0; y < h; y += gridSize) {
      this.ctx.beginPath();
      this.ctx.moveTo(0, y);
      this.ctx.lineTo(w, y);
      this.ctx.stroke();
    }
    
    // Draw Ground
    this.ctx.fillStyle = '#0f172a';
    this.ctx.fillRect(0, this.yGround, w, h - this.yGround);
    this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
    this.ctx.lineWidth = 2;
    this.ctx.beginPath();
    this.ctx.moveTo(0, this.yGround);
    this.ctx.lineTo(w, this.yGround);
    this.ctx.stroke();
    
    // Draw Supports (pillars)
    this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.04)';
    this.ctx.lineWidth = 1.5;
    for (let i = 0; i < this.trackPoints.length; i += 18) {
      const pt = this.trackPoints[i];
      if (pt.x > 30 && pt.x < w - 30) {
        this.ctx.beginPath();
        this.ctx.moveTo(pt.x, pt.y);
        this.ctx.lineTo(pt.x, this.yGround);
        this.ctx.stroke();
      }
    }
    
    // Draw Track Rails (glowing lines)
    // Support rails
    this.ctx.strokeStyle = 'rgba(99, 102, 241, 0.1)';
    this.ctx.lineWidth = 6;
    this.ctx.beginPath();
    this.ctx.moveTo(this.trackPoints[0].x, this.trackPoints[0].y + 4);
    for (let i = 1; i < this.trackPoints.length; i++) {
      this.ctx.lineTo(this.trackPoints[i].x, this.trackPoints[i].y + 4);
    }
    this.ctx.stroke();
    
    // Main glowing rail
    this.ctx.strokeStyle = 'var(--color-indigo)';
    this.ctx.lineWidth = 2.5;
    this.ctx.shadowBlur = 4;
    this.ctx.shadowColor = 'var(--color-indigo-glow)';
    this.ctx.beginPath();
    this.ctx.moveTo(this.trackPoints[0].x, this.trackPoints[0].y);
    for (let i = 1; i < this.trackPoints.length; i++) {
      this.ctx.lineTo(this.trackPoints[i].x, this.trackPoints[i].y);
    }
    this.ctx.stroke();
    
    // Reset shadow
    this.ctx.shadowBlur = 0;
    
    // Draw Track Ties (cross beams)
    this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
    this.ctx.lineWidth = 1;
    for (let i = 0; i < this.trackPoints.length; i += 4) {
      const pt = this.trackPoints[i];
      const theta = pt.slopeAngle;
      const cosT = Math.cos(theta + Math.PI/2);
      const sinT = Math.sin(theta + Math.PI/2);
      
      this.ctx.beginPath();
      this.ctx.moveTo(pt.x - cosT * 4, pt.y - sinT * 4);
      this.ctx.lineTo(pt.x + cosT * 4, pt.y + sinT * 4);
      this.ctx.stroke();
    }
    
    // Draw Key Labels
    this.ctx.fillStyle = 'rgba(255, 255, 255, 0.35)';
    this.ctx.font = '600 9px Outfit';
    this.ctx.textAlign = 'center';
    
    // Start hill label
    this.ctx.fillText(`START HILL (${this.hStart.toFixed(1)}m)`, 50, this.trackPoints[0].y - 12);
    
    // Valley label
    const valleyIdx = Math.floor(this.trackPoints.length * 0.35);
    const valleyPt = this.trackPoints[valleyIdx];
    this.ctx.fillText('VALLEY (LOW EP)', valleyPt.x, valleyPt.y + 16);
    
    // Second hill peak label
    const peakIdx = Math.floor(this.trackPoints.length * 0.6);
    const peakPt = this.trackPoints[peakIdx];
    this.ctx.fillText('HILL 2 (8.5m)', peakPt.x, peakPt.y - 12);
    
    // Brake stop zone
    const endPt = this.trackPoints[this.trackPoints.length - 1];
    this.ctx.fillText('BRAKE STOP', endPt.x, endPt.y - 12);
    
    // Draw Cart
    if (this.trackPoints.length > 0) {
      const cartPt = this.trackPoints[this.cartIndex];
      const theta = cartPt.slopeAngle;
      
      this.ctx.save();
      this.ctx.translate(cartPt.x, cartPt.y);
      this.ctx.rotate(theta);
      
      // Draw shadow glow on cart
      this.ctx.shadowBlur = 10;
      this.ctx.shadowColor = 'rgba(6, 182, 212, 0.7)';
      
      // Cart base
      this.ctx.fillStyle = '#06b6d4';
      this.ctx.fillRect(-10, -8, 20, 8);
      
      // Clear shadow
      this.ctx.shadowBlur = 0;
      
      // Cart cabin detailing
      this.ctx.fillStyle = 'rgba(15, 22, 36, 0.7)';
      this.ctx.fillRect(-8, -7, 16, 5);
      
      // Cart Wheels
      this.ctx.fillStyle = '#ffffff';
      this.ctx.beginPath();
      this.ctx.arc(-6, 1, 3, 0, Math.PI * 2);
      this.ctx.arc(6, 1, 3, 0, Math.PI * 2);
      this.ctx.fill();
      
      // Wheel centers
      this.ctx.fillStyle = '#0f172a';
      this.ctx.beginPath();
      this.ctx.arc(-6, 1, 1, 0, Math.PI * 2);
      this.ctx.arc(6, 1, 1, 0, Math.PI * 2);
      this.ctx.fill();
      
      // Cart passenger dots (simulation of kids!)
      this.ctx.fillStyle = '#fb7185';
      this.ctx.beginPath();
      this.ctx.arc(-3, -4, 2, 0, Math.PI * 2);
      this.ctx.arc(3, -4, 2, 0, Math.PI * 2);
      this.ctx.fill();
      
      this.ctx.restore();
    }
  }
}
