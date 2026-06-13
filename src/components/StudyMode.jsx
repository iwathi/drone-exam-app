import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { CheckCircle, XCircle } from 'lucide-react';
import { useAuth } from '../AuthContext';
import { db } from '../firebase';
import { collection, doc, setDoc, serverTimestamp } from 'firebase/firestore';

function StudyMode({ questions: defaultQuestions }) {
  const navigate = useNavigate();
  const location = useLocation();
  const questions = location.state?.questions || defaultQuestions;
  const mode = location.state?.mode || 'normal';
  const chapterName = location.state?.chapterName || '';
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [answerHistory, setAnswerHistory] = useState([]);
  const { currentUser } = useAuth();
  
  // セッションドキュメントの参照を保持
  const [sessionDocRef, setSessionDocRef] = useState(null);

  useEffect(() => {
    if (currentUser) {
      setSessionDocRef(doc(collection(db, `users/${currentUser.uid}/progress`)));
    }
  }, [currentUser]);

  const currentQ = questions[currentIndex];

  const handleAnswer = async (index) => {
    if (isAnswered) return;
    setSelectedAnswer(index);
    setIsAnswered(true);

    const isCorrect = index === questions[currentIndex].correctAnswerIndex;
    let newCorrectCount = correctCount;
    if (isCorrect) {
      newCorrectCount = correctCount + 1;
      setCorrectCount(newCorrectCount);
    }
    
    const newHistory = [
      ...answerHistory,
      {
        questionId: questions[currentIndex].id,
        reference: questions[currentIndex].reference || 'その他',
        isCorrect: isCorrect
      }
    ];
    setAnswerHistory(newHistory);

    // 回答のたびにFirestoreを更新（中断しても残るようにする）
    if (sessionDocRef) {
      try {
        await setDoc(sessionDocRef, {
          type: 'study',
          mode: mode,
          score: newCorrectCount,
          total: newHistory.length,
          details: newHistory,
          timestamp: serverTimestamp()
        }, { merge: true });
      } catch (e) {
        console.error("Error updating progress:", e);
      }
    }
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

  // 教則PDFへのリンク（ページ先頭を開く）
  const getPdfLink = (refStr) => {
    if (!refStr) return null;
    return `https://www.mlit.go.jp/koku/content/001860312.pdf`;
  };

  const handleFinish = () => {
    // 終了時は単にダッシュボードに戻る（保存は都度行っているため不要）
    navigate('/');
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
        <button className="btn btn-outline" onClick={handleFinish}>
          終了して戻る
        </button>
        
        {isAnswered && (
          <button className="btn" onClick={currentIndex < questions.length - 1 ? nextQuestion : handleFinish}>
            {currentIndex < questions.length - 1 ? '次の問題へ' : '学習を完了する'}
          </button>
        )}
      </div>
    </div>
  );
}

export default StudyMode;
