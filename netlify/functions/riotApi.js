export async function handler(event, context) {
    const apiKey = process.env.REACT_APP_API_KEY;

    const puuid = event.queryStringParameters?.puuid;
    if (!puuid) {
        return {
            statusCode: 400,
            body: JSON.stringify({ error: "puuid is required" }),
        };
    }

    try {
        const response = await fetch(
            `https://euw1.api.riotgames.com/lol/league/v4/entries/by-puuid/${puuid}?api_key=${apiKey}`
        );
        if (!response.ok) {
            throw new Error("Failed to fetch Riot API");
        }
        const data = await response.json();

        return {
            statusCode: 200,
            body: JSON.stringify(data),
        };
    } catch (error) {
        return {
            statusCode: 500,
            body: JSON.stringify({ error: error.message }),
        };
    }
}
