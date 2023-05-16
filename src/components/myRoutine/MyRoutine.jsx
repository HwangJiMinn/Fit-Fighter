import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import InfiniteScroll from "react-infinite-scroll-component";
import {
  collection,
  query,
  orderBy,
  limit,
  startAfter,
  where,
  doc,
  writeBatch,
} from "firebase/firestore";
import { getFirestore, getDocs, deleteDoc } from "firebase/firestore";
import { app } from "../../../firebaseconfig";
import { updateDoc, arrayUnion, arrayRemove } from "firebase/firestore";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { addDoc } from "firebase/firestore";

export default function MyRoutine() {
  const [posts, setPosts] = useState([]);
  const [morePost, setMorePost] = useState(true);
  const [lastDoc, setLastDoc] = useState(null);
  const [currentUserEmail, setCurrentUserEmail] = useState("");

  const nav = useNavigate();

  const db = getFirestore(app);

  // 이메일이 firebase에 있는 이메일과 firestore에 있는 이메일과 일치하는지 확인 후 사용자의 닉네임을 가져옴
  const getPostUser = async (email) => {
    const usersRef = collection(db, "users");
    const userQuery = query(usersRef, where("email", "==", email));

    const userSnapshot = await getDocs(userQuery);

    if (!userSnapshot.empty) {
      const userData = userSnapshot.docs[0].data();
      return userData.name;
    } else {
      return "Unknown User";
    }
  };

  // firestore에 저장되어있는 게시물을 가져오기
  const fetchPosts = async () => {
    const postRef = collection(db, "posts");
    let postQuery = query(postRef, orderBy("createdAt", "desc"), limit(5)); // 5개씩 가져오기

    if (lastDoc) {
      postQuery = query(
        postRef,
        orderBy("createdAt", "desc"),
        startAfter(lastDoc),
        limit(5)
      );
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

  // 게시물 작성 페이지로 이동
  const creatPost = () => {
    nav("/postroutine");
  };

  // 현재 로그인 되어있는 유저 정보 확인(좋아요 중복 및 수정 삭제 기능 구현을 위함)
  const auth = getAuth(app);
  onAuthStateChanged(auth, (user) => {
    if (user) {
      setCurrentUserEmail(user.email);
    }
  });

  // 좋아요 버튼 구현(한 계정당 하나의 좋아요만 누를 수 있음)
  const toggleLike = async (post) => {
    const postRef = doc(db, "posts", post.id);
    const likedByCurrentUser = post.likedBy.includes(currentUserEmail);
    {
      post.likedBy.includes(currentUserEmail) ? "Unlike" : "Like";
    }

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

  // 댓글 작성 구현
  const addComment = async (postId, commentText) => {
    const commentData = {
      postId,
      userEmail: currentUserEmail,
      text: commentText,
      createdAt: new Date().toISOString(),
    };

    const commentDocRef = await addDoc(
      collection(db, "posts", postId, "comments"),
      commentData
    );
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

  // 댓글을 firestore에서 가져오기
  const fetchComments = async (postId) => {
    const commentsRef = collection(db, "posts", postId, "comments");
    const commentsQuery = query(
      commentsRef,
      where("postId", "==", postId),
      orderBy("createdAt", "desc")
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

  // 게시물 삭제 구현
  const deletePost = async (postId) => {
    if (window.confirm("이 게시물을 삭제하시겠습니까?")) {
      try {
        const postRef = doc(db, "posts", postId);
        const commentsRef = collection(db, "posts", postId, "comments");

        const commentsSnapshot = await getDocs(commentsRef);
        const batch = writeBatch(db);
        commentsSnapshot.docs.forEach((doc) => {
          batch.delete(doc.ref);
        });

        batch.delete(postRef);

        await batch.commit();

        setPosts(posts.filter((post) => post.id !== postId));
      } catch (e) {
        console.error("게시물 삭제 실패:", e);
      }
    }
  };

  // 댓글 삭제 구현
  const deleteComment = async (commentId, postId) => {
    const commentRef = doc(db, "posts", postId, "comments", commentId);
    await deleteDoc(commentRef);

    setPosts((prevPosts) => {
      const updatedPosts = prevPosts.map((post) => {
        if (post.id === postId) {
          post.comments = post.comments.filter(
            (comment) => comment.id !== commentId
          );
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
      <InfiniteScroll // 무한스크롤 구현
        dataLength={posts.length}
        next={fetchMorePosts}
        hasMore={morePost}
        loader={
          <div className="flex items-center justify-center my-2">
            <img
              className="align-center"
              src="/ball-triangle.svg"
              alt="Loading..."
            ></img>
          </div>
        }
        endMessage={
          <p className="text-center font-semibold">마지막 포스트입니다.</p>
        }
      >
        {posts.map((post) => (
          <div key={post.id} className="bg-white shadow-md rounded-md p-4 mb-4">
            <div className="flex items-center mb-2">
              <div className="font-bold text-xl">{post.userName}</div>
            </div>
            <div className="mb-2 flex justify-center">
              <img
                src={post.image}
                className="w-[500px] h-[500px] object-cover"
              />
            </div>
            <p>{post.content}</p>
            <div className="flex justify-between items-center mt-4 font-semibold">
              <div>
                <button onClick={() => toggleLike(post)} className="text-2xl">
                  <i
                    className={`fa${
                      post.likedBy.includes(currentUserEmail) ? "s" : "r"
                    } fa-heart`}
                    style={
                      post.likedBy.includes(currentUserEmail)
                        ? { color: "red" }
                        : { color: "black" }
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
            <div
              key={post.id}
              className="bg-white shadow-md rounded-md p-4 mb-4 mt-4"
            >
              <div className="font-semibold mb-2">
                댓글 : {post.comments ? post.comments.length : 0}
              </div>
              {post.comments &&
                post.comments.map((comment) => (
                  <div
                    key={comment.id}
                    className="bg-gray-100 p-2 my-2 rounded-md"
                  >
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
                    e.target.elements.commentText.value = "";
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
                <button
                  type="submit"
                  className="bg-blue-500 text-white px-4 py-2 rounded-md ml-2"
                >
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
