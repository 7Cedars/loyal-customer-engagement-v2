import { Hex, toHex, toBytes, hexToBytes } from "viem"

export const fromHexColourToBytes = (hexColour: string) => {
  const onlyNumbers: string = hexColour.slice(1)
  console.log("onlyNumbers: ", onlyNumbers)
  const hex = toHex(onlyNumbers)
  console.log("hex: ", hex)
  const bytes = toBytes(hex)
  console.log("bytes:", bytes)

  return bytes 
}