// I am using this as an example for now to create modular range slider (and modal). 
// Taken from react-graph-gallery github repo.  

import { useAppSelector } from "@/redux/hooks";

type ButtonProps = {
  disabled?: boolean;
  children: any;
  onClick?: () => void;
};

export const Button = ({
  disabled = false, 
  onClick,
  children,
}: ButtonProps) => {
  const {selectedProgram} = useAppSelector(state => state.selectedProgram)

  return (
    <button 
      className={`w-full h-full grid grid-cols-1 disabled:opacity-50 text-md text-center border content-center rounded-lg p-2 h-12`} 
      style = {{color: selectedProgram.colourAccent, borderColor: selectedProgram.colourAccent}} // can add background, but should not be necessary.  
      onClick={onClick} 
      disabled={disabled}
      >
      {children}
    </button>
  );
};
