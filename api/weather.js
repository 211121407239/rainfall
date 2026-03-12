export default async function handler(req, res) {
  try {
    const dataResp = await fetch("https://www.vrain.vn/api/vrain/private/v1/stats/summary", {
      headers: {
        "x-org-uuid": process.env.VRAIN_ORG_UUID,
        "cookie": `sid=${process.env.VRAIN_SID}`,
        "accept": "application/json"
      }
    });
 
    const dataText = await dataResp.text();
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Content-Type", "application/json");
 
    if (!dataResp.ok) {
      return res.status(dataResp.status).json({ error: "Data fetch failed", details: dataText });
    }
 
    return res.status(200).send(dataText);
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}
