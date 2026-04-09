export interface RxNavRelatedGroup {
  rxcui: string;
  tty: string;
  name: string;
}

export interface RxNavRelatedResponse {
  relatedGroup?: {
    conceptGroup?: {
      tty: string;
      conceptProperties?: {
        rxcui: string;
        name: string;
        tty: string;
      }[];
    }[];
  };
}
