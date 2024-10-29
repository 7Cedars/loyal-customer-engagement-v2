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
  align?: 0 | 1 | 2;
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

const alignText = [
  "text-start",
  "text-center",
  "text-end"
]

export const TitleText = ({
  title, 
  subtitle, 
  size = 1
}: TitleTextProps) => {
  const {vendorProgram} = useAppSelector(state => state.vendorProgram)

  return (
    <div className="grid grid-cols-1 px-2">
      <div className={`text-center font-bold break-words ${appearanceTitle[size]}`} style = {{color: `${vendorProgram.colourAccent}`}}>
        {title}
      </div>
      <div className={`text-center text-slate-400 break-words ${appearanceSubtitle[size]}` } style = {{color: `${vendorProgram.colourAccent}`}}>
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
  const {vendorProgram} = useAppSelector(state => state.vendorProgram)

  return (
    <div className="grid grid-cols-1 px-2">
      <div className={`text-start font-bold break-words select-all ${appearanceTitle[size]}`} style = {{color: `${vendorProgram.colourAccent}`}}>
        {text}
      </div>
      <div className={`text-start text-slate-400 break-words select-all ${appearanceSubtitle[size]}` } style = {{color: `${vendorProgram.colourAccent}`}}>
        {subtext}
      </div>
    </div>
  );
};

export const NoteText = ({
  message, 
  size = 1,
  align = 0
}: NoteTextProps) => {
  const {vendorProgram} = useAppSelector(state => state.vendorProgram)

  return (
    <div className={`grid grid-cols-1 px-2 gap-1 break-words text-gray-500 font-sm`}>
      <div className={`${alignText[align]} italic select-all ${appearanceNote[size]}`} style = {{color: `${vendorProgram.colourAccent}`}}>
        {message}
      </div>
    </div>
  );
};