import { useState } from 'react';
import { 
  GraduationCap, 
  Briefcase, 
  ExternalLink, 
  Sparkles, 
  Clock, 
  Search,
  Plane
} from 'lucide-react';

interface Opportunity {
  id: string;
  title: string;
  organization: string;
  category: 'Scholarship' | 'Internship' | 'Conference' | 'Fellowship';
  fundingType: 'Fully Funded (Flights + Hotel)' | 'Tuition-Free' | 'Paid Internship' | 'Partially Funded';
  deadline: string;
  region: string;
  description: string;
  visaSupport?: string;
  url: string;
}

const OPPORTUNITIES_DATA: Opportunity[] = [
  {
    id: '1',
    title: 'Mastercard Foundation Scholars Program',
    organization: 'Mastercard Foundation',
    category: 'Scholarship',
    fundingType: 'Fully Funded (Flights + Hotel)',
    deadline: 'Rolling / Institutional Deadlines',
    region: 'Africa / Partner Global Universities',
    description: 'Comprehensive financial support covering 100% of tuition, accommodation, airfare, stipends, and leadership development for high-potential African students.',
    url: 'https://mastercardfdn.org/all/scholars/'
  },
  {
    id: '2',
    title: 'Youth Diplomacy Convention 2027',
    organization: 'Organisation for Global Peace and Sustainability',
    category: 'Conference',
    fundingType: 'Fully Funded (Flights + Hotel)',
    deadline: 'December 31, 2026',
    region: 'Brussels, Belgium',
    description: 'Premier international academic summit for youth leaders in public policy, climate governance, and diplomacy. Full airfare, accommodation, and official visa invitation letters provided.',
    visaSupport: 'Official Schengen invitation letter included',
    url: 'https://www.opportunitydesk.org/'
  },
  {
    id: '3',
    title: 'Google Student Training in Engineering Program (STEP)',
    organization: 'Google Careers',
    category: 'Internship',
    fundingType: 'Paid Internship',
    deadline: 'Upcoming Cohort Intake',
    region: 'Remote / EMEA Hubs',
    description: 'A 12-week development internship program for first and second-year undergraduate students with a passion for computer science and software engineering.',
    url: 'https://buildyourfuture.withgoogle.com/programs/step'
  },
  {
    id: '4',
    title: 'DAAD Helmut-Schmidt-Programme Scholarships',
    organization: 'German Academic Exchange Service (DAAD)',
    category: 'Scholarship',
    fundingType: 'Fully Funded (Flights + Hotel)',
    deadline: 'Annual Cohort Window',
    region: 'Germany',
    description: 'Full master’s degree scholarships in public policy, good governance, and civil administration for future leaders from developing countries.',
    url: 'https://www.daad.de/'
  },
  {
    id: '5',
    title: 'University of the People Assessment Grants',
    organization: 'UoPeople Foundation',
    category: 'Scholarship',
    fundingType: 'Tuition-Free',
    deadline: 'Rolling Admissions (5 terms/yr)',
    region: 'Global Online',
    description: 'Accredited American online degrees with assessment-fee scholarships available for eligible students who cannot afford course exam fees.',
    url: 'https://www.uopeople.edu/tuition-free/our-scholarships/'
  }
];

export default function LiveFeed() {
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const categories = [
    { label: 'All Opportunities', value: 'All', icon: Sparkles },
    { label: 'Scholarships', value: 'Scholarship', icon: GraduationCap },
    { label: 'Internships', value: 'Internship', icon: Briefcase },
    { label: 'Conferences & Summits', value: 'Conference', icon: Plane },
  ];

  const filtered = OPPORTUNITIES_DATA.filter((item) => {
    const matchesCategory = activeCategory === 'All' || item.category === activeCategory;
    const matchesSearch = 
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.organization.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="w-full max-w-6xl mx-auto px-4 py-8 space-y-8">
      {/* Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-slate-800 p-6 sm:p-8 shadow-xl">
        <div className="max-w-2xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" /> Verified Global Student Stream
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
            Scholarships, Internships & Conferences
          </h1>
          <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
            Curated opportunities for African and international youth: fully funded scholarships, remote tech internships, and fully funded global travel summits.
          </p>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="space-y-4">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search scholarships, internships, conferences (e.g. Mastercard, Google, Belgium)..."
            className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          />
        </div>

        <div className="flex flex-wrap gap-2">
          {categories.map((cat) => {
            const Icon = cat.icon;
            const isActive = activeCategory === cat.value;
            return (
              <button
                key={cat.value}
                onClick={() => setActiveCategory(cat.value)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                    : 'bg-slate-900 hover:bg-slate-800 text-slate-400 border border-slate-800'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {filtered.map((item) => (
          <div
            key={item.id}
            className="flex flex-col justify-between bg-slate-900/90 border border-slate-800 rounded-2xl p-6 hover:border-slate-700 hover:shadow-xl transition relative group"
          >
            <div>
              <div className="flex items-center justify-between gap-2">
                <span className="text-[11px] font-semibold tracking-wide uppercase px-2.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                  {item.category}
                </span>
                <span className="flex items-center gap-1 text-xs text-slate-400 font-medium">
                  <Clock className="w-3.5 h-3.5 text-amber-400" />
                  {item.deadline}
                </span>
              </div>

              <h3 className="text-lg font-bold text-white mt-3 group-hover:text-indigo-300 transition">
                {item.title}
              </h3>
              <p className="text-xs text-slate-400 mt-1 font-medium">
                {item.organization} • <span className="text-slate-300">{item.region}</span>
              </p>

              <div className="mt-3">
                <span className="inline-block text-[11px] font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 rounded-md">
                  {item.fundingType}
                </span>
                {item.visaSupport && (
                  <span className="ml-2 inline-block text-[11px] font-semibold text-sky-400 bg-sky-500/10 border border-sky-500/20 px-2.5 py-0.5 rounded-md">
                    {item.visaSupport}
                  </span>
                )}
              </div>

              <p className="text-sm text-slate-400 mt-3 leading-relaxed">
                {item.description}
              </p>
            </div>

            <div className="pt-5 mt-5 border-t border-slate-800/80 flex items-center justify-between">
              <span className="text-xs text-slate-500">Official Opportunity</span>
              <a
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 bg-slate-800 hover:bg-indigo-600 text-slate-200 hover:text-white px-3.5 py-1.5 rounded-lg text-xs font-semibold transition"
              >
                <span>Apply / Details</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
