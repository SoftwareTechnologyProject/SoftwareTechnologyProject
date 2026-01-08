import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Clock, User, MessageCircle, Send } from 'lucide-react';
import './BlogDetail.css';

const API_URL = 'http://localhost:8080/blog';

const BlogDetail = () => {
    const { id } = useParams();
    const [post, setPost] = useState(null);
    const [comments, setComments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [commentForm, setCommentForm] = useState({
        commenterName: '',
        content: ''
    });
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        fetchPost();
        fetchComments();
    }, [id]);

    const fetchPost = async () => {
        try {
            setLoading(true);
            const response = await fetch(`${API_URL}/posts/${id}`);
            if (!response.ok) {
                throw new Error('Không thể tải bài viết');
            }
            const data = await response.json();
            setPost(data);
            setError(null);
        } catch (err) {
            setError(err.message);
            console.error('Error fetching post:', err);
        } finally {
            setLoading(false);
        }
    };

    const fetchComments = async () => {
        try {
            const response = await fetch(`${API_URL}/posts/${id}/comments`);
            if (!response.ok) {
                throw new Error('Không thể tải bình luận');
            }
            const data = await response.json();
            setComments(data);
        } catch (err) {
            console.error('Error fetching comments:', err);
        }
    };

    const handleCommentSubmit = async (e) => {
        e.preventDefault();
        
        if (!commentForm.commenterName.trim() || !commentForm.content.trim()) {
            alert('Vui lòng điền đầy đủ tên và nội dung bình luận');
            return;
        }

        // Validate lengths
        if (commentForm.commenterName.length > 100) {
            alert('Tên không được vượt quá 100 ký tự');
            return;
        }

        if (commentForm.content.length > 1000) {
            alert('Nội dung bình luận không được vượt quá 1000 ký tự');
            return;
        }

        try {
            setSubmitting(true);
            const response = await fetch(`${API_URL}/posts/${id}/comments`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(commentForm)
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.error || 'Không thể gửi bình luận');
            }

            setCommentForm({ commenterName: '', content: '' });
            fetchComments();
            alert('Bình luận của bạn đã được gửi!');
        } catch (err) {
            alert(err.message);
            console.error('Error submitting comment:', err);
        } finally {
            setSubmitting(false);
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('vi-VN', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    if (loading) {
        return (
            <div className="blog-page">
                <div className="blog-container">
                    <div className="loading-state">
                        <div className="spinner"></div>
                        <p>Đang tải...</p>
                    </div>
                </div>
            </div>
        );
    }

    if (error || !post) {
        return (
            <div className="blog-page">
                <div className="blog-container">
                    <div className="error-state">
                        <p className="error-message">Lỗi: {error || 'Không tìm thấy bài viết'}</p>
                        <Link to="/blog" className="back-button-error">
                            <ArrowLeft size={20} />
                            Quay lại danh sách bài viết
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="blog-page">
            <div className="blog-container">
                <div className="blog-layout">
                    {/* Left Side - Post Content */}
                    <div className="post-section">
                        <article className="post-article">
                            {/* Back Button inside article */}
                            <Link to="/blog" className="back-button">
                                <ArrowLeft size={18} />
                                Quay lại
                            </Link>

                            <header className="post-header">
                                <h1 className="post-title">{post.title}</h1>
                                
                                <div className="post-meta">
                                    <div className="meta-item">
                                        <User size={16} />
                                        <span>{post.author}</span>
                                    </div>
                                    <div className="meta-item">
                                        <Clock size={16} />
                                        <span>{formatDate(post.createdAt)}</span>
                                    </div>
                                </div>
                            </header>

                            {post.coverImage && (
                                <div className="post-cover">
                                    <img src={post.coverImage} alt={post.title} />
                                </div>
                            )}

                            <div className="post-content">
                                {post.content.split('\n').map((paragraph, index) => (
                                    paragraph.trim() && <p key={index}>{paragraph}</p>
                                ))}
                            </div>
                        </article>
                    </div>

                    {/* Right Side - Comments Section */}
                    <aside className="comments-sidebar">
                        <div className="comments-section">
                            <div className="comments-header">
                                <MessageCircle size={24} />
                                <h2>Bình luận ({comments.length})</h2>
                            </div>

                            {/* Comment Form */}
                            <div className="comment-form-wrapper">
                                <h3 className="form-title-blog">Để lại bình luận</h3>
                                <form className="comment-form" onSubmit={handleCommentSubmit}>
                                    <div className="form-group">
                                        <label htmlFor="name">Tên của bạn</label>
                                        <input
                                            type="text"
                                            id="name"
                                            placeholder="Nhập tên"
                                            value={commentForm.commenterName}
                                            onChange={(e) => setCommentForm({...commentForm, commenterName: e.target.value})}
                                            maxLength={100}
                                            required
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label htmlFor="content">Nội dung <small>(tối đa 1000 ký tự)</small></label>
                                        <textarea
                                            id="content"
                                            placeholder="Viết bình luận..."
                                            value={commentForm.content}
                                            onChange={(e) => setCommentForm({...commentForm, content: e.target.value})}
                                            rows={4}
                                            maxLength={1000}
                                            required
                                        ></textarea>
                                        <small className="char-count">{commentForm.content.length}/1000</small>
                                    </div>
                                    <button type="submit" disabled={submitting} className="submit-button">
                                        <Send size={18} />
                                        {submitting ? 'Đang gửi...' : 'Gửi'}
                                    </button>
                                </form>
                            </div>

                            {/* Comments List */}
                            <div className="comments-list">
                                {comments.length === 0 ? (
                                    <div className="empty-comments">
                                        <MessageCircle size={48} />
                                        <p>Chưa có bình luận</p>
                                        <span>Hãy là người đầu tiên!</span>
                                    </div>
                                ) : (
                                    comments.map(comment => (
                                        <div key={comment.id} className="comment-item">
                                            <div className="comment-avatar">
                                                {comment.commenterName.charAt(0).toUpperCase()}
                                            </div>
                                            <div className="comment-body">
                                                <div className="comment-header">
                                                    <span className="commenter-name">{comment.commenterName}</span>
                                                    <span className="comment-date">
                                                        <Clock size={12} />
                                                        {formatDate(comment.createdAt)}
                                                    </span>
                                                </div>
                                                <p className="comment-content">{comment.content}</p>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </aside>
                </div>
            </div>
        </div>
    );
};

export default BlogDetail;