Assignment 1 — “SMS→Video Escalation with LiveKit”
Goal
Build an end-to-end flow where a customer texts a Plivo number for help, receives a short-lived link to a LiveKit video room, and an agent joins that room from an internal page to resolve the issue (with recording and basic quality telemetry).
Architecture (high level)
1.	Customer → SMS to Plivo Number
2.	Plivo hits your message callback webhook → your backend:
○	Creates a LiveKit room + ephemeral access token.
○	Replies via Plivo SMS with a magic link that embeds the token.
3.	Customer opens link → LiveKit Web Client joins room.
4.	Agent portal lists “waiting” rooms → agent clicks to join with an agent token.
5.	LiveKit recording on join; post-call, upload summary + artefacts to your help desk of choice (even a stub).
Key refs: Plivo SMS callbacks/webhooks (how to receive delivery & status) Plivo • LiveKit SDK quickstarts & SIP/telephony note (for optional stretch) LiveKit docs • LiveKit SDK overview (platform support) LiveKit docs
Prerequisites
●	A Plivo SMS-enabled number and auth creds.
●	LiveKit Cloud project or self-hosted LiveKit.
●	Small Node/Express (or Python/Flask) server for webhooks + token minting.
Core Tasks
1.	Messaging webhook
○	Expose POST /plivo/sms-callback.
○	On inbound “HELP”:
■	Create a LiveKit room (TTL: 30–60 minutes).
■	Create user token (expires in ~10 mins).
■	Send SMS reply: Join support: https://<app>/r/<roomId>?t=<token>
 (Use Plivo Send SMS with your status callbacks enabled for delivery traceability.) Plivo
2.	Customer web client
○	Build a minimal page using LiveKit JS/React quickstart: mic permissions, connection state, mute/unmute, leave. LiveKit docs
○	Show call timer + “connection quality” indicator (LiveKit provides stats events).
3.	Agent console
○	Simple internal page that lists open rooms (your server tracks them).
○	“Join as Agent” button mints an agent token (with a distinct role).
4.	Recording & storage
○	Enable Egress/Composite recording or room-based recording. After the call, store the file URL (or stub) next to the SMS conversation ID for traceability.
5.	Observability
○	Log Plivo inbound SMS payloads + your reply SID.
○	Log LiveKit join/leave, and record room duration.
Must Dos
●	Inbound “HELP” triggers a reply SMS with a working video link within ~30s.
●	Customer and agent can see/hear each other; calls can be recorded.
●	Delivery receipts for the reply SMS are visible in your logs/DB (using callbacks). Plivo
●	A simple call summary object (roomId, participants, duration, recording URL) is persisted.
What you need to submit
1.	Codebase (Flask/FastAPI or NodeJS)
2.	ReadMe with setup instructions
3.	Document all the blockers/roadblocks you’ve encountered and how you overcame them. 
