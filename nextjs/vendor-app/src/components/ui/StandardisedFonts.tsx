import { useAppSelector } from "@/redux/hooks";

type TitleTextProps = {
  title: string; 
  subtitle?: string;
  size?: 0 | 1 | 2;
}

type SectionTextProps = {
  text: string; 
  subtext?: string;
  size?: 0 | 1 | 2;
}

type NoteTextProps = {
  message: string; 
  size?: 0 | 1 | 2;
}

const appearanceTitle = [
  "text-sm py-0",
  "text-lg py-0",
  "text-2xl py-1"
]

const appearanceSubtitle = [
  "text-xs",
  "text-md",
  "text-lg"
]

const appearanceNote = [
  "text-xs",
  "text-md",
  "text-lg"
]

export const TitleText = ({
  title, 
  subtitle, 
  size = 1
}: TitleTextProps) => {
  const {selectedProgram} = useAppSelector(state => state.selectedProgram)

  return (
    <div className="grid grid-cols-1 px-2">
      <div className={`text-center font-bold ${appearanceTitle[size]}`} style = {{color: `${selectedProgram.colourAccent}`}}>
        {title}
      </div>
      <div className={`text-center text-slate-400 ${appearanceSubtitle[size]}` } style = {{color: `${selectedProgram.colourAccent}`}}>
        {subtitle}
      </div>
    </div>
  );
};

export const SectionText = ({
  text, 
  subtext, 
  size = 1
}: SectionTextProps) => {
  const {selectedProgram} = useAppSelector(state => state.selectedProgram)

  return (
    <div className="grid grid-cols-1 px-2">
      <div className={`text-start font-bold ${appearanceTitle[size]}`} style = {{color: `${selectedProgram.colourAccent}`}}>
        {text}
      </div>
      <div className={`text-start text-slate-400 ${appearanceSubtitle[size]}` } style = {{color: `${selectedProgram.colourAccent}`}}>
        {subtext}
      </div>
    </div>
  );
};

export const NoteText = ({
  message, 
  size = 1,
}: NoteTextProps) => {
  const {selectedProgram} = useAppSelector(state => state.selectedProgram)

  return (
    <div className="grid grid-cols-1 gap-1 text-center text-gray-500 font-sm">
      <div className={`text-center italic ${appearanceNote[size]}`} style = {{color: `${selectedProgram.colourAccent}`}}>
        {message}
      </div>
    </div>
  );
};