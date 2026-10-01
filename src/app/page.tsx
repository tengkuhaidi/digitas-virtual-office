'use client';

import React, { useState } from 'react';
import OfficeCanvas from '@/components/OfficeCanvas';
import { AGENTS, AgentData } from '@/data/agents';
import { 
  Building2, 
  Terminal, 
  ShieldCheck, 
  Activity, 
  Sparkles, 
  X, 
  ArrowRight,
  ExternalLink,
  Cpu,
  TrendingUp,
  FileText,
  MessageSquare
} from 'lucide-react';

export default function Home() {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const activeAgent: AgentData | null = selectedId ? AGENTS[selectedId] : null;

  return (
    <main className="relative w-screen h-screen overflow-hidden bg-[#090a10]">
      {/* 3D CANVAS VIEWPORT */}
      <div className="absolute inset-0 z-0">
        <OfficeCanvas selectedAgentId={selectedId} onSelectAgent={setSelectedId} />
      </div>

      {/* TOP FLOATING NAVIGATION & STATUS HEADER */}
      <header className="absolute top-0 left-0 right-0 z-10 p-4 sm:p-6 flex items-center justify-between pointer-events-none">
        <div className="flex items-center gap-3 pointer-events-auto">
          <div className="w-10 h-10 rounded-xl bg-[#131622]/90 backdrop-blur-md border border-[#23293d] flex items-center justify-center text-amber-500 shadow-lg">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-sm font-semibold tracking-wide text-white uppercase font-mono">
                Digitas &amp; Legalizin
              </h1>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                LIVE OFFICE
              </span>
            </div>
            <p className="text-[11px] text-neutral-400 font-mono">
              Autonomous Operations Room &amp; Agent Pods
            </p>
          </div>
        </div>

        {/* TOP RIGHT TELEMETRY */}
        <div className="hidden sm:flex items-center gap-2 pointer-events-auto bg-[#131622]/80 backdrop-blur-md border border-[#23293d] px-3.5 py-2 rounded-xl text-xs font-mono text-neutral-300">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>4 Agents Operating</span>
          <span className="text-neutral-600">|</span>
          <span className="text-neutral-400">99.98% SLA</span>
        </div>
      </header>

      {/* BOTTOM AGENT QUICK-SELECT BAR */}
      <nav className="absolute bottom-5 left-1/2 -translate-x-1/2 z-10 flex items-center gap-2 p-1.5 rounded-2xl bg-[#131622]/90 backdrop-blur-md border border-[#23293d] shadow-2xl max-w-[92vw] overflow-x-auto">
        <button
          onClick={() => setSelectedId(null)}
          className={`px-3 py-2 rounded-xl text-xs font-mono transition-all shrink-0 ${
            selectedId === null
              ? 'bg-neutral-800 text-white shadow-sm'
              : 'text-neutral-400 hover:text-white'
          }`}
        >
          Overview [0]
        </button>

        {Object.values(AGENTS).map((ag) => {
          const isSelected = selectedId === ag.id;
          return (
            <button
              key={ag.id}
              onClick={() => setSelectedId(ag.id)}
              className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-mono transition-all shrink-0 ${
                isSelected
                  ? 'bg-white/10 text-white border border-white/20 shadow-sm'
                  : 'text-neutral-300 hover:text-white hover:bg-white/5'
              }`}
            >
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: ag.color }} />
              <span>{ag.name.split(' ')[0]}</span>
            </button>
          );
        })}
      </nav>

      {/* SELECTED AGENT DETAIL MODAL / DRAWER */}
      {activeAgent && (
        <aside className="absolute top-4 bottom-20 right-4 w-full sm:w-[420px] z-20 rounded-2xl bg-[#0f121d]/95 backdrop-blur-xl border border-[#283049] shadow-2xl p-6 flex flex-col justify-between overflow-y-auto animate-in slide-in-from-right duration-300">
          <div>
            {/* Header with Close */}
            <div className="flex items-start justify-between pb-4 border-b border-[#23293d] mb-5">
              <div className="flex items-center gap-3">
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-md"
                  style={{ backgroundColor: activeAgent.color }}
                >
                  {activeAgent.name.charAt(0)}
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white leading-tight">
                    {activeAgent.name}
                  </h2>
                  <p className="text-xs font-mono text-neutral-400">
                    {activeAgent.role}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedId(null)}
                className="w-8 h-8 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-400 hover:text-white flex items-center justify-center transition-colors"
                aria-label="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Live Operational State Tag */}
            <div className="mb-5 p-3 rounded-xl bg-[#171b2b] border border-[#283049]">
              <div className="text-[10px] uppercase font-mono tracking-wider text-neutral-400 mb-1 flex items-center gap-1.5">
                <Activity className="w-3 h-3 text-emerald-400 animate-spin" />
                Live Status
              </div>
              <p className="text-xs font-medium text-emerald-300">
                {activeAgent.status}
              </p>
            </div>

            {/* Location & Background */}
            <div className="space-y-4 mb-6 text-xs text-neutral-300 leading-relaxed">
              <div>
                <span className="font-mono text-neutral-500 uppercase text-[10px] block mb-1">
                  Assigned Station
                </span>
                <p className="font-medium text-neutral-200">{activeAgent.location}</p>
              </div>

              <div>
                <span className="font-mono text-neutral-500 uppercase text-[10px] block mb-1">
                  Primary Duty
                </span>
                <p className="text-neutral-300">{activeAgent.duty}</p>
              </div>

              <div>
                <span className="font-mono text-neutral-500 uppercase text-[10px] block mb-1">
                  Background &amp; Pedigree
                </span>
                <p className="text-neutral-400">{activeAgent.background}</p>
              </div>
            </div>

            {/* Latest Real Output */}
            <div className="p-4 rounded-xl bg-[#131622] border border-[#23293d]">
              <div className="flex items-center justify-between text-[11px] font-mono text-neutral-400 mb-2">
                <span className="flex items-center gap-1.5 text-white font-medium">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  Latest Work Artifact
                </span>
                <span>{activeAgent.latestOutput.timestamp}</span>
              </div>
              <h3 className="text-xs font-bold text-neutral-200 mb-1">
                {activeAgent.latestOutput.title}
              </h3>
              <p className="text-[11px] text-neutral-400 mb-3 leading-snug">
                {activeAgent.latestOutput.summary}
              </p>

              {activeAgent.latestOutput.metrics && (
                <div className="grid grid-cols-3 gap-2 pt-2 border-t border-[#23293d]">
                  {activeAgent.latestOutput.metrics.map((m, idx) => (
                    <div key={idx} className="text-center">
                      <div className="text-[10px] font-mono text-neutral-500">{m.label}</div>
                      <div className="text-xs font-bold text-white mt-0.5">{m.val}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Footer Reset Camera */}
          <div className="pt-4 border-t border-[#23293d] mt-4 flex items-center justify-between">
            <span className="text-[11px] font-mono text-neutral-500">
              Interactive 3D Workspace
            </span>
            <button
              onClick={() => setSelectedId(null)}
              className="px-3.5 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-xs text-white font-mono flex items-center gap-1.5 transition-colors"
            >
              <span>Reset Cam</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </aside>
      )}
    </main>
  );
}
