import React from 'react'
import { BrowserRouter,Routes, Route } from "react-router-dom";
import Nav from "./components/navigation/Navigation"
import Login from "./components/logIn/Login"
import SignUp from './components/signUp/SignUp';
import KcalPgae from './components/kcalPage/KcalPage'
import UserProfile from './components/userprofile/UserProfile'
import AuthProvider from './AuthProvider';
import FoodPage from './components/foodPage/FoodPage'
import Main from './components/main/Main'
import ExercisePage from './components/exercisePage/ExercisePage';
import Community from './components/community/Community';
import MyRoutine from './components/myRoutine/MyRoutine';
import PostRoutine from './components/myRoutine/PostRoutine';
import EditRoutine from './components/myRoutine/EditRoutine';
import MyFood from './components/myFood/MyFood';
import PostMyFood from './components/myFood/PostMyFood';
import MyFoodPage from './components/myFood/MyFoodPage';
import EditMyfood from './components/myFood/EditMyfood';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Nav/>
          <Routes>
            <Route path="/login" element={<Login />}/>
            <Route path="/signUp" element={<SignUp />}/>
            <Route path="/kcalPage" element={<KcalPgae />}/>
            <Route path="/food" element={<FoodPage />}/>
            <Route path="/userprofile" element={<UserProfile />}/>
            <Route path="/" element={<Main />}/>
            <Route path="/exercisePage" element={<ExercisePage />}/>
            <Route path="/community" element={<Community />}/>
            <Route path="/myroutine" element={<MyRoutine />}/>
            <Route path="/postroutine" element={<PostRoutine />}/>
            <Route path="/edit/:postId" element={<EditRoutine />} />
            <Route path="/myfood" element={<MyFood />}/>
            <Route path="/postmyfood" element={<PostMyFood />}/>
            <Route path="/myfoodpage/:postId" element={<MyFoodPage />} />
            <Route path="/editmyfood/:postId" element={<EditMyfood />} />
          </Routes>
      </AuthProvider>   
    </BrowserRouter>
  )
}

export default App