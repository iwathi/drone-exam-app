import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, TrendingUp } from 'lucide-react';
import { useAuth } from '../AuthContext';
import { db } from '../firebase';
import { collection, query, orderBy, getDocs } from 'firebase/firestore';

function ProgressViewer() {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentUser || !db) {
      setLoading(false);
      return;
    }

    const fetchProgress = async () => {
      try {
        const q = query(collection(db, `users/${currentUser.uid}/progress`), orderBy('timestamp', 'desc'));
        const querySnapshot = await getDocs(q);
        const data = [];
        querySnapshot.forEach((doc) => {
          data.push({ id: doc.id, ...doc.data() });
        });
        setHistory(data);
      } catch (e) {
        console.error("Error fetching progress: ", e);
      } finally {
        setLoading(false);
      }
    };

    fetchProgress();
  }, [currentUser]);

  if (!currentUser) {
    return (
      <div className="card text-center">
        <h2>ログインが必要です</h2>
        <p>進捗を確認するには、トップ画面からログインしてください。</p>
        <button className="btn mt-4" onClick={() => navigate('/')}>トップに戻る</button>
      </div>
    );
  }

  return (
    <div className="card" style={{ maxWidth: '800px' }}>
      <div className="flex items-center gap-4 mb-6">
        <button className="btn btn-outline" style={{ padding: '0.5rem' }} onClick={() => navigate('/')}>
          <ArrowLeft size={20} />
        </button>
        <h2 style={{ marginBottom: 0 }}>学習の進捗</h2>
      </div>

      <div className="flex items-center gap-2 mb-6 text-primary">
        <TrendingUp size={24} />
        <h3 style={{ margin: 0 }}>過去の模擬試験結果</h3>
      </div>

      {loading ? (
        <p>データを読み込み中...</p>
      ) : history.length === 0 ? (
        <p className="text-secondary">まだ学習記録がありません。模擬試験を完了するとここに記録されます。</p>
      ) : (
        <div style={{ display: 'grid', gap: '1rem' }}>
          {history.map((record) => {
            const date = record.timestamp ? new Date(record.timestamp.toDate()).toLocaleString('ja-JP') : '日付不明';
            const rate = Math.round((record.score / record.total) * 100);
            
            return (
              <div key={record.id} style={{ 
                padding: '1rem', 
                border: '1px solid var(--border-color)', 
                borderRadius: '0.5rem',
                backgroundColor: 'var(--bg-dark)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <div>
                  <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>{date}</div>
                  <div style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>{record.score} / {record.total} 問正解</div>
                </div>
                <div style={{ 
                  fontSize: '1.5rem', 
                  fontWeight: 'bold', 
                  color: rate >= 80 ? 'var(--success-color)' : rate >= 60 ? 'var(--warning-color)' : 'var(--danger-color)' 
                }}>
                  {rate}%
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default ProgressViewer;
