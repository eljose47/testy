import * as React from "react";
import { useQuery } from "react-query";
import styled from "styled-components";

const List = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const Entry = styled.a`
  display: flex;
  gap: 8px;
  align-items: center;
  height: 70px;
  text-decoration: none;
  color: inherit;
`;

const LiveSince = styled.div`
  margin-left: auto;
`;

const Channel = styled.div`
  font-size: 28px;
  font-weight: 600px;
`;

const Category = styled.div`
  font-size: 26px;
  font-weight: 300;
`;

const clientId = "l3pj0aepy2pt31r2xv2bfyp2lebryx";
const redirect_uri = "https://eljose47.github.io/twitch";
// const redirect_uri = "http://localhost:3000";

interface User {
  id: string;
  login: string;
  display_name: string;
  offline_image_url: string;
  profile_image_url: string;
}

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
      }).then((e) => e.json().then((e) => e.data[0] as User)),
    { enabled: !!access_token }
  );

  const { data: followed } = useQuery(
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

  const { data } = useQuery(
    "users_followed",
    async () => {
      const url = new URL("https://api.twitch.tv/helix/users");
      for (const stream of followed) {
        url.searchParams.append("id", stream.user_id);
      }

      const response = await fetch(url, {
        headers,
      });

      const users = await response
        .json()
        .then((output: { data: User[] }) =>
          Object.fromEntries(output.data?.map((e) => [e.id, e]) ?? [])
        );
      return users;
    },
    { enabled: !!followed }
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
          {followed && (
            <List>
              {followed.map((stream: any) => {
                if (!data) {
                  return null;
                }
                const user = data[stream.user_id];
                let profilePic = user?.profile_image_url;
                profilePic = profilePic?.replace("300x300", "70x70");

                const timePassedSinceStreamStart =
                  Date.now() - new Date(stream.started_at).valueOf();

                return (
                  <Entry
                    key={stream.user_id}
                    href={`https://twitch.tv/${stream.user_login}`}
                    target="_blank"
                  >
                    <img
                      alt={`${stream.user_name} profile picture`}
                      src={profilePic}
                    />
                    <div>
                      <Channel>{stream.user_name}</Channel>
                      <Category>{stream.game_name}</Category>
                    </div>
                    <LiveSince>
                      Live for:{" "}
                      {(timePassedSinceStreamStart / 1000 / 60).toFixed(0)}{" "}
                      minutes
                    </LiveSince>
                  </Entry>
                );
              })}
            </List>
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
