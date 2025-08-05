import "./leaderboard.css";
import users from "../../data/users.json";
import { useEffect, useState } from "react";

const tierMap = {
    IRON: 0,
    BRONZE: 400,
    SILVER: 800,
    GOLD: 1200,
    PLATINUM: 1600,
    EMERALD: 2000,
    DIAMOND: 2400,
    MASTER: 2800,
    GRANDMASTER: 3200,
    CHALLENGER: 3600,
};

const rankMap = {
    IV: 0,
    III: 100,
    II: 200,
    I: 300,
};

const Leaderboard = () => {
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchAllUserData = async () => {
            setLoading(true);
            try {
                const data = await Promise.all(
                    users.map(async (user) => {
                        const res = await fetch(
                            `/.netlify/functions/riotApi?puuid=${user.id}`
                        );

                        if (!res.ok) {
                            throw new Error(
                                `Error fetching data for ${user.name}`
                            );
                        }

                        const json = await res.json();

                        const enhancedData = json.map((player) => {
                            const rank = rankMap[player.rank] ?? 0;
                            const tier = tierMap[player.tier] ?? 0;
                            const lp = player.leaguePoints ?? 0;

                            const startingRank =
                                rankMap[user.startingRank] ?? 0;
                            const startingTier =
                                tierMap[user.startingTier] ?? 0;
                            const startingLp = user.startingLP ?? 0;

                            const calc =
                                rank +
                                tier +
                                lp -
                                (startingRank + startingTier + startingLp);

                            const totalLPGained =
                                calc > 0 ? `+${calc}` : `${calc}`;

                            return {
                                ...player,
                                totalLPGained,
                            };
                        });

                        return { name: user.name, data: enhancedData };
                    })
                );

                const sortedData = data.sort((a, b) => {
                    const aSolo = a.data.find(
                        (entry) => entry.queueType === "RANKED_SOLO_5x5"
                    );
                    const bSolo = b.data.find(
                        (entry) => entry.queueType === "RANKED_SOLO_5x5"
                    );

                    const aLP = parseInt(aSolo?.totalLPGained) || 0;
                    const bLP = parseInt(bSolo?.totalLPGained) || 0;

                    return bLP - aLP;
                });

                const finalData = sortedData.map((user, index) => ({
                    ...user,
                    position: index + 1,
                }));

                setResults(finalData);
                setLoading(false);
            } catch (err) {
                console.error("API fetch failed:", err);
            }
        };

        fetchAllUserData();
    }, []);

    const leaderboardItem = (user, index) => {
        const soloQueue = user.data.find(
            (entry) => entry.queueType === "RANKED_SOLO_5x5"
        );

        if (!soloQueue) return null;

        return (
            <div key={index} className="leaderboard-item">
                <h3 className={`pos${user.position}`}>
                    #{user.position} - {user.name}
                    {user.position === 1 && " 👑"}
                </h3>
                <div>
                    <div className="lp-container">
                        <div>
                            {soloQueue.tier} {soloQueue.rank} -{" "}
                            {soloQueue.leaguePoints} LP
                        </div>
                        <div>{soloQueue.totalLPGained}</div>
                    </div>
                    <div>
                        {soloQueue.wins}W / {soloQueue.losses}L -{" "}
                        {(
                            (soloQueue.wins /
                                (soloQueue.losses + soloQueue.wins)) *
                            100
                        ).toFixed(1)}
                        %
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="leaderboard-container">
            <div className="title">
                <h1>Cracker Snackers Official Leaderboard</h1>
            </div>
            <div className="player-standings">
                {results.map((user, index) => leaderboardItem(user, index))}
            </div>
            {loading && (
                <div className="loading-text-container">
                    <p className="loading-text">LOADING LEADERBOARD...</p>
                </div>
            )}
        </div>
    );
};

export default Leaderboard;
