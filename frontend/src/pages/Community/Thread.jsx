// src/pages/Community/Thread.js

import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../../config/api.js';

export default function CommunityThread() {
  const navigate = useNavigate();
  const { threadId } = useParams();
  const [thread, setThread] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newPostContent, setNewPostContent] = useState('');

  useEffect(() => {
    fetchThread();
    fetchPosts();
  }, [threadId]);

  const fetchThread = async () => {
    try {
      const response = await api.get(`/community/threads/${threadId}`);
      setThread(response.data);
    } catch (err) {
      console.error('Error fetching thread:', err);
    }
  };

  const fetchPosts = async () => {
    try {
      const response = await api.get(`/community/threads/${threadId}/posts`);
      setPosts(response.data);
    } catch (err) {
      console.error('Error fetching posts:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePost = async (e) => {
    e.preventDefault();
    try {
      await api.post('/community/posts', {
        thread_id: parseInt(threadId),
        content: newPostContent,
      });
      alert('Post created successfully!');
      setNewPostContent('');
      fetchPosts();
    } catch (err) {
      console.error('Error creating post:', err);
      alert('Failed to create post');
    }
  };

  const handleLikePost = async (postId) => {
    try {
      await api.post(`/community/posts/${postId}/like`);
      fetchPosts();
    } catch (err) {
      console.error('Error liking post:', err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-orange-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <button
            onClick={() => navigate('/community')}
            className="text-gray-600 hover:text-gray-800 mb-2"
          >
            ← Back to Community
          </button>
          <h1 className="text-3xl font-bold text-gray-800">{thread?.title}</h1>
          <p className="text-gray-600 mt-2">{thread?.description}</p>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Posts */}
        <div className="space-y-6 mb-8">
          {posts.map((post) => (
            <div key={post.id} className="bg-white rounded-lg shadow p-6 border-l-4 border-blue-500">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <p className="font-semibold text-gray-800">User #{post.user_id}</p>
                  <p className="text-xs text-gray-500">{new Date(post.created_at).toLocaleString()}</p>
                </div>
              </div>
              <p className="text-gray-700 mb-4">{post.content}</p>
              <button
                onClick={() => handleLikePost(post.id)}
                className="px-3 py-1 bg-orange-100 text-orange-600 rounded hover:bg-orange-200 transition text-sm font-semibold"
              >
                👍 {post.like_count} Likes
              </button>
            </div>
          ))}
        </div>

        {/* Create Post Form */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-lg font-bold text-gray-800 mb-4">Add Your Reply</h3>
          <form onSubmit={handleCreatePost} className="space-y-4">
            <textarea
              placeholder="Share your thoughts..."
              value={newPostContent}
              onChange={(e) => setNewPostContent(e.target.value)}
              required
              minLength="5"
              rows="4"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-orange-500"
            ></textarea>

            <button
              type="submit"
              className="px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition font-semibold"
            >
              Post Reply
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}
