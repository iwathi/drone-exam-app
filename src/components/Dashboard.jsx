import React from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, Timer, Settings } from 'lucide-react';

function Dashboard({ questionsCount }) {
  const navigate = useNavigate();

  return (
    <div className="card" style={{ textAlign: 'center' }}>
      <h1>二等無人航空機操縦士 学科試験</h1>
      <p className="text-secondary mb-8">
        登録問題数: {questionsCount}問
      </p>
      
      <div className="flex flex-col gap-4">
        <button className="btn" onClick={() => navigate('/exam')}>
          <Timer size={20} />
          模擬試験 (50問 / 30分)
        </button>
        
        <button className="btn" onClick={() => navigate('/study')} style={{ backgroundColor: '#10b981' }}>
          <BookOpen size={20} />
          自己学習モード (解説付き)
        </button>
        
        <button className="btn btn-outline mt-4" onClick={() => navigate('/manage')}>
          <Settings size={20} />
          問題の管理・追加
        </button>
      </div>
    </div>
  );
}

export default Dashboard;
