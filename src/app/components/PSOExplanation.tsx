'use client'
import { InlineMath, BlockMath } from 'react-katex'
import 'katex/dist/katex.min.css'

export default function PSOExplanation() {
  return (
    <div className="max-w-3xl mx-auto mt-8 md:mt-12 ">
      <h3 className="text-lg md:text-xl font-semibold mb-4 md:mb-6">Particle Swarm Optimization (PSO)</h3>
      
      <p className="text-sm md:text-base text-gray-700 mb-6 md:mb-8">
        PSO is a computational method that optimizes a problem by iteratively improving candidate solutions (particles) 
        with regard to a given measure of quality (fitness function).
      </p>
      
      <div className="space-y-6 md:space-y-8">
        <div>
          <h4 className="text-base md:text-lg font-medium mb-3 md:mb-4">Velocity Update:</h4>
          <div className="text-center mb-4 overflow-x-auto">
            <BlockMath math="v_i(t+1) = w \cdot v_i(t) + c_1 \cdot r_1 \cdot (p_i - x_i(t)) + c_2 \cdot r_2 \cdot (g - x_i(t))" />
          </div>
        </div>
        
        <div>
          <h4 className="text-base md:text-lg font-medium mb-3 md:mb-4">Position Update:</h4>
          <div className="text-center mb-4 overflow-x-auto">
            <BlockMath math="x_i(t+1) = x_i(t) + v_i(t+1)" />
          </div>
        </div>
        
        <div>
          <h4 className="text-base md:text-lg font-medium mb-3 md:mb-4">Parameters:</h4>
          <ul className="space-y-1 md:space-y-2 text-sm md:text-base text-gray-700">
            <li><InlineMath math="w" /> - inertia weight (momentum)</li>
            <li><InlineMath math="c_1" /> - cognitive coefficient (personal best attraction)</li>
            <li><InlineMath math="c_2" /> - social coefficient (global best attraction)</li>
            <li><InlineMath math="r_1, r_2" /> - random numbers [0,1]</li>
            <li><InlineMath math="x_i" /> - particle position</li>
            <li><InlineMath math="v_i" /> - particle velocity</li>
            <li><InlineMath math="p_i" /> - particle&apos;s best known position</li>
            <li><InlineMath math="g" /> - swarm&apos;s best known position</li>
          </ul>
        </div>
      </div>
    </div>
  )
} 