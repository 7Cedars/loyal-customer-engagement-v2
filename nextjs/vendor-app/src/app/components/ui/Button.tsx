// I am using this as an example for now to create modular range slider (and modal). 
// Taken from react-graph-gallery github repo.  

type ButtonProps = {
  disabled?: boolean;
  customColours?: string; 
  children: any;
  onClick?: () => void;
};

export const Button = ({
  disabled = false, 
  customColours = `bg-slate-100 text-slate-900 border-slate-900`, 
  onClick,
  children,
}: ButtonProps) => {

  return (
    <button 
      className={`w-full h-full grid grid-cols-1 text-md text-center border content-center rounded-lg p-2 h-12` + customColours}  
      onClick={onClick} 
      disabled={disabled}
      >
      {children}
    </button>
  );
};
