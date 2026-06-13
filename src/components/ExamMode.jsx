import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, AlertTriangle } from 'lucide-react';
import { db } from '../firebase';
import { collection, doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { useAuth } from '../context/AuthContext';

function ExamMode({ questions }) {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [examQuestions, setExamQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(30 * 60); // 30 minutes
  const [sessionDocRef, setSessionDocRef] = useState(null);
  
  useEffect(() => {
    if (currentUser) {
      setSessionDocRef(doc(collection(db, `users/${currentUser.uid}/progress`)));
    }
    const shuffled = [...questions].sort(() => 0.5 - Math.random());
    setExamQuestions(shuffled.slice(0, 50));
  }, [questions, currentUser]);

  useEffect(() => {
    if (timeLeft <= 0) {
      finishExam();
      return;
    }
    const timer = setInterval(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [timeLeft]);

  const handleAnswer = async (index) => {
    const newAnswers = { ...answers, [currentIndex]: index };
    setAnswers(newAnswers);

    if (sessionDocRef) {
      let correctCount = 0;
      const details = [];
      examQuestions.forEach((q, idx) => {
        if (newAnswers[idx] !== undefined) {
          const isCorrect = newAnswers[idx] === q.correctAnswerIndex;
          if (isCorrect) correctCount++;
          details.push({
            questionId: q.id,
            reference: q.reference || 'その他',
            isCorrect: isCorrect
          });
        }
      });

      try {
        await setDoc(sessionDocRef, {
          type: 'exam',
          score: correctCount,
          total: details.length,
          details: details,
          timestamp: serverTimestamp()
        }, { merge: true });
      } catch (e) {
        console.error("Error updating exam progress: ", e);
      }
    }
  };

  const nextQuestion = () => {
    if (currentIndex < examQuestions.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const prevQuestion = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const handleEarlyExit = () => {
    if (window.confirm('試験を中断してここまでの結果を保存しますか？')) {
      finishExam();
    }
  };

  const finishExam = () => {
    // navigate to result passing answers
    navigate('/result', { state: { answers, examQuestions, mode: 'exam' } });
  };

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  if (examQuestions.length === 0) return <div>問題を読み込み中...</div>;

  const currentQ = examQuestions[currentIndex];
  const progress = ((currentIndex + 1) / examQuestions.length) * 100;

  return (
    <div className="card">
      <div className="flex justify-between items-center mb-6">
        <h2 style={{ marginBottom: 0 }}>模擬試験</h2>
        <div className="flex items-center gap-2" style={{ color: timeLeft < 300 ? 'var(--danger-color)' : 'inherit' }}>
          <Clock size={20} />
          <span style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>{formatTime(timeLeft)}</span>
        </div>
      </div>
      
      <div className="progress-container">
        <div className="progress-bar" style={{ width: `${progress}%` }}></div>
      </div>
      
      <p className="text-secondary mb-4">問題 {currentIndex + 1} / {examQuestions.length}</p>
      
      <h3 className="mb-6">{currentQ.question}</h3>
      
      <div className="flex flex-col mb-8">
        {currentQ.options.map((option, idx) => (
          <button 
            key={idx}
            className={`option-btn ${answers[currentIndex] === idx ? 'selected' : ''}`}
            onClick={() => handleAnswer(idx)}
          >
            {idx + 1}. {option}
          </button>
        ))}
      </div>
      
      <div className="flex justify-between mt-auto">
        <button 
          className="btn btn-outline" 
          onClick={prevQuestion}
          disabled={currentIndex === 0}
        >
          前の問題へ
        </button>
        
        {currentIndex < examQuestions.length - 1 ? (
          <button 
            className="btn" 
            onClick={nextQuestion}
            disabled={answers[currentIndex] === undefined}
          >
            次の問題へ
          </button>
        ) : (
          <button 
            className="btn" 
            onClick={finishExam}
            disabled={answers[currentIndex] === undefined}
            style={{ backgroundColor: 'var(--success-color)' }}
          >
            試験終了
          </button>
        )}
      </div>

      <div className="mt-8 pt-4" style={{ borderTop: '1px solid var(--border-color)', textAlign: 'center' }}>
        <button 
          className="btn btn-outline" 
          onClick={handleEarlyExit}
          style={{ color: 'var(--danger-color)', borderColor: 'var(--danger-color)' }}
        >
          <AlertTriangle size={18} style={{ display: 'inline', marginRight: '0.5rem', verticalAlign: 'middle' }} />
          試験を中断して終了する
        </button>
      </div>
    </div>
  );
}

export default ExamMode;
