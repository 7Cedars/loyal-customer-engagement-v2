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
      style = {{color: selectedProgram.colourAccent, borderColor: selectedProgram.colourAccent, backgroundColor: selectedProgram.colourBase}} // can add background, but should not be necessary.  
      onClick={onClick} 
      disabled={disabled}
      >
      {children}
    </button>
  );
};
