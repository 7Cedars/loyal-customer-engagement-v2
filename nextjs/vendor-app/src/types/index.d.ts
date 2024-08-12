import { Hex } from "viem";

export type Program = {
  address: Hex; 
  name: string;
  balance?: int;  
  colourBase: string; 
  colourAccent: string; 
  uriImage?: string;
  owner?: Hex; 
}

export type Gift = {
  address: Hex;
  name: string; 
  symbol: string; 
  points: number; 
  uri: string;
  additionalReq: boolean; 
  metadata?: Metadata; 
};

export type QrData = undefined | {
  program: Hex; 
  owner: Hex; 
  gift: Hex; 
  giftId: BigInt; 
  uniqueNumber: BigInt; 
  signature?: Hex; 
}

// NB 0 = claim req
// 1 = redeem req 
export type Attribute = {  
  trait_type: string | number ;  
  value: string;
}

export type Metadata = { 
  description: string; 
  imageUri: string;
  attributes: Attribute[]
}

export type Event = {
  address: EthAddress;
  blockNumber: BigInt;
  logIndex: number; 
  args?: any; // this has to be fixed later. 
  event?:
    GiftListed | 
    PointsExchanged | 
    GiftRedeemed | 
    CardBlocked | 
    CreationCardsAllowed | 
    GiftsMinted | 
    ColourSchemeChanged |
    ImageUriChanged;
  blockData?: Any
}

type GiftListed = {

}

type PointsExchanged = {
  
}

type GiftRedeemed = {
  
}

type CardBlocked = {
  
}

type CreationCardsAllowed = {
  
}

type GiftsMinted = {
  
}

type ColourSchemeChanged = {
  
}

type ImageUriChanged = {
  
}

export type Status = "isIdle" | "isLoading" | "isError" | "isSuccess" 