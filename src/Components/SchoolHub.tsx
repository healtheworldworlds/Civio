import { useState, useEffect } from 'react';

interface University {
  name: string;
  country: string;
  stateProvince?: string | null;
  webPage: string;
  feeBadge?: string;
  type?: string;
}

interface SchoolHubProps {
  initialQuery?: string;
}

const FEATURED_SCHOOLS: University[] = [
  {
    name: 'Kwame Nkrumah University of Science and Technology',
    country: 'Ghana',
    stateProvince: 'Kumasi',
    webPage: 'https://apps.knust.edu.gh/admissions',
    feeBadge: 'Local Voucher (GHS 250)',
    type: 'Public Research University'
  },
  {
    name: 'University of Ghana',
    country: 'Ghana',
    stateProvince: 'Legon, Accra',
    webPage: 'https://admission.ug.edu.gh',
    feeBadge: 'Local Voucher (GHS 250)',
    type: 'Public Premier University'
  },
  {
    name: 'Berea College',
    country: 'United States',
    stateProvince: 'Kentucky',
    webPage: 'https://www.berea.edu/admissions',
    feeBadge: 'No Fee ($0)',
    type: 'Private Liberal Arts College'
  },
  {
    name: 'Minnesota State University, Mankato',
    country: 'United States',
    stateProvince: 'Minnesota',
    webPage: 'https://mankato.mnsu.edu/admissions',
    feeBadge: 'Fee Waiver Available',
    type: 'Public Comprehensive University'
  },
  {
    name: 'University of Toronto',
    country: 'Canada',
    stateProvince: 'Ontario',
    webPage: 'https://future.utoronto.ca/apply',
    feeBadge: 'Standard Fee',
    type: 'Public Research University'
  },
  {
    name: 'Harvard University',
    country: 'United States',
    stateProvince: 'Massachusetts',
    webPage: 'https://college.harvard.edu/admissions',
    feeBadge: 'Fee Waiver by Request',
    type: 'Private Ivy League University'
  },
  {
    name: 'University of Oxford',
    country: 'United Kingdom',
    stateProvince: 'Oxford',
    webPage: 'https://www.ox.ac.uk/admissions',
    feeBadge: 'UCAS International Fee',
    type: 'Collegiate Research University'
  },
  {
    name: 'Ashesi University',
    country: 'Ghana',
    stateProvince: 'Berekuso',
    webPage: 'https://www.ashesi.edu.gh/admissions',
    feeBadge: 'Financial Aid Available',
    type: 'Private Liberal Arts University'
  }
];

