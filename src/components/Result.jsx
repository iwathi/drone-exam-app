import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { CheckCircle, XCircle, Home } from 'lucide-react';
import { useAuth } from '../AuthContext';
import { db } from '../firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

function Result() {
  const location = useLocation();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { answers, examQuestions } = location.state || { answers: {}, examQuestions: [] };

  useEffect(() => {
    if (!examQuestions || !answers) {
      navigate('/');
    }
  }, [examQuestions, answers, navigate]);

  if (examQuestions.length === 0) {
    return (
      <div className="card text-center">
        <h2>結果が見つかりません</h2>
        <button className="btn mt-4" onClick={() => navigate('/')}>トップへ戻る</button>
      </div>
    );
  }

  let correctCount = 0;
  examQuestions.forEach((q, idx) => {
    if (answers[idx] === q.correctAnswerIndex) {
      correctCount++;
    }
  });

  const percentage = Math.round((correctCount / examQuestions.length) * 100);
  // 二等学科は50問中40問（80%）以上で合格
  const isPassed = percentage >= 80;

  return (
    <div className="card">
      <div className="text-center mb-8">
        <h1>試験結果</h1>
        <div style={{ fontSize: '3rem', fontWeight: 'bold', color: isPassed ? 'var(--success-color)' : 'var(--danger-color)' }}>
          {percentage}%
        </div>
        <p className="text-secondary" style={{ fontSize: '1.25rem' }}>
          {correctCount} / {examQuestions.length} 正解
        </p>
        <div className="mt-4">
          {isPassed ? (
            <span className="badge badge-success" style={{ fontSize: '1.2rem', padding: '0.5rem 1rem' }}>合格レベルです！🎉</span>
          ) : (
            <span className="badge badge-danger" style={{ fontSize: '1.2rem', padding: '0.5rem 1rem' }}>不合格レベルです（80%以上必要）</span>
          )}
        </div>
      </div>

      <h3 className="mb-4">解答と解説</h3>
      <div className="flex flex-col gap-6">
        {examQuestions.map((q, idx) => {
          const userAns = answers[idx];
          const isCorrect = userAns === q.correctAnswerIndex;
          
          return (
            <div key={idx} style={{ padding: '1rem', border: '1px solid var(--border-color)', borderRadius: '0.5rem' }}>
              <div className="flex items-center gap-2 mb-2">
                {isCorrect ? <CheckCircle size={18} color="var(--success-color)" /> : <XCircle size={18} color="var(--danger-color)" />}
                <strong>問 {idx + 1}</strong>
              </div>
              <p className="mb-2">{q.question}</p>
              
              <div className="mb-2" style={{ fontSize: '0.9rem' }}>
                <p>あなたの解答: {userAns !== undefined ? `${userAns + 1}. ${q.options[userAns]}` : '無回答'}</p>
                <p style={{ color: 'var(--success-color)' }}>正解: {q.correctAnswerIndex + 1}. {q.options[q.correctAnswerIndex]}</p>
              </div>
              
              <div style={{ backgroundColor: 'rgba(255,255,255,0.05)', padding: '0.75rem', borderRadius: '0.25rem', fontSize: '0.9rem' }}>
                <p>{q.explanation}</p>
                {q.reference && (
                  <p className="text-secondary mt-1" style={{ fontSize: '0.8rem' }}>根拠: {q.reference}</p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-8 text-center">
        <button className="btn" onClick={() => navigate('/')}>
          <Home size={20} />
          トップに戻る
        </button>
      </div>
    </div>
  );
}

export default Result;
