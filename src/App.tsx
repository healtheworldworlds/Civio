import React, { useState, useEffect } from 'react'
import { Landmark, Search, PlusCircle, CheckCircle2, Users, Loader2, X, Filter, LogIn, LogOut, User, Trash2, Vote, MessageSquare, Edit3, Check } from 'lucide-react'
import { supabase } from './lib/supabase'

interface Initiative {
  id: string
  created_at: string
  title: string
  description: string
  category: string
  endorsements_count: number
  volunteers_count: number
  author_email?: string
}

interface Poll {
  id: string
  created_at: string
  question: string
  category: string
  author_email: string
  option_a: string
  votes_a: number
  option_b: string
  votes_b: number
}

interface Comment {
  id: string
  created_at: string
  initiative_id: string
  author_email: string
  content: string
}

export default function App() {
  const [sectionView, setSectionView] = useState<'initiatives' | 'polls'>('initiatives')
  const [activeTab, setActiveTab] = useState<string>('All')
  const [searchQuery, setSearchQuery] = useState<string>('')
  const [initiatives, setInitiatives] = useState<Initiative[]>([])
  const [polls, setPolls] = useState<Poll[]>([])
  const [comments, setComments] = useState<Comment[]>([])
  const [userVotes, setUserVotes] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState<boolean>(true)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  // Auth state
  const [user, setUser] = useState<any>(null)
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false)
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin')
  const [authEmail, setAuthEmail] = useState('')
  const [authPassword, setAuthPassword] = useState('')
  const [authLoading, setAuthLoading] = useState(false)
  const [authMessage, setAuthMessage] = useState<string | null>(null)

  // Initiative Modal & Form
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [editingInitiativeId, setEditingInitiativeId] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'Education',
  })

  // Poll Form Modal
  const [isPollModalOpen, setIsPollModalOpen] = useState(false)
  const [pollFormData, setPollFormData] = useState({
    question: '',
    category: 'Public Policy',
    option_a: '',
    option_b: '',
  })

  // Comments State
  const [expandedComments, setExpandedComments] = useState<Record<string, boolean>>({})
  const [newCommentText, setNewCommentText] = useState<Record<string, string>>({})
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null)
  const [editingCommentText, setEditingCommentText] = useState('')

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      const currentUser = session?.user ?? null
      setUser(currentUser)
      fetchData(currentUser?.email)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      const currentUser = session?.user ?? null
      setUser(currentUser)
      fetchData(currentUser?.email)
    })

    return () => subscription.unsubscribe()
  }, [])

  async function fetchData(currentUserEmail?: string) {
    setLoading(true)
    setErrorMsg(null)

    const [initRes, pollRes, commentRes] = await Promise.all([
      supabase.from('initiatives').select('*').order('created_at', { ascending: false }),
      supabase.from('polls').select('*').order('created_at', { ascending: false }),
      supabase.from('initiative_comments').select('*').order('created_at', { ascending: true })
    ])

    if (initRes.error) {
      console.error('Error initiatives:', initRes.error)
      setErrorMsg(initRes.error.message)
    } else {
      setInitiatives(initRes.data || [])
    }

    if (pollRes.data) setPolls(pollRes.data)
    if (commentRes.data) setComments(commentRes.data)

    if (currentUserEmail) {
      const { data: voteData } = await supabase
        .from('poll_votes')
        .select('poll_id, selected_option')
        .eq('user_email', currentUserEmail)

      if (voteData) {
        const votesMap: Record<string, string> = {}
        voteData.forEach(v => { votesMap[v.poll_id] = v.selected_option })
        setUserVotes(votesMap)
      }
    } else {
      setUserVotes({})
    }

    setLoading(false)
  }

  async function handleAuth(e: React.FormEvent) {
    e.preventDefault()
    setAuthLoading(true)
    setAuthMessage(null)

    if (authMode === 'signup') {
      const { error } = await supabase.auth.signUp({
        email: authEmail,
        password: authPassword,
      })
      if (error) setAuthMessage(error.message)
      else setAuthMessage('Account created! You can now sign in.')
    } else {
      const { error } = await supabase.auth.signInWithPassword({
        email: authEmail,
        password: authPassword,
      })
      if (error) setAuthMessage(error.message)
      else {
        setIsAuthModalOpen(false)
        setAuthEmail('')
        setAuthPassword('')
      }
    }
    setAuthLoading(false)
  }

  async function handleSignOut() {
    await supabase.auth.signOut()
    setUser(null)
    setUserVotes({})
  }

  // --- Initiatives CRUD ---
  async function handleCreateOrEditInitiative(e: React.FormEvent) {
    e.preventDefault()
    if (!formData.title.trim() || !formData.description.trim()) return
    setIsSubmitting(true)

    if (editingInitiativeId) {
      const { data, error } = await supabase
        .from('initiatives')
        .update({
          title: formData.title.trim(),
          description: formData.description.trim(),
          category: formData.category,
        })
        .eq('id', editingInitiativeId)
        .select()

      if (error) {
        alert(`Error editing: ${error.message}`)
      } else if (data) {
        setInitiatives(prev => prev.map(item => item.id === editingInitiativeId ? data[0] : item))
        setIsModalOpen(false)
        setEditingInitiativeId(null)
      }
    } else {
      const { data, error } = await supabase
        .from('initiatives')
        .insert([
          {
            title: formData.title.trim(),
            description: formData.description.trim(),
            category: formData.category,
            endorsements_count: 0,
            volunteers_count: 0,
            author_email: user?.email || 'Anonymous',
          },
        ])
        .select()

      if (error) {
        alert(`Error creating: ${error.message}`)
      } else if (data) {
        setInitiatives(prev => [data[0], ...prev])
        setIsModalOpen(false)
      }
    }

    setFormData({ title: '', description: '', category: 'Education' })
    setIsSubmitting(false)
  }

  function startEditInitiative(item: Initiative) {
    setEditingInitiativeId(item.id)
    setFormData({
      title: item.title,
      description: item.description,
      category: item.category,
    })
    setIsModalOpen(true)
  }

  async function handleDeleteInitiative(id: string) {
    if (!confirm('Are you sure you want to delete this civic initiative?')) return
    const { error } = await supabase.from('initiatives').delete().eq('id', id)
    if (error) alert(`Could not delete: ${error.message}`)
    else setInitiatives(prev => prev.filter(item => item.id !== id))
  }

  async function handleEndorse(id: string, currentCount: number) {
    const { error } = await supabase
      .from('initiatives')
      .update({ endorsements_count: currentCount + 1 })
      .eq('id', id)

    if (!error) {
      setInitiatives(prev => prev.map(item => item.id === id ? { ...item, endorsements_count: item.endorsements_count + 1 } : item))
    }
  }

  async function handleVolunteer(id: string, currentCount: number) {
    const { error } = await supabase
      .from('initiatives')
      .update({ volunteers_count: currentCount + 1 })
      .eq('id', id)

    if (!error) {
      setInitiatives(prev => prev.map(item => item.id === id ? { ...item, volunteers_count: item.volunteers_count + 1 } : item))
    }
  }

  // --- Comments CRUD ---
  async function handleAddComment(initiativeId: string) {
    if (!user) {
      setIsAuthModalOpen(true)
      return
    }
    const text = newCommentText[initiativeId]?.trim()
    if (!text) return

    const { data, error } = await supabase
      .from('initiative_comments')
      .insert([{ initiative_id: initiativeId, author_email: user.email, content: text }])
      .select()

    if (error) {
      alert(`Comment failed: ${error.message}`)
    } else if (data) {
      setComments(prev => [...prev, data[0]])
      setNewCommentText(prev => ({ ...prev, [initiativeId]: '' }))
    }
  }

  async function handleUpdateComment(commentId: string) {
    if (!editingCommentText.trim()) return
    const { error } = await supabase
      .from('initiative_comments')
      .update({ content: editingCommentText.trim() })
      .eq('id', commentId)

    if (error) {
      alert(`Update failed: ${error.message}`)
    } else {
      setComments(prev => prev.map(c => c.id === commentId ? { ...c, content: editingCommentText.trim() } : c))
      setEditingCommentId(null)
      setEditingCommentText('')
    }
  }

  async function handleDeleteComment(commentId: string) {
    if (!confirm('Delete this comment?')) return
    const { error } = await supabase.from('initiative_comments').delete().eq('id', commentId)
    if (error) alert(`Could not delete: ${error.message}`)
    else setComments(prev => prev.filter(c => c.id !== commentId))
  }

  // --- Polls & Vote-Locking ---
  async function handleVotePoll(pollId: string, option: 'a' | 'b', currentCount: number) {
    if (!user) {
      setIsAuthModalOpen(true)
      return
    }
    if (userVotes[pollId]) {
      alert('You have already voted on this civic poll!')
      return
    }

    const { error: voteErr } = await supabase.from('poll_votes').insert([{
      poll_id: pollId,
      user_email: user.email,
      selected_option: option,
    }])

    if (voteErr) {
      alert(`Vote record failed: ${voteErr.message}`)
      return
    }

    const updatePayload = option === 'a' ? { votes_a: currentCount + 1 } : { votes_b: currentCount + 1 }
    await supabase.from('polls').update(updatePayload).eq('id', pollId)

    setUserVotes(prev => ({ ...prev, [pollId]: option }))
    setPolls(prev =>
      prev.map(p =>
        p.id === pollId
          ? { ...p, votes_a: option === 'a' ? p.votes_a + 1 : p.votes_a, votes_b: option === 'b' ? p.votes_b + 1 : p.votes_b }
          : p
      )
    )
  }

  async function handleCreatePoll(e: React.FormEvent) {
    e.preventDefault()
    if (!pollFormData.question.trim() || !pollFormData.option_a.trim() || !pollFormData.option_b.trim()) return
    setIsSubmitting(true)

    const { data, error } = await supabase.from('polls').insert([{
      question: pollFormData.question.trim(),
      category: pollFormData.category,
      author_email: user?.email || 'Anonymous',
      option_a: pollFormData.option_a.trim(),
      votes_a: 0,
      option_b: pollFormData.option_b.trim(),
      votes_b: 0,
    }]).select()

    if (error) {
      alert(`Poll creation failed: ${error.message}`)
    } else if (data) {
      setPolls(prev => [data[0], ...prev])
      setPollFormData({ question: '', category: 'Public Policy', option_a: '', option_b: '' })
      setIsPollModalOpen(false)
    }
    setIsSubmitting(false)
  }

  const filteredInitiatives = initiatives.filter(item => {
    const matchesCategory = activeTab === 'All' || item.category.toLowerCase() === activeTab.toLowerCase()
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          item.description.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesCategory && matchesSearch
  })

  const filteredPolls = polls.filter(item => {
    const matchesCategory = activeTab === 'All' || item.category.toLowerCase() === activeTab.toLowerCase()
    const matchesSearch = item.question.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesCategory && matchesSearch
  })

  const categories = ['All', 'Education', 'Public Policy', 'Environment', 'Community']

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-900/60 backdrop-blur sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-indigo-600 rounded-lg text-white">
                <Landmark className="w-5 h-5" />
              </div>
              <span className="font-bold text-xl tracking-tight text-white">Civio</span>
            </div>

            <nav className="flex items-center bg-slate-900 border border-slate-800 rounded-lg p-1">
              <button
                onClick={() => setSectionView('initiatives')}
                className={`px-3 py-1 text-xs font-semibold rounded-md transition cursor-pointer ${
                  sectionView === 'initiatives' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'
                }`}
              >
                Initiatives
              </button>
              <button
                onClick={() => setSectionView('polls')}
                className={`px-3 py-1 text-xs font-semibold rounded-md flex items-center gap-1.5 transition cursor-pointer ${
                  sectionView === 'polls' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'
                }`}
              >
                <Vote className="w-3.5 h-3.5" />
                <span>Civic Polls</span>
              </button>
            </nav>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative hidden md:block">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input 
                type="text" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search..." 
                className="bg-slate-900 border border-slate-750 text-sm rounded-full pl-9 pr-4 py-1.5 focus:outline-none focus:border-indigo-500 text-slate-200 placeholder-slate-500 w-56"
              />
            </div>

            {user ? (
              <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs">
                <User className="w-3.5 h-3.5 text-indigo-400" />
                <span className="text-slate-300 font-medium truncate max-w-[120px]">{user.email}</span>
                <button 
                  onClick={handleSignOut} 
                  title="Sign Out" 
                  className="text-slate-400 hover:text-rose-400 transition cursor-pointer ml-1"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <button 
                onClick={() => setIsAuthModalOpen(true)}
                className="text-slate-300 hover:text-white border border-slate-750 hover:border-slate-600 bg-slate-900 text-xs font-semibold px-3 py-2 rounded-lg flex items-center gap-1.5 transition cursor-pointer"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Sign In</span>
              </button>
            )}

            <button 
              onClick={() => {
                if (!user) {
                  setIsAuthModalOpen(true)
                } else {
                  if (sectionView === 'initiatives') {
                    setEditingInitiativeId(null)
                    setFormData({ title: '', description: '', category: 'Education' })
                    setIsModalOpen(true)
                  } else {
                    setIsPollModalOpen(true)
                  }
                }
              }}
              className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold px-3.5 py-2 rounded-lg flex items-center gap-1.5 transition cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              <span>{sectionView === 'initiatives' ? 'New Action' : 'Create Poll'}</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-6xl mx-auto px-4 py-8 flex-1 w-full grid grid-cols-1 md:grid-cols-3 gap-8">
        <section className="md:col-span-2 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
            <div>
              <h1 className="text-2xl font-bold text-white">
                {sectionView === 'initiatives' ? 'Civic Engagement Feed' : 'Active Community Polls'}
              </h1>
              <p className="text-sm text-slate-400">
                {sectionView === 'initiatives' ? 'Discover, support, and discuss local initiatives' : 'One person, one vote. Shape town policies.'}
              </p>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveTab(cat)}
                  className={`px-3 py-1 text-xs font-medium rounded-full transition cursor-pointer ${
                    activeTab === cat
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-slate-200'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {loading && (
            <div className="flex items-center justify-center p-12 text-slate-400 gap-2">
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Loading civic data...</span>
            </div>
          )}

          {errorMsg && (
            <div className="bg-rose-950/40 border border-rose-800 text-rose-300 p-4 rounded-xl text-sm">
              Failed to load records: {errorMsg}
            </div>
          )}

          {/* INITIATIVES SECTION */}
          {sectionView === 'initiatives' && !loading && !errorMsg && (
            <>
              {filteredInitiatives.length === 0 && (
                <div className="text-center py-12 bg-slate-900/30 border border-slate-800 rounded-xl">
                  <Filter className="w-8 h-8 text-slate-500 mx-auto mb-2" />
                  <p className="text-slate-300 font-medium">No initiatives found</p>
                  <p className="text-xs text-slate-500 mt-1">Try selecting another category or clear your search.</p>
                </div>
              )}

              {filteredInitiatives.map((initiative) => {
                const isAuthor = user && initiative.author_email === user.email
                const initiativeComments = comments.filter(c => c.initiative_id === initiative.id)
                const isCommentBoxOpen = expandedComments[initiative.id]

                return (
                  <div 
                    key={initiative.id} 
                    className="bg-slate-900/50 border border-slate-800 rounded-xl p-5 hover:border-slate-700 transition space-y-4"
                  >
                    <div className="flex items-center justify-between text-xs text-slate-400">
                      <span className="bg-indigo-950 text-indigo-300 px-2.5 py-0.5 rounded border border-indigo-800 font-medium">
                        {initiative.category}
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="text-slate-500">By {initiative.author_email || 'Anonymous'}</span>
                        <span>•</span>
                        <span>{new Date(initiative.created_at).toLocaleDateString()}</span>
                        {isAuthor && (
                          <div className="flex items-center gap-1 ml-2">
                            <button
                              onClick={() => startEditInitiative(initiative)}
                              title="Edit Initiative"
                              className="text-slate-500 hover:text-indigo-400 transition cursor-pointer p-1"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteInitiative(initiative.id)}
                              title="Delete Initiative"
                              className="text-slate-500 hover:text-rose-400 transition cursor-pointer p-1"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    <div>
                      <h2 className="text-lg font-semibold text-slate-100">{initiative.title}</h2>
                      <p className="text-sm text-slate-400 mt-1 leading-relaxed">
                        {initiative.description}
                      </p>
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t border-slate-800/80 text-xs text-slate-400">
                      <div className="flex items-center gap-4">
                        <button 
                          onClick={() => handleEndorse(initiative.id, initiative.endorsements_count)}
                          className="flex items-center gap-1.5 text-emerald-400 hover:text-emerald-300 transition cursor-pointer"
                        >
                          <CheckCircle2 className="w-4 h-4" /> {initiative.endorsements_count} Endorsements
                        </button>
                        <span className="flex items-center gap-1.5">
                          <Users className="w-4 h-4" /> {initiative.volunteers_count} Volunteers
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <button 
                          onClick={() => setExpandedComments(prev => ({ ...prev, [initiative.id]: !prev[initiative.id] }))}
                          className="flex items-center gap-1.5 text-slate-400 hover:text-indigo-300 transition cursor-pointer"
                        >
                          <MessageSquare className="w-3.5 h-3.5" />
                          <span>{initiativeComments.length} Comments</span>
                        </button>
                        <button 
                          onClick={() => handleVolunteer(initiative.id, initiative.volunteers_count)}
                          className="text-indigo-400 hover:text-indigo-300 font-medium transition cursor-pointer"
                        >
                          Join &rarr;
                        </button>
                      </div>
                    </div>

                    {/* COMMENTS THREAD */}
                    {isCommentBoxOpen && (
                      <div className="mt-4 pt-4 border-t border-slate-800/60 space-y-3 bg-slate-950/40 p-4 rounded-lg">
                        <h4 className="text-xs font-semibold text-slate-300">Community Discussion</h4>

                        {initiativeComments.length === 0 ? (
                          <p className="text-xs text-slate-500 italic">No comments yet. Start the conversation!</p>
                        ) : (
                          <div className="space-y-2">
                            {initiativeComments.map(c => {
                              const isCommentAuthor = user && c.author_email === user.email
                              return (
                                <div key={c.id} className="bg-slate-900/70 border border-slate-800/80 rounded-md p-2.5 text-xs">
                                  <div className="flex items-center justify-between text-slate-400 mb-1">
                                    <span className="font-medium text-slate-300">{c.author_email}</span>
                                    <div className="flex items-center gap-2">
                                      <span className="text-[10px] text-slate-500">{new Date(c.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                      {isCommentAuthor && (
                                        <div className="flex items-center gap-1">
                                          <button
                                            onClick={() => {
                                              setEditingCommentId(c.id)
                                              setEditingCommentText(c.content)
                                            }}
                                            className="text-slate-500 hover:text-indigo-300"
                                            title="Edit comment"
                                          >
                                            <Edit3 className="w-3 h-3" />
                                          </button>
                                          <button
                                            onClick={() => handleDeleteComment(c.id)}
                                            className="text-slate-500 hover:text-rose-400"
                                            title="Delete comment"
                                          >
                                            <Trash2 className="w-3 h-3" />
                                          </button>
                                        </div>
                                      )}
                                    </div>
                                  </div>

                                  {editingCommentId === c.id ? (
                                    <div className="flex gap-2 mt-2">
                                      <input
                                        type="text"
                                        value={editingCommentText}
                                        onChange={(e) => setEditingCommentText(e.target.value)}
                                        className="flex-1 bg-slate-950 border border-slate-750 rounded px-2 py-1 text-xs text-slate-200"
                                      />
                                      <button 
                                        onClick={() => handleUpdateComment(c.id)}
                                        className="bg-indigo-600 hover:bg-indigo-500 text-white px-2 py-1 rounded text-xs"
                                      >
                                        Save
                                      </button>
                                      <button 
                                        onClick={() => setEditingCommentId(null)}
                                        className="text-slate-400 hover:text-white px-2 py-1 text-xs"
                                      >
                                        Cancel
                                      </button>
                                    </div>
                                  ) : (
                                    <p className="text-slate-300 leading-relaxed">{c.content}</p>
                                  )}
                                </div>
                              )
                            })}
                          </div>
                        )}

                        {/* Add Comment Input */}
                        <div className="flex gap-2 pt-2">
                          <input
                            type="text"
                            placeholder={user ? "Write a civic comment..." : "Sign in to leave a comment..."}
                            value={newCommentText[initiative.id] || ''}
                            onChange={(e) => setNewCommentText(prev => ({ ...prev, [initiative.id]: e.target.value }))}
                            onKeyDown={(e) => { if (e.key === 'Enter') handleAddComment(initiative.id) }}
                            className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 placeholder-slate-600"
                          />
                          <button
                            onClick={() => handleAddComment(initiative.id)}
                            className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs px-3 py-1.5 rounded-lg font-medium transition cursor-pointer"
                          >
                            Post
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}
            </>
          )}

          {/* POLLS SECTION */}
          {sectionView === 'polls' && !loading && !errorMsg && (
            <div className="space-y-4">
              {filteredPolls.length === 0 && (
                <div className="text-center py-12 bg-slate-900/30 border border-slate-800 rounded-xl">
                  <Vote className="w-8 h-8 text-slate-500 mx-auto mb-2" />
                  <p className="text-slate-300 font-medium">No polls found</p>
                  <p className="text-xs text-slate-500 mt-1">Be the first to create a civic poll for the community.</p>
                </div>
              )}

              {filteredPolls.map((poll) => {
                const totalVotes = poll.votes_a + poll.votes_b
                const pctA = totalVotes > 0 ? Math.round((poll.votes_a / totalVotes) * 100) : 0
                const pctB = totalVotes > 0 ? Math.round((poll.votes_b / totalVotes) * 100) : 0
                const userChoice = userVotes[poll.id]

                return (
                  <div key={poll.id} className="bg-slate-900/50 border border-slate-800 rounded-xl p-5 space-y-4">
                    <div className="flex items-center justify-between text-xs text-slate-400">
                      <span className="bg-indigo-950 text-indigo-300 px-2.5 py-0.5 rounded border border-indigo-800 font-medium">
                        {poll.category}
                      </span>
                      <div className="flex items-center gap-2">
                        {userChoice && (
                          <span className="text-emerald-400 flex items-center gap-1 font-semibold">
                            <Check className="w-3 h-3" /> Voted
                          </span>
                        )}
                        <span>{totalVotes} Total Votes</span>
                      </div>
                    </div>

                    <h2 className="text-base font-semibold text-slate-100">{poll.question}</h2>

                    <div className="space-y-3">
                      {/* Option A */}
                      <button
                        disabled={!!userChoice}
                        onClick={() => handleVotePoll(poll.id, 'a', poll.votes_a)}
                        className={`w-full text-left bg-slate-950 border rounded-lg p-3 transition group relative overflow-hidden ${
                          userChoice === 'a' ? 'border-emerald-500 ring-1 ring-emerald-500/50' : 'border-slate-800 hover:border-indigo-600'
                        } ${userChoice ? 'cursor-default' : 'cursor-pointer'}`}
                      >
                        <div 
                          className="absolute inset-y-0 left-0 bg-indigo-950/60 transition-all duration-500 pointer-events-none"
                          style={{ width: `${pctA}%` }}
                        />
                        <div className="relative flex justify-between items-center text-xs">
                          <span className="font-medium text-slate-200">
                            {poll.option_a} {userChoice === 'a' && '? (Your vote)'}
                          </span>
                          <span className="font-bold text-slate-400">
                            {poll.votes_a} ({pctA}%)
                          </span>
                        </div>
                      </button>

                      {/* Option B */}
                      <button
                        disabled={!!userChoice}
                        onClick={() => handleVotePoll(poll.id, 'b', poll.votes_b)}
                        className={`w-full text-left bg-slate-950 border rounded-lg p-3 transition group relative overflow-hidden ${
                          userChoice === 'b' ? 'border-emerald-500 ring-1 ring-emerald-500/50' : 'border-slate-800 hover:border-indigo-600'
                        } ${userChoice ? 'cursor-default' : 'cursor-pointer'}`}
                      >
                        <div 
                          className="absolute inset-y-0 left-0 bg-indigo-950/60 transition-all duration-500 pointer-events-none"
                          style={{ width: `${pctB}%` }}
                        />
                        <div className="relative flex justify-between items-center text-xs">
                          <span className="font-medium text-slate-200">
                            {poll.option_b} {userChoice === 'b' && '? (Your vote)'}
                          </span>
                          <span className="font-bold text-slate-400">
                            {poll.votes_b} ({pctB}%)
                          </span>
                        </div>
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </section>

        {/* Sidebar */}
        <aside className="space-y-6">
          <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-5">
            <h3 className="font-semibold text-white mb-2">Civio Engine</h3>
            <p className="text-xs text-emerald-400 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span> Live Database Active
            </p>
            <p className="text-xs text-slate-500 mt-2">
              Voting duplicates protected. Discussions & post editing enabled.
            </p>
          </div>
        </aside>
      </main>

      {/* Auth Modal */}
      {isAuthModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-sm p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white">
                {authMode === 'signin' ? 'Sign In to Civio' : 'Create Civic Account'}
              </h3>
              <button onClick={() => setIsAuthModalOpen(false)} className="text-slate-400 hover:text-slate-200">
                <X className="w-4 h-4" />
              </button>
            </div>

            {authMessage && (
              <div className="p-2.5 rounded-lg bg-indigo-950/60 border border-indigo-800/80 text-indigo-300 text-xs">
                {authMessage}
              </div>
            )}

            <form onSubmit={handleAuth} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Email</label>
                <input
                  type="email"
                  required
                  value={authEmail}
                  onChange={(e) => setAuthEmail(e.target.value)}
                  placeholder="your.email@example.com"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Password</label>
                <input
                  type="password"
                  required
                  value={authPassword}
                  onChange={(e) => setAuthPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <button
                type="submit"
                disabled={authLoading}
                className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-semibold py-2.5 rounded-lg flex items-center justify-center gap-2 transition cursor-pointer mt-2"
              >
                {authLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <span>{authMode === 'signin' ? 'Sign In' : 'Sign Up'}</span>
              </button>
            </form>

            <div className="text-center pt-2">
              <button
                type="button"
                onClick={() => {
                  setAuthMode(authMode === 'signin' ? 'signup' : 'signin')
                  setAuthMessage(null)
                }}
                className="text-xs text-indigo-400 hover:text-indigo-300 transition"
              >
                {authMode === 'signin' ? "Don't have an account? Sign Up" : 'Already have an account? Sign In'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* New / Edit Action Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-lg font-bold text-white">
                {editingInitiativeId ? 'Edit Civic Initiative' : 'Create New Civic Initiative'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-200">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateOrEditInitiative} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Free Community WiFi in Central Park"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Category</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-indigo-500"
                >
                  <option value="Education">Education</option>
                  <option value="Community">Community</option>
                  <option value="Public Policy">Public Policy</option>
                  <option value="Environment">Environment</option>
                  <option value="Healthcare">Healthcare</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Description</label>
                <textarea
                  required
                  rows={3}
                  placeholder="Explain the purpose and goals of this initiative..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-indigo-500 resize-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-slate-200 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-semibold px-4 py-2 rounded-lg flex items-center gap-2 transition cursor-pointer"
                >
                  {isSubmitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>{editingInitiativeId ? 'Save Changes' : 'Publish Action'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* New Poll Modal */}
      {isPollModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-lg font-bold text-white">Create New Civic Poll</h3>
              <button onClick={() => setIsPollModalOpen(false)} className="text-slate-400 hover:text-slate-200">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreatePoll} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Poll Question</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Should the neighborhood add bike lanes along Oak Street?"
                  value={pollFormData.question}
                  onChange={(e) => setPollFormData({ ...pollFormData, question: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Category</label>
                <select
                  value={pollFormData.category}
                  onChange={(e) => setPollFormData({ ...pollFormData, category: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-indigo-500"
                >
                  <option value="Public Policy">Public Policy</option>
                  <option value="Education">Education</option>
                  <option value="Community">Community</option>
                  <option value="Environment">Environment</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Option 1</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Yes, allocate funds for bike lanes"
                  value={pollFormData.option_a}
                  onChange={(e) => setPollFormData({ ...pollFormData, option_a: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Option 2</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. No, keep existing road layout"
                  value={pollFormData.option_b}
                  onChange={(e) => setPollFormData({ ...pollFormData, option_b: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsPollModalOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-slate-200 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-semibold px-4 py-2 rounded-lg flex items-center gap-2 transition cursor-pointer"
                >
                  {isSubmitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>{isSubmitting ? 'Creating...' : 'Publish Poll'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
