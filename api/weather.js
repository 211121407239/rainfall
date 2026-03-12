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
    const setCookie = loginResp.headers.get("set-cookie");
 
    if (!loginResp.ok) {
      return res.status(loginResp.status).json({
        error: "Login failed",
        details: loginBodyText
      });
    }
 
    // If auth is cookie-based
    let sid = null;
    if (setCookie) {
      const m = setCookie.match(/sid=([^;]+)/);
      sid = m ? m[1] : null;
    }
 
    // If auth is token-based (some APIs return token in JSON)
    let token = null;
    try {
      const parsed = JSON.parse(loginBodyText);
      token = parsed?.access_token || parsed?.token || parsed?.data?.access_token || null;
    } catch {}
 
    const headers = {
      "x-org-uuid": process.env.VRAIN_ORG_UUID,
      "accept": "application/json"
    };
 
    if (sid) headers["cookie"] = "sid=" + sid;
    if (token) headers["authorization"] = "Bearer " + token;
 
    const dataResp = await fetch("https://www.vrain.vn/api/vrain/private/v1/stats/summary", {
      headers
    });
 
    const dataText = await dataResp.text();
 
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Content-Type", "application/json");
 
    if (!dataResp.ok) {
      return res.status(dataResp.status).send(
        JSON.stringify({ error: "Data request failed", details: dataText })
      );
    }
 
    return res.status(200).send(dataText);
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}
