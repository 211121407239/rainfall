export default async function handler(req, res) {
    // Step 1: Login
    const login = await fetch("https://www.vrain.vn/api/vrain/auth/login", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
            username: process.env.VRAIN_USERNAME,   // stored in Vercel env vars
            password: process.env.VRAIN_PASSWORD
        })
    });
 
    const setCookie = login.headers.get("set-cookie");
    const sid = setCookie.match(/sid=([^;]+)/)?.[1];
 
    // Step 2: Query data
    const data = await fetch("https://www.vrain.vn/api/vrain/private/v1/stats/summary", {
        headers: {
            "x-org-uuid": process.env.VRAIN_ORG_UUID,
            "cookie": `sid=${sid}`,
            "accept": "application/json"
        }
    });
 
    const json = await data.json();
    res.status(200).json(json);
}
