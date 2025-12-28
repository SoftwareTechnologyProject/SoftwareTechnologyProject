import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, Clock, User, MessageCircle, ChevronDown, ChevronUp } from 'lucide-react';
import Footer from '../../components/Footer/Footer';
import './BlogList.css';

const API_URL = 'http://localhost:8080/blog';

const BlogList = () => {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [comments, setComments] = useState({});
    const [expandedComments, setExpandedComments] = useState({});

    useEffect(() => {
        fetchPosts();
    }, []);

    useEffect(() => {
        if (posts.length > 0) {
            posts.forEach(post => {
                if (!comments[post.id]) {
                    fetchComments(post.id);
                }
            });
        }
    }, [posts]);

    const fetchPosts = async () => {
        try {
            setLoading(true);
            const response = await fetch(`${API_URL}/posts`);
            if (!response.ok) {
                throw new Error('Không thể tải danh sách bài viết');
            }
            const data = await response.json();
            setPosts(data);
            setError(null);
        } catch (err) {
            setError(err.message);
            console.error('Error fetching posts:', err);
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('vi-VN', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    };

    const fetchComments = async (postId) => {
        try {
            const response = await fetch(`${API_URL}/posts/${postId}/comments`);
            if (!response.ok) {
                throw new Error('Không thể tải comments');
            }
            const data = await response.json();
            setComments(prev => ({
                ...prev,
                [postId]: data
            }));
        } catch (err) {
            console.error('Error fetching comments:', err);
            setComments(prev => ({
                ...prev,
                [postId]: []
            }));
        }
    };

    const toggleComments = (postId) => {
        setExpandedComments(prev => ({
            ...prev,
            [postId]: !prev[postId]
        }));
    };

    const filteredPosts = posts.filter(post =>
        post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        post.description.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const featuredPosts = posts.slice(0, 5);

    if (loading) {
        return (
            <div className="blog-list-page">
                <div className="blog-list-container">
                    <div className="loading-state">
                        <div className="spinner"></div>
                        <p>Đang tải...</p>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="blog-list-page">
                <div className="blog-list-container">
                    <div className="error-state">
                        <p className="error-message">Lỗi: {error}</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="blog-list-page">
            <div className="blog-list-container">
                <div className="blog-list-layout">
                    {/* Main Content */}
                    <main className="posts-main">
                        {filteredPosts.length === 0 ? (
                            <div className="empty-state">
                                <Search size={48} />
                                <p>Không tìm thấy bài viết nào</p>
                            </div>
                        ) : (
                            <div className="posts-grid">
                                {filteredPosts.map(post => (
                                    <article key={post.id} className="post-card">
                                        <div className="post-card-layout">
                                            {/* Left - Post Image */}
                                            <Link to={`/blog/posts/${post.id}`} className="post-image-link">
                                                <div className="post-image">
                                                    {post.coverImage ? (
                                                        <img src={post.coverImage} alt={post.title} />
                                                    ) : (
                                                        <div className="post-image-placeholder">
                                                            <span>📚</span>
                                                        </div>
                                                    )}
                                                </div>
                                            </Link>

                                            {/* Right - Post Content */}
                                            <div className="post-body">
                                                <Link to={`/blog/posts/${post.id}`} className="post-link">
                                                    <h2 className="post-title">{post.title}</h2>
                                                    <p className="post-description">{post.description}</p>
                                                </Link>

                                                <div className="post-meta">
                                                    <div className="meta-item">
                                                        <User size={14} />
                                                        <span>{post.author}</span>
                                                    </div>
                                                    <div className="meta-item">
                                                        <Clock size={14} />
                                                        <span>{formatDate(post.createdAt)}</span>
                                                    </div>
                                                </div>

                                                {/* Post Actions */}
                                                <div className="post-actions">
                                                    <Link to={`/blog/posts/${post.id}`} className="btn-read-more">
                                                        Đọc thêm
                                                    </Link>
                                                    <button
                                                        className={`btn-toggle-comments ${expandedComments[post.id] ? 'active' : ''}`}
                                                        onClick={() => toggleComments(post.id)}
                                                    >
                                                        <MessageCircle size={16} />
                                                        {comments[post.id]?.length || 0}
                                                        {expandedComments[post.id] ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                                                    </button>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Expanded Comments */}
                                        {expandedComments[post.id] && (
                                            <div className="post-comments">
                                                {comments[post.id] && comments[post.id].length > 0 ? (
                                                    <>
                                                        {comments[post.id].slice(0, 3).map((comment, index) => (
                                                            <div key={index} className="comment-preview">
                                                                <div className="comment-preview-header">
                                                                    <strong>{comment.commenterName || 'Ẩn danh'}</strong>
                                                                    <span>{formatDate(comment.createdAt)}</span>
                                                                </div>
                                                                <p>{comment.content}</p>
                                                            </div>
                                                        ))}
                                                        {comments[post.id].length > 3 && (
                                                            <Link to={`/blog/posts/${post.id}`} className="view-all-link">
                                                                Xem tất cả {comments[post.id].length} bình luận →
                                                            </Link>
                                                        )}
                                                    </>
                                                ) : (
                                                    <p className="no-comments-text">Chưa có bình luận nào</p>
                                                )}
                                            </div>
                                        )}
                                    </article>
                                ))}
                            </div>
                        )}
                    </main>

                    {/* Sidebar */}
                    <aside className="blog-list-sidebar">
                        {/* Search Box */}
                        <div className="sidebar-card">
                            <h3 className="sidebar-title">Tìm kiếm</h3>
                            <div className="search-box">
                                <Search size={18} />
                                <input
                                    type="text"
                                    placeholder="Tìm bài viết..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                        </div>

                        {/* Featured Posts */}
                        {featuredPosts.length > 0 && (
                            <div className="sidebar-card">
                                <h3 className="sidebar-title">Bài viết nổi bật</h3>
                                <ul className="featured-posts">
                                    {featuredPosts.map(post => (
                                        <li key={post.id}>
                                            <Link to={`/blog/posts/${post.id}`}>
                                                <span className="featured-title">{post.title}</span>
                                                <span className="featured-date">
                                                    <Clock size={12} />
                                                    {formatDate(post.createdAt)}
                                                </span>
                                            </Link>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </aside>
                </div>
            </div>
        </div>
    );
};

export default BlogList;