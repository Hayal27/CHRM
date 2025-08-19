import React from 'react';

const CommentsPage: React.FC = () => {
  return (
    <div className="p-3 p-sm-4">
      <h2>Comments</h2>
      <p>This page lists comments submitted by users. Administrators can moderate (approve, mark as spam, delete) comments here.</p>
      {/* Add table or list of comments with filtering (Pending, Approved, Spam, Trash) */}
      {/* Example Row: Comment | Author | In Response To | Date | Actions (Approve, Spam, Edit, Trash) */}
    </div>
  );
};

export default CommentsPage;