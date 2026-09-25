import { Sparkles } from "lucide-react";
import { SCHOOL_BUILDING_PHOTO } from "../data/images";

export default function Banner({ title, subtitle, tagline }) {
  return (
    <div className="relative overflow-hidden rounded-xl2 text-white mb-5 min-h-[150px]">
      <img
        src={SCHOOL_BUILDING_PHOTO}
        alt="School campus"
        className="absolute inset-0 w-full h-full object-cover"
        loading="lazy"
      />
      <div className="absolute inset-0 bg-gradient-to-r from-[#0c1a45ee] via-[#173f9bd9] to-[#2F6FED66]" />
      <div className="relative z-[1] px-7 py-6 flex items-center justify-between h-full">
        <div className="max-w-[60%]">
          <h1 className="font-heading text-xl font-bold mb-1 flex items-center gap-2">
            Good Morning, Admin! <Sparkles size={18} className="text-yellow-300" />
          </h1>
          <h2 className="font-heading text-2xl font-extrabold mb-1">{title}</h2>
          <p className="opacity-90 text-[13.5px]">{subtitle}</p>
        </div>
      </div>
      {tagline && (
        <div className="hidden lg:block absolute right-6 top-4 font-heading italic text-white/85 text-sm leading-tight text-right z-[1]">
          {tagline.split("\n").map((l, i) => (
            <div key={i}>{l}</div>
          ))}
        </div>
      )}
    </div>
  );
}
