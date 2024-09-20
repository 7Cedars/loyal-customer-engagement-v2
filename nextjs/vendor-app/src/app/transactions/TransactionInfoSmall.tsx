import { useAppSelector } from "@/redux/hooks";
// import { GiftInfoProps } from "@/types";
import { Url } from "next/dist/shared/lib/router/router";
import Image from "next/image";

// export const TransactionInfo = ({
//   disabled = false,
//   imageUri, 
//   title,
//   points,
//   claim = "",
//   redeem = "", 
//   onClick 
// }: GiftInfoProps) => {
//   const {selectedProgram} = useAppSelector(state => state.selectedProgram)

//   return (
//     <div 
//       className={`w-full h-fit flex flex-row items-center p-2`} 
//       style = {{color: selectedProgram.colourAccent, borderColor: selectedProgram.colourAccent}} // can add background, but should not be necessary.   
//       >
//       <Image
//         className="w-fit h-fit rounded-lg p-2"
//         width={90}
//         height={90}
//         style = {{ objectFit: "fill" }} 
//         src={imageUri} 
//         alt="No valid image detected."
//       />
//       <section className="grow flex flex-col p-1">
//           <a className="text-md font-bold">
//             {title}
//           </a>
//           <a className="text-md">
//             {points} points
//           </a>
//           <a className="text-md">
//             Claim: {claim}
//           </a>
//           <a className="text-md">
//             Redeem: {redeem}
//           </a>
        
//       </section>
//     </div>
//   );
// };
