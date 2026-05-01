export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black">
      <div className="max-w-4xl mx-auto px-6 py-20 text-center">
        <h1 className="text-6xl font-bold text-white mb-4">Solar AI Platform</h1>
        <p className="text-xl text-gray-400 mb-8">
          AI-powered solar energy forecasting, roof detection, and financial projections
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 my-12">
          <div className="p-6 bg-gray-800 rounded-lg border border-gray-700">
            <div className="text-4xl mb-2">🏠</div>
            <h3 className="text-xl font-bold text-white mb-2">Roof Detection</h3>
            <p className="text-gray-400">AI-powered analysis using YOLOv8</p>
          </div>
          <div className="p-6 bg-gray-800 rounded-lg border border-gray-700">
            <div className="text-4xl mb-2">☀️</div>
            <h3 className="text-xl font-bold text-white mb-2">Solar Forecast</h3>
            <p className="text-gray-400">ML predictions with 95% confidence</p>
          </div>
          <div className="p-6 bg-gray-800 rounded-lg border border-gray-700">
            <div className="text-4xl mb-2">💰</div>
            <h3 className="text-xl font-bold text-white mb-2">Savings Projection</h3>
            <p className="text-gray-400">ROI and financial analysis</p>
          </div>
        </div>

        <div className="flex gap-4 justify-center flex-wrap">
          <a href="http://localhost:3000" className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-lg">
            Open Local App
          </a>
          <a href="https://github.com/varshithdepa45/solar-2" target="_blank" rel="noopener noreferrer" className="border-2 border-gray-600 text-white font-bold py-3 px-8 rounded-lg hover:bg-gray-800">
            GitHub Repository
          </a>
        </div>

        <div className="mt-16 text-gray-500 text-sm">
          <p>Tech Stack: FastAPI • Next.js 16 • Firebase • scikit-learn</p>
          <p className="mt-4">Run locally with: <code className="bg-gray-800 px-2 py-1 rounded">cd frontend && npm run dev</code></p>
        </div>
      </div>
    </div>
  );
}
