import './App.css'
import LoginPage from './components/SignInUp/LoginPage.jsx'
import LandingPage from './components/LandingPage/LandingPage.jsx'
import { SignUp } from './components/SignInUp/SignUp.jsx'
import { Routes, Route } from 'react-router-dom'
import { Sidebar } from './components/Sidebar/Sidebar.jsx'
import { MainContent } from './components/Hub/MainContent.jsx'
import { Modal } from './components/Modal/CreateLearningHubModal.jsx'
import { useState } from 'react'
import { MediaSection } from './components/MediaSection/MediaSection.jsx'
import { MainPanel } from './components/MainPanel/MainPanel.jsx'
import { PostFeed } from './components/Community/PostFeed/PostFeed.jsx'

function App() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const SubHubPage = () => {
    return (
      <>
            <div className="app">
              <Sidebar onOpenModal={() => setIsModalOpen(true)}></Sidebar>
              <div className="content">
                <MediaSection></MediaSection>
                <MainPanel></MainPanel>
                <Modal visible={isModalOpen} onClose={() => setIsModalOpen(false)}></Modal>
              </div>
            </div>
      </>
    )
  }

  const CommunityPage = () => {
    return (
      <>
          <div className="app">
            <Sidebar onOpenModal={() => setIsModalOpen(true)}></Sidebar>
            <div className="content community-content">
              <PostFeed/>
            </div>
            <Modal visible={isModalOpen} onClose={() => setIsModalOpen(false)}></Modal>
          </div>
        </>
    )
  }

  return (
    <>
      <Routes>
        <Route path='/' element={<LandingPage></LandingPage>}></Route>
        <Route path='/login' element={<LoginPage></LoginPage>}></Route>
        <Route path='/signup' element={<SignUp></SignUp>}></Route>
        <Route path='/dashboard'
        element={<>
          <div className="app">
            <Sidebar onOpenModal={() => setIsModalOpen(true)}></Sidebar>
            <MainContent></MainContent>
            <Modal visible={isModalOpen} onClose={() => setIsModalOpen(false)}></Modal>
          </div>
        </>}>
        </Route>
        <Route path='/subhub' element={<SubHubPage/>}></Route>
        <Route path='/community'
        element={<CommunityPage/>}>
        </Route>
      </Routes>
    </>
  )
}

export default App