export default function SchoolHub({ initialQuery = '' }: SchoolHubProps) {
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [selectedRegion, setSelectedRegion] = useState('All');
  const [results, setResults] = useState<University[]>(FEATURED_SCHOOLS);
  const [loading, setLoading] = useState(false);
  const [statusText, setStatusText] = useState('');

  useEffect(() => {
    if (initialQuery) {
      setSearchQuery(initialQuery);
    }
  }, [initialQuery]);

  useEffect(() => {
    const query = searchQuery.trim();

    if (query.length === 0) {
      setResults(FEATURED_SCHOOLS);
      setStatusText('');
      setLoading(false);
      return;
    }

    if (query.length < 2) {
      return;
    }

    const controller = new AbortController();

    const fetchSchools = async () => {
      setLoading(true);
      setStatusText('Searching worldwide index...');

      try {
        let apiUrl = `https://universities.hipolabs.com/search?name=${encodeURIComponent(query)}`;
        if (selectedRegion === 'USA') apiUrl += '&country=United+States';
        if (selectedRegion === 'Canada') apiUrl += '&country=Canada';
        if (selectedRegion === 'Ghana') apiUrl += '&country=Ghana';

        const res = await fetch(apiUrl, { signal: controller.signal });
        if (!res.ok) throw new Error('API query failed');
        const data = await res.json();

        if (Array.isArray(data) && data.length > 0) {
          const mapped: University[] = data.slice(0, 40).map((item: any) => ({
            name: item.name,
            country: item.country,
            stateProvince: item['state-province'] || null,
            webPage: item.web_pages && item.web_pages.length > 0 ? item.web_pages[0] : '#',
            feeBadge: 'Verified Directory',
            type: 'Accredited Higher Education'
          }));
          setResults(mapped);
          setStatusText(`Found ${mapped.length} matching institutions`);
        } else {
          const localFiltered = FEATURED_SCHOOLS.filter((s) =>
            s.name.toLowerCase().includes(query.toLowerCase())
          );
          setResults(localFiltered);
          setStatusText(localFiltered.length > 0 ? '' : 'No institutions match this keyword');
        }
      } catch (err: any) {
        if (err.name !== 'AbortError') {
          console.warn('API lookup error, using local catalog:', err);
          const fallbackMatches = FEATURED_SCHOOLS.filter((s) =>
            s.name.toLowerCase().includes(query.toLowerCase())
          );
          setResults(fallbackMatches);
          setStatusText('Offline/Local results shown');
        }
      } finally {
        setLoading(false);
      }
    };

    const timer = setTimeout(fetchSchools, 350);
    return () => {
      controller.abort();
      clearTimeout(timer);
    };
  }, [searchQuery, selectedRegion]);

  const filtered = results.filter((school) => {
    if (selectedRegion === 'All') return true;
    if (selectedRegion === 'USA') return school.country === 'United States';
    if (selectedRegion === 'Canada') return school.country === 'Canada';
    if (selectedRegion === 'Ghana') return school.country === 'Ghana';
    if (selectedRegion === 'Europe / Global') {
      return !['United States', 'Canada', 'Ghana'].includes(school.country);
    }
    return true;
  });

  return (
    <div className="p-4 md:p-6 max-w-6xl mx-auto space-y-6">
      <div className="text-center md:text-left space-y-2">
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Admissions & School Hub</h1>
        <p className="text-sm md:text-base text-gray-400">
          Inspect live application sessions, upfront fee transparency ($0, local vouchers, or waivers), and official portals worldwide.
        </p>
      </div>

      <div className="relative">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search universities worldwide (e.g. Harvard, Oxford, Legon, Minnesota, Toronto)..."
          className="w-full bg-[#121929] border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        {loading && (
          <span className="absolute right-4 top-3.5 text-xs text-blue-400 font-semibold animate-pulse">
            Searching...
          </span>
        )}
      </div>

      <div className="flex flex-wrap gap-2 items-center justify-between">
        <div className="flex flex-wrap gap-2">
          {['All', 'USA', 'Canada', 'Ghana', 'Europe / Global'].map((region) => (
            <button
              key={region}
              onClick={() => setSelectedRegion(region)}
              className={`px-4 py-1.5 rounded-full text-xs md:text-sm font-medium transition ${
                selectedRegion === region
                  ? 'bg-blue-600 text-white shadow-lg'
                  : 'bg-[#182338] text-gray-300 hover:bg-[#202e49]'
              }`}
            >
              {region}
            </button>
          ))}
        </div>
        {statusText && <span className="text-xs text-gray-400">{statusText}</span>}
      </div>

      <div className="text-xs uppercase tracking-wider text-gray-400 font-semibold">
        MATCHING INSTITUTIONS ({filtered.length})
      </div>

      <div className="space-y-4">
        {filtered.length === 0 ? (
          <div className="bg-[#0f172a] border border-gray-800 rounded-2xl p-8 text-center text-gray-400">
            No matching institutions found for "{searchQuery}". Try another keyword or check region filters.
          </div>
        ) : (
          filtered.map((school, idx) => (
            <div
              key={`${school.name}-${idx}`}
              className="bg-[#0d1527] border border-gray-800/80 rounded-2xl p-5 hover:border-blue-500/50 transition flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              <div className="space-y-1">
                <div className="text-xs text-blue-400 flex items-center gap-1">
                  <span>🌐</span>
                  <span>{school.stateProvince ? `${school.stateProvince}, ` : ''}{school.country}</span>
                </div>
                <h2 className="text-lg md:text-xl font-bold text-white">{school.name}</h2>
                <p className="text-xs text-gray-400">{school.type}</p>
                {school.feeBadge && (
                  <span className="inline-block mt-2 text-[11px] bg-green-500/10 text-green-400 border border-green-500/30 px-2.5 py-0.5 rounded-full font-medium">
                    {school.feeBadge}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-3">
                <a
                  href={school.webPage}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full md:w-auto text-center px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs md:text-sm font-semibold rounded-xl transition shadow-md"
                >
                  Official Application Portal ↗
                </a>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
