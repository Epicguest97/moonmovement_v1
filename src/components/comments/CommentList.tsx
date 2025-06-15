
import React from 'react';
import Comment from './CommentItem';

export interface CommentType {
  id: string;
  author: string;
  content: string;
  timestamp: string;
  voteScore: number;
  replies?: CommentType[];
}

interface CommentListProps {
  comments: CommentType[];
  postId: string;
  onReplySubmit: (parentId: string, content: string) => Promise<void>;
  onCommentUpdate?: () => void;
}

const CommentList = ({ comments, postId, onReplySubmit, onCommentUpdate }: CommentListProps) => {
  return (
    <div className="mt-4">
      {comments.map(comment => (
        <Comment 
          key={comment.id} 
          comment={comment} 
          postId={postId}
          onReplySubmit={onReplySubmit}
          onCommentUpdate={onCommentUpdate}
        />
      ))}
    </div>
  );
};

export default CommentList;
