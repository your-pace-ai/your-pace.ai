import './App.css'
import LoginPage from './components/SignInUp/LoginPage.jsx'
import LandingPage from './components/LandingPage/LandingPage.jsx'
import { SignUp } from './components/SignInUp/SignUp.jsx'
import { Routes, Route } from 'react-router-dom'

function App() {

  return (
    <>
      <Routes>
        <Route path='/' element={<LandingPage></LandingPage>}></Route>
        <Route path='/login' element={<LoginPage></LoginPage>}></Route>
        <Route path='/signup' element={<SignUp></SignUp>}></Route>
        <Route path='/dashboard' element={<h1>Welcome to the dashboard</h1>}></Route>
      </Routes>
    </>
  )
}

export default App
