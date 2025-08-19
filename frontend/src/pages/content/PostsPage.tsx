import React from 'react';
import { Link } from 'react-router-dom';

const PostsPage: React.FC = () => {
  return (
    <div className="p-3 p-sm-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2>Posts</h2>
        <Link to="/content/posts/new" className="btn btn-primary">Add New Post</Link>
      </div>
      <p>This page will list all blog posts or articles. Users can create, edit, delete, and manage posts here.</p>
      {/* Add table or list of posts here */}
      {/* Example Row: Post Title | Author | Categories | Tags | Date | Actions (Edit, Delete, View) */}
    </div>
  );
};

export default PostsPage;