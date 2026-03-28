import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { postAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { LoadingSpinner, EmptyState } from '../components/UI';
import { HiHeart, HiChat, HiFlag, HiEye, HiEyeOff, HiPaperAirplane, HiUsers } from 'react-icons/hi';

const categories = ['All', 'General', 'Academics', 'Relationships', 'Mental Health', 'Social Life'];

export default function Community() {
  const { user } = useAuth();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState('All');
  const [newPost, setNewPost] = useState('');
  const [postAnonymous, setPostAnonymous] = useState(false);
  const [postCategory, setPostCategory] = useState('General');
  const [posting, setPosting] = useState(false);
  const [commentTexts, setCommentTexts] = useState({});
  const [commentAnonymous, setCommentAnonymous] = useState({});

  useEffect(() => { loadPosts(); }, [category]);

  const loadPosts = async () => {
    try {
      setLoading(true);
      const params = {};
      if (category !== 'All') params.category = category;
      const { data } = await postAPI.getAll(params);
      setPosts(data.posts || []);
    } catch (e) {
      toast.error('Failed to load posts');
    } finally {
      setLoading(false);
    }
  };

  const createPost = async (e) => {
    e.preventDefault();
    if (!newPost.trim()) return;
    setPosting(true);
    try {
      const { data } = await postAPI.create({ content: newPost, category: postCategory, isAnonymous: postAnonymous });
      setPosts(prev => [data.post, ...prev]);
      setNewPost('');
      setPostAnonymous(false);
      toast.success('Post shared! 🎉');
    } catch (e) {
      toast.error(e.response?.data?.message || 'Failed to post');
    } finally {
      setPosting(false);
    }
  };

  const likePost = async (postId) => {
    try {
      const { data } = await postAPI.like(postId);
      setPosts(prev => prev.map(p => p._id === postId ? { ...p, likeCount: data.likeCount, liked: data.liked } : p));
    } catch (e) { toast.error('Failed to like'); }
  };

  const addComment = async (postId) => {
    const content = commentTexts[postId]?.trim();
    if (!content) return;
    try {
      const { data } = await postAPI.comment(postId, { content, isAnonymous: commentAnonymous[postId] || false });
      setPosts(prev => prev.map(p => p._id === postId ? { ...p, comments: data.post.comments, commentCount: data.post.commentCount } : p));
      setCommentTexts(prev => ({ ...prev, [postId]: '' }));
      toast.success('Comment added');
    } catch (e) { toast.error('Failed to comment'); }
  };

  const reportPost = async (postId) => {
    try {
      await postAPI.report(postId, { reason: 'Inappropriate content' });
      toast.success('Post reported. Admins will review.');
    } catch (e) { toast.error('Failed to report'); }
  };

  return (
    <div className="px-4">
      <div className="max-w-3xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
            <HiUsers className="text-primary-500" /> Peer <span className="gradient-text">Community</span>
          </h1>
          <p className="text-dark-500 dark:text-dark-400 mb-8">Share, support, and connect. You're not alone in this.</p>
        </motion.div>

        {/* Categories */}
        <div className="flex flex-wrap gap-2 mb-6">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all
                ${category === cat
                  ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/25'
                  : 'bg-dark-100 dark:bg-dark-800 text-dark-600 dark:text-dark-400 hover:bg-dark-200 dark:hover:bg-dark-700'
                }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* New Post */}
        <motion.form
          onSubmit={createPost}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card mb-8"
        >
          <textarea
            value={newPost}
            onChange={(e) => setNewPost(e.target.value)}
            placeholder="What's on your mind? Share your thoughts..."
            className="input-field !rounded-xl min-h-[100px] resize-none mb-3"
            maxLength={5000}
          />
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-3">
              <select
                value={postCategory}
                onChange={(e) => setPostCategory(e.target.value)}
                className="input-field !w-auto !py-2 text-sm"
              >
                {categories.filter(c => c !== 'All').map(c => <option key={c}>{c}</option>)}
              </select>
              <button
                type="button"
                onClick={() => setPostAnonymous(!postAnonymous)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm transition-colors
                  ${postAnonymous ? 'bg-primary-500/10 text-primary-600 dark:text-primary-400' : 'text-dark-400 hover:text-dark-600'}`}
              >
                {postAnonymous ? <HiEyeOff className="w-4 h-4" /> : <HiEye className="w-4 h-4" />}
                {postAnonymous ? 'Anonymous' : 'Public'}
              </button>
            </div>
            <button
              type="submit"
              disabled={!newPost.trim() || posting}
              className="btn-primary !py-2 !px-6 text-sm flex items-center gap-2 disabled:opacity-50"
            >
              {posting ? 'Posting...' : <><HiPaperAirplane className="w-4 h-4 rotate-90" /> Share</>}
            </button>
          </div>
        </motion.form>

        {/* Posts */}
        {loading ? (
          <LoadingSpinner size="lg" />
        ) : posts.length === 0 ? (
          <EmptyState icon={HiUsers} title="No Posts Yet" description="Be the first to share something with the community!" />
        ) : (
          <div className="space-y-4">
            {posts.map((post, i) => (
              <motion.div
                key={post._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="glass-card"
              >
                {/* Header */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-mint-500 flex items-center justify-center">
                      <span className="text-white font-semibold text-sm">
                        {post.isAnonymous ? '?' : post.userId?.name?.charAt(0)?.toUpperCase() || '?'}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium text-sm">
                        {post.isAnonymous ? 'Anonymous User' : post.userId?.name || 'Unknown'}
                      </p>
                      <p className="text-xs text-dark-400">{new Date(post.createdAt).toLocaleDateString('en', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="badge-primary text-[10px]">{post.category}</span>
                    <button onClick={() => reportPost(post._id)} className="text-dark-400 hover:text-red-500 transition-colors" title="Report">
                      <HiFlag className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Content */}
                <p className="text-sm leading-relaxed text-dark-700 dark:text-dark-300 whitespace-pre-wrap mb-4">{post.content}</p>

                {/* Actions */}
                <div className="flex items-center gap-4 pt-3 border-t border-dark-100 dark:border-dark-800">
                  <button onClick={() => likePost(post._id)} className="flex items-center gap-1.5 text-sm text-dark-500 hover:text-red-500 transition-colors">
                    <HiHeart className={`w-5 h-5 ${post.liked ? 'text-red-500 fill-current' : ''}`} />
                    {post.likeCount || 0}
                  </button>
                  <span className="flex items-center gap-1.5 text-sm text-dark-500">
                    <HiChat className="w-5 h-5" /> {post.commentCount || 0}
                  </span>
                </div>

                {/* Comments */}
                {post.comments?.length > 0 && (
                  <div className="mt-4 space-y-3 pl-4 border-l-2 border-primary-200 dark:border-primary-800">
                    {post.comments.slice(-3).map((comment, ci) => (
                      <div key={ci} className="text-sm">
                        <span className="font-medium text-primary-600 dark:text-primary-400">
                          {comment.isAnonymous ? 'Anonymous' : comment.userId?.name || 'User'}
                        </span>
                        <span className="text-dark-600 dark:text-dark-400 ml-2">{comment.content}</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Add Comment */}
                <div className="mt-3 flex items-center gap-2">
                  <input
                    value={commentTexts[post._id] || ''}
                    onChange={(e) => setCommentTexts(prev => ({ ...prev, [post._id]: e.target.value }))}
                    placeholder="Write a comment..."
                    className="input-field !py-2 text-sm flex-1"
                    onKeyDown={(e) => e.key === 'Enter' && addComment(post._id)}
                  />
                  <button
                    onClick={() => setCommentAnonymous(prev => ({ ...prev, [post._id]: !prev[post._id] }))}
                    className={`p-2 rounded-lg transition-colors ${commentAnonymous[post._id] ? 'text-primary-500' : 'text-dark-400'}`}
                    title={commentAnonymous[post._id] ? 'Anonymous' : 'Public'}
                  >
                    {commentAnonymous[post._id] ? <HiEyeOff className="w-4 h-4" /> : <HiEye className="w-4 h-4" />}
                  </button>
                  <button onClick={() => addComment(post._id)} className="btn-primary !p-2 !rounded-lg">
                    <HiPaperAirplane className="w-4 h-4 rotate-90" />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
