import React, { useState, useEffect, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { getElectionsByClub, getElectionResults , getElectionAnalytics} from '../../api/apiService';
import type { Election, ResultPosition , ElectionAnalyticsData} from '../../types';
import './AnalyticsPage.css';

import { Bar, Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);

const AnalyticsPage: React.FC = () => {
  const { clubId } = useParams<{ clubId: string }>();
  const [elections, setElections] = useState<Election[]>([]);
  const [selectedElectionId, setSelectedElectionId] = useState<string>('');
  const [results, setResults] = useState<ResultPosition[] | null>(null);
  const [totalBallots, setTotalBallots] = useState(0);
  const [analytics, setAnalytics] = useState<ElectionAnalyticsData | null>(null);

  const [isLoading, setIsLoading] = useState(false);

  // Fetch all elections for this club on component mount
  useEffect(() => {
    if (!clubId) return;
    const fetchElections = async () => {
      const res = await getElectionsByClub(clubId);
      const closedElections = res.data.data.elections.filter(e => e.status === 'closed');
      setElections(closedElections);
      if (closedElections.length > 0) {
        setSelectedElectionId(closedElections[0]._id); 
      }
    };
    fetchElections();
  }, [clubId]);

  // Fetch results whenever a new election is selected
  useEffect(() => {
    if (!selectedElectionId) {
      setResults(null);
      setAnalytics(null);
      return;
    }
    const fetchDataForElection = async () => {
      setIsLoading(true);
      try {
        // Fetch both sets of data in parallel for speed
        const [resultsRes, analyticsRes] = await Promise.all([
          getElectionResults(selectedElectionId),
          getElectionAnalytics(selectedElectionId)
        ]);
        
        setResults(resultsRes.data.data.results);
        setTotalBallots(resultsRes.data.data.totalBallotsCast);
        setAnalytics(analyticsRes.data.data);

      } catch (error) {
        console.error('Failed to fetch election data', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchDataForElection();
  }, [selectedElectionId]);

  // Prepare data for the charts 
  const chartData = useMemo(() => {
    if (!results || !analytics) {
        return null;
    }
    
    // Data for Votes by Candidate (Bar Chart)
    const allCandidates = results.flatMap(pos => pos.candidates);
    const barChartLabels = allCandidates.map(c => c.name);
    const barChartData = allCandidates.map(c => c.voteCount);

    // Data for Votes per Position (Pie Chart)
    const pieChartLabels = results.map(pos => pos.positionTitle);
    const pieChartData = results.map(pos => 
      pos.candidates.reduce((sum, cand) => sum + cand.voteCount, 0)
    );

    const facultyLabels = Object.keys(analytics.votesByFaculty);
    const facultyData = Object.values(analytics.votesByFaculty);

    return { barChartLabels, barChartData, pieChartLabels, pieChartData ,  facultyLabels, facultyData};
  }, [results, analytics]);

  const selectedElection = elections.find(e => e._id === selectedElectionId);

  return (
    <div className="analytics-page">
      <h1>Election Analytics</h1>
      
      <div className="election-selector-bar">
        <label htmlFor="electionSelect">Select an Election:</label>
        <select 
          id="electionSelect" 
          value={selectedElectionId} 
          onChange={(e) => setSelectedElectionId(e.target.value)}
          disabled={elections.length === 0}
        >
          {elections.length > 0 ? (
            elections.map(e => <option key={e._id} value={e._id}>{e.title}</option>)
          ) : (
            <option>No closed elections available</option>
          )}
        </select>
      </div>

      {isLoading ? (
        <p>Loading analytics...</p>
      ) : selectedElection && results && analytics? (
        <>
          <div className="admin-cards">
            <div className="admin-card" style={{ background: '#04a319ff' }}>
              <h3>Participation</h3><p>{analytics.participationRate.toFixed(1)}%</p>
            </div>
            <div className="admin-card" style={{ background: '#04a319ff' }}>
              <h3>Eligible Voters</h3><p>{analytics.totalEligibleVoters}</p>
            </div>
            <div className="admin-card" style={{ background: '#04a319ff' }}>
              <h3>Ballots Cast</h3><p>{totalBallots}</p>
            </div>
            <div className="admin-card" style={{ background: '#04a319ff' }}>
              <h3>Positions</h3><p>{results.length}</p>
            </div>
          </div>

          <div className="charts-grid">
            <div className="chart-container">
              <h3>Votes by Candidate</h3>
              <div style={{ position: 'relative', height: '100%' }}>
              {chartData && (
                <Bar 
                  data={{
                    labels: chartData.barChartLabels,
                    datasets: [{ label: 'Total Votes', data: chartData.barChartData, backgroundColor: '#3498db' }]
                  }}
                  options={{ responsive: true,maintainAspectRatio: false, scales: { y: { beginAtZero: true } } }}
                />
              )}
              </div>
            </div>
            <div className="chart-container">
              <h3>Votes per Position</h3>
              <div style={{ position: 'relative', height: '100%' }}>
              {chartData && (
                 <Pie 
                   data={{
                     labels: chartData.pieChartLabels,
                     datasets: [{ label: 'Votes', data: chartData.pieChartData, backgroundColor: ['#3498db', '#2ecc71', '#f1c40f', '#e67e22'] }]
                   }}
                   options={{ responsive: true , maintainAspectRatio: false}}
                 />
              )}
              </div>
            </div>
            <div className="chart-container">
              <h3>Votes by Faculty</h3>
              <div style={{ position: 'relative', height: '100%' }}>
              {chartData && (
                <Bar 
                  data={{
                    labels: chartData.facultyLabels,
                    datasets: [{ 
                      label: 'Number of Voters', 
                      data: chartData.facultyData, 
                      backgroundColor: '#16a085' 
                    }]
                  }}
                  options={{ 
                    responsive: true,
                    indexAxis: 'y',
                    maintainAspectRatio: false,
                    scales: { x: { beginAtZero: true } } 
                  }}
                />
              )}
              </div>
            </div>
          </div>
        </>
      ) : (
        <div className="no-data-message">
          Select an election to view its analytics.
        </div>
      )}
    </div>
  );
}

export default AnalyticsPage;