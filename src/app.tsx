import * as React from "react";
import { useQuery } from "react-query";

const clientId = "l3pj0aepy2pt31r2xv2bfyp2lebryx";
const redirect_uri = "https://eljose47.github.io/twitch";
// const redirect_uri = "http://localhost:3000";

const App: React.FunctionComponent<AppProps> = (props) => {
  const { access_token } = React.useMemo(() => {
    const hash = new URLSearchParams(document.location.hash.slice(1));
    const output: Record<string, any> = {};

    for (const [key, value] of hash.entries()) {
      output[key] = value;
    }

    return output;
  }, []);

  const headers = {
    Authorization: `Bearer ${access_token}`,
    "Client-Id": clientId,
  };

  const { data: user } = useQuery(
    "user",
    () =>
      fetch("https://api.twitch.tv/helix/users", {
        headers,
      }).then((e) => e.json().then((e) => e.data[0])),
    { enabled: !!access_token }
  );

  const { data } = useQuery(
    "followed",
    async () => {
      const url = new URL("https://api.twitch.tv/helix/streams/followed");
      url.searchParams.append("user_id", user!.id);

      const response = await fetch(url, {
        headers,
      });

      const { data } = await response.json();
      return data;
    },
    { enabled: !!user }
  );

  const twitchAuthUrl = new URL("https://id.twitch.tv/oauth2/authorize");
  twitchAuthUrl.searchParams.append("client_id", clientId);
  twitchAuthUrl.searchParams.append("redirect_uri", redirect_uri);
  twitchAuthUrl.searchParams.append("response_type", "token");
  twitchAuthUrl.searchParams.append("scope", "user:read:follows");

  return (
    <>
      {access_token ? (
        <>
          <h1>Followed Channels</h1>
          {data && (
            <ul>
              {data.map((channel: any) => (
                <li key={channel.user_id}>{channel.user_name}</li>
              ))}
            </ul>
          )}
        </>
      ) : (
        <>
          <h1>Hallo</h1>
          <a href={twitchAuthUrl.toString()}>Connect with Twitch</a>;
        </>
      )}
    </>
  );
};

App.displayName = "App";

export default App;

export interface AppProps {}
