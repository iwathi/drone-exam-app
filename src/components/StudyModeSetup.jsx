import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, Shuffle, Target, ArrowLeft } from 'lucide-react';

function StudyModeSetup({ questions }) {
  const navigate = useNavigate();
  const [selectedChapter, setSelectedChapter] = useState('2');

  const handleStartNormal = () => {
    navigate('/study', { state: { mode: 'normal', questions } });
  };

  const handleStartRandom = () => {
    const shuffled = [...questions].sort(() => 0.5 - Math.random());
    navigate('/study', { state: { mode: 'random', questions: shuffled } });
  };

  const handleStartChapter = () => {
    const chapterQuestions = questions.filter(q => {
      const ref = q.reference || '';
      return ref.startsWith(selectedChapter + '.');
    });
    
    if (chapterQuestions.length === 0) {
      alert(`第${selectedChapter}章に関連する問題が見つかりませんでした。`);
      return;
    }
    
    navigate('/study', { state: { mode: 'chapter', chapterName: `第${selectedChapter}章`, questions: chapterQuestions } });
  };

  return (
    <div className="card">
      <div className="flex items-center gap-4 mb-6">
        <button className="btn btn-outline" style={{ padding: '0.5rem' }} onClick={() => navigate('/')}>
          <ArrowLeft size={20} />
        </button>
        <h2 style={{ marginBottom: 0 }}>自己学習モードの設定</h2>
      </div>

      <div className="flex flex-col gap-4">
        {/* 通常モード */}
        <div style={{ border: '1px solid var(--border-color)', borderRadius: '0.5rem', padding: '1rem' }}>
          <div className="flex items-center gap-2 mb-2">
            <BookOpen color="var(--primary-color)" />
            <h3 style={{ margin: 0 }}>通常モード</h3>
          </div>
          <p className="text-secondary mb-4">登録されている順番通りに全問題を解いていきます。</p>
          <button className="btn w-full" onClick={handleStartNormal}>通常モードで開始</button>
        </div>

        {/* ランダムモード */}
        <div style={{ border: '1px solid var(--border-color)', borderRadius: '0.5rem', padding: '1rem' }}>
          <div className="flex items-center gap-2 mb-2">
            <Shuffle color="var(--warning-color)" />
            <h3 style={{ margin: 0 }}>ランダムモード</h3>
          </div>
          <p className="text-secondary mb-4">全問題をランダムな順番で出題します。実力試しに最適です。</p>
          <button className="btn w-full" style={{ backgroundColor: 'var(--warning-color)', color: '#1a1a1a', fontWeight: 'bold' }} onClick={handleStartRandom}>ランダムモードで開始</button>
        </div>

        {/* 章単位重点モード */}
        <div style={{ border: '1px solid var(--border-color)', borderRadius: '0.5rem', padding: '1rem' }}>
          <div className="flex items-center gap-2 mb-2">
            <Target color="var(--danger-color)" />
            <h3 style={{ margin: 0 }}>章単位重点モード</h3>
          </div>
          <p className="text-secondary mb-4">教則の特定の章に絞って集中的に学習します。</p>
          <div className="flex gap-2 mb-4">
            <select 
              value={selectedChapter} 
              onChange={(e) => setSelectedChapter(e.target.value)}
              style={{
                flex: 1,
                padding: '0.75rem',
                backgroundColor: 'var(--bg-dark)',
                color: 'var(--text-primary)',
                border: '1px solid var(--border-color)',
                borderRadius: '0.5rem'
              }}
            >
              <option value="2">第2章: 無人航空機操縦者の心得</option>
              <option value="3">第3章: 無人航空機に関する規則</option>
              <option value="4">第4章: 無人航空機のシステム</option>
              <option value="5">第5章: 無人航空機の操縦者及び運航体制</option>
              <option value="6">第6章: 運航上のリスク管理</option>
            </select>
          </div>
          <button className="btn w-full" style={{ backgroundColor: 'var(--danger-color)', color: '#fff' }} onClick={handleStartChapter}>重点モードで開始</button>
        </div>
      </div>
    </div>
  );
}

export default StudyModeSetup;
