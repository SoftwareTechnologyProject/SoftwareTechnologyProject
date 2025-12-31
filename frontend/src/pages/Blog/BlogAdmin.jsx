import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import Swal from 'sweetalert2';
import Footer from '../../components/Footer/Footer';
import './BlogAdmin.css';

const API_URL = 'http://localhost:8080/blog';
//const API_URL = 'http://localhost:8080/blog';
const BlogAdmin = () => {
    const navigate = useNavigate();
    const [posts, setPosts] = useState([]);
    const [postComments, setPostComments] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [editingPost, setEditingPost] = useState(null);
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState('');
    const [uploading, setUploading] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        content: '',
        coverImage: '',
        author: 'Admin'
    });

    // Check authentication
    useEffect(() => {
        const token = localStorage.getItem('accessToken');
        if (!token) {
            toast.error('Vui lòng đăng nhập để truy cập trang này');
            navigate('/login');
            return;
        }
    }, [navigate]);

    useEffect(() => {
        fetchPosts();
    }, []);

    const fetchPosts = async () => {
        try {
            const response = await fetch(`${API_URL}/posts`);
            const data = await response.json();
            setPosts(data);
        } catch (err) {
            console.error('Error fetching posts:', err);
        }
    };

    const fetchPostComments = async (postId) => {
        try {
            const response = await fetch(`${API_URL}/posts/${postId}/comments`);
            const comments = await response.json();
            setPostComments(comments);
        } catch (err) {
            console.error('Error fetching comments:', err);
        }
    };

    const handleDeleteComment = async (commentId) => {
        const result = await Swal.fire({
            title: 'Xác nhận xóa?',
            text: 'Bạn có chắc muốn xóa bình luận này?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Xóa',
            cancelButtonText: 'Hủy'
        });

        if (!result.isConfirmed) {
            return;
        }

        try {
            const token = localStorage.getItem('accessToken');
            const response = await fetch(`${API_URL}/comments/${commentId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.status === 403) {
                toast.error('Bạn không có quyền thực hiện thao tác này');
                return;
            }

            if (!response.ok) {
                throw new Error('Không thể xóa bình luận');
            }

            toast.success('Đã xóa bình luận!');
            if (editingPost) {
                fetchPostComments(editingPost.id);
            }
        } catch (err) {
            toast.error('Lỗi: ' + err.message);
            console.error('Error deleting comment:', err);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Frontend validation
        if (!formData.title || formData.title.length > 200) {
            toast.error('Tiêu đề không được để trống và không quá 200 ký tự');
            return;
        }
        if (!formData.description || formData.description.length > 500) {
            toast.error('Mô tả không được để trống và không quá 500 ký tự');
            return;
        }
        if (!formData.content || formData.content.length < 50) {
            toast.error('Nội dung phải ít nhất 50 ký tự');
            return;
        }
        if (!imageFile && !formData.coverImage) {
            toast.error('Vui lòng chọn ảnh bìa cho bài viết');
            return;
        }
        
        const loadingToast = toast.loading(editingPost ? 'Đang cập nhật...' : 'Đang tạo bài viết...');
        
        try {
            const token = localStorage.getItem('accessToken');
            let coverImageUrl = formData.coverImage;

            // Upload image if file selected
            if (imageFile) {
                setUploading(true);
                const uploadFormData = new FormData();
                uploadFormData.append('file', imageFile);

                const uploadResponse = await fetch(`${API_URL}/upload-image`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`
                    },
                    body: uploadFormData
                });

                if (uploadResponse.status === 403) {
                    toast.dismiss(loadingToast);
                    toast.error('Bạn không có quyền upload ảnh');
                    setUploading(false);
                    return;
                }

                if (!uploadResponse.ok) {
                    throw new Error('Không thể upload ảnh');
                }

                const uploadData = await uploadResponse.json();
                coverImageUrl = uploadData.url;
                setUploading(false);
            }

            const postData = {
                ...formData,
                coverImage: coverImageUrl
            };
            
            const url = editingPost 
                ? `${API_URL}/posts/${editingPost.id}`
                : `${API_URL}/posts`;
            
            const method = editingPost ? 'PUT' : 'POST';
            
            const response = await fetch(url, {
                method: method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(postData)
            });

            if (response.status === 403) {
                toast.dismiss(loadingToast);
                toast.error('Bạn không có quyền thực hiện thao tác này');
                return;
            }

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Không thể lưu bài viết');
            }

            toast.dismiss(loadingToast);
            toast.success(editingPost ? 'Đã cập nhật bài viết!' : 'Đã tạo bài viết mới!');
            resetForm();
            fetchPosts();
        } catch (err) {
            toast.dismiss(loadingToast);
            toast.error('Lỗi: ' + err.message);
            console.error('Error saving post:', err);
        } finally {
            setUploading(false);
        }
    };

    const handleEdit = (post) => {
        setEditingPost(post);
        setFormData({
            title: post.title,
            description: post.description,
            content: post.content,
            coverImage: post.coverImage || '',
            author: post.author
        });
        setImagePreview(post.coverImage || '');
        setImageFile(null);
        fetchPostComments(post.id);
        setShowForm(true);
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImageFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleDelete = async (id) => {
        const result = await Swal.fire({
            title: 'Xác nhận xóa?',
            text: 'Bạn có chắc muốn xóa bài viết này? Tất cả bình luận sẽ bị xóa theo.',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Xóa',
            cancelButtonText: 'Hủy'
        });

        if (!result.isConfirmed) {
            return;
        }

        const loadingToast = toast.loading('Đang xóa bài viết...');

        try {
            const token = localStorage.getItem('accessToken');
            const response = await fetch(`${API_URL}/posts/${id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.status === 403) {
                toast.dismiss(loadingToast);
                toast.error('Bạn không có quyền thực hiện thao tác này');
                return;
            }

            if (!response.ok) {
                throw new Error('Không thể xóa bài viết');
            }

            toast.dismiss(loadingToast);
            toast.success('Đã xóa bài viết!');
            fetchPosts();
        } catch (err) {
            toast.dismiss(loadingToast);
            toast.error('Lỗi: ' + err.message);
            console.error('Error deleting post:', err);
        }
    };

    const resetForm = () => {
        setFormData({
            title: '',
            description: '',
            content: '',
            coverImage: '',
            author: 'Admin'
        });
        setEditingPost(null);
        setImageFile(null);
        setImagePreview('');
        setPostComments([]);
        setShowForm(false);
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('vi-VN', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    };

    return (
        <div className="blog-page">
            <div className="admin-container">
                <header className="admin-header">
                    <h1>Quản lý Blog</h1>
                    <div className="admin-nav">
                        <button 
                            className="btn-new-post"
                            onClick={() => setShowForm(!showForm)}
                        >
                            {showForm ? 'Đóng Form' : '+ Bài viết mới'}
                        </button>
                    </div>
                </header>

                {showForm && (
                    <div className="post-form-section">
                        <h2>{editingPost ? 'Chỉnh sửa bài viết' : 'Tạo bài viết mới'}</h2>
                        <form className="post-form" onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label>Tiêu đề *</label>
                                <input
                                    type="text"
                                    value={formData.title}
                                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                                    maxLength={200}
                                    required
                                />
                                <small className="char-count">{formData.title.length}/200 ký tự</small>
                            </div>

                            <div className="form-group">
                                <label>Mô tả ngắn (1-2 câu) *</label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                                    maxLength={500}
                                    rows={3}
                                    required
                                ></textarea>
                                <small className="char-count">{formData.description.length}/500 ký tự</small>
                            </div>

                            <div className="form-group">
                                <label>Nội dung *</label>
                                <textarea
                                    value={formData.content}
                                    onChange={(e) => setFormData({...formData, content: e.target.value})}
                                    rows={15}
                                    required
                                    placeholder="Mỗi đoạn văn cách nhau 1 dòng... (Tối thiểu 50 ký tự)"
                                ></textarea>
                                <small className="char-count">{formData.content.length} ký tự {formData.content.length < 50 ? `(còn thiếu ${50 - formData.content.length})` : '✓'}</small>
                            </div>

                            <div className="form-group">
                                <label>Ảnh bìa *</label>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleImageChange}
                                    required={!formData.coverImage}
                                />
                                {imagePreview && (
                                    <div className="image-preview">
                                        <img src={imagePreview} alt="Preview" />
                                    </div>
                                )}
                            </div>

                            <div className="form-group">
                                <label>Tác giả *</label>
                                <input
                                    type="text"
                                    value={formData.author}
                                    onChange={(e) => setFormData({...formData, author: e.target.value})}
                                    maxLength={100}
                                    required
                                />
                            </div>

                            <div className="form-actions">
                                <button type="submit" className="btn-submit" disabled={uploading}>
                                    {uploading ? 'Đang upload...' : (editingPost ? 'Cập nhật' : 'Đăng bài')}
                                </button>
                                <button type="button" className="btn-cancel" onClick={resetForm}>
                                    Hủy
                                </button>
                            </div>
                        </form>

                        {/* Comments section for editing post */}
                        {editingPost && postComments.length > 0 && (
                            <div className="post-comments-section">
                                <h3>Bình luận ({postComments.length})</h3>
                                <div className="comments-list">
                                    {postComments.map(comment => (
                                        <div key={comment.id} className="comment-item">
                                            <div className="comment-avatar">
                                                <div className="avatar-circle">
                                                    {comment.commenterName?.charAt(0).toUpperCase() || comment.userName?.charAt(0).toUpperCase() || 'U'}
                                                </div>
                                            </div>
                                            <div className="comment-body">
                                                <div className="comment-header">
                                                    <strong className="commenter-name">{comment.commenterName || comment.userName}</strong>
                                                    <span className="comment-date">
                                                        {new Date(comment.createdAt).toLocaleDateString('vi-VN', {
                                                            day: '2-digit',
                                                            month: '2-digit',
                                                            year: 'numeric',
                                                            hour: '2-digit',
                                                            minute: '2-digit'
                                                        })}
                                                    </span>
                                                </div>
                                                <p className="comment-content">{comment.content}</p>
                                            </div>
                                            <button 
                                                className="btn-delete-comment"
                                                onClick={() => handleDeleteComment(comment.id)}
                                                title="Xóa bình luận"
                                            >
                                                ×
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}

                <div className="posts-table-section">
                    <h2>Danh sách bài viết ({posts.length})</h2>
                    
                    {posts.length === 0 ? (
                        <p className="empty-message">Chưa có bài viết nào</p>
                    ) : (
                        <div className="posts-table">
                            <table>
                                <thead>
                                    <tr>
                                        <th>Tiêu đề</th>
                                        <th>Tác giả</th>
                                        <th>Ngày đăng</th>
                                        <th>Bình luận</th>
                                        <th>Hành động</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {posts.map(post => (
                                        <tr key={post.id}>
                                            <td className="post-title-cell">
                                                <Link to={`/blog/posts/${post.id}`} target="_blank">
                                                    {post.title}
                                                </Link>
                                            </td>
                                            <td>{post.author}</td>
                                            <td>{formatDate(post.createdAt)}</td>
                                            <td>{post.commentCount}</td>
                                            <td className="actions-cell">
                                                <button 
                                                    className="btn-edit"
                                                    onClick={() => handleEdit(post)}
                                                >
                                                    Sửa
                                                </button>
                                                <button 
                                                    className="btn-delete"
                                                    onClick={() => handleDelete(post.id)}
                                                >
                                                    Xóa
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
            <Footer />
        </div>
    );
};

export default BlogAdmin;
