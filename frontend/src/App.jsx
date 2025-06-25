import './App.css'
import LoginPage from './components/SignInUp/LoginPage.jsx'
import LandingPage from './components/LandingPage/LandingPage.jsx'
import { Routes, Route, Link } from 'react-router-dom'

function App() {

  return (
    <>
      <Routes>
        <Route path='/' element={<LandingPage></LandingPage>}></Route>
        <Route path='/login' element={<LoginPage></LoginPage>}></Route>
      </Routes>
    </>
  )
}

export default App
