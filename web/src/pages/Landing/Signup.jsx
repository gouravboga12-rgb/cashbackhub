import React from 'react';
import Login from './Login';

export default function Signup({ onLoginSuccess }) {
  return <Login onLoginSuccess={onLoginSuccess} initialTab="register" />;
}
