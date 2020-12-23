const config = {
  annotations: [
    {
      tool: "Pencil",
      fields: ["height", "width", "left", "top", "path"],
    },
    {
      tool: "Line",
      fields: ["height", "width", "left", "top", "x1", "x2", "y1", "y2"],
    },
    {
      tool: "Rectangle",
      fields: ["height", "width", "left", "top"],
    },
    {
      tool: "Circle",
      fields: ["height", "width", "left", "top", "radius", "angle"],
    },
  ],
  payload: { IMAGE: "IMAGE", ANNOTATION: "ANNOTATION" },
  PEER_CONFIG: {
    iceServers: [
      {
        urls: "stun:ec2-18-221-102-19.us-east-2.compute.amazonaws.com:3478",
        username: "arimaglobal",
        credential: "arimaglobal",
      },
      {
        urls: "turn:ec2-18-221-102-19.us-east-2.compute.amazonaws.com:3478",
        username: "arimaglobal",
        credential: "arimaglobal",
      },
    ],
  },
  SIGNALING_SERVER:
    "https://signallingserver2020.herokuapp.com/",
  SOCKET_TOPICS: {
    JOIN_ROOM: "JOIN_ROOM",
    REMOTE_USER: "REMOTE_USER",
    REMOTE_USER_JOINED: "REMOTE_USER_JOINED",
    OFFER: "OFFER",
    ANSWER: "ANSWER",
    ICE_CANDIDATE: "ICE_CANDIDATE",
  },
};

export default config;
