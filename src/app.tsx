import * as React from "react";
import { useQuery } from "react-query";
import styled from "styled-components";

const List = styled.div`
  display: flex;
  flex-direction: column;
`;

const Entry = styled.div``;

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

  console.log(data);

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
            <List>
              {data.map((channel: any) => {
                let thumbnail = channel.thumbnail_url as string;
                thumbnail = thumbnail.replace("{width}", "160");
                thumbnail = thumbnail.replace("{height}", "90");

                return (
                  <Entry key={channel.user_id}>
                    <h2>{channel.user_name}</h2>
                    <h3>Category: {channel.game_name}</h3>
                    <a href={`https://twitch.tv/${channel.user_login}`}>
                      <img
                        alt={`${channel.user_name} thumbnail`}
                        src={thumbnail}
                      />
                    </a>
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
