import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import MainLayout from '@/components/layout/MainLayout';
import PostContent from '@/components/post/PostContent';
import PostFooter from '@/components/post/PostFooter';
import CommentBox from '@/components/comments/CommentBox';
import CommentList from '@/components/comments/CommentList';
import LikeButton from '@/components/post/LikeButton';
import EditPostDialog from '@/components/post/EditPostDialog';
import { Post } from '@/components/post/PostCard';
import { CommentType } from '@/components/comments/CommentList';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

const PostDetail = () => {
  const { id } = useParams<{ id: string }>();
  const isMobile = useIsMobile();
  const [post, setPost] = useState<Post | null>(null);
  const [comments, setComments] = useState<CommentType[]>([]);
  const [isLiked, setIsLiked] = useState(false);
  const [likeScore, setLikeScore] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

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

  const fetchPost = () => {
    if (id) {
      console.log('Fetching post with ID:', id);
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
            voteScore: data.likeCount || 0,
            commentCount: data.comments?.length || 0,
            timestamp: new Date(data.createdAt).toLocaleString(),
            subreddit: data.subreddit || 'general',
            poll: data.poll || null // Ensure poll data is preserved
          };
          setPost(transformedPost);
          setLikeScore(transformedPost.voteScore);
          setLoading(false);
        })
        .catch((error) => {
          console.error('Failed to fetch post:', error);
          setError(error.message);
          setLoading(false);
        });
    }
  };

  const fetchComments = () => {
    if (id) {
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
  };

  useEffect(() => {
    fetchPost();
    fetchComments();
  }, [id]);
  
  const handleLike = async () => {
    const username = localStorage.getItem('username');
    if (!username) {
      alert('You must be signed in to like posts.');
      return;
    }

    try {
      const res = await fetch(`https://moonmovement.onrender.com/api/posts/${post.id}/like`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username })
      });
      
      if (!res.ok) throw new Error('Failed to like post');
      
      const updatedPost = await res.json();
      setLikeScore(updatedPost.likeCount || 0);
      setIsLiked(!isLiked);
    } catch (err) {
      console.error('Failed to like post:', err);
      alert('Failed to like post');
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
      
      fetchComments();
      setPost({ ...post, commentCount: post.commentCount + 1 });
    } catch (err) {
      console.error('Error submitting reply:', err);
      throw err;
    }
  };

  const handleEditPost = async (title: string, content: string) => {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('You must be logged in to edit posts');
    }

    try {
      const response = await fetch(`https://moonmovement.onrender.com/api/posts/${post.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ title, content })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update post');
      }

      setPost({ ...post, title, content });
    } catch (error) {
      console.error('Error updating post:', error);
      throw error;
    }
  };
  
  if (loading) {
    return (
      <MainLayout>
        <div className={isMobile ? "min-h-screen bg-background text-foreground flex items-center justify-center px-4" : "max-w-3xl mx-auto p-4"}>
          <div className={isMobile ? "text-center w-full" : "bg-sidebar p-6 rounded-md border border-sidebar-border text-center"}>
            <h2 className="text-lg font-bold mb-2 text-foreground">Loading...</h2>
            <p className="text-muted-foreground">Fetching post details...</p>
          </div>
        </div>
      </MainLayout>
    );
  }
  
  if (error || !post) {
    return (
      <MainLayout>
        <div className={isMobile ? "min-h-screen bg-background text-foreground flex items-center justify-center p-4" : "max-w-3xl mx-auto p-4"}>
          <div className={isMobile ? "text-center w-full" : "bg-sidebar p-6 rounded-md border border-sidebar-border text-center"}>
            <h2 className="text-lg font-bold mb-2 text-foreground">Post Not Found</h2>
            <p className="text-muted-foreground mb-4">
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
  
  if (isMobile) {
    return (
      <MainLayout>
        <div className="min-h-screen bg-background text-foreground w-full overflow-x-hidden">
          {/* Mobile Header */}
          <div className="sticky top-0 bg-sidebar border-b border-sidebar-border z-10 px-4 py-3">
            <div className="flex items-center space-x-3">
              <Link to="/">
                <Button variant="ghost" size="sm" className="p-1">
                  <ArrowLeft size={20} className="text-foreground" />
                </Button>
              </Link>
              <div className="flex-1 min-w-0">
                <div className="text-xs text-muted-foreground truncate">
                  r/{post.subreddit} • u/{authorName}
                </div>
              </div>
            </div>
          </div>

          {/* Mobile Content */}
          <div className="bg-sidebar">
            <div className="px-4 py-4">
              <h1 className="text-lg font-semibold mb-3 text-foreground leading-tight break-words">
                {post.title}
              </h1>
              
              <div className="mb-4">
                <PostContent post={post} isDetailView={true} />
              </div>
              
              {/* Action Bar */}
              <div className="flex items-center justify-between py-3 border-t border-b border-sidebar-border">
                <LikeButton 
                  score={likeScore}
                  isLiked={isLiked}
                  onLike={handleLike}
                />
                
                <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                  <span>{post.commentCount} comments</span>
                  <span>{post.timestamp}</span>
                </div>
              </div>
              
              {/* Comment Box */}
              <div className="py-4">
                <CommentBox onSubmit={handleCommentSubmit} />
              </div>
              
              {/* Comments */}
              {comments.length > 0 && (
                <div className="border-t border-sidebar-border pt-4">
                  <CommentList 
                    comments={comments} 
                    postId={post.id}
                    onReplySubmit={handleReplySubmit}
                    onCommentUpdate={fetchComments}
                  />
                </div>
              )}
            </div>
          </div>
        </div>

        <EditPostDialog
          isOpen={isEditDialogOpen}
          onClose={() => setIsEditDialogOpen(false)}
          onSave={handleEditPost}
          initialTitle={post.title}
          initialContent={post.content}
        />
      </MainLayout>
    );
  }
  
  return (
    <MainLayout>
      <div className="w-full max-w-full overflow-x-hidden">
        <div className="overflow-hidden border border-sidebar-border rounded-lg md:max-w-3xl md:mx-auto">
          
          <div className="bg-sidebar p-4">
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
            
            <div className="overflow-x-hidden mb-4">
              <PostContent post={post} isDetailView={true} />
            </div>
            
            <div className="flex items-center justify-between text-xs text-gray-400 mt-3 pt-2">
              <div className="flex items-center space-x-4">
                <LikeButton 
                  score={likeScore}
                  isLiked={isLiked}
                  onLike={handleLike}
                />
                
                <PostFooter 
                  commentCount={post.commentCount}
                  postId={post.id}
                  subreddit={post.subreddit}
                  authorUsername={authorName}
                  onEditClick={() => setIsEditDialogOpen(true)}
                />
              </div>
            </div>
          </div>
          
          <div className="mx-8 h-[0.5px] bg-gray-700/50"></div>
          
          <div className="bg-sidebar p-4">
            <CommentBox onSubmit={handleCommentSubmit} />
          </div>
          
          <div className="mx-8 h-[0.5px] bg-gray-700/50"></div>
          
          <div className="bg-sidebar p-4">
            {comments.length > 0 ? (
              <>
                <h3 className="font-medium mb-4 text-white">{comments.length} Comments</h3>
                <CommentList 
                  comments={comments} 
                  postId={post.id}
                  onReplySubmit={handleReplySubmit}
                  onCommentUpdate={fetchComments}
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

      <EditPostDialog
        isOpen={isEditDialogOpen}
        onClose={() => setIsEditDialogOpen(false)}
        onSave={handleEditPost}
        initialTitle={post.title}
        initialContent={post.content}
      />
    </MainLayout>
  );
};

export default PostDetail;
