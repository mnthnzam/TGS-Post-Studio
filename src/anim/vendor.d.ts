// Ambient shims so the project typechecks before `npm install mp4-muxer gifenc`.
// Once the real packages are installed, their own types take over.
declare module 'mp4-muxer';
declare module 'gifenc';
