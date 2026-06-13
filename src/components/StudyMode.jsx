import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { CheckCircle, XCircle } from 'lucide-react';

function StudyMode({ questions: defaultQuestions }) {
  const navigate = useNavigate();
  const location = useLocation();
  const questions = location.state?.questions || defaultQuestions;
  const mode = location.state?.mode || 'normal';
  const chapterName = location.state?.chapterName || '';
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [isAnswered, setIsAnswered] = useState(false);

  const currentQ = questions[currentIndex];

  const handleAnswer = (idx) => {
    if (isAnswered) return;
    setSelectedAnswer(idx);
    setIsAnswered(true);
  };

  const nextQuestion = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setSelectedAnswer(null);
      setIsAnswered(false);
    } else {
      navigate('/');
    }
  };

  if (!questions || questions.length === 0) return <div>問題がありません。</div>;

  const isCorrect = selectedAnswer === currentQ.correctAnswerIndex;

  // 教則PDFのページマッピング（目安）
  const getPdfLink = (refStr) => {
    if (!refStr) return null;
    let page = 1;
    if (refStr.startsWith('2.')) page = 5;
    if (refStr.startsWith('3.1')) page = 9;
    if (refStr.startsWith('3.2')) page = 25;
    if (refStr.startsWith('4.1')) page = 31;
    if (refStr.startsWith('4.4')) page = 35;
    if (refStr.startsWith('5.')) page = 47;
    if (refStr.startsWith('6.')) page = 51;
    
    // ページ指定URLを生成
    return `https://www.mlit.go.jp/koku/content/001860312.pdf#page=${page}`;
  };

  return (
    <div className="card">
      <div className="flex justify-between items-center mb-6">
        <h2 style={{ marginBottom: 0 }}>
          自己学習モード 
          {mode === 'chapter' && <span style={{ fontSize: '1rem', marginLeft: '0.5rem', color: 'var(--danger-color)' }}>({chapterName})</span>}
          {mode === 'random' && <span style={{ fontSize: '1rem', marginLeft: '0.5rem', color: 'var(--warning-color)' }}>(ランダム)</span>}
        </h2>
        <span className="badge badge-success">解説付き</span>
      </div>

      <p className="text-secondary mb-4">問題 {currentIndex + 1} / {questions.length}</p>
      
      <h3 className="mb-6">{currentQ.question}</h3>
      
      <div className="flex flex-col mb-6">
        {currentQ.options.map((option, idx) => {
          let btnClass = "option-btn";
          if (isAnswered) {
            if (idx === currentQ.correctAnswerIndex) btnClass += " correct";
            else if (idx === selectedAnswer) btnClass += " wrong";
          }
          return (
            <button 
              key={idx}
              className={btnClass}
              onClick={() => handleAnswer(idx)}
              disabled={isAnswered}
            >
              {idx + 1}. {option}
            </button>
          );
        })}
      </div>

      {isAnswered && (
        <div className="mb-6" style={{ padding: '1rem', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: '0.5rem' }}>
          <div className="flex items-center gap-2 mb-2">
            {isCorrect ? <CheckCircle color="var(--success-color)" /> : <XCircle color="var(--danger-color)" />}
            <h4 style={{ margin: 0 }}>{isCorrect ? '正解' : '不正解'}</h4>
          </div>
          <p style={{ marginTop: '0.5rem', marginBottom: '0.5rem' }}><strong>正解: {currentQ.correctAnswerIndex + 1}. {currentQ.options[currentQ.correctAnswerIndex]}</strong></p>
          <p>{currentQ.explanation}</p>
          {currentQ.reference && (
            <div className="mt-2 flex flex-col gap-1">
              <p className="text-secondary" style={{ fontSize: '0.875rem', margin: 0 }}>
                根拠: {currentQ.reference}
              </p>
              <a 
                href={getPdfLink(currentQ.reference)} 
                target="_blank" 
                rel="noopener noreferrer"
                style={{ fontSize: '0.875rem', color: 'var(--primary-color)', textDecoration: 'underline' }}
              >
                教則PDFの該当ページを開く
              </a>
            </div>
          )}
        </div>
      )}
      
      <div className="flex justify-between">
        <button className="btn btn-outline" onClick={() => navigate('/')}>
          終了して戻る
        </button>
        
        {isAnswered && (
          <button className="btn" onClick={nextQuestion}>
            {currentIndex < questions.length - 1 ? '次の問題へ' : 'トップに戻る'}
          </button>
        )}
      </div>
    </div>
  );
}

export default StudyMode;
