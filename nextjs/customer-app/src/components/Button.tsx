import { useAppSelector } from "@/redux/hooks";
import { TwoSeventyRingWithBg } from "react-svg-spinners";

type ButtonProps = {
  statusButton: 'pending' | 'success' | 'error' | 'disabled' | 'idle';
  selected?: boolean;
  size?: 0 | 1 | 2;   
  children: any;
  onClick?: () => void;
};

const fontSize = [
  "text-sm p-1 h-6",
  "text-md p-2 h-12", 
  "text-lg p-3 h-16", 
]

export const Button = ({
  statusButton = 'idle', 
  selected = false, 
  size = 1, 
  onClick,
  children,
}: ButtonProps) => {
  const {vendorProgram} = useAppSelector(state => state.vendorProgram)

  return (
    <button 
      className={`w-full h-full grid grid-cols-1 disabled:opacity-50 text-center border content-center rounded-lg ${fontSize[size]}`} 
      style = {
        selected ? 
        {color: vendorProgram.colourBase, borderColor: vendorProgram.colourBase, backgroundColor: vendorProgram.colourAccent}
        :
        {color: vendorProgram.colourAccent, borderColor: vendorProgram.colourAccent}
      } // can add background, but should not be necessary.  
      onClick={onClick} 
      disabled={statusButton != 'idle'}
      >
        <div className="flex flex-row justify-center items-center gap-1 w-full h-full">
        {
          statusButton == 'pending' ?  
          <>
          {/* adapted from https://github.com/n3r4zzurr0/svg-spinners/blob/main/svg-smil/180-ring-with-bg.svg?short_path=0bedbc1 */}
          <div> 
            <TwoSeventyRingWithBg color={vendorProgram.colourAccent}/>
            </div>
            <div>
              Loading...
              </div>
            </>
          : 
          statusButton == 'success' ? 
            <>
            Success! 
            </>
          :
          statusButton == 'error' ? 
            <>
            Error 
            </>
          :
          <>
          {children}
          </>
        }
      </div>
    </button>
  );
};
