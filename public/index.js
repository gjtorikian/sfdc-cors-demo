async function fetchSFDCData() {
  let res;
  try {
    let response = await fetch(`${instance_url}/services/data/v37.0/sobjects`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
    const data = await response.json();
    const names = data.sobjects.map((item) => item.name);
    res = JSON.stringify(data, null, 2);
    res = `Here's the SFDC data your org can see: <br/><br/>${names.join(
      "<br/> "
    )}`;
  } catch (e) {
    res =
      e + " due to CORS error :(. Open up the Browser Console for more info";
  }

  document.getElementById("container").innerHTML = res;
}

fetchSFDCData();
