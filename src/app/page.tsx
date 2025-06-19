import PSO from './components/PSO'

export default function Home() {
  return (
    <div className="min-h-screen p-8 bg-gray-50">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8">
          Particle Swarm Optimization
        </h1>
        <div className="flex justify-center">
          <PSO />
        </div>
      </div>
    </div>
  )
}
