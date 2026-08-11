import React from 'react';
import { Lightbulb, HeartHandshake, ShieldAlert, Sparkles } from 'lucide-react';

interface AdviceBannerProps {
  progressPct: number;
  guests: number;
}

export const AdviceBanner: React.FC<AdviceBannerProps> = ({ progressPct, guests }) => {
  return (
    <div className="bg-gradient-to-r from-rose-500 via-pink-600 to-rose-700 rounded-3xl p-6 text-white shadow-md relative overflow-hidden">
      
      {/* Background Decorative Heart Shapes */}
      <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-white/10 rounded-full blur-2xl pointer-events-none" />
      <div className="absolute left-1/2 -top-12 w-32 h-32 bg-rose-300/20 rounded-full blur-xl pointer-events-none" />

      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
        
        <div className="space-y-1.5 max-w-2xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-xs font-bold text-rose-100">
            <Sparkles className="w-3.5 h-3.5 text-amber-200" /> Dica de Ouro dos Noivos
          </div>
          <h2 className="text-lg font-bold font-serif tracking-tight">
            Mantenham a lista em até {guests} convidados e controlem a alimentação
          </h2>
          <p className="text-xs text-rose-100/90 leading-relaxed">
            Alimentação e bebida representam entre 40% a 60% do custo total do casamento.
            Manter a lista enxuta permite oferecer uma experiência inesquecível sem estourar o orçamento!
          </p>
        </div>

        <div className="bg-white/10 backdrop-blur-md border border-white/20 p-4 rounded-2xl text-xs space-y-1 sm:min-w-[240px]">
          <div className="flex items-center gap-1.5 font-bold text-amber-200">
            <Lightbulb className="w-4 h-4" /> Dica de Negociação
          </div>
          <p className="text-rose-100 text-[11px] leading-snug">
            Sempre peçam desconto para pagamento à vista com o valor acumulado do cofrinho ou parcelamento direto com o fornecedor sem juros.
          </p>
        </div>

      </div>
    </div>
  );
};
