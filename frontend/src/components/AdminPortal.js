import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const AdminPortal = () => {
  const navigate = useNavigate();

  // Placeholder states for dashboard data
  const [totalStudents, setTotalStudents] = useState(0);
  const [totalTokensUsed, setTotalTokensUsed] = useState(0);
  const [totalCapacity, setTotalCapacity] = useState(0);
  const availableTokens = totalCapacity - totalTokensUsed;

  const [chickenOrder, setChickenOrder] = useState(0);
  const [beefOrder, setBeefOrder] = useState(0);
  const [muttonOrder, setMuttonOrder] = useState(0);
  const [fishOrder, setFishOrder] = useState(0);

  // Fetch dashboard data - placeholder function
  useEffect(() => {
    // Fetch real data from backend API
    const fetchData = async () => {
      try {
        // Fetch signed-up students count
        const studentsResponse = await fetch('http://localhost:5000/api/signed-up-students-count');
        const studentsData = await studentsResponse.json();
        if (studentsData.success) {
          setTotalStudents(studentsData.count);
        } else {
          setTotalStudents(0);
        }

    // Fetch tokens used
    const tokensResponse = await fetch('http://localhost:5000/api/tokens-used');
    const tokensData = await tokensResponse.json();
    if (tokensData.success) {
      setTotalTokensUsed(tokensData.totalTokensUsed);
    } else {
      setTotalTokensUsed(0);
    }

    // Fetch configured months to calculate total capacity
    const monthsResponse = await fetch('http://localhost:5000/api/months');
    const monthsData = await monthsResponse.json();
    if (monthsData.success && monthsData.months.length > 0) {
      const totalCap = monthsData.months.reduce((acc, month) => acc + (month.token_allocation || 0), 0);
      setTotalCapacity(totalCap);
    } else {
      setTotalCapacity(0);
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
        setTotalStudents(0);
        setTotalTokensUsed(0);
        setChickenOrder(0);
        setBeefOrder(0);
        setMuttonOrder(0);
        setFishOrder(0);
      }
    };
    fetchData();
  }, []);

  const handleConfiguredMonthClick = () => {
    navigate('/month-configuration');
  };

  const handleSignOut = () => {
    // TODO: Clear auth tokens or session
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-neongreen via-milkywhite to-cream text-[#262840] p-8">
      <header className="mb-8">
        <h1 className="text-5xl font-extrabold">Student Data Management</h1>
        <h2 className="text-2xl mt-1">Manage Students and Their Token Allocations</h2>
        <div className="mt-4 flex space-x-4">
          <button
            onClick={handleConfiguredMonthClick}
            className="bg-[#262840] text-neongreen px-4 py-2 rounded hover:bg-[#3a3c4e] transition"
          >
            Configured Month
          </button>
          <button
            onClick={handleSignOut}
            className="bg-[#262840] text-neongreen px-4 py-2 rounded hover:bg-[#3a3c4e] transition"
          >
            Sign Out
          </button>
        </div>
      </header>

      <main className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* First four dashboard sections */}
        <div className="bg-white p-6 rounded shadow text-center">
          <h3 className="text-lg font-semibold mb-2">Total Students</h3>
          <p className="text-3xl font-bold">{totalStudents}</p>
        </div>
        <div className="bg-white p-6 rounded shadow text-center">
          <h3 className="text-lg font-semibold mb-2">Total Tokens Used</h3>
          <p className="text-3xl font-bold">{totalTokensUsed}</p>
        </div>
        <div className="bg-white p-6 rounded shadow text-center">
          <h3 className="text-lg font-semibold mb-2">Available Tokens</h3>
          <p className="text-3xl font-bold">{availableTokens}</p>
        </div>
        <div className="bg-white p-6 rounded shadow text-center">
          <h3 className="text-lg font-semibold mb-2">Total Capacity</h3>
          <p className="text-3xl font-bold">{totalCapacity}</p>
        </div>

        {/* Next four dashboard sections */}
        <div className="bg-white p-6 rounded shadow text-center">
          <h3 className="text-lg font-semibold mb-2">Chicken Order</h3>
          <p className="text-3xl font-bold">{chickenOrder}</p>
        </div>
        <div className="bg-white p-6 rounded shadow text-center">
          <h3 className="text-lg font-semibold mb-2">Beef Order</h3>
          <p className="text-3xl font-bold">{beefOrder}</p>
        </div>
        <div className="bg-white p-6 rounded shadow text-center">
          <h3 className="text-lg font-semibold mb-2">Mutton Order</h3>
          <p className="text-3xl font-bold">{muttonOrder}</p>
        </div>
        <div className="bg-white p-6 rounded shadow text-center">
          <h3 className="text-lg font-semibold mb-2">Fish Order</h3>
          <p className="text-3xl font-bold">{fishOrder}</p>
        </div>
      </main>
    </div>
  );
};

export default AdminPortal;
