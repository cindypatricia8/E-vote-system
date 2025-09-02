const mongoose = require('mongoose');
const userQueries = require('../queries/userQueries');
const clubQueries = require('../queries/clubQueries');
const electionQueries = require('../queries/electionQueries');
const ballotQueries = require('../queries/ballotQueries');

/**
 * Handles the submission of a vote. 
 */
const castVote = async (req, res) => {
    const { electionId } = req.params;
    const { selections } = req.body; // e.g., [{ positionId, candidateId }, ...]
    const userId = req.user._id; 

    // Eligibility Checks =-=-=-=-=-=-=-==-=--=--=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=--=--=-=-=-=-=-
    try {
        const election = await electionQueries.findElectionById(electionId);
        const user = await userQueries.findUserById(userId);

        // Basic validation checks
        if (!election) return res.status(404).json({ message: 'Election not found.' });
        if (election.status !== 'active' || new Date() > election.endTime) {
            return res.status(403).json({ message: 'This election is not currently active.' });
        }
        if (!selections || !Array.isArray(selections) || selections.length === 0) {
            return res.status(400).json({ message: 'Vote selections are required and must be an array.' });
        }

        //  Check is the user a member of the club?
        const isMember = await clubQueries.isUserClubMember(election.clubId._id, userId);
        if (!isMember) {
            return res.status(403).json({ message: 'Forbidden: You are not a member of this club and are not eligible to vote.' });
        }

        // Check has the user already voted?
        const hasVoted = user.votedInElections.some(id => id.equals(electionId));
        if (hasVoted) {
            return res.status(409).json({ message: 'Conflict: You have already voted in this election.' });
        }

    } catch (error) {
        return res.status(500).json({ message: 'An error occurred during the eligibility check.', error: error.message });
    }

    // Cast the vote =-=-=-=-=-=-=-=-=-=-=-=--=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=---==-=--=-

    // Use a session to create multiple actions
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        // Create the anonymous ballot.
        await ballotQueries.createBallot(electionId, selections);

        // Record that the user has participated.
        await userQueries.recordUserVote(userId, electionId);

        // Then commit transaction.
        await session.commitTransaction(); // commits all currently active transactions in this case it would be recordUserVote and createBallot
        
        res.status(201).json({ status: 'success', message: 'Your vote has been successfully and anonymously cast!' });

    } catch (error) {
        await session.abortTransaction();
        res.status(500).json({ message: 'A critical error occurred while casting your vote. The vote was not recorded. Please try again.', error: error.message });
    } finally {
        session.endSession();
    }
};

/**
 * Retrieves and tallys the results for a given election.
 * Results are only visible after the election has closed (Can be set otherwise).
 */
const getElectionResults = async (req, res) => {
    try {
        const { electionId } = req.params;

        // Fetch the election
        const election = await electionQueries.findElectionById(electionId);
        if (!election) {
            return res.status(404).json({ message: 'Election not found.' });
        }

        // Check is the election over?
        if (election.status === 'active' && new Date() < election.endTime) {
            return res.status(403).json({ message: 'Election results are not available until the voting period has ended.' });
        }

        // Tally the anonymous ballots.
        const rawResults = await ballotQueries.getElectionResults(electionId);
        const totalBallots = await ballotQueries.countBallotsForElection(electionId);

        // Format the results.
        const formattedResults = election.positions.map(position => {
            const positionResults = {
                positionId: position._id,
                positionTitle: position.title,
                candidates: position.candidates.map(candidate => {
                    const result = rawResults.find(r =>
                        r.positionId.equals(position._id) && r.candidateId.equals(candidate.candidateId._id)
                    );
                    return {
                        candidateId: candidate.candidateId._id,
                        name: candidate.candidateId.name,
                        voteCount: result ? result.voteCount : 0 // Default to 0 if no votes
                    };
                }).sort((a, b) => b.voteCount - a.voteCount) // Sort candidates by vote count
            };
            return positionResults;
        });

        res.status(200).json({
            status: 'success',
            data: {
                electionTitle: election.title,
                clubName: election.clubId.name,
                totalBallotsCast: totalBallots,
                results: formattedResults
            }
        });

    } catch (error) {
        res.status(500).json({ message: 'Error retrieving election results.', error: error.message });
    }
};

module.exports = {
    castVote,
    getElectionResults,
};