// src/components/Home.js
import React from 'react';
import { Link } from 'react-router-dom';

function Home() {
  return (
    <div>
      <h1>Welcome to Race Betting App</h1>
      <Link to="/register">Register</Link>
      <Link to="/login">Login</Link>
    </div>
  );
}

export default Home;
