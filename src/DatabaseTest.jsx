import React, { useState, useEffect } from 'react';
import { supabase } from './config/supabase';
import { useAuth } from './contexts/AuthContext';

const DatabaseTest = () => {
  const { user, userProfile, isAuthenticated } = useAuth();
  const [dbStatus, setDbStatus] = useState('Testing...');
  const [userData, setUserData] = useState(null);
  const [error, setError] = useState(null);

  const testBasicConnection = async () => {
    console.log('DatabaseTest: Starting basic connection test...');
    try {
      // Add timeout to prevent hanging
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Connection timeout after 10 seconds')), 10000);
      });
      
      const connectionPromise = supabase.auth.getSession();
      
      const { data, error } = await Promise.race([connectionPromise, timeoutPromise]);
      
      if (error) {
        console.error('DatabaseTest: Auth error:', error);
        setDbStatus(`Auth Error: ${error.message}`);
        setError(error.message);
      } else {
        console.log('DatabaseTest: Auth success:', data);
        setDbStatus('Basic connection working - testing database...');
        // Now test database
        testDatabase();
      }
    } catch (err) {
      console.error('DatabaseTest: Basic connection failed:', err);
      setDbStatus(`Basic connection failed: ${err.message}`);
      setError(err.message);
    }
  };

  useEffect(() => {
    console.log('DatabaseTest: Component mounted');
    testBasicConnection();
  }, []);

  const testDatabase = async () => {
    console.log('DatabaseTest: Starting database test...');
    try {
      // Add timeout to prevent hanging
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Database timeout after 10 seconds')), 10000);
      });
      
      const dbPromise = supabase
        .from('users')
        .select('*')
        .limit(1);
      
      const { data, error } = await Promise.race([dbPromise, timeoutPromise]);

      if (error) {
        console.error('DatabaseTest: Database error:', error);
        setDbStatus(`Database Error: ${error.message}`);
        setError(error.message);
      } else {
        console.log('DatabaseTest: Database success:', data);
        setDbStatus('Database connected successfully');
        setError(null);
      }
    } catch (err) {
      console.error('DatabaseTest: Connection failed:', err);
      setDbStatus(`Connection failed: ${err.message}`);
      setError(err.message);
    }
  };

  const testUserProfile = async () => {
    setTestStatus('Testing user profile...');
    setTestError('');
    
    try {
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('User profile test timeout after 10 seconds')), 10000);
      });
      
      const testPromise = (async () => {
        if (!user) {
          throw new Error('No authenticated user found');
        }
        
        console.log('Testing with user:', user);
        
        // Test 1: Try to get current user profile
        const { data: profileData, error: profileError } = await supabase
          .from('users')
          .select('*')
          .eq('id', user.id)
          .single();
        
        if (profileError) {
          console.error('Profile retrieval error:', profileError);
          throw new Error(`Profile retrieval failed: ${profileError.message}`);
        }
        
        console.log('Profile data retrieved:', profileData);
        
        // Test 2: Try to insert a test profile update
        const testUpdate = {
          phone: '+91-9876543210',
          address: 'Test Address, Test City, Test State - 123456'
        };
        
        const { error: updateError } = await supabase
          .from('users')
          .update(testUpdate)
          .eq('id', user.id);
        
        if (updateError) {
          console.error('Profile update error:', updateError);
          throw new Error(`Profile update failed: ${updateError.message}`);
        }
        
        console.log('Profile update successful');
        
        // Test 3: Retrieve updated profile
        const { data: updatedProfile, error: finalError } = await supabase
          .from('users')
          .select('*')
          .eq('id', user.id)
          .single();
        
        if (finalError) {
          throw new Error(`Final profile retrieval failed: ${finalError.message}`);
        }
        
        console.log('Updated profile data:', updatedProfile);
        
        return {
          originalProfile: profileData,
          updatedProfile: updatedProfile,
          testUpdate: testUpdate
        };
      })();
      
      const result = await Promise.race([testPromise, timeoutPromise]);
      
      setTestStatus('User profile test completed successfully!');
      setTestResult(JSON.stringify(result, null, 2));
      setTestError('');
      
    } catch (error) {
      console.error('User profile test error:', error);
      setTestStatus('User profile test failed');
      setTestError(error.message);
      setTestResult('');
    }
  };

  return (
    <div style={{ 
      padding: '20px', 
      border: '2px solid #007bff', 
      margin: '20px', 
      backgroundColor: '#f8f9fa',
      borderRadius: '8px',
      fontFamily: 'Arial, sans-serif'
    }}>
      <h3 style={{ color: '#007bff', margin: '0 0 20px 0' }}>🔧 Database Test Component</h3>
      
      {error && (
        <div style={{ 
          padding: '10px', 
          backgroundColor: '#f8d7da', 
          border: '1px solid #f5c6cb', 
          borderRadius: '4px',
          marginBottom: '20px',
          color: '#721c24'
        }}>
          <strong>Error:</strong> {error}
        </div>
      )}
      
      <div style={{ marginBottom: '20px' }}>
        <strong>Database Status:</strong> 
        <span style={{ 
          color: error ? '#dc3545' : '#28a745', 
          marginLeft: '10px',
          fontWeight: 'bold'
        }}>
          {dbStatus}
        </span>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <strong>Auth State:</strong>
        <pre style={{ 
          backgroundColor: '#e9ecef', 
          padding: '10px', 
          borderRadius: '4px',
          fontSize: '12px',
          overflow: 'auto'
        }}>
          {JSON.stringify({ isAuthenticated, user: user ? { id: user.id, email: user.email } : null, userProfile }, null, 2)}
        </pre>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <strong>User Profile Data:</strong>
        <pre style={{ 
          backgroundColor: '#e9ecef', 
          padding: '10px', 
          borderRadius: '4px',
          fontSize: '12px',
          overflow: 'auto',
          maxHeight: '200px'
        }}>
          {userData ? JSON.stringify(userData, null, 2) : 'No data loaded'}
        </pre>
      </div>

      <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
        <button 
          onClick={testBasicConnection}
          style={{ 
            padding: '8px 16px',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          🔄 Test Basic Connection
        </button>
        
        <button 
          onClick={testDatabase}
          style={{ 
            padding: '8px 16px',
            backgroundColor: '#28a745',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          🔄 Test Database
        </button>
        
        <button 
          onClick={testUserProfile}
          style={{ 
            padding: '8px 16px',
            backgroundColor: '#ffc107',
            color: '#212529',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          👤 Test User Profile
        </button>
      </div>
    </div>
  );
};

export default DatabaseTest;
