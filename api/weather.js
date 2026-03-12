export default async function handler(req, res) {
  try {
    if (!process.env.VRAIN_USERNAME || !process.env.VRAIN_PASSWORD || !process.env.VRAIN_ORG_UUID) {
      return res.status(500).json({ error: "Missing env vars" });
    }
 
    const loginResp = await fetch("https://www.vrain.vn/api/vrain/public/v1/login", {
      method: "POST",
      headers: { "content-type": "application/json", "accept": "application/json" },
      body: JSON.stringify({
        username: process.env.VRAIN_USERNAME,
        password: process.env.VRAIN_PASSWORD
      })
    });
 
    const loginBodyText = await loginResp.text();
    console.log("=== LOGIN RESPONSE ===");
    console.log("Status:", loginResp.status);
    console.log("Set-Cookie header:", loginResp.headers.get("set-cookie"));
    console.log("Response body:", loginBodyText);
    console.log("All headers:", Array.from(loginResp.headers.entries()));
 
    if (!loginResp.ok) {
      return res.status(loginResp.status).json({
        error: "Login failed",
        details: loginBodyText
      });
    }
 
    // Parse the response to see what auth info it contains
    let authInfo = {};
    try {
      authInfo = JSON.parse(loginBodyText);
      console.log("Parsed JSON:", authInfo);
    } catch (e) {
      console.log("Not JSON:", e.message);
    }
 
    return res.status(200).json({
      debug: "Check Vercel logs",
      loginStatus: loginResp.status,
      hasCookie: !!loginResp.headers.get("set-cookie"),
      responseKeys: Object.keys(authInfo)
    });
 
  } catch (e) {
    console.error("ERROR:", e);
    return res.status(500).json({ error: e.message });
  }
}
