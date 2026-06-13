import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, FileText, Book } from 'lucide-react';
import manualSummary from '../data/manual_summary.json';

function ManualViewer() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('summary');

  return (
    <div className="card" style={{ maxWidth: '800px' }}>
      <div className="flex items-center gap-4 mb-6">
        <button className="btn btn-outline" style={{ padding: '0.5rem' }} onClick={() => navigate('/')}>
          <ArrowLeft size={20} />
        </button>
        <h2 style={{ marginBottom: 0 }}>教則の確認</h2>
      </div>

      <div className="flex gap-4 mb-6">
        <button 
          className={`btn ${activeTab === 'summary' ? '' : 'btn-outline'}`}
          onClick={() => setActiveTab('summary')}
          style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
        >
          <Book size={20} />
          要約版を読む
        </button>
        <button 
          className={`btn ${activeTab === 'original' ? '' : 'btn-outline'}`}
          onClick={() => setActiveTab('original')}
          style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
        >
          <FileText size={20} />
          原本PDFを確認
        </button>
      </div>

      {activeTab === 'summary' && (
        <div className="flex flex-col gap-6">
          {manualSummary.map((item, index) => (
            <div key={index} style={{ border: '1px solid var(--border-color)', borderRadius: '0.5rem', overflow: 'hidden' }}>
              <div style={{ backgroundColor: 'var(--bg-dark)', padding: '1rem', borderBottom: '1px solid var(--border-color)' }}>
                <h3 style={{ margin: 0 }}>{item.chapter}</h3>
              </div>
              <div style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                {item.subsections.map((sub, idx) => (
                  <div key={idx}>
                    <h4 style={{ marginBottom: '0.5rem', color: 'var(--primary-color)' }}>{sub.title}</h4>
                    <p style={{ lineHeight: '1.6', marginBottom: '0.5rem' }}>{sub.summary}</p>
                    <a 
                      href={`https://www.mlit.go.jp/koku/content/001860312.pdf`} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      style={{ fontSize: '0.875rem', color: 'var(--warning-color)', textDecoration: 'underline' }}
                    >
                      教則のPDFを開く
                    </a>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'original' && (
        <div style={{ height: '600px', borderRadius: '0.5rem', overflow: 'hidden', border: '1px solid var(--border-color)' }}>
          <iframe 
            src="https://www.mlit.go.jp/koku/content/001860312.pdf" 
            width="100%" 
            height="100%" 
            style={{ border: 'none' }}
            title="教則第4版"
          />
        </div>
      )}
    </div>
  );
}

export default ManualViewer;
