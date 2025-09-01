import React, { useState, useEffect } from 'react';
import { supabase } from '../config/supabase';

const SupabaseTest = () => {
  const [connectionStatus, setConnectionStatus] = useState('Testing...');
  const [testResult, setTestResult] = useState('');

  useEffect(() => {
    testSupabaseConnection();
  }, []);

  const testSupabaseConnection = async () => {
    try {
      setConnectionStatus('Testing connection...');
      
      // Test basic connection
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .limit(1);

      if (error) {
        setConnectionStatus('❌ Connection Failed');
        setTestResult(`Error: ${error.message}`);
      } else {
        setConnectionStatus('✅ Connected to Supabase');
        setTestResult(`Successfully fetched ${data?.length || 0} categories`);
      }
    } catch (err) {
      setConnectionStatus('❌ Connection Failed');
      setTestResult(`Exception: ${err.message}`);
    }
  };

  const testAuth = async () => {
    try {
      setTestResult('Testing auth...');
      
      // Test auth status
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        setTestResult(`Auth Error: ${error.message}`);
      } else {
        setTestResult(`Auth Status: ${session ? 'Session exists' : 'No session'}`);
      }
    } catch (err) {
      setTestResult(`Auth Exception: ${err.message}`);
    }
  };

  const testSignUp = async () => {
    try {
      setTestResult('Testing sign up...');
      
      const testEmail = `test${Date.now()}@example.com`;
      const testPassword = 'testpassword123';
      
      const { data, error } = await supabase.auth.signUp({
        email: testEmail,
        password: testPassword
      });
      
      if (error) {
        setTestResult(`Sign Up Error: ${error.message}`);
      } else {
        setTestResult(`Sign Up Success: ${data.user ? 'User created' : 'Check email'}`);
      }
    } catch (err) {
      setTestResult(`Sign Up Exception: ${err.message}`);
    }
  };

  return (
    <div style={{ 
      padding: '20px', 
      margin: '20px', 
      border: '1px solid #ccc', 
      borderRadius: '8px',
      backgroundColor: '#f9f9f9'
    }}>
      <h3>🔧 Supabase Connection Test</h3>
      
      <div style={{ marginBottom: '15px' }}>
        <strong>Status:</strong> {connectionStatus}
      </div>
      
      <div style={{ marginBottom: '15px' }}>
        <strong>Result:</strong> {testResult}
      </div>
      
      <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
        <button 
          onClick={testSupabaseConnection}
          style={{ padding: '8px 16px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px' }}
        >
          Test Connection
        </button>
        
        <button 
          onClick={testAuth}
          style={{ padding: '8px 16px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '4px' }}
        >
          Test Auth
        </button>
        
        <button 
          onClick={testSignUp}
          style={{ padding: '8px 16px', backgroundColor: '#ffc107', color: 'black', border: 'none', borderRadius: '4px' }}
        >
          Test Sign Up
        </button>
      </div>
      
      <div style={{ marginTop: '15px', fontSize: '12px', color: '#666' }}>
        <strong>Environment Check:</strong><br/>
        URL: {process.env.REACT_APP_SUPABASE_URL ? '✅ Set' : '❌ Missing'}<br/>
        Key: {process.env.REACT_APP_SUPABASE_ANON_KEY ? '✅ Set' : '❌ Missing'}
      </div>
    </div>
  );
};

export default SupabaseTest;
