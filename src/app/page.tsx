import PSO from './components/PSO'
import PSOExplanation from './components/PSOExplanation'

export default function Home() {
  return (
    <div className="min-h-screen p-4 md:p-8" style={{ background: 'var(--background)' }}>
      <div className="max-w-3xl mx-auto">
        <h1 className="text-2xl md:text-3xl font-bold text-center mb-6 md:mb-8" style={{ color: 'var(--foreground)' }}>
          Particle Swarm Optimization
        </h1>
        <div className="flex justify-center mb-8">
          <PSO />
        </div>
        <PSOExplanation />
      </div>
    </div>
  )
}
