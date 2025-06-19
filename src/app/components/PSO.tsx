'use client'
import { useEffect, useRef, useState, useCallback } from 'react'

interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  bestX: number
  bestY: number
  bestFitness: number
}

export default function PSO() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isRunning, setIsRunning] = useState(false)
  const [particles, setParticles] = useState<Particle[]>([])
  const [globalBest, setGlobalBest] = useState({ x: 0, y: 0, fitness: Infinity })
  const [iteration, setIteration] = useState(0)

  // Sphere function (simple)
  const fitness = (x: number, y: number) => x * x + y * y

  // Initialize particles
  const initParticles = useCallback(() => {
    const newParticles: Particle[] = []
    for (let i = 0; i < 20; i++) {
      const x = (Math.random() - 0.5) * 10
      const y = (Math.random() - 0.5) * 10
      const f = fitness(x, y)
      newParticles.push({
        x, y, vx: 0, vy: 0,
        bestX: x, bestY: y, bestFitness: f
      })
    }
    setParticles(newParticles)
    setGlobalBest({ x: 0, y: 0, fitness: Infinity })
    setIteration(0)
  }, [])

  // PSO update
  const updateParticles = useCallback(() => {
    setParticles(prev => {
      let newGlobalBest = globalBest
      
      const updated = prev.map(p => {
        // Update velocity
        const w = 0.5, c1 = 1.5, c2 = 1.5
        const r1 = Math.random(), r2 = Math.random()
        
        const vx = w * p.vx + c1 * r1 * (p.bestX - p.x) + c2 * r2 * (newGlobalBest.x - p.x)
        const vy = w * p.vy + c1 * r1 * (p.bestY - p.y) + c2 * r2 * (newGlobalBest.y - p.y)
        
        // Update position
        const x = Math.max(-5, Math.min(5, p.x + vx))
        const y = Math.max(-5, Math.min(5, p.y + vy))
        
        // Update fitness
        const f = fitness(x, y)
        const bestX = f < p.bestFitness ? x : p.bestX
        const bestY = f < p.bestFitness ? y : p.bestY
        const bestFitness = Math.min(f, p.bestFitness)
        
        // Update global best
        if (f < newGlobalBest.fitness) {
          newGlobalBest = { x, y, fitness: f }
        }
        
        return { x, y, vx, vy, bestX, bestY, bestFitness }
      })
      
      setGlobalBest(newGlobalBest)
      return updated
    })
    setIteration(prev => prev + 1)
  }, [globalBest])

  // Animation loop
  useEffect(() => {
    if (!isRunning) return
    const interval = setInterval(updateParticles, 100)
    return () => clearInterval(interval)
  }, [isRunning, updateParticles])

  // Draw
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    
    ctx.clearRect(0, 0, 400, 400)
    
    // Draw fitness landscape (heat map)
    const imageData = ctx.createImageData(400, 400)
    for (let i = 0; i < imageData.data.length; i += 4) {
      const pixel = i / 4
      const x = (pixel % 400) / 40 - 5  // Convert to world coordinates
      const y = Math.floor(pixel / 400) / 40 - 5
      
      const f = fitness(x, y)
      const intensity = Math.max(0, Math.min(255, 255 - f * 10)) // Darker = higher fitness
      
      imageData.data[i] = intensity     // Red
      imageData.data[i + 1] = intensity // Green  
      imageData.data[i + 2] = 255       // Blue
      imageData.data[i + 3] = 50        // Alpha (transparency)
    }
    ctx.putImageData(imageData, 0, 0)
    
    // Draw target (global optimum)
    const targetX = 200 // Center of canvas (0,0 in world coords)
    const targetY = 200
    ctx.strokeStyle = '#10b981'
    ctx.lineWidth = 3
    ctx.beginPath()
    ctx.arc(targetX, targetY, 12, 0, Math.PI * 2)
    ctx.stroke()
    
    // Draw particles
    particles.forEach(p => {
      const x = (p.x + 5) * 40
      const y = (p.y + 5) * 40
      
      ctx.fillStyle = '#3b82f6'
      ctx.beginPath()
      ctx.arc(x, y, 4, 0, Math.PI * 2)
      ctx.fill()
    })
    
    // Draw global best
    if (globalBest.fitness < Infinity) {
      const x = (globalBest.x + 5) * 40
      const y = (globalBest.y + 5) * 40
      
      ctx.fillStyle = '#ef4444'
      ctx.beginPath()
      ctx.arc(x, y, 6, 0, Math.PI * 2)
      ctx.fill()
    }
  }, [particles, globalBest])

  useEffect(() => {
    initParticles()
  }, [initParticles])

  return (
    <div className="flex gap-8">
      <canvas 
        ref={canvasRef} 
        width={400} 
        height={400} 
        className="border border-gray-300"
      />
      
      <div className="flex flex-col gap-4">
        <h2 className="text-xl font-bold">PSO Visualization</h2>
        
        <div className="flex gap-2">
          <button 
            onClick={() => setIsRunning(!isRunning)}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            {isRunning ? 'Pause' : 'Play'}
          </button>
          
          <button 
            onClick={updateParticles}
            disabled={isRunning}
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            Step
          </button>
          
          <button 
            onClick={initParticles}
            className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
          >
            Reset
          </button>
        </div>
        
        <div className="text-sm">
          <p>Iteration: {iteration}</p>
          <p>Best Fitness: {globalBest.fitness.toFixed(4)}</p>
          <p>Best Position: ({globalBest.x.toFixed(2)}, {globalBest.y.toFixed(2)})</p>
        </div>
      </div>
    </div>
  )
} 