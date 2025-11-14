export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-white mb-4">
            SMS → Video Escalation
          </h1>
          <p className="text-xl text-gray-300">
            Powered by Plivo & LiveKit
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
            <div className="text-4xl mb-4">📱</div>
            <h2 className="text-2xl font-semibold text-white mb-3">
              For Customers
            </h2>
            <p className="text-gray-300 mb-4">
              Text <span className="font-mono bg-blue-600 px-2 py-1 rounded">HELP</span> to
              our support number to receive an instant video link.
            </p>
            <div className="bg-black/30 rounded-lg p-3 text-sm text-gray-400">
              <p className="font-mono">Send SMS: &quot;HELP&quot;</p>
              <p className="font-mono">Receive: Video link</p>
              <p className="font-mono">Join: Support call</p>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
            <div className="text-4xl mb-4">👨‍💼</div>
            <h2 className="text-2xl font-semibold text-white mb-3">
              For Agents
            </h2>
            <p className="text-gray-300 mb-4">
              Access the agent console to see waiting rooms and join customer
              video calls.
            </p>
            <a
              href="/agent"
              className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg transition-colors"
            >
              Open Agent Console →
            </a>
          </div>
        </div>

        <div className="bg-white/5 backdrop-blur-lg rounded-xl p-6 border border-white/10">
          <h3 className="text-xl font-semibold text-white mb-4">
            How It Works
          </h3>
          <ol className="space-y-3 text-gray-300">
            <li className="flex items-start">
              <span className="flex-shrink-0 w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold mr-3">
                1
              </span>
              <span>Customer sends SMS with &quot;HELP&quot; to your Plivo number</span>
            </li>
            <li className="flex items-start">
              <span className="flex-shrink-0 w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold mr-3">
                2
              </span>
              <span>System creates a LiveKit room and sends back a magic link</span>
            </li>
            <li className="flex items-start">
              <span className="flex-shrink-0 w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold mr-3">
                3
              </span>
              <span>Customer clicks link and joins the video room</span>
            </li>
            <li className="flex items-start">
              <span className="flex-shrink-0 w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold mr-3">
                4
              </span>
              <span>Agent sees waiting room in console and joins to help</span>
            </li>
            <li className="flex items-start">
              <span className="flex-shrink-0 w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold mr-3">
                5
              </span>
              <span>Call is recorded and summary is saved for later review</span>
            </li>
          </ol>
        </div>

        <div className="mt-8 text-center text-gray-400 text-sm">
          <p>
            Built with Next.js, Prisma, MongoDB, Plivo SMS API, and LiveKit
          </p>
        </div>
      </div>
    </div>
  );
}
