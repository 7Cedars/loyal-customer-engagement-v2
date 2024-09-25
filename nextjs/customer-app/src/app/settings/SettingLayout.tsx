import { TitleText } from "@/components/StandardisedFonts";
import { useAppSelector } from "@/redux/hooks";

type ButtonProps = {
  selected: boolean; 
  titleText: string; 
  sizeFoldout?: 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7
  children: any;
  onClick?: () => void;
};

const heights = [
  "aria-selected:h-32",
  "aria-selected:h-40",
  "aria-selected:h-52",
  "aria-selected:h-64",
  "aria-selected:h-80",
  "aria-selected:h-96",
  "aria-selected:h-[32rem]",
  "aria-selected:h-[42rem]"
]

export const SettingLayout = ({
  titleText, 
  selected = false, 
  sizeFoldout = 0, 
  onClick,
  children,
}: ButtonProps) => {
  const {selectedProgram} = useAppSelector(state => state.selectedProgram)

  return (
    <div 
      className="w-full grid grid-cols-1 justify-items-start content-start h-fit pt-1 border-b" 
      style = {{color: selectedProgram.colourAccent, borderColor: selectedProgram.colourAccent}} // can add background, but should not be necessary.   
      aria-selected = {selected}
      >
      <button 
        className={`z-10 w-full h-fit flex flex-row justify-start pt-2`} 
        onClick={onClick}
        >
        <TitleText size={1} title={""} subtitle={titleText} /> 
      </button>

      {/* NB transitions do not work with variable height props. (such as h-fit; h-min; etc.)   */}
      <div 
        className={`z-1 w-full flex flex-row justify-start ps-3 p-2 md:px-8 p-1 h-1 opacity-0 aria-selected:opacity-100 ${heights[sizeFoldout]} ease-in-out duration-300 delay-300`}
        aria-selected = {selected}
        > 
      
          {children}
       
      </div> 
    </div>
  );
};
