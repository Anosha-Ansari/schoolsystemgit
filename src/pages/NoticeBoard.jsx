import { useState } from "react";
import { Megaphone, Plus, Calendar } from "lucide-react";
import Banner from "../components/Banner";
import Card from "../components/Card";
import Pill from "../components/Pill";
import { notices } from "../data/sampleData";

const tabs = ["All Notices", "Academic", "General", "Events", "Circulars"];

export default function NoticeBoard() {
  const [tab, setTab] = useState("All Notices");
  return (
    <>
      <Banner title="Notice Board" subtitle="Stay updated with the latest announcements, circulars and important notices from the school administration." tagline={"Stay Informed\nStay Ahead"} />

      <div className="grid grid-cols-[2fr_1fr] gap-4">
        <div>
          <div className="flex items-center justify-between mb-4">
            <div className="flex gap-2">
              {tabs.map((t) => (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  className={`px-3.5 py-2 rounded-lg text-[13px] font-semibold ${tab === t ? "bg-brand-blue text-white" : "bg-card border border-border text-muted"}`}
                >
                  {t}
                </button>
              ))}
            </div>
            <button className="bg-brand-pink text-white text-[13px] font-semibold px-4 py-2 rounded-lg flex items-center gap-1.5 btn-tap hover:brightness-105 transition-all">
              <Plus size={15} /> Post New Notice
            </button>
          </div>

          <div className="flex flex-col gap-3">
            {notices.map((n) => (
              <Card key={n.title}>
                <div className="flex justify-between items-start gap-4">
                  <div className="flex gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-50 text-brand-blue flex items-center justify-center shrink-0">
                      <Megaphone size={17} />
                    </div>
                    <div>
                      <div className="font-semibold text-[14.5px]">{n.title}</div>
                      <p className="text-muted text-[13px] mt-1 max-w-[520px]">{n.body}</p>
                      <div className="flex gap-2 mt-2">
                        {n.tags.map((t) => (
                          <span key={t} className="bg-bg text-muted text-[11px] px-2 py-1 rounded-md">{t}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-muted text-xs flex items-center gap-1 justify-end mb-2"><Calendar size={12} />{n.date}</div>
                    <Pill>{n.priority}</Pill>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <Card title="Important Notices">
            {notices.slice(0, 4).map((n) => (
              <div key={n.title} className="flex justify-between items-center py-2 border-b border-border last:border-none text-[13px]">
                <div><b className="line-clamp-1">{n.title}</b><div className="text-muted text-xs">{n.date}</div></div>
                <Pill>{n.priority}</Pill>
              </div>
            ))}
          </Card>
          <Card title="Notice Statistics">
            <div className="grid grid-cols-2 gap-3 text-[13px]">
              <div className="bg-bg rounded-xl p-3"><div className="text-muted text-[11px]">Total Notices</div><div className="font-heading font-bold text-lg">24</div></div>
              <div className="bg-bg rounded-xl p-3"><div className="text-muted text-[11px]">Active Notices</div><div className="font-heading font-bold text-lg">18</div></div>
              <div className="bg-bg rounded-xl p-3"><div className="text-muted text-[11px]">Events</div><div className="font-heading font-bold text-lg">4</div></div>
              <div className="bg-bg rounded-xl p-3"><div className="text-muted text-[11px]">Circulars</div><div className="font-heading font-bold text-lg">2</div></div>
            </div>
          </Card>
        </div>
      </div>
    </>
  );
}
