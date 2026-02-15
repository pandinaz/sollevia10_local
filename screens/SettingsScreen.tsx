import React, { useState } from 'react';
import { Shield, ArrowLeft, Info, Activity, CheckCircle, AlertCircle, Loader } from 'lucide-react';
import { ScreenName } from '../types';
import { APP_VERSION, MIA_API_URL } from '../config';
import { sendMessageToMia } from '../services/miaService';

interface SettingsScreenProps {
  onNavigate: (screen: ScreenName) => void;
}

const SettingsScreen: React.FC<SettingsScreenProps> = ({ onNavigate }) => {
  const [testStatus, setTestStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [testMessage, setTestMessage] = useState('');
  const [details, setDetails] = useState('');

  const runConnectionTest = async () => {
    setTestStatus('loading');
    setTestMessage('Pinging Mia21...');
    setDetails('');
    
    try {
      const response = await sendMessageToMia('Ping', false);
      
      if (response.source === 'api') {
        setTestStatus('success');
        setTestMessage('Connected successfully to Mia21 API.');
      } else {
        setTestStatus('error');
        setTestMessage('Connection failed. Using offline mock mode.');
        setDetails(response.error || 'Unknown error occurred');
      }
    } catch (e) {
      setTestStatus('error');
      setTestMessage('Critical Error');
      setDetails(e instanceof Error ? e.message : String(e));
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col text-slate-900">
      <div className="p-6 pt-8">
        <button 
          onClick={() => onNavigate('home')} 
          className="flex items-center text-slate-500 hover:text-slate-900 transition-colors mb-6"
        >
          <ArrowLeft size={20} className="mr-1" />
          Back
        </button>

        <h1 className="text-3xl font-bold text-slate-900 mb-8">Settings</h1>
        
        {/* API Status Section */}
        <div className="bg-white rounded-2xl p-6 shadow-card border border-slate-200 mb-6">
           <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-emerald-50 rounded-lg text-emerald-600 border border-emerald-100">
              <Activity size={20} />
            </div>
            <div>
              <h2 className="font-semibold text-slate-900">System Status</h2>
            </div>
          </div>
          
          <div className="mt-2">
             <div className="text-xs text-slate-500 mb-2 font-mono break-all">
                Endpoint: {MIA_API_URL}
             </div>
            <button 
              onClick={runConnectionTest}
              disabled={testStatus === 'loading'}
              className="w-full py-3 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-xl transition-colors flex items-center justify-center gap-2 text-sm border border-slate-200"
            >
              {testStatus === 'loading' ? <Loader className="animate-spin" size={16} /> : <Activity size={16} />}
              Test API Connection
            </button>
            
            {testStatus !== 'idle' && (
              <div className={`mt-4 p-3 rounded-xl flex flex-col gap-1 text-sm ${
                testStatus === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-red-50 text-red-700 border border-red-100'
              }`}>
                <div className="flex items-center gap-2 font-medium">
                  {testStatus === 'success' ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
                  {testMessage}
                </div>
                {details && (
                    <div className="text-xs mt-1 p-2 bg-white rounded border border-slate-200 font-mono break-all text-slate-500">
                        {details}
                    </div>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-card border border-slate-200 mb-6">
          <div className="flex items-center gap-3 mb-6 border-b border-slate-100 pb-4">
            <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600 border border-indigo-100">
              <Shield size={20} />
            </div>
            <div>
              <h2 className="font-semibold text-slate-900">Privacy & Security</h2>
              <p className="text-xs text-slate-500">Your data stays on your device</p>
            </div>
          </div>

          <p className="text-sm text-slate-600 leading-relaxed">
            Sollevia prioritizes your privacy. Chat history and personal reflections are stored locally on your device using browser storage.
          </p>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-card border border-slate-200">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-slate-100 rounded-lg text-slate-500">
              <Info size={20} />
            </div>
            <div>
              <h2 className="font-semibold text-slate-900">About</h2>
            </div>
          </div>
          <div className="flex justify-between items-center py-2 border-b border-slate-100">
             <span className="text-sm text-slate-500">Version</span>
             <span className="text-sm font-medium text-slate-900">{APP_VERSION}</span>
          </div>
          <div className="flex justify-between items-center py-2 pt-4">
             <span className="text-sm text-slate-500">Build</span>
             <span className="text-sm font-medium text-slate-900">Alpha</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsScreen;