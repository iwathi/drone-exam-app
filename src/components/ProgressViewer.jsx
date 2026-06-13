import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, TrendingUp } from 'lucide-react';
import { useAuth } from '../AuthContext';
import { db } from '../firebase';
import { collection, query, getDocs } from 'firebase/firestore';
import allQuestions from '../data/questions.json';
import manualData from '../data/manual_summary.json';

// Build a mapping from prefix to title
const categoryMap = {};
manualData.forEach(chapter => {
  chapter.subsections.forEach(sub => {
    const match = sub.title.match(/^[\d\.]+/);
    if (match) {
      let refKey = match[0];
      if (refKey.endsWith('.')) refKey = refKey.slice(0, -1);
      categoryMap[refKey] = sub.title;
    }
  });
});

function ProgressViewer() {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [stats, setStats] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentUser || !db) {
      setLoading(false);
      return;
    }

    const fetchProgress = async () => {
      // 1. 全問題からセクションごとの問題数を集計
      const baseStats = {};
      allQuestions.forEach(q => {
        const match = q.reference ? q.reference.match(/^[\d\.]+/) : null;
        // マッチした文字列の末尾がドットで終わる場合は削除（例: "2.1." -> "2.1"）
        let refKey = match ? match[0] : 'その他';
        if (refKey.endsWith('.')) {
          refKey = refKey.slice(0, -1);
        }
        if (!baseStats[refKey]) {
          baseStats[refKey] = {
            section: refKey,
            originalRef: q.reference,
            totalAvailable: 0,
            correct: 0,
            incorrect: 0
          };
        }
        baseStats[refKey].totalAvailable++;
      });

      // 配列に変換してソート（初期状態を作成）
      const initialStatsArray = Object.values(baseStats).sort((a, b) => {
        if (a.section === 'その他') return 1;
        if (b.section === 'その他') return -1;
        return a.section.localeCompare(b.section, undefined, { numeric: true });
      });
      
      // まず初期状態をセットして画面に表示させる
      setStats(initialStatsArray);

      try {
        // 2. Firestoreから学習履歴を取得して正解・不正解を集計
        const q = query(collection(db, `users/${currentUser.uid}/progress`));
        const querySnapshot = await getDocs(q);
        
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          if (data.details && Array.isArray(data.details)) {
            data.details.forEach(detail => {
              const match = detail.reference ? detail.reference.match(/^[\d\.]+/) : null;
              let refKey = match ? match[0] : 'その他';
              if (refKey.endsWith('.')) {
                refKey = refKey.slice(0, -1);
              }
              
              if (baseStats[refKey]) {
                if (detail.isCorrect) {
                  baseStats[refKey].correct++;
                } else {
                  baseStats[refKey].incorrect++;
                }
              }
            });
          }
        });

        // 集計後のデータで再セット
        const updatedStatsArray = Object.values(baseStats).sort((a, b) => {
          if (a.section === 'その他') return 1;
          if (b.section === 'その他') return -1;
          return a.section.localeCompare(b.section, undefined, { numeric: true });
        });

        setStats(updatedStatsArray);
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
        <h2 style={{ marginBottom: 0 }}>学習の進捗（項目別）</h2>
      </div>

      <div className="flex items-center gap-2 mb-6 text-primary">
        <TrendingUp size={24} />
        <h3 style={{ margin: 0 }}>教則セクション別の成績</h3>
      </div>

      {loading ? (
        <p>データを読み込み中...</p>
      ) : stats.length === 0 ? (
        <p className="text-secondary">問題データが見つかりません。</p>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid var(--border-color)', backgroundColor: 'rgba(255,255,255,0.05)' }}>
                <th style={{ padding: '1rem' }}>教則の項目</th>
                <th style={{ padding: '1rem', textAlign: 'center' }}>登録問題数</th>
                <th style={{ padding: '1rem', textAlign: 'center', color: 'var(--success-color)' }}>正解した回数</th>
                <th style={{ padding: '1rem', textAlign: 'center', color: 'var(--danger-color)' }}>間違えた回数</th>
                <th style={{ padding: '1rem', textAlign: 'center' }}>正答率</th>
              </tr>
            </thead>
            <tbody>
              {stats.map((row) => {
                const totalAttempts = row.correct + row.incorrect;
                const rate = totalAttempts > 0 ? Math.round((row.correct / totalAttempts) * 100) : 0;
                
                return (
                  <tr key={row.section} style={{ borderBottom: '1px solid var(--border-color)' }}>
                    <td style={{ padding: '1rem', fontWeight: 'bold' }}>
                      <a 
                        href="https://www.mlit.go.jp/koku/content/001860312.pdf" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        style={{ color: 'var(--primary-color)', textDecoration: 'none' }}
                        onMouseOver={(e) => e.target.style.textDecoration = 'underline'}
                        onMouseOut={(e) => e.target.style.textDecoration = 'none'}
                        title="教則のPDFを開く"
                      >
                        {categoryMap[row.section] || row.section}
                      </a>
                    </td>
                    <td style={{ padding: '1rem', textAlign: 'center' }}>{row.totalAvailable}</td>
                    <td style={{ padding: '1rem', textAlign: 'center', color: row.correct > 0 ? 'var(--success-color)' : 'inherit', fontWeight: 'bold' }}>{row.correct}</td>
                    <td style={{ padding: '1rem', textAlign: 'center', color: row.incorrect > 0 ? 'var(--danger-color)' : 'inherit', fontWeight: 'bold' }}>{row.incorrect}</td>
                    <td style={{ padding: '1rem', textAlign: 'center' }}>
                      {totalAttempts > 0 ? (
                        <div style={{ color: rate >= 80 ? 'var(--success-color)' : rate >= 60 ? 'var(--warning-color)' : 'var(--danger-color)', fontWeight: 'bold' }}>
                          {rate}%
                        </div>
                      ) : (
                        <span className="text-secondary">-</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default ProgressViewer;
