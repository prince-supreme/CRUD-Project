"use client";

import { useState, useEffect } from "react";
import { AlertCircle } from "lucide-react";

interface Post {
  id: number;
  title: string;
  body: string;
}

interface FormErrors {
  title?: string;
  body?: string;
}

export default function Home() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [isEditing, setIsEditing] = useState<number | null>(null);
  const [newPost, setNewPost] = useState({ title: "", body: "" });
  const [editPost, setEditPost] = useState<Post | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetch('https://jsonplaceholder.typicode.com/posts')
      .then(response => response.json())
      .then(data => {
        setPosts(data.slice(0, 2));
        setIsLoading(false);
      })
      .catch(error => {
        console.error('Error fetching posts:', error);
        setIsLoading(false);
      });
  }, []);

  const validateForm = () => {
    const errors: FormErrors = {};
    if (!newPost.title.trim()) {
      errors.title = "Title is required";
    }
    if (!newPost.body.trim()) {
      errors.body = "Content is required";
    }
    if (newPost.title.length > 100) {
      errors.title = "Title must be less than 100 characters";
    }
    if (newPost.body.length > 500) {
      errors.body = "Content must be less than 500 characters";
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      const response = await fetch('https://jsonplaceholder.typicode.com/posts', {
        method: 'POST',
        body: JSON.stringify({
          title: newPost.title.trim(),
          body: newPost.body.trim(),
          userId: 1,
        }),
        headers: {
          'Content-type': 'application/json; charset=UTF-8',
        },
      });
      
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      
      const data = await response.json();
      setPosts([data, ...posts]);
      setNewPost({ title: "", body: "" });
      setFormErrors({});
    } catch (error) {
      console.error('Error creating post:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const startEditing = (post: Post) => {
    setIsEditing(post.id);
    setEditPost(post);
  };

  const handleUpdate = async (id: number) => {
    if (!editPost) return;
    
    try {
      const response = await fetch(`https://jsonplaceholder.typicode.com/posts/${id}`, {
        method: 'PUT',
        body: JSON.stringify({
          id,
          title: editPost.title.trim(),
          body: editPost.body.trim(),
          userId: 1,
        }),
        headers: {
          'Content-type': 'application/json; charset=UTF-8',
        },
      });
      
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      
      const data = await response.json();
      setPosts(posts.map(post => post.id === id ? { ...post, ...data } : post));
      setIsEditing(null);
      setEditPost(null);
    } catch (error) {
      console.error('Error updating post:', error);
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm("Are you sure ?")) {
      try {
        const response = await fetch(`https://jsonplaceholder.typicode.com/posts/${id}`, {
          method: 'DELETE',
        });
        
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        
        setPosts(posts.filter(post => post.id !== id));
      } catch (error) {
        console.error('Error deleting post:', error);
      }
    }
  };

  const cancelEditing = () => {
    setIsEditing(null);
    setEditPost(null);
  };

  if (isLoading) {
    return <div className="container">Loading...</div>;
  }

  return (
    <div className="container">
      <h1 className="title">Posts</h1>

      <form onSubmit={handleCreate} className="form">
        <div className="form-group">
          <input
            type="text"
            placeholder="Post title"
            value={newPost.title}
            onChange={(e) => {
              setNewPost({ ...newPost, title: e.target.value });
              if (formErrors.title) {
                setFormErrors({ ...formErrors, title: undefined });
              }
            }}
            className={`input ${formErrors.title ? 'error' : ''}`}
            disabled={isSubmitting}
          />
          {formErrors.title && (
            <div className="error-message">
              <AlertCircle className="error-icon" />
              {formErrors.title}
            </div>
          )}
        </div>

        <div className="form-group">
          <textarea
            placeholder="Post content"
            value={newPost.body}
            onChange={(e) => {
              setNewPost({ ...newPost, body: e.target.value });
              if (formErrors.body) {
                setFormErrors({ ...formErrors, body: undefined });
              }
            }}
            className={`textarea ${formErrors.body ? 'error' : ''}`}
            disabled={isSubmitting}
          />
          {formErrors.body && (
            <div className="error-message">
              <AlertCircle className="error-icon" />
              {formErrors.body}
            </div>
          )}
        </div>

        <button 
          type="submit" 
          className="button button-primary"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Adding Post" : "Add Post"}
        </button>
      </form>

      <div>
        {posts.map((post) => (
          <div key={post.id} className="post">
            {isEditing === post.id ? (
              <div>
                <input
                  type="text"
                  value={editPost?.title || ''}
                  onChange={(e) => setEditPost(prev => prev ? { ...prev, title: e.target.value } : null)}
                  className="input"
                />
                <textarea
                  value={editPost?.body || ''}
                  onChange={(e) => setEditPost(prev => prev ? { ...prev, body: e.target.value } : null)}
                  className="textarea"
                />
                <div className="button-group">
                  <button onClick={() => handleUpdate(post.id)} className="button button-primary">
                    Save
                  </button>
                  <button onClick={cancelEditing} className="button button-outline">
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <>
                <h2 className="post-title">{post.title}</h2>
                <p className="post-content">{post.body}</p>
                <div className="button-group">
                  <button onClick={() => startEditing(post)} className="button button-outline">
                    Edit
                  </button>
                  <button onClick={() => handleDelete(post.id)} className="button button-danger">
                    Delete
                  </button>
                </div>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}