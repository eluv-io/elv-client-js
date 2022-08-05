const { ElvClient } = require("../../src/ElvClient");

const networkName = "demo"; // "main" or "demo"
const idToken = "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6Inlwd1ZUbXJkWENkYU5tcjAzVGRDaCJ9.eyJodHRwczovL2F1dGguY29udGVudGZhYnJpYy5pby9nZW8iOnsiY291bnRyeV9jb2RlIjoiVVMiLCJjb3VudHJ5X2NvZGUzIjoiVVNBIiwiY291bnRyeV9uYW1lIjoiVW5pdGVkIFN0YXRlcyIsImNpdHlfbmFtZSI6IlByb3ZpZGVuY2UiLCJsYXRpdHVkZSI6NDEuODMwNywibG9uZ2l0dWRlIjotNzEuMzk4MiwidGltZV96b25lIjoiQW1lcmljYS9OZXdfWW9yayIsImNvbnRpbmVudF9jb2RlIjoiTkEiLCJzdWJkaXZpc2lvbl9jb2RlIjoiUkkiLCJzdWJkaXZpc2lvbl9uYW1lIjoiUmhvZGUgSXNsYW5kIn0sIm5pY2tuYW1lIjoiam9uK3Rlc3QiLCJuYW1lIjoiam9uK3Rlc3RAZWx1di5pbyIsInBpY3R1cmUiOiJodHRwczovL3MuZ3JhdmF0YXIuY29tL2F2YXRhci8xMmMzMTQzYjFjYzQ3MjY5YjQ3MDAzYTFmNzBiMTVmMj9zPTQ4MCZyPXBnJmQ9aHR0cHMlM0ElMkYlMkZjZG4uYXV0aDAuY29tJTJGYXZhdGFycyUyRmpvLnBuZyIsInVwZGF0ZWRfYXQiOiIyMDIyLTA4LTA1VDE2OjU3OjMxLjc3NFoiLCJlbWFpbCI6Impvbit0ZXN0QGVsdXYuaW8iLCJlbWFpbF92ZXJpZmllZCI6ZmFsc2UsImlzcyI6Imh0dHBzOi8vYXV0aC5jb250ZW50ZmFicmljLmlvLyIsInN1YiI6ImF1dGgwfDYyZWQ0YmZiNjFjMzk0MTc3YjgzMWJhYiIsImF1ZCI6Ik9OeXViUDlyRkk1Qkh6bVlnbFFLQloxYkJiaXlvQjNTIiwiaWF0IjoxNjU5NzE4NjUzLCJleHAiOjE2NTk3NTQ2NTMsIm5vbmNlIjoiY0hReGEzcFNWVTAyYUZCWk9VNUhSSE5hY0hsM1gwNW9aVTl3TXpseFRqZDBjRmt0WDNCbWJsb3pMUT09In0.VA4dQQyi8iRralXJgfcNHJfymKeBvM57YhpVQnB7l5M2cqWMW0vdqqwsz8C9aJv5YUrKhwLjHjrArFQ2lo_H4o8xvwTyc3ZHuVa5jDi4an7-Z8eNyjSiKvYxeqLiq5shJohNPsj1eGSbiFiHWvmpVbwb_cfMx_2-2EiuH1dZS0Rk1CNHvQuMOwzkDgSZ9KTKKBGkREHxlw8DPioXWUhIOtqR-Q9_kwCWWhGaVNlxq0UTikw5KoZC5SgskDHm-q7kZuOTpI5G3B_boFN97Y4iohG9d49eldoh8TFqaQc1NDubKgn5ECF4kKZZ2Rd0mpqKjLH-upPdWt9lhPpEcZxhPQ"

const Setup = async () => {

  client = await ElvClient.FromNetworkName({networkName});
  await client.SetRemoteSigner({idToken: idToken, unsignedPublicAuth: true})
  client.ToggleLogging(false);

  return client;
}

const MakeClientSignedToken = async ({client}) => {

  const token = await client.CreateFabricToken({
	  duration: 60 * 60 * 1000, // millisec
  });

  console.log("ETH_TOKEN", token);
  return token;
}

const MakeClientSignedTokenPersonal = async ({client}) => {

  const token = await client.CreateFabricToken({
    duration: 60 * 60 * 1000, // millisec
    addEthereumPrefix: false,
  });

  console.log("PERSONAL_TOKEN", token);
  return token;
}

const Run = async () => {

  client = await Setup();

  const ethToken = await MakeClientSignedToken({client: client});
  const personalToken = await MakeClientSignedTokenPersonal({client: client});
}

Run();
