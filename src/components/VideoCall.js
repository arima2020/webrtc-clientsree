import React, { useContext, useEffect, useRef } from "react";

import { SocketContext } from "./Context";
import config from "../config";

const VideoCall = ({ roomId, setConnected }) => {
  const { socket } = useContext(SocketContext);
  const {
    PEER_CONFIG,
    SOCKET_TOPICS: {
      JOIN_ROOM,
      REMOTE_USER,
      REMOTE_USER_JOINED,
      OFFER,
      ANSWER,
      ICE_CANDIDATE,
    },
  } = config;

  const peer = new RTCPeerConnection(PEER_CONFIG);
  const userVideo = useRef();
  const partnerVideo = useRef();
  const peerRef = useRef(peer);
  const socketRef = useRef(socket);
  const otherUser = useRef();
  const userStream = useRef();

  useEffect(() => {
    navigator.mediaDevices
      .getUserMedia({ audio: false, video: true })
      .then((stream) => {
        userVideo.current = {};
        userVideo.current.srcObject = stream;
        userStream.current = stream;

        socketRef.current.emit(JOIN_ROOM, roomId);

        socketRef.current.on(REMOTE_USER, (userID) => {
          callUser(userID);
          otherUser.current = userID;
        });

        socketRef.current.on(REMOTE_USER_JOINED, (userID) => {
          otherUser.current = userID;
          setConnected();
        });

        socketRef.current.on(OFFER, handleReceiveCall);

        socketRef.current.on(ANSWER, handleAnswer);

        socketRef.current.on(ICE_CANDIDATE, handleNewICECandidateMsg);
      });
  }, []);

  function callUser(userID) {
    createPeer(userID);
    userStream.current
      .getTracks()
      .forEach((track) => peerRef.current.addTrack(track, userStream.current));
  }

  function createPeer(userID) {
    peerRef.current.onicecandidate = handleICECandidateEvent;
    peerRef.current.ontrack = handleTrackEvent;
    peerRef.current.onnegotiationneeded = () =>
      handleNegotiationNeededEvent(userID);
  }

  function handleNegotiationNeededEvent(userID) {
    peerRef.current
      .createOffer()
      .then((offer) => {
        return peerRef.current.setLocalDescription(offer);
      })
      .then(() => {
        const payload = {
          target: userID,
          caller: socketRef.current.id,
          sdp: peerRef.current.localDescription,
        };
        socketRef.current.emit(OFFER, payload);
      })
      .catch((e) => console.error(e));
  }

  function handleReceiveCall(incoming) {
    createPeer();
    const desc = new RTCSessionDescription(incoming.sdp);
    peerRef.current
      .setRemoteDescription(desc)
      .then(() => {
        userStream.current
          .getTracks()
          .forEach((track) =>
            peerRef.current.addTrack(track, userStream.current)
          );
      })
      .then(() => {
        return peerRef.current.createAnswer();
      })
      .then((answer) => {
        return peerRef.current.setLocalDescription(answer);
      })
      .then(() => {
        const payload = {
          target: incoming.caller,
          caller: socketRef.current.id,
          sdp: peerRef.current.localDescription,
        };
        socketRef.current.emit(ANSWER, payload);
      });
  }

  function handleAnswer(message) {
    const desc = new RTCSessionDescription(message.sdp);
    peerRef.current.setRemoteDescription(desc).catch((e) => console.error(e));
    setConnected();
  }

  function handleICECandidateEvent(e) {
    if (e.candidate) {
      const payload = {
        target: otherUser.current,
        candidate: e.candidate,
      };
      socketRef.current.emit(ICE_CANDIDATE, payload);
    }
  }

  function handleNewICECandidateMsg(incoming) {
    const candidate = new RTCIceCandidate(incoming);
    peerRef.current.addIceCandidate(candidate).catch((e) => console.error(e));
  }

  function handleTrackEvent(e) {
    partnerVideo.current.srcObject = e.streams[0];
  }

  return (
    <video
      height="700"
      width="350"
      style={{ float: "left" }}
      autoPlay
      ref={partnerVideo}
    />
  );
};

export default VideoCall;
