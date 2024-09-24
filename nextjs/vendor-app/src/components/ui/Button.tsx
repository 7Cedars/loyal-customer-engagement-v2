import { useAppSelector } from "@/redux/hooks";

type ButtonProps = {
  disabled?: boolean;
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
  disabled = false, 
  selected = false, 
  size = 1, 
  onClick,
  children,
}: ButtonProps) => {
  const {selectedProgram} = useAppSelector(state => state.selectedProgram)

  return (
    <button 
      className={`w-full h-full grid grid-cols-1 disabled:opacity-50 text-center border content-center rounded-lg ${fontSize[size]}`} 
      style = {
        selected ? 
        {color: selectedProgram.colourBase, borderColor: selectedProgram.colourBase, backgroundColor: selectedProgram.colourAccent}
        :
        {color: selectedProgram.colourAccent, borderColor: selectedProgram.colourAccent}
      } // can add background, but should not be necessary.  
      onClick={onClick} 
      disabled={disabled}
      >
      {children}
    </button>
  );
};
