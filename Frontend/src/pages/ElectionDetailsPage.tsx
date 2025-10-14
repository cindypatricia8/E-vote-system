import React, { useState, useEffect, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getElectionById, getElectionResults } from '../api/apiService';
import type { Election, Position } from '../types'; 
import './ElectionDetailsPage.css';


interface FormattedResult
{
    positionId: string;
    positionTitle: string;
    candidates: {
        candidateId: string;
        name: string;
        voteCount: number;
        percentage: number;
    }[];
}

interface DisplayPosition
{
    id: string;
    title: string;
    candidates: FormattedResult['candidates'] | Position['candidates'];
}


export default function ElectionDetailsPage()
{
    const { electionId } = useParams<{ electionId: string }>();
    const [election, setElection] = useState<Election | null>(null);
    const [results, setResults] = useState<FormattedResult[] | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() =>
    {
        if (!electionId) return;

        const fetchData = async () =>
        {
            try
            {
                const electionRes = await getElectionById(electionId);
                const fetchedElection = electionRes.data.data.election;
                setElection(fetchedElection);
                const isElectionClosed = fetchedElection.status === 'closed' || new Date() > new Date(fetchedElection.endTime);
                if (isElectionClosed)
                {
                    const resultsRes = await getElectionResults(electionId);
                    const { results: resultsFromApi, totalBallotsCast: totalBallotsCast } = resultsRes.data.data;
                    console.log(resultsRes)
                    const finalResults = resultsFromApi.map(position =>
                    {
                        const candidatesWithPercentage = position.candidates.map(candidate => ({
                            ...candidate,
                            percentage: totalBallotsCast > 0 ? (candidate.voteCount / totalBallotsCast) * 100 : 0,
                        }));
                        candidatesWithPercentage.sort((a, b) => b.voteCount - a.voteCount);
                        return {
                            ...position,
                            candidates: candidatesWithPercentage,
                        };
                    });


                    setResults(finalResults);
                }
            } catch (err)
            {
                setError('Failed to load election details.');
                console.error(err);
            } finally
            {
                setIsLoading(false);
            }
        };

        fetchData();
    }, [electionId]);

    const isClosed =
        election?.status === "closed" ||
        (election && new Date() > new Date(election.endTime));

    const isActive = election?.status === 'active' && !isClosed;    

    const displayablePositions = useMemo((): DisplayPosition[] =>
    {
        if (!election) return [];

        if (isClosed && results)
        {
            return results.map((res) => ({
                id: res.positionId,
                title: res.positionTitle,
                candidates: res.candidates,
            }));
        } else
        {
            return election.positions.map((pos) => ({
                id: pos._id,
                title: pos.title,
                candidates: pos.candidates,
            }));
        }
    }, [election, results, isClosed]);

    if (isLoading) return <div>Loading Election...</div>;
    if (error) return <div className="error-message">{error}</div>;
    if (!election) return <div>Election not found.</div>;

    return (
        <div className="election-details-page">
            <header className="election-header">
                <div className="club-name">
                    <Link to={`/club/${election.clubId._id}`}>{election.clubId.name}</Link>
                </div>
                <h1>{election.title}</h1>
                <div className={`election-status-banner status-${isClosed ? 'closed' : election.status}`}>
                    {isClosed ? 'Election Closed' : `Status: ${election.status}`}
                </div>
                {isActive && (
                    <Link to={`/election/${electionId}/vote`} className="vote-now-button">
                        <i className="fas fa-vote-yea"></i> Cast Your Vote Now
                    </Link>
                )}
            </header>

            <div className="positions-list">
                {displayablePositions.map((position) => (
                    <div key={position.id} className="position-card">
                        <h2>{position.title}</h2>

                        {isClosed && results ? (
                            // This block runs only if the election is closed and results are available
                            <div className="results-list">
                                {(position.candidates as FormattedResult['candidates']).map((candidate, rank) => (
                                    <div key={candidate.candidateId} className={`result-item ${rank === 0 && candidate.voteCount > 0 ? 'winner' : ''}`}>
                                        <div className="rank">#{rank + 1}</div>
                                        <div className="info">
                                            <div className="name">{candidate.name}</div>
                                            <div className="vote-count">{candidate.voteCount} Votes ({candidate.percentage.toFixed(1)}%)</div>
                                            <div className="result-bar">
                                                <div className="result-bar-inner" style={{ width: `${candidate.percentage}%` }}></div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            // This block runs for active or upcoming elections
                            <div className="candidates-grid">
                                {(position.candidates as Position['candidates']).map(candidate => (
                                    <div key={candidate.candidateId._id} className="candidate-card">
                                        <div className="name">{candidate.candidateId.name}</div>
                                        <div className="student-id">({candidate.candidateId.studentId})</div>
                                        <p className="statement">"{candidate.statement || 'No statement provided.'}"</p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                ))}

                {displayablePositions.length === 0 && (
                    <p style={{ textAlign: 'center', color: '#6b7280' }}>
                        No positions have been configured for this election yet.
                    </p>
                )}
            </div>
        </div>
    );
}