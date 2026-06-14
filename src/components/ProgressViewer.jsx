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
        let refKey = 'その他';
        let chapterName = 'その他';

        if (match) {
          const rawKey = match[0].replace(/\.$/, '');
          let bestMatchLen = 0;
          for (const chapter of manualData) {
            for (const sub of chapter.subsections) {
              const subMatch = sub.title.match(/^[\d\.]+/);
              if (subMatch) {
                const subKey = subMatch[0].replace(/\.$/, '');
                if (rawKey === subKey || rawKey.startsWith(subKey + '.')) {
                   if (subKey.length > bestMatchLen) {
                     bestMatchLen = subKey.length;
                     refKey = subKey;
                     chapterName = sub.title;
                   }
                } else if (subKey.startsWith(rawKey + '.')) {
                   if (rawKey.length > bestMatchLen) {
                      bestMatchLen = rawKey.length;
                      refKey = subKey;
                      chapterName = sub.title;
                   }
                }
              }
            }
          }
          if (chapterName === 'その他') {
             refKey = rawKey;
             chapterName = q.reference || 'その他';
          }
        }

        if (!baseStats[refKey]) {
          baseStats[refKey] = {
            section: refKey,
            displayName: chapterName,
            originalRef: q.reference,
            totalAvailable: 0,
            correctQuestionIds: new Set(),
            incorrectQuestionIds: new Set()
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
              let refKey = 'その他';
              let chapterName = 'その他';

              if (match) {
                const rawKey = match[0].replace(/\.$/, '');
                
                // Find longest matching prefix from manualData
                let bestMatchLen = 0;
                for (const chapter of manualData) {
                  for (const sub of chapter.subsections) {
                    const subMatch = sub.title.match(/^[\d\.]+/);
                    if (subMatch) {
                      const subKey = subMatch[0].replace(/\.$/, '');
                      // Check prefix matching in both directions
                      if (rawKey === subKey || rawKey.startsWith(subKey + '.')) {
                         if (subKey.length > bestMatchLen) {
                           bestMatchLen = subKey.length;
                           refKey = subKey;
                           chapterName = sub.title;
                         }
                      } else if (subKey.startsWith(rawKey + '.')) {
                         if (rawKey.length > bestMatchLen) {
                            bestMatchLen = rawKey.length;
                            refKey = subKey;
                            chapterName = sub.title;
                         }
                      }
                    }
                  }
                }

                // If no mapping found in summary, fallback
                if (chapterName === 'その他') {
                   refKey = rawKey;
                   chapterName = detail.reference || 'その他';
                }
              }
              
              if (baseStats[refKey] && detail.questionId) {
                if (detail.isCorrect) {
                  baseStats[refKey].correctQuestionIds.add(detail.questionId);
                } else {
                  baseStats[refKey].incorrectQuestionIds.add(detail.questionId);
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

      <div style={{ backgroundColor: 'rgba(59, 130, 246, 0.1)', borderLeft: '4px solid var(--primary-color)', padding: '1rem', marginBottom: '2rem', borderRadius: '0.25rem', fontSize: '0.95rem', lineHeight: '1.5' }}>
        <strong>💡 学習達成率についてのご注意</strong><br/>
        この画面の数値は「マスターした（正解した）ユニークな問題の数」を示しています。<br/>
        すでに正解したことのある同じ問題に何度正解しても、達成率は上がりません。まだ解いていない問題や、間違えた問題に重点的に挑戦して達成率100%を目指しましょう！
      </div>

      <div className="flex items-center gap-2 mb-2 text-primary">
        <TrendingUp size={24} />
        <h3 style={{ margin: 0 }}>教則セクション別の成績</h3>
      </div>
      <p className="text-secondary mb-6" style={{ fontSize: '0.9rem' }}>
        ※ カテゴリ名をクリックすると、その項目に関連する問題に絞って「重点学習」を開始できます。
      </p>

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
                <th style={{ padding: '1rem', textAlign: 'center', color: 'var(--success-color)' }}>正解済みの問題数</th>
                <th style={{ padding: '1rem', textAlign: 'center', color: 'var(--danger-color)' }}>間違えた問題数</th>
                <th style={{ padding: '1rem', textAlign: 'center' }}>学習達成率</th>
              </tr>
            </thead>
            <tbody>
              {stats.map((row) => {
                const correctCount = row.correctQuestionIds.size;
                const incorrectCount = row.incorrectQuestionIds.size;
                const rate = row.totalAvailable > 0 ? Math.round((correctCount / row.totalAvailable) * 100) : 0;
                
                return (
                  <tr key={row.section} style={{ borderBottom: '1px solid var(--border-color)' }}>
                    <td style={{ padding: '1rem', fontWeight: 'bold' }}>
                      <button 
                        style={{ 
                          background: 'none', 
                          border: 'none', 
                          color: 'var(--primary-color)', 
                          textDecoration: 'none', 
                          cursor: 'pointer',
                          padding: 0,
                          font: 'inherit',
                          fontWeight: 'bold',
                          textAlign: 'left'
                        }}
                        onMouseOver={(e) => e.target.style.textDecoration = 'underline'}
                        onMouseOut={(e) => e.target.style.textDecoration = 'none'}
                        title="この項目の重点学習を開始する"
                        onClick={() => {
                          const chapterQuestions = allQuestions.filter(q => {
                            const ref = q.reference || '';
                            return ref.startsWith(row.section);
                          });
                          navigate('/study', { 
                            state: { 
                              mode: 'chapter', 
                              chapterName: categoryMap[row.section] || row.originalRef || row.section, 
                              questions: chapterQuestions 
                            } 
                          });
                        }}
                      >
                        {categoryMap[row.section] || row.originalRef || row.section}
                      </button>
                    </td>
                    <td style={{ padding: '1rem', textAlign: 'center' }}>{row.totalAvailable}</td>
                    <td style={{ padding: '1rem', textAlign: 'center', color: correctCount > 0 ? 'var(--success-color)' : 'inherit', fontWeight: 'bold' }}>{correctCount}</td>
                    <td style={{ padding: '1rem', textAlign: 'center', color: incorrectCount > 0 ? 'var(--danger-color)' : 'inherit', fontWeight: 'bold' }}>{incorrectCount}</td>
                    <td style={{ padding: '1rem', textAlign: 'center' }}>
                      <div style={{ color: rate >= 100 ? 'var(--success-color)' : rate >= 50 ? 'var(--warning-color)' : 'var(--danger-color)', fontWeight: 'bold' }}>
                        {rate}%
                      </div>
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
