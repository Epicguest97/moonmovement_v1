import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import MainLayout from '@/components/layout/MainLayout';
import { Card } from '@/components/ui/card';
import VoteControls from '@/components/post/VoteControls';
import PostContent from '@/components/post/PostContent';
import PostFooter from '@/components/post/PostFooter';
import CommentBox from '@/components/comments/CommentBox';
import CommentList from '@/components/comments/CommentList';
import { Post } from '@/components/post/PostCard';
import { CommentType } from '@/components/comments/CommentList';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

const PostDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [post, setPost] = useState<Post | null>(null);
  const [comments, setComments] = useState<CommentType[]>([]);
  const [voteStatus, setVoteStatus] = useState<'up' | 'down' | null>(null);
  const [voteScore, setVoteScore] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Function to build nested comment structure
  const buildCommentTree = (flatComments: any[]): CommentType[] => {
    const commentMap = new Map();
    const rootComments: CommentType[] = [];
    
    // First pass: create all comment objects
    flatComments.forEach(comment => {
      const commentObj: CommentType = {
        id: comment.id.toString(),
        author: typeof comment.author === 'string' ? comment.author : comment.author.username,
        content: comment.content,
        timestamp: new Date(comment.createdAt).toLocaleString(),
        voteScore: 0,
        replies: []
      };
      commentMap.set(comment.id, commentObj);
    });
    
    // Second pass: build the tree structure
    flatComments.forEach(comment => {
      const commentObj = commentMap.get(comment.id);
      if (comment.parentId) {
        const parent = commentMap.get(comment.parentId);
        if (parent) {
          parent.replies!.push(commentObj);
        }
      } else {
        rootComments.push(commentObj);
      }
    });
    
    return rootComments;
  };

  useEffect(() => {
    if (id) {
      console.log('Fetching post with ID:', id);
      // Fetch the specific post by ID
      fetch(`https://moonmovement.onrender.com/api/posts/${id}`)
        .then(res => {
          if (!res.ok) {
            throw new Error('Post not found');
          }
          return res.json();
        })
        .then(data => {
          console.log('PostDetail API Response:', data);
          const transformedPost = {
            ...data,
            id: data.id.toString(),
            voteScore: data.votes?.length || 0,
            commentCount: data.comments?.length || 0,
            timestamp: new Date(data.createdAt).toLocaleString(),
            subreddit: data.subreddit || 'general'
          };
          setPost(transformedPost);
          setVoteScore(transformedPost.voteScore);
          setLoading(false);
        })
        .catch((error) => {
          console.error('Failed to fetch post:', error);
          setError(error.message);
          setLoading(false);
        });
      
      // Fetch comments for this specific post
      fetch(`https://moonmovement.onrender.com/api/comments/post/${id}`)
        .then(res => res.json())
        .then(data => {
          console.log('Comments data:', data);
          const nestedComments = buildCommentTree(data);
          setComments(nestedComments);
        })
        .catch((error) => {
          console.error('Failed to fetch comments:', error);
        });
    }
  }, [id]);
  
  const handleVote = (direction: 'up' | 'down') => {
    if (voteStatus === direction) {
      // Remove vote
      setVoteStatus(null);
      setVoteScore(direction === 'up' ? voteScore - 1 : voteScore + 1);
    } else {
      // Change vote or add new vote
      const scoreDelta = voteStatus === null 
        ? (direction === 'up' ? 1 : -1) 
        : (direction === 'up' ? 2 : -2);
      setVoteStatus(direction);
      setVoteScore(voteScore + scoreDelta);
    }
  };
  
  const handleCommentSubmit = async (commentText: string) => {
    if (!commentText.trim() || !post) return;
    
    const token = localStorage.getItem('token');
    if (!token) {
      alert('You must be signed in to comment.');
      return;
    }
    
    const commentData = {
      content: commentText,
      postId: post.id,
      // Don't send authorId or username - the server should determine this from the token
    };
    
    try {
      const res = await fetch('https://moonmovement.onrender.com/api/comments', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(commentData),
      });
      
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to submit comment');
      }
      
      const newComment = await res.json();
      // Map backend response to CommentType
      const mappedComment = {
        id: newComment.id.toString(),
        author: typeof newComment.author === 'string' ? newComment.author : newComment.author.username,
        content: newComment.content,
        timestamp: new Date(newComment.createdAt).toLocaleString(),
        voteScore: 0,
        replies: []
      };
      setComments([mappedComment, ...comments]);
      setPost({ ...post, commentCount: post.commentCount + 1 });
    } catch (err) {
      console.error('Error submitting comment:', err);
      alert('Failed to submit comment: ' + err.message);
    }
  };
  
  const handleReplySubmit = async (parentId: string, content: string) => {
    if (!content.trim() || !post) return;
    
    const token = localStorage.getItem('token');
    if (!token) {
      alert('You must be signed in to reply.');
      return;
    }
    
    const replyData = {
      content,
      postId: post.id,
      parentId: parseInt(parentId)
      // Don't send authorId or username - the server should determine this from the token
    };
    
    console.log('Submitting reply data:', replyData);
    
    try {
      const res = await fetch('https://moonmovement.onrender.com/api/comments', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(replyData),
      });
      
      if (!res.ok) {
        const errorData = await res.json();
        console.error('Server error:', errorData);
        throw new Error(errorData.error || 'Failed to submit reply');
      }
      
      // Refresh comments to get the updated nested structure
      const commentsRes = await fetch(`https://moonmovement.onrender.com/api/comments/post/${post.id}`);
      const commentsData = await commentsRes.json();
      const nestedComments = buildCommentTree(commentsData);
      setComments(nestedComments);
      setPost({ ...post, commentCount: post.commentCount + 1 });
    } catch (err) {
      console.error('Error submitting reply:', err);
      throw err;
    }
  };
  
  if (loading) {
    return (
      <MainLayout>
        <div className="max-w-3xl mx-auto p-4">
          <div className="bg-sidebar p-6 rounded-md border border-sidebar-border text-center">
            <h2 className="text-lg font-bold mb-2 text-white">Loading...</h2>
            <p className="text-gray-300">Fetching post details...</p>
          </div>
        </div>
      </MainLayout>
    );
  }
  
  if (error || !post) {
    return (
      <MainLayout>
        <div className="max-w-3xl mx-auto p-4">
          <div className="bg-sidebar p-6 rounded-md border border-sidebar-border text-center">
            <h2 className="text-lg font-bold mb-2 text-white">Post Not Found</h2>
            <p className="text-gray-300">
              {error || "The post you're looking for doesn't exist or has been removed."}
            </p>
            <Link to="/" className="mt-4 inline-block">
              <Button>
                <ArrowLeft size={16} className="mr-2" />
                Back to Home
              </Button>
            </Link>
          </div>
        </div>
      </MainLayout>
    );
  }
  
  const authorName = typeof post.author === 'string' ? post.author : post.author.username;
  
  return (
    <MainLayout>
      <div className="w-full max-w-full overflow-x-hidden">
        {/* Single unified card for post and comments */}
        <div className="overflow-hidden border border-sidebar-border rounded-lg md:max-w-3xl md:mx-auto">
          
          {/* Post content section */}
          <Card className="bg-sidebar rounded-none border-0">
            <div className="flex">
              <VoteControls 
                score={voteScore} 
                voteStatus={voteStatus} 
                onVote={handleVote} 
              />
              
              <div className="flex-1 p-4 min-w-0 overflow-x-hidden">
                <div className="flex items-center text-xs text-gray-400 mb-2 flex-wrap">
                  <Link to={`/r/${post.subreddit}`} className="font-medium text-gray-200 hover:underline mr-1 break-all">
                    r/{post.subreddit}
                  </Link>
                  <span className="mx-1">•</span>
                  <span className="break-words">Posted by{" "}</span>
                  <Link to={`/user/${authorName}`} className="hover:underline mx-1 text-gray-400 break-all">
                    u/{authorName}
                  </Link>
                  <span className="mx-1">•</span>
                  <span className="break-words">{post.timestamp}</span>
                </div>
                
                <h1 className="text-xl font-semibold mb-3 text-white break-words">{post.title}</h1>
                
                <div className="overflow-x-hidden">
                  <PostContent post={post} isDetailView={true} />
                </div>
                
                <PostFooter 
                  commentCount={post.commentCount} 
                  postId={post.id} 
                />
              </div>
            </div>
          </Card>
          
          {/* Subtle divider line */}
          <div className="mx-8 h-[0.5px] bg-gray-700/50"></div>
          
          {/* Comment box section */}
          <div className="bg-sidebar p-4 border-0 rounded-none">
            <CommentBox onSubmit={handleCommentSubmit} />
          </div>
          
          {/* Subtle divider line */}
          <div className="mx-8 h-[0.5px] bg-gray-700/50"></div>
          
          {/* Comments section */}
          <div className="bg-sidebar p-4 border-0 rounded-none">
            {comments.length > 0 ? (
              <>
                <h3 className="font-medium mb-4 text-white">{comments.length} Comments</h3>
                <CommentList 
                  comments={comments} 
                  postId={post.id}
                  onReplySubmit={handleReplySubmit}
                />
              </>
            ) : (
              <div className="text-center py-4 text-gray-400">
                <p>No comments yet. Be the first to comment!</p>
              </div>
            )}
          </div>
          
        </div>
      </div>
    </MainLayout>
  );
};

export default PostDetail;
