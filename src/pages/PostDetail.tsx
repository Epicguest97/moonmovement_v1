import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import MainLayout from '@/components/layout/MainLayout';
import PostContent from '@/components/post/PostContent';
import PostFooter from '@/components/post/PostFooter';
import CommentBox from '@/components/comments/CommentBox';
import CommentList from '@/components/comments/CommentList';
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
          setLikeScore(transformedPost.voteScore);
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
        <div className={isMobile ? "min-h-screen bg-black text-white flex items-center justify-center" : "max-w-3xl mx-auto p-4"}>
          <div className={isMobile ? "text-center" : "bg-sidebar p-6 rounded-md border border-sidebar-border text-center"}>
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
        <div className={isMobile ? "min-h-screen bg-black text-white flex items-center justify-center p-4" : "max-w-3xl mx-auto p-4"}>
          <div className={isMobile ? "text-center" : "bg-sidebar p-6 rounded-md border border-sidebar-border text-center"}>
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
  
  if (isMobile) {
    return (
      <MainLayout>
        <div className="min-h-screen bg-black text-white">
          <div className="px-4 py-2">
            <div className="flex items-center text-xs text-gray-400 mb-3">
              <span className="text-gray-200 font-medium">r/{post.subreddit}</span>
              <span className="mx-2">•</span>
              <span>u/{authorName}</span>
              <span className="mx-2">•</span>
              <span>{post.timestamp}</span>
            </div>
            
            <h1 className="text-lg font-semibold mb-4 text-white leading-tight">
              {post.title}
            </h1>
            
            <div className="mb-4">
              <PostContent post={post} isDetailView={true} />
            </div>
            
            <PostFooter 
              commentCount={post.commentCount}
              postId={post.id}
              likeScore={likeScore}
              isLiked={isLiked}
              onLike={handleLike}
            />
            
            <div className="mt-6 mb-4">
              <CommentBox onSubmit={handleCommentSubmit} />
            </div>
            
            {comments.length > 0 && (
              <div className="mt-6">
                <h3 className="font-medium mb-4 text-white text-sm">
                  {comments.length} Comments
                </h3>
                <CommentList 
                  comments={comments} 
                  postId={post.id}
                  onReplySubmit={handleReplySubmit}
                />
              </div>
            )}
          </div>
        </div>
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
            
            <PostFooter 
              commentCount={post.commentCount}
              postId={post.id}
              likeScore={likeScore}
              isLiked={isLiked}
              onLike={handleLike}
            />
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
