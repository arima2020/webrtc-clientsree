import React from "react";
import io from "socket.io-client";

import config from "../config";

export const SocketContext = React.createContext();

export const AppContext = ({ children }) => {
  const { PEER_CONFIG, SIGNALING_SERVER } = config;
  const peer = new RTCPeerConnection(PEER_CONFIG);
  const socket = io.connect(SIGNALING_SERVER);
  const dataChannel = peer.createDataChannel("annotationData");

  const sendData = (payload) => {
    if (dataChannel.readyState === "open") {
      dataChannel.send(JSON.stringify(payload));
    }
  };

  return (
    <SocketContext.Provider value={{ socket, peer, sendData }}>
      {children}
    </SocketContext.Provider>
  );
};
