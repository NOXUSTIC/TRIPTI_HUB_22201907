import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const months = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const MonthConfiguration = () => {
  const navigate = useNavigate();
  const [selectedMonths, setSelectedMonths] = useState([]);
  const [isConfigured, setIsConfigured] = useState(false);

  // New states for tokens and orders
  const [totalTokensUsed, setTotalTokensUsed] = useState(0);
  const [totalCapacity, setTotalCapacity] = useState(0);
  const availableTokens = totalCapacity - totalTokensUsed;

  const [chickenOrder, setChickenOrder] = useState(0);
  const [beefOrder, setBeefOrder] = useState(0);
  const [muttonOrder, setMuttonOrder] = useState(0);
  const [fishOrder, setFishOrder] = useState(0);

  React.useEffect(() => {
    // Fetch existing selected months on mount
    const fetchSelectedMonths = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/months');
        const data = await response.json();
        if (data.success && data.months.length > 0) {
          setSelectedMonths(data.months.map(m => m.month_name));
          setIsConfigured(true);
          setTotalCapacity(data.months.reduce((acc, m) => acc + (m.token_allocation || 0), 0));
        }
      } catch (error) {
        console.error('Error fetching selected months:', error);
      }
    };

    const fetchDashboardData = async () => {
      try {
        // Fetch tokens used
        const tokensResponse = await fetch('http://localhost:5000/api/tokens-used');
        const tokensData = await tokensResponse.json();
        if (tokensData.success) {
          setTotalTokensUsed(tokensData.totalTokensUsed);
        } else {
          setTotalTokensUsed(0);
        }

        // Fetch orders summary
        const ordersResponse = await fetch('http://localhost:5000/api/orders-summary');
        const ordersData = await ordersResponse.json();
        if (ordersData.success) {
          setChickenOrder(ordersData.summary.chickenOrder);
          setBeefOrder(ordersData.summary.beefOrder);
          setMuttonOrder(ordersData.summary.muttonOrder);
          setFishOrder(ordersData.summary.fishOrder);
        } else {
          setChickenOrder(0);
          setBeefOrder(0);
          setMuttonOrder(0);
          setFishOrder(0);
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        setTotalTokensUsed(0);
        setChickenOrder(0);
        setBeefOrder(0);
        setMuttonOrder(0);
        setFishOrder(0);
      }
    };

    fetchSelectedMonths();
    fetchDashboardData();
  }, []);

  const handleMonthClick = (month) => {
    if (isConfigured) return; // disable editing if already configured
    if (selectedMonths.includes(month)) {
      // Remove month if already selected
      setSelectedMonths(selectedMonths.filter(m => m !== month));
    } else {
      // Add month if less than 3 selected
      if (selectedMonths.length < 3) {
        setSelectedMonths([...selectedMonths, month]);
      }
    }
  };

  const handleConfirm = async () => {
    if (selectedMonths.length !== 3) {
      alert('Please select exactly 3 months.');
      return;
    }
    try {
      const response = await fetch('http://localhost:5000/api/months', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ months: selectedMonths }),
      });
      const data = await response.json();
      if (data.success) {
        setIsConfigured(true);
        // Calculate total capacity based on selected months (each 400 tokens)
        setTotalCapacity(selectedMonths.length * 400);
        alert('Months configured successfully.');
        navigate('/admin-portal');
      } else {
        alert(data.message || 'Failed to configure months.');
      }
    } catch (error) {
      console.error('Error saving months:', error);
      alert('Server error while saving months.');
    }
  };

  const handleSignOut = () => {
    // TODO: Clear auth tokens or session
    navigate('/');
  };

  const handleResetMonths = () => {
    navigate('/reset-months-captcha');
  };

  const handleBack = () => {
    navigate('/admin-portal');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-neongreen via-milkywhite to-cream text-[#262840] p-8">
      <header className="mb-6 flex justify-between items-center">
        <h1 className="text-3xl font-bold">Month Configuration</h1>
        <div className="flex space-x-4">
          <button
            onClick={handleBack}
            className="bg-[#262840] text-neongreen px-4 py-2 rounded hover:bg-[#3a3c4e] transition"
          >
            Back
          </button>
          <button
            onClick={handleSignOut}
            className="bg-[#262840] text-neongreen px-4 py-2 rounded hover:bg-[#3a3c4e] transition"
          >
            Sign Out
          </button>
        </div>
      </header>
      <div className="grid grid-cols-3 md:grid-cols-4 gap-4 mb-6">
        {months.map((month) => (
          <button
            key={month}
            onClick={() => handleMonthClick(month)}
            className={`p-4 rounded shadow font-semibold transition ${
              selectedMonths.includes(month)
                ? 'bg-[#262840] text-neongreen'
                : 'bg-white text-[#262840]'
            }`}
            disabled={isConfigured}
          >
            {month}
          </button>
        ))}
      </div>
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2">Selected Months:</h2>
        <ul>
          {selectedMonths.map((month) => (
            <li key={month} className="mb-1">
              {month} - 400 tokens
            </li>
          ))}
        </ul>
        <div className="mt-4 font-semibold">
          Total Tokens Used: {selectedMonths.length * 400}
        </div>
        <div className="font-semibold">
          Available Tokens: 400
        </div>
      </div>
      <button
        onClick={handleConfirm}
        disabled={isConfigured}
        className={`px-6 py-3 rounded font-semibold transition ${
          isConfigured
            ? 'bg-gray-400 text-gray-700 cursor-not-allowed'
            : 'bg-[#262840] text-neongreen hover:bg-[#3a3c4e]'
        }`}
      >
        Confirm
      </button>
      <button
        onClick={handleResetMonths}
        className="ml-4 px-6 py-3 rounded font-semibold transition bg-red-600 text-white hover:bg-red-700"
      >
        Reset Months
      </button>

      {/* New display for tokens and orders */}
      <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-6">
        <div className="bg-white p-4 rounded shadow text-center">
          <h3 className="text-lg font-semibold mb-2">Total Tokens Used</h3>
          <p className="text-2xl font-bold">{totalTokensUsed}</p>
        </div>
        <div className="bg-white p-4 rounded shadow text-center">
          <h3 className="text-lg font-semibold mb-2">Available Tokens</h3>
          <p className="text-2xl font-bold">{availableTokens}</p>
        </div>
        <div className="bg-white p-4 rounded shadow text-center">
          <h3 className="text-lg font-semibold mb-2">Total Capacity</h3>
          <p className="text-2xl font-bold">{totalCapacity}</p>
        </div>
        <div className="bg-white p-4 rounded shadow text-center">
          <h3 className="text-lg font-semibold mb-2">Chicken Order</h3>
          <p className="text-2xl font-bold">{chickenOrder}</p>
        </div>
        <div className="bg-white p-4 rounded shadow text-center">
          <h3 className="text-lg font-semibold mb-2">Beef Order</h3>
          <p className="text-2xl font-bold">{beefOrder}</p>
        </div>
        <div className="bg-white p-4 rounded shadow text-center">
          <h3 className="text-lg font-semibold mb-2">Mutton Order</h3>
          <p className="text-2xl font-bold">{muttonOrder}</p>
        </div>
        <div className="bg-white p-4 rounded shadow text-center">
          <h3 className="text-lg font-semibold mb-2">Fish Order</h3>
          <p className="text-2xl font-bold">{fishOrder}</p>
        </div>
      </div>
    </div>
  );
};

export default MonthConfiguration;
