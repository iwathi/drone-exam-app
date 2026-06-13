import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, AlertTriangle } from 'lucide-react';

function ExamMode({ questions }) {
  const navigate = useNavigate();
  const [examQuestions, setExamQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(30 * 60); // 30 minutes
  
  useEffect(() => {
    // 実際のCBTは50問ですが、足りない場合はある分だけで実施
    // ランダムにシャッフルして最大50問抽出
    const shuffled = [...questions].sort(() => 0.5 - Math.random());
    setExamQuestions(shuffled.slice(0, 50));
  }, [questions]);

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

  const handleAnswer = (index) => {
    setAnswers({ ...answers, [currentIndex]: index });
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
      
      <div className="flex justify-between">
        <button className="btn btn-outline" onClick={prevQuestion} disabled={currentIndex === 0}>
          前へ
        </button>
        
        {currentIndex < examQuestions.length - 1 ? (
          <button className="btn" onClick={nextQuestion}>
            次へ
          </button>
        ) : (
          <button className="btn btn-danger" onClick={finishExam}>
            試験終了
          </button>
        )}
      </div>
    </div>
  );
}

export default ExamMode;
