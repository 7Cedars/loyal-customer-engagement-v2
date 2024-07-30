import { Hex, Log, ReadContractErrorType, getAddress } from "viem";

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

const parseName = (name: unknown): string => {
  if (!isString(name)) {
    throw new Error(`Incorrect name, not a string: ${name}`);
  }
  // here can additional checks later. 

  return name as string;
};

const parseDescription = (description: unknown): string => {
  if (!isString(description)) {
    throw new Error(`Incorrect description, not a string: ${description}`);
  }
  // here can additional checks later. 

  return description as string;
};
