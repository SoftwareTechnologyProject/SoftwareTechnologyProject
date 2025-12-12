import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import BlogHeader from './BlogHeader';
import Footer from '../../components/Footer/Footer';
import './BlogDetail.css';

//const API_URL = 'http://localhost:8080/blog';
const API_URL = 'http://localhost:8081/blog';

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
                throw new Error('Không thể gửi bình luận');
            }

            // Reset form and reload comments
            setCommentForm({ commenterName: '', content: '' });
            fetchComments();
            alert('Bình luận của bạn đã được gửi!');
        } catch (err) {
            alert('Lỗi: ' + err.message);
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
            <div className="blog-container">
                <div className="loading">Đang tải...</div>
            </div>
        );
    }

    if (error || !post) {
        return (
            <div className="blog-container">
                <div className="error">Lỗi: {error || 'Không tìm thấy bài viết'}</div>
                <Link to="/blog" className="back-link">Quay lại danh sách bài viết</Link>
            </div>
        );
    }

    return (
        <div className="blog-page">
            <BlogHeader />
            <div className="blog-container">
                <Link to="/blog" className="back-link">Quay lại</Link>
                
                <article className="post-detail">
                    <h1 className="post-title">{post.title}</h1>
                
                <div className="post-meta">
                    <span className="post-author">{post.author}</span>
                    <span className="post-date">{formatDate(post.createdAt)}</span>
                </div>

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

            <section className="comments-section">
                <div className="comments-container">
                    <h2 className="comments-title">Bình luận ({comments.length})</h2>

                    <form className="comment-form" onSubmit={handleCommentSubmit}>
                        <div className="form-group">
                            <input
                                type="text"
                                placeholder="Tên của bạn"
                                value={commentForm.commenterName}
                                onChange={(e) => setCommentForm({...commentForm, commenterName: e.target.value})}
                                maxLength={100}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <textarea
                                placeholder="Nội dung bình luận..."
                                value={commentForm.content}
                                onChange={(e) => setCommentForm({...commentForm, content: e.target.value})}
                                rows={4}
                                required
                            ></textarea>
                        </div>
                        <button type="submit" disabled={submitting} className="submit-btn">
                            {submitting ? 'Đang gửi...' : 'Gửi bình luận'}
                        </button>
                    </form>

                    <div className="comments-list">
                        {comments.length === 0 ? (
                            <p className="no-comments">Chưa có bình luận nào. Hãy là người đầu tiên!</p>
                        ) : (
                            comments.map(comment => (
                                <div key={comment.id} className="comment-item">
                                    <div className="comment-header">
                                        <strong className="commenter-name">{comment.commenterName}</strong>
                                        <span className="comment-date">{formatDate(comment.createdAt)}</span>
                                    </div>
                                    <p className="comment-content">{comment.content}</p>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </section>
            <Footer />
        </div>
        </div>
    );
};

export default BlogDetail;
