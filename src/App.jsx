import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import Dashboard from './components/Dashboard';
import ExamMode from './components/ExamMode';
import StudyMode from './components/StudyMode';
import Result from './components/Result';
import QuestionManager from './components/QuestionManager';
import initialQuestions from './data/questions.json';

function App() {
  const [questions, setQuestions] = useState([]);

  useEffect(() => {
    const saved = localStorage.getItem('droneQuestions');
    if (saved) {
      setQuestions(JSON.parse(saved));
    } else {
      setQuestions(initialQuestions);
      localStorage.setItem('droneQuestions', JSON.stringify(initialQuestions));
    }
  }, []);

  const saveQuestions = (newQuestions) => {
    setQuestions(newQuestions);
    localStorage.setItem('droneQuestions', JSON.stringify(newQuestions));
  };

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Dashboard questionsCount={questions.length} />} />
        <Route path="/exam" element={<ExamMode questions={questions} />} />
        <Route path="/study" element={<StudyMode questions={questions} />} />
        <Route path="/result" element={<Result questions={questions} />} />
        <Route path="/manage" element={<QuestionManager questions={questions} saveQuestions={saveQuestions} />} />
      </Routes>
    </Router>
  );
}

export default App;
