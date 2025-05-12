import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const SignUp = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    studentId: '',
    dormName: '',
    roomNumber: '',
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');

  const dormOptions = [
    'Dhanshiri',
    'Chayaneer',
    'Mayurpankhi',
    'Dhrubotara',
    'Meghdoot',
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;

    // Remove validation logic for roomNumber
    setFormData({ ...formData, [name]: value });
    setError('');
  };

  const handleSignUp = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    // If studentId is required but empty, show error
    if (
      formData.email.includes('@g.bracu.ac.bd') &&
      formData.studentId.trim() === ''
    ) {
      setError('Student ID is required for g.bracu.ac.bd email addresses');
      return;
    }

    try {
      const response = await axios.post('http://localhost:5000/api/signup', formData);
      if (response.data.success) {
        navigate('/');
      } else {
        setError(response.data.message || 'Sign up failed');
      }
    } catch (err) {
      setError('Server error. Please try again later.');
    }
  };

  // Determine whether to show studentId input
  const showStudentId = formData.email.includes('@g.bracu.ac.bd');

  return (
    <div className="min-h-screen flex font-sans bg-background text-foreground">
      {/* Left side: form */}
      <div className="bg-foreground shadow-xl max-w-sm w-full p-8 animate-fade-in-up">
        <h1 className="text-3xl font-bold text-[#262840] mb-6 text-center tracking-wide">Sign Up</h1>
        <form onSubmit={handleSignUp} className="space-y-4">
          <input
            type="text"
            name="name"
            placeholder="Name"
            value={formData.name}
            onChange={handleChange}
            required
            className="w-full p-3 rounded-xl bg-background text-foreground placeholder-cream focus:outline-none focus:ring-4 focus:ring-neongreen transition"
          />
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            required
            className="w-full p-3 rounded-xl bg-background text-foreground placeholder-cream focus:outline-none focus:ring-4 focus:ring-neongreen transition"
          />
          {showStudentId && (
            <input
              type="text"
              name="studentId"
              placeholder="Student ID"
              value={formData.studentId}
              onChange={handleChange}
              required
              className="w-full p-3 rounded-xl bg-background text-foreground placeholder-cream focus:outline-none focus:ring-4 focus:ring-neongreen transition"
            />
          )}
          <select
            name="dormName"
            value={formData.dormName}
            onChange={handleChange}
            required
            className="w-full p-3 rounded-xl bg-background text-foreground placeholder-cream focus:outline-none focus:ring-4 focus:ring-neongreen transition"
          >
            <option value="" disabled>
              Select Dorm Name
            </option>
            {dormOptions.map((dorm) => (
              <option key={dorm} value={dorm}>
                {dorm}
              </option>
            ))}
          </select>
          <input
            type="text"
            name="roomNumber"
            placeholder="Room Number (e.g. N-100, M-105)"
            value={formData.roomNumber}
            onChange={handleChange}
            required
            className="w-full p-3 rounded-xl bg-background text-foreground placeholder-cream focus:outline-none focus:ring-4 focus:ring-neongreen transition"
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            required
            className="w-full p-3 rounded-xl bg-background text-foreground placeholder-cream focus:outline-none focus:ring-4 focus:ring-neongreen transition"
          />
          <input
            type="password"
            name="confirmPassword"
            placeholder="Confirm Password"
            value={formData.confirmPassword}
            onChange={handleChange}
            required
            className="w-full p-3 rounded-xl bg-background text-foreground placeholder-cream focus:outline-none focus:ring-4 focus:ring-neongreen transition"
          />
          {error && <p className="text-red-600 font-semibold text-center">{error}</p>}
          <button
            type="submit"
            className="w-full bg-neongreen text-background py-4 rounded-xl text-xl font-semibold hover:bg-primary-hover transition shadow-lg"
          >
            Sign Up
          </button>
          <div className="text-center mt-4">
            <p className="text-sm text-gray-600">
              Already have an account?{' '}
              <span
                className="text-neongreen cursor-pointer font-medium hover:underline"
                onClick={() => navigate('/')}
              >
                Log In
              </span>
            </p>
          </div>
        </form>
      </div>

      {/* Right side: text with typewriter animation */}
      <div className="flex-1 flex flex-col justify-center p-8 text-left">
        <h1 className="text-6xl font-extrabold text-white mb-4">TRIPTI Token Management System</h1>
        <div className="text-green-700 whitespace-pre-wrap typewriter-animation max-w-lg">
          <p className="mb-2"><span className="text-2xl text-white">{'\u2022'}</span> A streamlined platform for BRAC University students</p>
          <p className="mb-2"><span className="text-2xl text-white">{'\u2022'}</span> Manage your meal tokens effortlessly</p>
          <p className="mb-2"><span className="text-2xl text-white">{'\u2022'}</span> Save time and avoid long cafeteria queues</p>
          <p className="mb-2"><span className="text-2xl text-white">{'\u2022'}</span> Track your dining history and expenses</p>
        </div>
      </div>
    </div>
  );
};

export default SignUp;
