import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { resourceAPI } from '../services/api';
import { LoadingSpinner, EmptyState, SkeletonCard } from '../components/UI';
import { HiSearch, HiBookOpen, HiPlay, HiMusicNote, HiDocument, HiExternalLink, HiEye, HiHeart, HiFilter } from 'react-icons/hi';

const categories = ['All', 'Anxiety', 'Depression', 'Stress', 'Relationships', 'Academic', 'General'];
const types = { article: { icon: HiBookOpen, color: 'text-primary-500' }, video: { icon: HiPlay, color: 'text-red-500' }, audio: { icon: HiMusicNote, color: 'text-mint-500' }, pdf: { icon: HiDocument, color: 'text-coral-500' } };

export default function Resources() {
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState('All');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [hasMore, setHasMore] = useState(false);

  useEffect(() => { loadResources(); }, [category, page]);

  const loadResources = async () => {
    try {
      setLoading(true);
      const params = { page, limit: 12 };
      if (category !== 'All') params.category = category;
      if (search) params.search = search;
      
      const { data } = await resourceAPI.getAll(params);
      if (page === 1) {
        setResources(data.resources);
      } else {
        setResources(prev => [...prev, ...data.resources]);
      }
      setTotal(data.total);
      setHasMore(data.hasMore);
    } catch (e) {
      console.error('Resources load error:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    loadResources();
  };

  return (
    <div className="px-4">
      <div className="max-w-6xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-3xl font-bold mb-2">Resource <span className="gradient-text">Library</span></h1>
          <p className="text-dark-500 dark:text-dark-400 mb-8">Self-help articles, videos, meditations, and worksheets curated for you.</p>
        </motion.div>

        {/* Search & Filter */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <form onSubmit={handleSearch} className="flex-1 relative">
            <HiSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search resources..."
              className="input-field !pl-10"
            />
          </form>
        </div>

        {/* Categories */}
        <div className="flex flex-wrap gap-2 mb-8">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => { setCategory(cat); setPage(1); }}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200
                ${category === cat
                  ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/25'
                  : 'bg-dark-100 dark:bg-dark-800 text-dark-600 dark:text-dark-400 hover:bg-dark-200 dark:hover:bg-dark-700'
                }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Grid */}
        {loading && page === 1 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : resources.length === 0 ? (
          <EmptyState icon={HiBookOpen} title="No Resources Found" description="No resources match your search criteria." />
        ) : (
          <>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {resources.map((resource, i) => {
                const TypeInfo = types[resource.type] || types.article;
                return (
                  <motion.div
                    key={resource._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="glass-card card-hover group overflow-hidden !p-0"
                  >
                    {/* Thumbnail */}
                    <div className="h-44 bg-gradient-to-br from-primary-500/20 to-mint-500/20 relative overflow-hidden">
                      {resource.thumbnail ? (
                        <img src={resource.thumbnail} alt={resource.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <TypeInfo.icon className={`w-12 h-12 ${TypeInfo.color} opacity-50`} />
                        </div>
                      )}
                      <div className="absolute top-3 right-3">
                        <span className={`badge ${resource.type === 'video' ? 'bg-red-500 text-white' : resource.type === 'audio' ? 'bg-mint-500 text-white' : 'bg-white/90 text-dark-700'}`}>
                          <TypeInfo.icon className="w-3 h-3 mr-1" /> {resource.type}
                        </span>
                      </div>
                    </div>

                    <div className="p-5">
                      <span className="badge-primary text-[10px] mb-2">{resource.category}</span>
                      <h3 className="font-semibold mb-2 line-clamp-2 group-hover:text-primary-500 transition-colors">{resource.title}</h3>
                      <p className="text-sm text-dark-500 dark:text-dark-400 line-clamp-2 mb-4">{resource.description}</p>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3 text-xs text-dark-400">
                          <span className="flex items-center gap-1"><HiEye className="w-3 h-3" /> {resource.views}</span>
                          <span className="flex items-center gap-1"><HiHeart className="w-3 h-3" /> {resource.likes}</span>
                        </div>
                        {resource.url && resource.url !== '#' && (
                          <a href={resource.url} target="_blank" rel="noreferrer" className="text-primary-500 hover:text-primary-600 text-sm font-medium flex items-center gap-1">
                            View <HiExternalLink className="w-3 h-3" />
                          </a>
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {hasMore && (
              <div className="text-center mt-8">
                <button onClick={() => setPage(prev => prev + 1)} className="btn-ghost border border-dark-200 dark:border-dark-700 !px-8">
                  {loading ? 'Loading...' : 'Load More'}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
