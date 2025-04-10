import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const platforms = ['ChatGPT', 'Gemini', 'GovTech AI'];

const initialData = {
  privacyScores: [
    { name: 'Data Retention', ChatGPT: 60, Gemini: 80, 'GovTech AI': 90 },
    { name: 'User Consent', ChatGPT: 70, Gemini: 75, 'GovTech AI': 85 },
    { name: 'Data Encryption', ChatGPT: 80, Gemini: 85, 'GovTech AI': 95 },
  ],
  ethicsScores: [
    { name: 'Transparency', ChatGPT: 65, Gemini: 70, 'GovTech AI': 80 },
    { name: 'Bias Mitigation', ChatGPT: 70, Gemini: 75, 'GovTech AI': 85 },
    { name: 'Accountability', ChatGPT: 75, Gemini: 80, 'GovTech AI': 90 },
  ],
};

const Dashboard = () => {
  const [data, setData] = useState(initialData);
  const [activeTab, setActiveTab] = useState('privacy');

  const renderBarChart = (data) => (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data}>
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip />
        <Legend />
        {platforms.map((platform, index) => (
          <Bar key={platform} dataKey={platform} fill={`hsl(${index * 120}, 70%, 50%)`} />
        ))}
      </BarChart>
    </ResponsiveContainer>
  );

  return (
    <div style={{ fontFamily: 'Arial, sans-serif', padding: '20px' }}>
      <h1 style={{ fontSize: '24px', marginBottom: '20px' }}>AI Privacy and Ethics Dashboard</h1>
      <div style={{ marginBottom: '20px' }}>
        <button 
          onClick={() => setActiveTab('privacy')}
          style={{ 
            padding: '10px 20px', 
            marginRight: '10px',
            backgroundColor: activeTab === 'privacy' ? '#007bff' : '#f8f9fa',
            color: activeTab === 'privacy' ? 'white' : 'black',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer'
          }}
        >
          Privacy Scores
        </button>
        <button 
          onClick={() => setActiveTab('ethics')}
          style={{ 
            padding: '10px 20px',
            backgroundColor: activeTab === 'ethics' ? '#007bff' : '#f8f9fa',
            color: activeTab === 'ethics' ? 'white' : 'black',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer'
          }}
        >
          Ethics Scores
        </button>
      </div>
      <div style={{ border: '1px solid #dee2e6', borderRadius: '5px', padding: '20px' }}>
        <h2 style={{ fontSize: '20px', marginBottom: '20px' }}>
          {activeTab === 'privacy' ? 'Privacy Scores Comparison' : 'Ethics Scores Comparison'}
        </h2>
        {renderBarChart(activeTab === 'privacy' ? data.privacyScores : data.ethicsScores)}
      </div>
    </div>
  );
};

export default Dashboard;