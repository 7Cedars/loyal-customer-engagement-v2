import { Hex, Log, ReadContractErrorType, getAddress, isHex } from "viem";
import { toHex } from "viem";

// simple checks // 
const isString = (text: unknown): text is string => {
  return typeof text === 'string' || text instanceof String;
};

const isValidUrl = (urlString: string) => {
  try { 
    return Boolean(new URL(urlString)); 
  }
  catch(e){ 
    return false; 
  }
}

const isNumber = (number: unknown): number is number => {
  return typeof number === 'number' || number instanceof Number;
};

const isBigInt = (number: unknown): number is BigInt => {
  return typeof number === 'bigint';
};

const isArray = (array: unknown): array is Array<unknown> => {
  // array.find(item => !isString(item)) 
  return array instanceof Array;
};

const isBoolean = (bool: unknown): bool is boolean => {
  // array.find(item => !isString(item)) 
  return typeof bool === 'boolean' || bool instanceof Boolean;
};

// compound checks // 
export const parseBoolean = (bool: unknown): boolean => {
  if (!isBoolean(bool)) {
    throw new Error(`Incorrect bool, not a boolean: ${bool}`);
  }

  return bool as boolean;
}

export const parseHex = (hex: unknown): Hex => {
  if (!isHex(hex)) {
    throw new Error(`Incorrect hex, not a hex: ${hex}`);
  }
  if (/0x/.test(hex) == false) {
    throw new Error(`Incorrect hex, 0x prefix missing: ${hex}`);
  }
  const hex2 = toHex(hex)

  return hex2 as Hex;
};

export const parseEthAddress = (address: unknown): Hex => {
  if (!isString(address)) {
    throw new Error(`Incorrect address, not a string: ${address}`);
  }
  if (/0x/.test(address) == false) {
    throw new Error(`Incorrect address, 0x prefix missing: ${address}`);
  }
  if (address.length != 42) {
    throw new Error(`Incorrect address length: ${address}`);
  }
  // in case I need stricter check: 
  // const returnAddress = getAddress(address) 
  return address as Hex;
};

export const parseUri = (uri: unknown): string => {
  if (!isString(uri)) {
    throw new Error(`Incorrect uri, not a string: ${uri}`);
  }
  
  if (!isValidUrl(uri)) {
    throw new Error(`Incorrect uri, not a uri: ${uri}`);
  }
  // here can additional checks later. 

  return uri as string;
};
