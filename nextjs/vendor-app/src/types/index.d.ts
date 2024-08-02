export type Program = {
  address?: Hex; 
  name?: string;
  balance?: int;  
  colourBase: string; 
  colourAccent: string; 
  uriImage?: string; 
}

export type GiftProps = {
  imageUri: string; 
  title: string; 
  points: number; 
  description: string; 
  claim?: string; 
  redeem?: string; 
};

export type QrData = undefined | {
  program: Hex; 
  owner: Hex; 
  gift: Hex; 
  giftId: BigInt; 
  uniqueNumber: BigInt; 
  signature?: Hex; 
}