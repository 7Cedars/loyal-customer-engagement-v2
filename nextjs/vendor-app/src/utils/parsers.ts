import { Attribute, Metadata, QrData } from "@/types";
import { Hex, Log, ReadContractErrorType, getAddress, isHex } from "viem";
import { toHex } from "viem";
import { Event } from "@/types";

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

export const parseString = (string: unknown): string => {
  if (!isString(string)) {
    throw new Error(`Incorrect string, not a string: ${string}`);
  } 

  return string as string;
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

export const parseSignature = (signature: unknown): Hex => {
  if (!isString(signature)) {
    throw new Error(`Incorrect signature, not a string: ${signature}`);
  }
  if (/0x/.test(signature) == false) {
    throw new Error(`Incorrect signature, 0x prefix missing: ${signature}`);
  }

  return signature as Hex;
};

export const parseNumber = (number: unknown): number => {
  if (!isNumber(number)) {
    throw new Error(`Incorrect number, not a number: ${number}`);
  }
  // here can additional checks later. 

  return number as number;
};

export const parseBigInt = (number: unknown): bigint => {
  if (!isBigInt(number) || isNumber(number) ) {
    throw new Error(`Incorrect number, not a bigInt or number: ${number}`);
  }
  // here can additional checks later. 

  return number as bigint;
};

export const parseBigIntToNumber = (bigint: unknown): number => {
  if (!isBigInt(bigint)) {
    throw new Error(`Incorrect number, not a bigInt: ${bigint}`);
  }
  const number = Number(bigint); 
  return number as number;
};


const parseDescription = (description: unknown): string => {
  if (!isString(description)) {
    throw new Error(`Incorrect description, not a string: ${description}`);
  }
  // here can additional checks later. For instance length, characters, etc. 
  return description as string;
};

const parseTraitType = (description: unknown): string => {
  if (!isString(description)) {
    throw new Error(`Incorrect trait type, not a string: ${description}`);
  }
  // here can additional checks later. 

  return description as string;
};

const parseTraitValue = (traitValue: unknown): string | number => {
  if (!isString(traitValue) && !isNumber(traitValue)) {
    throw new Error(`Incorrect trait value, not a string or number or boolean: ${traitValue}`);
  }
  // here can additional checks later. 
  if (isString(traitValue)) return traitValue as string;
  return traitValue as number;
};

export const parseAttributes = (attributes: unknown): Attribute[]  => {
  if (!isArray(attributes)) {
    throw new Error(`Incorrect attributes, not an array: ${attributes}`);
  }

  try { 
    const parsedAttributes = attributes.map((attribute: unknown) => {
      if ( !attribute || typeof attribute !== 'object' ) {
        throw new Error('Incorrect or missing data at attribute');
      }

      if (
        'trait_type' in attribute &&
        'value' in attribute
        ) { return ({
            trait_type: parseTraitType(attribute.trait_type),
            value: parseTraitValue(attribute.value)
          })
        }
        throw new Error('Incorrect data at Metadata: some fields are missing or incorrect');
    })

    return parsedAttributes as Attribute[] 

  } catch {
    throw new Error('Incorrect data at Metadata: Parser caught error');
  }
};

export const parseQrData = (qrText: unknown): QrData => {
  if ( !qrText || typeof qrText !== 'string' ) {
    throw new Error('Incorrect or missing data');
  }

  if (
    qrText.includes(';')
      ) { 
        try {
          const data = qrText.split(";")
            return {
              program: parseEthAddress(data[1]), 
              owner: parseEthAddress(data[2]), // = owner loyalty card
              gift: parseEthAddress(data[3]), 
              giftId: BigInt(data[4]), 
              uniqueNumber: BigInt(data[5]), 
              signature: parseSignature(data[6])
              }
        } catch (error) {
          throw new Error(`parseQrData caught error: ${error}`);
        }
      }
  };

export const parseMetadata = (metadata: unknown): Metadata => {
  if ( !metadata || typeof metadata !== 'object' ) {
    throw new Error('Incorrect or missing data');
  }

  if ( 
    'description' in metadata &&     
    'image' in metadata &&
    'attributes' in metadata 
    ) { 
        return ({
          description: parseDescription(metadata.description),
          imageUri: parseUri(metadata.image),
          attributes: parseAttributes(metadata.attributes)
        })
       }
      
       throw new Error('Incorrect data at program Metadata: some fields are missing or incorrect');
};

export const parseEventLogs = (logs: Log[]): Event[] => {
  if (!isArray(logs)) {
    throw new Error(`Incorrect transaction logs, not an array: ${logs}`);
  }

  try { 
    const parsedLogs = logs.map((log: unknown) => {
      if ( !log || typeof log !== 'object' ) {
        throw new Error('Incorrect or missing data at event log');
      }

      if ( 
        'address' in log && 
        'logIndex' in log && 
        'blockNumber' in log &&
        'args' in log
        ) {
        return ({
          address: parseEthAddress(log.address),
          blockNumber: parseBigInt(log.blockNumber),
          logIndex: parseNumber(log.logIndex),
          // ...parseArgsTransferSingle(log.args) 
        }) 
      } 
        throw new Error('Incorrect data at transaction logs: some fields are missing or incorrect');
    })

    return parsedLogs as Array<Event> 

  } catch {
    throw new Error('Incorrect data at transaction logs. Parser caught error');
  }
};