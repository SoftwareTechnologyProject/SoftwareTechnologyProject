import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import BlogHeader from './BlogHeader';
import Footer from '../../components/Footer/Footer';
import './BlogAdmin.css';

const API_URL = 'http://localhost:8080/blog';
//const API_URL = 'http://localhost:8081/blog';
const BlogAdmin = () => {
    const [posts, setPosts] = useState([]);
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

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        try {
            let coverImageUrl = formData.coverImage;

            // Upload image if file selected
            if (imageFile) {
                setUploading(true);
                const uploadFormData = new FormData();
                uploadFormData.append('file', imageFile);

                const uploadResponse = await fetch(`${API_URL}/upload-image`, {
                    method: 'POST',
                    body: uploadFormData
                });

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
                },
                body: JSON.stringify(postData)
            });

            if (!response.ok) {
                throw new Error('Không thể lưu bài viết');
            }

            alert(editingPost ? 'Đã cập nhật bài viết!' : 'Đã tạo bài viết mới!');
            resetForm();
            fetchPosts();
        } catch (err) {
            alert('Lỗi: ' + err.message);
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
        if (!confirm('Bạn có chắc muốn xóa bài viết này?')) {
            return;
        }

        try {
            const response = await fetch(`${API_URL}/posts/${id}`, {
                method: 'DELETE'
            });

            if (!response.ok) {
                throw new Error('Không thể xóa bài viết');
            }

            alert('Đã xóa bài viết!');
            fetchPosts();
        } catch (err) {
            alert('Lỗi: ' + err.message);
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
            <BlogHeader />
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
                            </div>

                            <div className="form-group">
                                <label>Nội dung *</label>
                                <textarea
                                    value={formData.content}
                                    onChange={(e) => setFormData({...formData, content: e.target.value})}
                                    rows={15}
                                    required
                                    placeholder="Mỗi đoạn văn cách nhau 1 dòng..."
                                ></textarea>
                            </div>

                            <div className="form-group">
                                <label>Ảnh bìa *</label>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleImageChange}
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
