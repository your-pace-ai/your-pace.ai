import React, { useState, useEffect } from 'react'
import './MainContent.css'
import { LearningSection } from './LearningSection'
import { UserHub } from './UserHub'
import { LearningHub } from './LearningHub'
import { currentUser } from '../../api/api'
import { useNavigate } from 'react-router-dom'

export const MainContent = () => {
  const [user, setUser] = useState(null)
  const navigate = useNavigate()

  useEffect(() => {
      (
          async () => {
              const currUser = await currentUser()
              setUser(currUser)
          }
      )()
  }, [navigate])

  return (
    <div className="main-content">
      <div className="page-title">
        {user ? <h1>Welcome</h1> : <h1>Please login</h1>}
      </div>
        <LearningSection />
        <UserHub />
        <LearningHub />
    </div>
  );
};
