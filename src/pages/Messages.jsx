import { useState } from "react";
import { Send, Paperclip, MessageSquare, Users, Star, Phone, Video } from "lucide-react";
import Banner from "../components/Banner";
import Card from "../components/Card";
import { conversations } from "../data/sampleData";

const thread = [
  { me: false, text: "Assalam o Alaikum Ma'am! Can you please tell me when is the next maths test?", time: "09:12 AM" },
  { me: true, text: "Wa Alaikum Assalam. The next maths test is on Friday, 15th August. It will be a short test, 20 marks.", time: "09:15 AM" },
  { me: false, text: "Thank you ma'am! Will there be any homework for this week?", time: "09:18 AM" },
  { me: true, text: "Yes, there will be a worksheet. I'll share it in the class group later today.", time: "09:20 AM" },
  { me: false, text: "Okay ma'am, thank you so much!", time: "09:22 AM" },
  { me: true, text: "You're welcome! Keep it up!", time: "09:24 AM" },
];

export default function Messages() {
  const [active, setActive] = useState(0);
  const [text, setText] = useState("");
  const c = conversations[active];

  return (
    <>
      <Banner title="Messages" subtitle="Stay connected with students, teachers and parents. Send and receive messages easily." tagline={"Better Communication\nStronger School"} />

      <div className="grid grid-cols-4 gap-4 mb-4">
        <Card><div className="text-muted text-[13px] flex items-center gap-2 mb-1"><MessageSquare size={15} />Total Messages</div><div className="font-heading font-bold text-xl">248</div></Card>
        <Card><div className="text-muted text-[13px] flex items-center gap-2 mb-1"><Star size={15} />Unread Messages</div><div className="font-heading font-bold text-xl">5</div></Card>
        <Card><div className="text-muted text-[13px] flex items-center gap-2 mb-1"><Users size={15} />Active Conversations</div><div className="font-heading font-bold text-xl">48</div></Card>
        <Card><div className="text-muted text-[13px] flex items-center gap-2 mb-1"><Star size={15} />Today's Messages</div><div className="font-heading font-bold text-xl">32</div></Card>
      </div>

      <div className="grid grid-cols-[280px_1fr_260px] gap-4 h-[500px]">
        <Card title="Messages" className="overflow-y-auto">
          {conversations.map((cv, i) => (
            <div
              key={cv.name}
              onClick={() => setActive(i)}
              className={`flex gap-2.5 py-2.5 border-b border-border last:border-none cursor-pointer ${i === active ? "bg-blue-50 -mx-2 px-2 rounded-lg" : ""}`}
            >
              <span className="w-9 h-9 rounded-full bg-bg text-brand-blue flex items-center justify-center text-xs font-bold shrink-0">{cv.name[0]}</span>
              <div className="min-w-0 flex-1">
                <div className="flex justify-between text-[13px]"><b className="truncate">{cv.name}</b><span className="text-muted text-[10.5px] shrink-0">{cv.time}</span></div>
                <div className="text-muted text-[11.5px] truncate">{cv.role}</div>
                <div className="text-[11.5px] truncate">{cv.last}</div>
              </div>
              {cv.unread > 0 && <span className="w-4 h-4 bg-brand-red text-white text-[9px] rounded-full flex items-center justify-center shrink-0">{cv.unread}</span>}
            </div>
          ))}
        </Card>

        <div className="bg-card border border-border rounded-xl2 flex flex-col">
          <div className="flex items-center justify-between p-4 border-b border-border">
            <div className="flex items-center gap-2.5">
              <span className="w-9 h-9 rounded-full bg-bg text-brand-blue flex items-center justify-center text-xs font-bold">{c.name[0]}</span>
              <div><div className="font-semibold text-[13.5px]">{c.name}</div><div className="text-muted text-[11.5px]">{c.role}</div></div>
            </div>
            <div className="flex gap-3 text-muted"><Phone size={16} /><Video size={16} /></div>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {thread.map((m, i) => (
              <div key={i} className={`flex ${m.me ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[70%] px-3.5 py-2 rounded-2xl text-[13px] ${m.me ? "bg-brand-blue text-white" : "bg-bg text-ink"}`}>
                  {m.text}
                  <div className={`text-[10px] mt-1 ${m.me ? "text-blue-100" : "text-muted"}`}>{m.time}</div>
                </div>
              </div>
            ))}
          </div>
          <div className="p-3 border-t border-border flex items-center gap-2">
            <Paperclip size={17} className="text-muted" />
            <input
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Type a message…"
              className="flex-1 bg-bg rounded-full px-4 py-2 text-[13px] outline-none"
            />
            <button onClick={() => setText("")} className="w-9 h-9 bg-brand-blue rounded-full flex items-center justify-center text-white"><Send size={15} /></button>
          </div>
        </div>

        <Card title="Contact Info" className="overflow-y-auto">
          <div className="text-center mb-3">
            <span className="w-14 h-14 rounded-full bg-bg text-brand-blue flex items-center justify-center text-lg font-bold mx-auto mb-2">{c.name[0]}</span>
            <div className="font-semibold text-[14px]">{c.name}</div>
            <div className="text-muted text-[12px]">{c.role}</div>
          </div>
          <button className="w-full bg-brand-blue text-white text-[12.5px] font-semibold py-2 rounded-lg">Send Message</button>
        </Card>
      </div>
    </>
  );
}
