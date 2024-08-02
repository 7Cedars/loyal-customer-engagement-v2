export type Program = {
  address?: Hex; 
  name?: string;
  balance?: int;  
  colourBase: string; 
  colourAccent: string; 
  uriImage?: string; 
}

export type Gift = {
  address: Hex;
  id: Hex;
  imageUri: string; 
  title: string; 
  points: number; 
  description: string; 
  claimReq?: string; 
  redeemReq?: string; 
};

export type QrData = undefined | {
  program: Hex; 
  owner: Hex; 
  gift: Hex; 
  giftId: BigInt; 
  uniqueNumber: BigInt; 
  signature?: Hex; 
}

export type Status = "isIdle" | "isLoading" | "isError" | "isSuccess" 