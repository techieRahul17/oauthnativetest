import * as AuthSession from "expo-auth-session";
import * as WebBrowser from "expo-web-browser";
import React, { useEffect, useState } from "react";
import { Button, Image, Text, View } from "react-native";

WebBrowser.maybeCompleteAuthSession();

const GOOGLE_CLIENT_ID = "486291190133-rfd0p9spon54i2b8ioj4hferrd2uj80l.apps.googleusercontent.com";

const discovery = {
  authorizationEndpoint: "https://accounts.google.com/o/oauth2/v2/auth",
  tokenEndpoint: "https://oauth2.googleapis.com/token",
  revocationEndpoint: "https://oauth2.googleapis.com/revoke",
};

// Define a type for the user info
interface GoogleUserInfo {
  name: string;
  email: string;
  picture?: string;
}

// @ts-ignore
console.log(AuthSession.makeRedirectUri({ useProxy: true }));

export default function App() {
  const [userInfo, setUserInfo] = useState<GoogleUserInfo | null>(null);

  const [request, response, promptAsync] = AuthSession.useAuthRequest(
    {
      clientId: GOOGLE_CLIENT_ID,
      scopes: ["openid", "profile", "email"],
      redirectUri: AuthSession.makeRedirectUri({
        // useProxy is not a valid property here, just use default for Expo Go
      }),
    },
    discovery
  );

  useEffect(() => {
    if (response?.type === "success") {
      const { authentication } = response;
      fetchUserInfo(authentication?.accessToken ?? "");
    }
  }, [response]);

  const fetchUserInfo = async (token: string) => {
    if (!token) return;
    try {
      const res = await fetch("https://www.googleapis.com/userinfo/v2/me", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const user = await res.json();
      setUserInfo(user);
    } catch (e) {
      setUserInfo(null);
    }
  };

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      {userInfo ? (
        <View style={{ alignItems: "center" }}>
          {userInfo.picture && (
            <Image source={{ uri: userInfo.picture }} style={{ width: 80, height: 80, borderRadius: 40, marginBottom: 16 }} />
          )}
          <Text style={{ fontSize: 18, fontWeight: "bold" }}>{userInfo.name}</Text>
          <Text>{userInfo.email}</Text>
        </View>
      ) : (
        <Button
          title="Sign in with Google"
          disabled={!request}
          onPress={() => promptAsync({ showInRecents: true })}
        />
      )}
    </View>
  );
}
