import React from 'react';
import './MainContent.css';
import { LearningSection } from './LearningSection'
import { UserHub } from './UserHub'
import { LearningHub } from './LearningHub'

export const MainContent = () => {
  return (
    <div className="main-content">
      <div className="page-title">
        Welcome!
      </div>

        <LearningSection />
        <UserHub />
        <LearningHub />
    </div>
  );
};
