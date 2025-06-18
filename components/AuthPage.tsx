
import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import Input from './common/Input';
import Button from './common/Button';
import { UserRole } from '../types';
import { APP_NAME } from '../constants';

const AuthPage: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  // Role is now fixed for signup, but kept in state for clarity if needed elsewhere (though not used for selection)
  // const [role, setRole] = useState<UserRole>(UserRole.CLIENT); 
  const { login, signup, isLoading, error } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLogin) {
      await login({ email, password });
    } else {
      // Sign up always as Client from this form
      // FIX: Removed 'role' property as it's not part of SignupData and is set by the backend.
      await signup({ email, password, name });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary to-teal-600 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-xl shadow-2xl">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            {isLogin ? 'Sign in to' : 'Create a Client Account for'} {APP_NAME}
          </h2>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && <p className="text-center text-sm text-danger bg-red-100 p-3 rounded-md">{error}</p>}
          
          {!isLogin && (
            <Input
              id="name"
              label="Full Name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              placeholder="John Doe"
            />
          )}
          <Input
            id="email"
            label="Email address"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
            placeholder="you@example.com"
          />
          <Input
            id="password"
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete={isLogin ? "current-password" : "new-password"}
            placeholder="••••••••"
          />

          {!isLogin && (
             <p className="text-xs text-center text-gray-600 mt-2">
              To register as a Doctor, please contact administration. All sign-ups here are for Client accounts.
            </p>
          )}

          <div>
            <Button type="submit" isLoading={isLoading} fullWidth variant="primary">
              {isLogin ? 'Sign in' : 'Sign up as Client'}
            </Button>
          </div>
        </form>
        <div className="text-sm text-center">
          <button
            onClick={() => {
              setIsLogin(!isLogin);
              // clearError(); // You might want a function to clear errors from useAuth context
            }}
            className="font-medium text-primary hover:text-teal-700"
          >
            {isLogin ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;