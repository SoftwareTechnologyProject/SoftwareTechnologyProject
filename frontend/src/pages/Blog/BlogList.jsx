import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import BlogHeader from './BlogHeader';
import Footer from '../../components/Footer/Footer';
import './BlogList.css';

//const API_URL = 'http://localhost:8080/blog';
const API_URL = 'http://localhost:8081/blog';

const BlogList = () => {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchPosts();
    }, []);

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

    const filteredPosts = posts.filter(post =>
        post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        post.description.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const featuredPosts = posts.slice(0, 3);

    if (loading) {
        return (
            <div className="blog-page">
                <div className="blog-container">
                    <div className="loading">Đang tải...</div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="blog-page">
                <div className="blog-container">
                    <div className="error">Lỗi: {error}</div>
                </div>
            </div>
        );
    }

    return (
        <div className="blog-page">
            <BlogHeader />

            <div className="blog-layout">
                {/* Main Content */}
                <main className="blog-main-content">
                    {loading ? (
                        <div className="loading">Đang tải...</div>
                    ) : error ? (
                        <div className="error">Lỗi: {error}</div>
                    ) : filteredPosts.length === 0 ? (
                        <div className="empty-state">
                            <p>Không tìm thấy bài viết nào</p>
                        </div>
                    ) : (
                        <div className="posts-grid">
                            {filteredPosts.map(post => (
                                <article key={post.id} className="post-card">
                                    <Link to={`/blog/posts/${post.id}`} className="card-link">
                                        <div className="card-image">
                                            {post.coverImage ? (
                                                <img src={post.coverImage} alt={post.title} />
                                            ) : (
                                                <div className="no-image">
                                                    <span>📚</span>
                                                </div>
                                            )}
                                        </div>
                                        <div className="card-content">
                                            <h2 className="card-title">{post.title}</h2>
                                            <p className="card-description">{post.description}</p>
                                            <div className="card-meta">
                                                <span className="meta-author">{post.author}</span>
                                                <span className="meta-date">{formatDate(post.createdAt)}</span>
                                            </div>
                                        </div>
                                    </Link>
                                </article>
                            ))}
                        </div>
                    )}
                </main>

                {/* Sidebar */}
                <aside className="blog-sidebar">
                    {/* Search Box */}
                    <div className="sidebar-section search-section">
                        <h3>Tìm kiếm</h3>
                        <input
                            type="text"
                            placeholder="Tìm bài viết..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="search-input"
                        />
                    </div>

                    {/* Categories */}
                    <div className="sidebar-section">
                        <h3>Danh mục</h3>
                        <ul className="category-list">
                            <li><Link to="/blog">Tất cả bài viết</Link></li>
                            <li><Link to="/blog/about">Giới thiệu</Link></li>
                            <li><Link to="/blog/admin">Quản lý</Link></li>
                        </ul>
                    </div>

                    {/* Featured Posts */}
                    {featuredPosts.length > 0 && (
                        <div className="sidebar-section">
                            <h3>Bài viết nổi bật</h3>
                            <ul className="featured-list">
                                {featuredPosts.map(post => (
                                    <li key={post.id}>
                                        <Link to={`/blog/posts/${post.id}`}>
                                            {post.title}
                                        </Link>
                                        <span className="featured-date">{formatDate(post.createdAt)}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </aside>
            </div>
            <Footer />
        </div>
    );
};

export default BlogList;
