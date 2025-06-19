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
  const [functionType, setFunctionType] = useState<'sphere' | 'rastrigin' | 'ackley' | 'rosenbrock' | 'himmelblau' | 'beale'>('sphere')

  // Get global optimum position for each function
  const getGlobalOptimum = () => {
    switch (functionType) {
      case 'sphere':
      case 'rastrigin':
      case 'ackley':
        return [{ x: 0, y: 0 }]
      case 'rosenbrock':
        return [{ x: 1, y: 1 }]
      case 'himmelblau':
        return [
          { x: 3, y: 2 },
          { x: -2.805118, y: 3.131312 },
          { x: -3.779310, y: -3.283186 },
          { x: 3.584428, y: -1.848126 }
        ]
      case 'beale':
        return [{ x: 3, y: 0.5 }]
      default:
        return [{ x: 0, y: 0 }]
    }
  }

  // Objective functions
  const fitness = (x: number, y: number) => {
    switch (functionType) {
      case 'sphere':
        return x * x + y * y
      case 'rastrigin':
        return 20 + (x * x - 10 * Math.cos(2 * Math.PI * x)) + (y * y - 10 * Math.cos(2 * Math.PI * y))
      case 'ackley':
        return -20 * Math.exp(-0.2 * Math.sqrt(0.5 * (x * x + y * y))) - Math.exp(0.5 * (Math.cos(2 * Math.PI * x) + Math.cos(2 * Math.PI * y))) + Math.E + 20
      case 'rosenbrock':
        return 100 * (y - x * x) * (y - x * x) + (1 - x) * (1 - x)
      case 'himmelblau':
        return (x * x + y - 11) * (x * x + y - 11) + (x + y * y - 7) * (x + y * y - 7)
      case 'beale':
        return Math.pow(1.5 - x + x * y, 2) + Math.pow(2.25 - x + x * y * y, 2) + Math.pow(2.625 - x + x * y * y * y, 2)
      default:
        return x * x + y * y
    }
  }

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
    
    // Draw target(s) (global optimum)
    const optimums = getGlobalOptimum()
    ctx.strokeStyle = '#10b981'
    ctx.lineWidth = 3
    
    optimums.forEach(opt => {
      const targetX = (opt.x + 5) * 40
      const targetY = (opt.y + 5) * 40
      
      // Only draw if within canvas bounds
      if (targetX >= 0 && targetX <= 400 && targetY >= 0 && targetY <= 400) {
        ctx.beginPath()
        ctx.arc(targetX, targetY, 12, 0, Math.PI * 2)
        ctx.stroke()
      }
    })
    
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
        
        <div className="flex flex-col gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Function:</label>
            <select 
              value={functionType} 
              onChange={(e) => {
                setFunctionType(e.target.value as 'sphere' | 'rastrigin' | 'ackley' | 'rosenbrock' | 'himmelblau' | 'beale')
                initParticles()
              }}
              className="px-3 py-2 border border-gray-300 rounded"
            >
              <option value="sphere">Sphere</option>
              <option value="rastrigin">Rastrigin</option>
              <option value="ackley">Ackley</option>
              <option value="rosenbrock">Rosenbrock</option>
              <option value="himmelblau">Himmelblau</option>
              <option value="beale">Beale</option>
            </select>
          </div>
          
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