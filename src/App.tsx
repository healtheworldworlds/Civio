import { useState } from 'react';
import LiveFeed from './Components/LiveFeed';
import SchoolHub from './Components/SchoolHub';

export default function App() {
  const [activeTab, setActiveTab] = useState<'civic' | 'admissions' | 'opportunities'>('civic');
  const [globalSearch, setGlobalSearch] = useState('');

  const handleSearchChange = (val: string) => {
    setGlobalSearch(val);
    const lower = val.toLowerCase();
    const schoolKeywords = ['school', 'univ', 'college', 'admiss', 'mankato', 'state', 'polytechnic', 'institute'];
    if (schoolKeywords.some(kw => lower.includes(kw))) {
      setActiveTab('admissions');
    }
  };

  return (
    <div className="min-h-screen bg-[#070d18] text-gray-100 flex flex-col font-sans">
      <header className="border-b border-gray-800/80 bg-[#0b1220]/90 backdrop-blur sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2 cursor-pointer" onClick={() => setActiveTab('civic')}>
              <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white font-bold text-lg shadow-md shadow-blue-500/20">
                ???
              </div>
              <span className="text-xl font-bold tracking-tight text-white">Civio</span>
            </div>

            <nav className="flex items-center gap-1 bg-[#10192d] p-1 rounded-xl border border-gray-800">
              <button
                onClick={() => setActiveTab('civic')}
                className={`px-3 py-1.5 rounded-lg text-xs md:text-sm font-semibold transition ${
                  activeTab === 'civic' ? 'bg-blue-600 text-white shadow' : 'text-gray-400 hover:text-white'
                }`}
              >
                Civic Hub
              </button>
              <button
                onClick={() => setActiveTab('admissions')}
                className={`px-3 py-1.5 rounded-lg text-xs md:text-sm font-semibold transition flex items-center gap-1.5 ${
                  activeTab === 'admissions' ? 'bg-blue-600 text-white shadow' : 'text-gray-400 hover:text-white'
                }`}
              >
                <span>??</span>
                <span>Admissions</span>
              </button>
              <button
                onClick={() => setActiveTab('opportunities')}
                className={`px-3 py-1.5 rounded-lg text-xs md:text-sm font-semibold transition flex items-center gap-1.5 ${
                  activeTab === 'opportunities' ? 'bg-blue-600 text-white shadow' : 'text-gray-400 hover:text-white'
                }`}
              >
                <span>?</span>
                <span>Opportunities</span>
              </button>
            </nav>
          </div>

          <div className="flex-1 max-w-md relative hidden sm:block">
            <input
              type="text"
              value={globalSearch}
              onChange={(e) => handleSearchChange(e.target.value)}
              placeholder="Search schools, universities, initiatives..."
              className="w-full bg-[#121c31] border border-gray-700/80 rounded-xl px-4 py-2 pl-9 text-xs md:text-sm text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <span className="absolute left-3 top-2.5 text-gray-400 text-xs">??</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-400 hidden md:inline">iamasanteprince@gmail.com</span>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {activeTab === 'civic' && <LiveFeed />}
        {activeTab === 'admissions' && <SchoolHub initialQuery={globalSearch} />}
        {activeTab === 'opportunities' && (
          <div className="max-w-4xl mx-auto p-8 text-center text-gray-400">
            <h2 className="text-xl font-bold text-white mb-2">Opportunities Hub</h2>
            <p className="text-sm">Grants, fellowships, and civic funding opportunities are loading shortly.</p>
          </div>
        )}
      </main>
    </div>
  );
}
