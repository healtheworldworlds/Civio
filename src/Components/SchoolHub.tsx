import React, { useState } from 'react';
import { 
  GraduationCap, 
  Search, 
  DollarSign, 
  CheckCircle2, 
  Clock, 
  ExternalLink, 
  FileText, 
  Globe2, 
  BookOpen, 
  AlertCircle 
} from 'lucide-react';

interface School {
  id: string;
  name: string;
  location: string;
  region: 'USA' | 'Canada' | 'Ghana' | 'Europe / Global';
  type: string;
  sessionStatus: 'Active Now' | 'Opening Soon' | 'Closed';
  activeIntake: string;
  appFee: {
    status: 'No Fee ($0)' | 'Fee Waiver Available' | 'Paid';
    amount: string;
    badgeColor: string;
  };
  tuitionModel: string;
  requirements: {
    academic: string;
    englishTest: string;
    requiredDocs: string[];
  };
  popularPrograms: string[];
  portalUrl: string;
}

const UNIVERSITIES_DATABASE: School[] = [
  {
    id: 'berea',
    name: 'Berea College',
    location: 'Kentucky, United States',
    region: 'USA',
    type: 'Private Liberal Arts College',
    sessionStatus: 'Active Now',
    activeIntake: 'Fall Regular Decision',
    appFee: {
      status: 'No Fee ($0)',
      amount: '$0 Application Fee (100% Free to apply)',
      badgeColor: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
    },
    tuitionModel: 'No-Tuition Promise (100% funding for all admitted students)',
    requirements: {
      academic: 'High school graduation (WASSCE / A-Levels / High School Diploma) in top academic tier',
      englishTest: 'Duolingo English Test (105+), IELTS (6.5), or TOEFL accepted',
      requiredDocs: ['Official Transcripts', '2 Teacher Recommendation Letters', 'Financial Eligibility Statement', 'Personal Statement']
    },
    popularPrograms: ['Computer Science', 'Business Administration', 'Engineering Dual Degree'],
    portalUrl: 'https://www.berea.edu/admissions/apply'
  },
  {
    id: 'knust',
    name: 'Kwame Nkrumah University of Science and Technology',
    location: 'Kumasi, Ghana',
    region: 'Ghana',
    type: 'Public Research University',
    sessionStatus: 'Active Now',
    activeIntake: 'Undergraduate & Postgraduate cohorts',
    appFee: {
      status: 'Paid',
      amount: 'GHS 290 E-Voucher (Domestic) / $150 (International)',
      badgeColor: 'bg-amber-500/10 text-amber-400 border-amber-500/20'
    },
    tuitionModel: 'Subsidized Government Fees / Mastercard Foundation Partner',
    requirements: {
      academic: 'WASSCE aggregate 24 or better across 3 core subjects & 3 electives',
      englishTest: 'Waived for West African English applicants',
      requiredDocs: ['WASSCE Results Slip', 'Biometric passport photo', 'Birth Certificate']
    },
    popularPrograms: ['Computer Science & Engineering', 'Business Administration (HRM/Finance)', 'Biological Sciences'],
    portalUrl: 'https://apps.knust.edu.gh/admissions/'
  },
  {
    id: 'uopeople',
    name: 'University of the People',
    location: 'Pasadena, CA (100% Online)',
    region: 'Europe / Global',
    type: 'Accredited Online American University',
    sessionStatus: 'Active Now',
    activeIntake: 'Rolling Admissions (5 terms/year)',
    appFee: {
      status: 'No Fee ($0)',
      amount: '$60 Processing Fee (Assessment fee grants widely available)',
      badgeColor: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
    },
    tuitionModel: 'Tuition-Free (Exam assessment grants available)',
    requirements: {
      academic: 'High school completion certificate (WASSCE, GED, or equivalent)',
      englishTest: 'Waived if secondary schooling was instructed in English',
      requiredDocs: ['High School Transcript / Certificate', 'Valid Government Photo ID']
    },
    popularPrograms: ['Computer Science (AS/BS)', 'Business Administration (BS/MBA)', 'Health Science'],
    portalUrl: 'https://www.uopeople.edu/apply/'
  },
  {
    id: 'ashesi',
    name: 'Ashesi University',
    location: 'Berekuso, Ghana',
    region: 'Ghana',
    type: 'Private Non-Profit University',
    sessionStatus: 'Active Now',
    activeIntake: 'Annual Fall Cohort',
    appFee: {
      status: 'Fee Waiver Available',
      amount: 'GHS 200 / Free with scholarship need application',
      badgeColor: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20'
    },
    tuitionModel: 'Comprehensive Need-based Scholarships (Mastercard Fdn Partner)',
    requirements: {
      academic: 'WASSCE passes in 6 subjects or IGCSE / A-Levels',
      englishTest: 'Waived for English-medium secondary schooling',
      requiredDocs: ['High School Transcripts', 'Personal Leadership Essay', 'Parent / Guardian Financial Statement']
    },
    popularPrograms: ['Computer Science', 'Management Information Systems', 'Business Administration'],
    portalUrl: 'https://www.ashesi.edu.gh/admissions/'
  },
  {
    id: 'alberta',
    name: 'University of Alberta',
    location: 'Edmonton, Canada',
    region: 'Canada',
    type: 'Public Research University',
    sessionStatus: 'Active Now',
    activeIntake: 'Fall Admissions Window',
    appFee: {
      status: 'Fee Waiver Available',
      amount: '$125 CAD (Waiver eligible for partner countries & hardship)',
      badgeColor: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20'
    },
    tuitionModel: 'International Student Entrance Scholarships (up to $20,000)',
    requirements: {
      academic: 'High school graduation with competitive scores in 5 Grade 12 subjects',
      englishTest: 'IELTS / TOEFL / Duolingo or verified English waiver eligibility',
      requiredDocs: ['Official Transcripts', 'English Proficiency Proof (if applicable)', 'Prerequisite courses']
    },
    popularPrograms: ['Computing Science', 'Engineering', 'Commerce / Economics'],
    portalUrl: 'https://www.ualberta.ca/admissions/international/'
  }
];

