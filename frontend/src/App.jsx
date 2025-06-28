import './App.css'
import LoginPage from './components/SignInUp/LoginPage.jsx'
import LandingPage from './components/LandingPage/LandingPage.jsx'
import { SignUp } from './components/SignInUp/SignUp.jsx'
import { Routes, Route } from 'react-router-dom'
import { Sidebar } from './components/Sidebar/Sidebar.jsx'
import { MainContent } from './components/Hub/MainContent.jsx'

function App() {
  return (
    <>
      <Routes>
        <Route path='/' element={<LandingPage></LandingPage>}></Route>
        <Route path='/login' element={<LoginPage></LoginPage>}></Route>
        <Route path='/signup' element={<SignUp></SignUp>}></Route>
        <Route path='/dashboard'
        element={<>
          <div className="app">
            <Sidebar></Sidebar>
            <MainContent></MainContent>
          </div>
        </>}>
        </Route>
      </Routes>
    </>
  )
}

export default App
