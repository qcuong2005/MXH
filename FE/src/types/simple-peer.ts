declare module "simple-peer" {
  export interface PeerOptions {
    initiator?: boolean;
    trickle?: boolean;
    stream?: MediaStream;
  }
  export default class Peer {
    constructor(opts?: PeerOptions);
    on(event: "signal", cb: (data: any) => void): void;
    on(event: "stream", cb: (stream: MediaStream) => void): void;
    on(event: "error", cb: (err: any) => void): void;
    signal(data: any): void;
    destroy(): void;
  }
  export type Instance = Peer;
}