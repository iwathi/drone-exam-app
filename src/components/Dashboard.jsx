import React from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, Target, Settings, FileText, LogIn, LogOut, TrendingUp } from 'lucide-react';
import { useAuth } from '../AuthContext';
import heroImage from '../assets/hero.png';

function Dashboard({ questionsCount }) {
  const navigate = useNavigate();
  const { currentUser, login, logout } = useAuth();

  return (
    <div className="card text-center" style={{ maxWidth: '600px' }}>
      <div className="flex justify-between items-center mb-4">
        {currentUser ? (
          <div className="flex items-center gap-4">
            <span className="text-sm">ようこそ, {currentUser.displayName}さん</span>
            <button className="btn btn-outline" style={{ padding: '0.25rem 0.5rem', fontSize: '0.8rem' }} onClick={logout}>
              <LogOut size={14} className="mr-1" style={{display: 'inline'}} /> ログアウト
            </button>
          </div>
        ) : (
          <div className="flex justify-end w-full">
            <button className="btn btn-outline" style={{ padding: '0.25rem 0.5rem', fontSize: '0.8rem' }} onClick={login}>
              <LogIn size={14} className="mr-1" style={{display: 'inline'}} /> ログインして進捗を保存
            </button>
          </div>
        )}
      </div>

      <img src={heroImage} alt="Drone" className="hero-image" style={{ width: '150px', height: '150px', objectFit: 'contain', margin: '0 auto 1rem auto' }} />
      <h1 className="mb-2">二等無人航空機操縦士</h1>
      <p className="text-secondary mb-6">学科試験 演習問題アプリ (全{questionsCount}問収録)</p>
      
      <div className="flex flex-col gap-4 mb-6">
        <button 
          className="btn" 
          onClick={() => navigate('/exam')}
          style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}
        >
          <Target size={32} />
          <div className="text-xl">模擬試験モード</div>
          <div className="text-sm opacity-80 font-normal">本番同様に50問を30分で解く</div>
        </button>
        
        <button 
          className="btn" 
          onClick={() => navigate('/study-setup')}
          style={{ backgroundColor: '#10b981', padding: '1.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}
        >
          <BookOpen size={32} />
          <div className="text-xl">自己学習モード</div>
          <div className="text-sm opacity-80 font-normal">解説を見ながら1問ずつ解く（ランダム・章別対応）</div>
        </button>
      </div>

      <div className="grid" style={{ gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
        <button 
          className="btn btn-outline" 
          onClick={() => navigate('/manage')}
          style={{ display: 'flex', alignItems: 'center', justifyItems: 'center', gap: '0.5rem' }}
        >
          <Settings size={20} />
          問題の管理
        </button>
        
        <button 
          className="btn btn-outline" 
          onClick={() => navigate('/manual')}
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
        >
          <FileText size={20} />
          教則の確認
        </button>
      </div>

      <div className="grid mt-4" style={{ gridTemplateColumns: '1fr', gap: '1rem' }}>
        {currentUser && (
          <button 
            className="btn btn-outline" 
            onClick={() => navigate('/progress')}
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', borderColor: 'var(--primary-color)', color: 'var(--primary-color)' }}
          >
            <TrendingUp size={20} />
            学習の進捗を確認する
          </button>
        )}
      </div>
    </div>
  );
}

export default Dashboard;
