import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Trash2, Save, ArrowLeft, RotateCcw } from 'lucide-react';
import initialQuestions from '../data/questions.json';

function QuestionManager({ questions, saveQuestions }) {
  const navigate = useNavigate();
  const [localQuestions, setLocalQuestions] = useState([...questions]);

  const handleAdd = () => {
    const newQ = {
      id: Date.now(),
      question: "新しい問題のテキストを入力",
      options: ["選択肢1", "選択肢2", "選択肢3"],
      correctAnswerIndex: 0,
      explanation: "解説を入力",
      reference: "教則 第4版 ページxx"
    };
    setLocalQuestions([newQ, ...localQuestions]);
  };

  const handleDelete = (id) => {
    setLocalQuestions(localQuestions.filter(q => q.id !== id));
  };

  const handleSaveAll = () => {
    saveQuestions(localQuestions);
    alert('保存しました！');
  };

  const handleChange = (id, field, value) => {
    setLocalQuestions(localQuestions.map(q => {
      if (q.id === id) {
        return { ...q, [field]: value };
      }
      return q;
    }));
  };

  const handleOptionChange = (id, optIndex, value) => {
    setLocalQuestions(localQuestions.map(q => {
      if (q.id === id) {
        const newOptions = [...q.options];
        newOptions[optIndex] = value;
        return { ...q, options: newOptions };
      }
      return q;
    }));
  };

  const handleReset = () => {
    if (window.confirm('追加した問題は消去され、初期データ（50問）にリセットされます。よろしいですか？')) {
      setLocalQuestions([...initialQuestions]);
      saveQuestions(initialQuestions);
      alert('初期データにリセットしました！');
    }
  };

  return (
    <div className="card" style={{ maxWidth: '800px', width: '100%' }}>
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-2">
          <button className="btn btn-outline" style={{ padding: '0.5rem' }} onClick={() => navigate('/')}>
            <ArrowLeft size={20} />
          </button>
          <h2 style={{ marginBottom: 0 }}>問題の管理 ({localQuestions.length}問)</h2>
        </div>
        <div className="flex gap-2">
          <button className="btn btn-outline" onClick={handleReset} style={{ color: 'var(--danger-color)', borderColor: 'var(--danger-color)' }}>
            <RotateCcw size={18} /> リセット
          </button>
          <button className="btn btn-success" onClick={handleAdd}>
            <Plus size={18} /> 追加
          </button>
          <button className="btn" onClick={handleSaveAll}>
            <Save size={18} /> 保存
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-6">
        {localQuestions.map((q, index) => (
          <div key={q.id} style={{ border: '1px solid var(--border-color)', padding: '1rem', borderRadius: '0.5rem' }}>
            <div className="flex justify-between mb-4">
              <strong>問題 {localQuestions.length - index}</strong>
              <button className="btn btn-danger" style={{ padding: '0.4rem' }} onClick={() => handleDelete(q.id)}>
                <Trash2 size={16} />
              </button>
            </div>
            
            <div className="form-group">
              <label className="form-label">問題文</label>
              <textarea 
                rows="3" 
                value={q.question} 
                onChange={(e) => handleChange(q.id, 'question', e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">選択肢</label>
              {q.options.map((opt, oIdx) => (
                <div key={oIdx} className="flex items-center gap-2 mb-2">
                  <input 
                    type="radio" 
                    name={`correct-${q.id}`} 
                    checked={q.correctAnswerIndex === oIdx}
                    onChange={() => handleChange(q.id, 'correctAnswerIndex', oIdx)}
                  />
                  <input 
                    type="text" 
                    value={opt}
                    onChange={(e) => handleOptionChange(q.id, oIdx, e.target.value)}
                  />
                </div>
              ))}
            </div>

            <div className="form-group">
              <label className="form-label">解説</label>
              <textarea 
                rows="2" 
                value={q.explanation} 
                onChange={(e) => handleChange(q.id, 'explanation', e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">教則 該当箇所 (ページなど)</label>
              <input 
                type="text" 
                value={q.reference || ''} 
                onChange={(e) => handleChange(q.id, 'reference', e.target.value)}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default QuestionManager;