export default function SchoolHub() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSchool, setSelectedSchool] = useState<School>(UNIVERSITIES_DATABASE[0]);
  const [selectedRegion, setSelectedRegion] = useState<string>('All');
  const [filterFee, setFilterFee] = useState<'All' | 'No Fee ($0)' | 'Fee Waiver Available'>('All');

  const filteredSchools = UNIVERSITIES_DATABASE.filter(school => {
    const matchesSearch = 
      school.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      school.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
      school.popularPrograms.some(p => p.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesRegion = selectedRegion === 'All' || school.region === selectedRegion;
    const matchesFee = filterFee === 'All' ? true : school.appFee.status === filterFee;
    return matchesSearch && matchesRegion && matchesFee;
  });

  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-8 space-y-8">
      {/* Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-slate-800 p-6 sm:p-8 shadow-xl">
        <div className="max-w-2xl space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold">
            <GraduationCap className="w-3.5 h-3.5" /> Admissions & Application Intelligence
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
            University Admissions & Fee Dossier
          </h1>
          <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
            Inspect live application sessions, upfront fee transparency ($0, local vouchers, or waivers), WASSCE cutoffs, and document checklists.
          </p>
        </div>
      </div>

      {/* Search, Region & Fee Filters */}
      <div className="space-y-3">
        <div className="relative w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search universities, programs, or locations (e.g. Computer Science, Berea, Kumasi)..."
            className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          />
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap gap-1.5">
            {['All', 'USA', 'Canada', 'Ghana', 'Europe / Global'].map(region => (
              <button
                key={region}
                onClick={() => setSelectedRegion(region)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                  selectedRegion === region
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
                }`}
              >
                {region}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-1.5">
            {(['All', 'No Fee ($0)', 'Fee Waiver Available'] as const).map(fee => (
              <button
                key={fee}
                onClick={() => setFilterFee(fee)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                  filterFee === fee
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
                }`}
              >
                {fee}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Two-Column Explorer */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: List */}
        <div className="lg:col-span-5 space-y-3">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 px-1">
            Matching Institutions ({filteredSchools.length})
          </h2>
          {filteredSchools.map((school) => {
            const isSelected = selectedSchool?.id === school.id;
            return (
              <div
                key={school.id}
                onClick={() => setSelectedSchool(school)}
                className={`p-4 rounded-xl border cursor-pointer transition flex flex-col justify-between ${
                  isSelected
                    ? 'bg-slate-800/90 border-indigo-500/80 ring-1 ring-indigo-500/50'
                    : 'bg-slate-900 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="text-sm font-bold text-white">{school.name}</h3>
                    <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                      <Globe2 className="w-3 h-3 text-slate-500" /> {school.location}
                    </p>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border whitespace-nowrap ${school.appFee.badgeColor}`}>
                    {school.appFee.status}
                  </span>
                </div>

                <div className="mt-3 flex items-center justify-between text-xs text-slate-400 border-t border-slate-800/60 pt-2.5">
                  <span className="flex items-center gap-1 text-emerald-400 font-medium">
                    ● {school.sessionStatus}
                  </span>
                  <span className="text-indigo-400 font-semibold">View Requirements →</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Right Column: Detail Dossier */}
        <div className="lg:col-span-7">
          {selectedSchool ? (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-6 shadow-xl sticky top-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
                <div>
                  <div className="inline-flex items-center gap-1.5 text-xs text-indigo-400 font-medium">
                    <Globe2 className="w-3.5 h-3.5" /> {selectedSchool.location}
                  </div>
                  <h2 className="text-2xl font-black text-white mt-1">{selectedSchool.name}</h2>
                  <p className="text-xs text-slate-400 mt-0.5">{selectedSchool.type}</p>
                </div>
                <a
                  href={selectedSchool.portalUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs px-4 py-2.5 rounded-xl shadow transition"
                >
                  <span>Official Application Portal</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>

              {/* Fee Transparency Box */}
              <div className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-4 flex items-center gap-4">
                <div className="p-3 bg-indigo-500/10 rounded-xl text-indigo-400">
                  <DollarSign className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Application Fee</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-sm sm:text-base font-bold text-white">{selectedSchool.appFee.amount}</span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${selectedSchool.appFee.badgeColor}`}>
                      {selectedSchool.appFee.status}
                    </span>
                  </div>
                </div>
              </div>

              {/* Timeline & Tuition */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-slate-950/40 border border-slate-800/80 rounded-xl p-4">
                  <div className="flex items-center gap-2 text-slate-400 text-xs font-semibold">
                    <Clock className="w-3.5 h-3.5 text-amber-400" /> Intake & Status
                  </div>
                  <p className="text-sm font-semibold text-slate-200 mt-1">{selectedSchool.sessionStatus}: {selectedSchool.activeIntake}</p>
                </div>

                <div className="bg-slate-950/40 border border-slate-800/80 rounded-xl p-4">
                  <div className="flex items-center gap-2 text-slate-400 text-xs font-semibold">
                    <BookOpen className="w-3.5 h-3.5 text-indigo-400" /> Tuition & Aid
                  </div>
                  <p className="text-sm font-semibold text-slate-200 mt-1">{selectedSchool.tuitionModel}</p>
                </div>
              </div>

              {/* Admission Criteria */}
              <div className="space-y-3">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <FileText className="w-4 h-4 text-indigo-400" /> Admission Requirements & Eligibility
                </h3>
                
                <div className="space-y-2 text-xs text-slate-300 bg-slate-950/40 border border-slate-800/80 rounded-xl p-4">
                  <div>
                    <span className="font-semibold text-slate-400">Academic Standard: </span>
                    <span>{selectedSchool.requirements.academic}</span>
                  </div>
                  <div>
                    <span className="font-semibold text-slate-400">English Testing Policy: </span>
                    <span>{selectedSchool.requirements.englishTest}</span>
                  </div>
                </div>
              </div>

              {/* Checklist */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Required Application Documents</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {selectedSchool.requirements.requiredDocs.map((doc, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-xs text-slate-300 bg-slate-950/30 border border-slate-800/60 p-2.5 rounded-lg">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                      <span>{doc}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Programs */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Featured Degree Programs</h4>
                <div className="flex flex-wrap gap-2">
                  {selectedSchool.popularPrograms.map((prog, idx) => (
                    <span key={idx} className="text-xs bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 px-3 py-1 rounded-lg">
                      {prog}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center text-slate-400">
              <AlertCircle className="w-8 h-8 mx-auto text-slate-500 mb-2" />
              <p>Select a university to inspect its admissions requirements.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
