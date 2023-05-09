import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import InfiniteScroll from 'react-infinite-scroll-component';
import { collection, query, orderBy, limit, startAfter, where, doc  } from 'firebase/firestore';
import { getFirestore, getDocs, deleteDoc  } from 'firebase/firestore';
import { app } from '../../../firebaseconfig';
import { updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { addDoc } from 'firebase/firestore';

export default function MyRoutine() {
  const [posts, setPosts] = useState([]);
  const [ morePost, setMorePost ] = useState(true)
  const [lastDoc, setLastDoc] = useState(null);
  const [currentUserEmail, setCurrentUserEmail] = useState('');


  const nav = useNavigate();

  const db = getFirestore(app);

  const getPostUser = async (email) => {
    const usersRef = collection(db, 'users');
    const userQuery = query(usersRef, where('email', '==', email));
    
    const userSnapshot = await getDocs(userQuery);
    
    if (!userSnapshot.empty) {
      const userData = userSnapshot.docs[0].data();
      return userData.name;
    } else {
      return 'Unknown User';
    }
  };

  const fetchPosts = async () => {
    const postRef = collection(db, 'posts');
    let postQuery = query(postRef, orderBy('createdAt', 'desc'), limit(7));
  
    if (lastDoc) {
      postQuery = query(postRef, orderBy('createdAt', 'desc'), startAfter(lastDoc), limit(7));
    }
  
    const snapshot = await getDocs(postQuery);
    if (snapshot.empty) {
      setMorePost(false);
      return;
    }
  
    setLastDoc(snapshot.docs[snapshot.docs.length - 1]);
    const newPosts = await Promise.all(
      snapshot.docs.map(async (doc) => {
        const post = { id: doc.id, ...doc.data() };
        post.userName = await getPostUser(post.email);
        post.comments = await fetchComments(post.id);
        return post;
      })
    );

    setPosts((prevPosts) => {
      const mergedPosts = [...prevPosts, ...newPosts];
      const uniquePosts = mergedPosts.filter(
        (post, index, self) => index === self.findIndex((p) => p.id === post.id)
      );
    
      return uniquePosts;
    });

  };
  const fetchMorePosts = () => {
    fetchPosts();
  };
  
  useEffect(() => {
    fetchPosts();
  }, []);

  

  const creatPost = () => {
    nav('/postroutine')
  }

  
  const auth = getAuth(app);
  onAuthStateChanged(auth, (user) => {
    if (user) {
      setCurrentUserEmail(user.email);
    }
  });

  const toggleLike = async (post) => {
    const postRef = doc(db, 'posts', post.id);
    const likedByCurrentUser = post.likedBy.includes(currentUserEmail);
    {post.likedBy.includes(currentUserEmail) ? 'Unlike' : 'Like'}
  
    if (likedByCurrentUser) {
      await updateDoc(postRef, {
        likedBy: arrayRemove(currentUserEmail),
        likes: post.likes - 1,
      });
      post.likes--;
      post.likedBy = post.likedBy.filter((email) => email !== currentUserEmail);
    } else {
      await updateDoc(postRef, {
        likedBy: arrayUnion(currentUserEmail),
        likes: post.likes + 1,
      });
      post.likes++;
      post.likedBy.push(currentUserEmail);
    }
  
    setPosts((prevPosts) => {
      const updatedPosts = prevPosts.map((p) => (p.id === post.id ? post : p));
      return updatedPosts;
    });
  };

  const addComment = async (postId, commentText) => {
    const commentData = {
      postId,
      userEmail: currentUserEmail,
      text: commentText,
      createdAt: new Date().toISOString(),
    };
  
    const commentDocRef = await addDoc(collection(db, 'posts', postId, "comments"), commentData);
    const comment = { id: commentDocRef.id, ...commentData };
    comment.userName = await getPostUser(comment.userEmail);
  
    setPosts((prevPosts) => {
      const updatedPosts = prevPosts.map((p) => {
        if (p.id === postId) {
          p.comments = [comment, ...p.comments];
        }
        return p;
      });
      return updatedPosts;
    });
  };

  const fetchComments = async (postId) => {
    const commentsRef = collection(db, 'posts', postId, "comments");
    const commentsQuery = query(
      commentsRef,
      where('postId', '==', postId),
      orderBy('createdAt', 'desc')
    );
  
    const commentsSnapshot = await getDocs(commentsQuery);
    const comments = await Promise.all(
      commentsSnapshot.docs.map(async (doc) => {
        const comment = { id: doc.id, ...doc.data() };
        comment.userName = await getPostUser(comment.userEmail);
        return comment;
      })
    );
  
    return comments;
  };

  const deletePost = async (postId) => {
    if(window.confirm("이 게시물을 삭제하시겠습니까?")){
      const postRef = doc(db, 'posts', postId);
      await deleteDoc(postRef);
  
      setPosts(posts.filter((post) => post.id !== postId));
    }
  };

  

  const deleteComment = async (commentId, postId) => {
    const commentRef = doc(db, 'posts', postId, "comments", commentId);
    await deleteDoc(commentRef);
  
    setPosts((prevPosts) => {
      const updatedPosts = prevPosts.map((post) => {
        if (post.id === postId) {
          post.comments = post.comments.filter((comment) => comment.id !== commentId);
        }
        return post;
      });
      return updatedPosts;
    });
  };

  



  return (
    <div className="container mx-auto p-4">
      <button
        onClick={creatPost}
        className="bg-blue-500 text-white px-4 py-2 rounded-md mb-4"
      >
        게시물 작성
      </button>
      <InfiniteScroll
        dataLength={posts.length}
        next={fetchMorePosts}
        hasMore={morePost}
        loader={<div className="flex items-center justify-center my-2"><img className="align-center" src='/ball-triangle.svg' alt="Loading..."></img></div>}
        endMessage={
          <p className="text-center font-semibold">
            마지막 포스트입니다.
          </p>
        }
      >
        {posts.map((post) => (
          <div key={post.id} className="bg-white shadow-md rounded-md p-4 mb-4">
            <div className="flex items-center mb-2">
              <div className="font-bold text-xl">{post.userName}</div>
            </div>
            <div className="mb-2">
              <img src={post.image} className="w-full h-auto" />
            </div>
            <p>{post.content}</p>
            <div className="flex justify-between items-center mt-4 font-semibold">
              <div>
                <button onClick={() => toggleLike(post)} className="text-2xl">
                  <i
                    className={`fa${post.likedBy.includes(currentUserEmail) ? 's' : 'r'} fa-heart`}
                    style={
                      post.likedBy.includes(currentUserEmail)
                        ? { color: 'red' }
                        : { color: 'black' }
                    }
                  ></i>
                </button>
                <span className="text-2xl ml-2">{post.likes}</span>
              </div>
              {post.email === currentUserEmail && (
                <div className="flex">
                  <button
                    onClick={() => nav(`/edit/${post.id}`)}
                    className="bg-yellow-500 text-white px-2 py-1 rounded-md mr-2 text-sm"
                  >
                    수정
                  </button>
                  <button
                    onClick={() => deletePost(post.id)}
                    className="bg-red-500 text-white px-2 py-1 rounded-md text-sm"
                  >
                    삭제
                  </button>
                </div>
              )}
            </div>
            <div key={post.id} className="bg-white shadow-md rounded-md p-4 mb-4 mt-4">
              <div className="font-semibold mb-2">댓글 : {post.comments ? post.comments.length : 0}</div>
                {post.comments &&
                  post.comments.map((comment) => (
                    <div key={comment.id} className="bg-gray-100 p-2 my-2 rounded-md">
                        <div className="flex">
                        <p className="font-semibold">
                          {comment.userName} : {comment.text}
                        </p>
                        {comment.userEmail === currentUserEmail && (
                          <div className="flex">
                            <button
                              onClick={() => deleteComment(comment.id, post.id)}
                              className="text-red-500 ml-5"
                            >
                              삭제
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const commentText = e.target.elements.commentText.value;
                  if (commentText) {
                    addComment(post.id, commentText);
                    e.target.elements.commentText.value = '';
                  }
                }}
                className="flex"
              >
                <input
                  type="text"
                  name="commentText"
                  className="flex-grow border-2 border-gray-300 p-2 rounded-md"
                  placeholder="댓글을 입력하세요..."
                />
                <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded-md ml-2">
                  등록
                </button>
              </form>
            </div>
            </div>
        ))}
      </InfiniteScroll>
    </div>
  );
}
