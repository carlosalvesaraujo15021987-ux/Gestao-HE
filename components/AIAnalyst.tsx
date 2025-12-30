
import React, { useState, useRef } from 'react';
import { Sparkles, Send, BrainCircuit, ShieldAlert, Zap, Loader2, Image as ImageIcon, Upload, Wand2, X, RefreshCw } from 'lucide-react';
import { getAIAnalysis, editLogisticsImage } from '../services/geminiService';
import { LogisticsEntry } from '../types';

interface AIAnalystProps {
  data: LogisticsEntry[];
}

const AIAnalyst: React.FC<AIAnalystProps> = ({ data }) => {
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [imageLoading, setImageLoading] = useState(false);
  
  // Image Editing States
  const [sourceImage, setSourceImage] = useState<string | null>(null);
  const [editPrompt, setEditPrompt] = useState("");
  const [editedImage, setEditedImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleGenerateAnalysis = async () => {
    setLoading(true);
    try {
      const result = await getAIAnalysis(data);
      setAnalysis(result || "Nenhuma análise gerada.");
    } catch (e) {
      setAnalysis("Erro ao conectar com a IA. Verifique sua chave API.");
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setSourceImage(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleImageEdit = async () => {
    if (!sourceImage || !editPrompt) return;
    setImageLoading(true);
    try {
      const result = await editLogisticsImage(sourceImage, editPrompt);
      setEditedImage(result);
    } catch (e) {
      alert("Erro ao editar imagem. Verifique o prompt e tente novamente.");
    } finally {
      setImageLoading(false);
    }
  };

  const resetImageLab = () => {
    setSourceImage(null);
    setEditedImage(null);
    setEditPrompt("");
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-700 pb-20">
      {/* Executive Analysis Header */}
      <div className="bg-gradient-to-br from-blue-700 via-indigo-800 to-indigo-950 rounded-[2.5rem] p-10 text-white shadow-2xl relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/20 rounded-full -mr-20 -mt-20 blur-3xl group-hover:bg-blue-400/30 transition-all duration-700" />
        <div className="relative z-10 flex flex-col md:flex-row items-center gap-12">
          <div className="flex-1 space-y-6">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-[0.2em] border border-white/10">
              <Sparkles size={14} className="text-yellow-400" />
              Intelligence Core
            </div>
            <h2 className="text-4xl font-black tracking-tight leading-tight">Gestão Preditiva com Gemini IA</h2>
            <p className="text-blue-100/80 text-lg font-medium leading-relaxed">
              Analise padrões complexos de horas extras e receba recomendações estratégicas baseadas nos dados reais da sua frota.
            </p>
            <div className="flex flex-wrap gap-4 pt-4">
              <button 
                onClick={handleGenerateAnalysis}
                disabled={loading}
                className="bg-white text-indigo-900 px-8 py-4 rounded-2xl font-black flex items-center gap-3 hover:bg-blue-50 transition-all shadow-xl shadow-indigo-950/20 active:scale-95 disabled:opacity-50"
              >
                {loading ? <Loader2 className="animate-spin" size={20} /> : <Zap size={20} className="fill-current" />}
                GERAR RELATÓRIO EXECUTIVO
              </button>
            </div>
          </div>
          <div className="hidden md:block">
            <div className="relative">
              <div className="w-56 h-56 bg-white/5 backdrop-blur-3xl rounded-full flex items-center justify-center border border-white/10 shadow-inner">
                <BrainCircuit size={100} className="text-white/20 animate-pulse" />
              </div>
              <div className="absolute -top-4 -right-4 bg-yellow-400 text-yellow-950 p-4 rounded-3xl shadow-xl animate-bounce">
                <Zap size={28} fill="currentColor" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {analysis && (
        <div className="bg-white p-10 rounded-[2.5rem] shadow-sm border border-slate-100 space-y-8 animate-in slide-in-from-bottom-6 duration-700">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl"><ShieldAlert size={28} /></div>
            <div>
              <h3 className="text-2xl font-black text-slate-800 tracking-tight">Parecer do Consultor IA</h3>
              <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-0.5">Relatório gerado em tempo real</p>
            </div>
          </div>
          <div className="prose prose-slate max-w-none">
            <div className="whitespace-pre-wrap text-slate-600 leading-relaxed text-lg bg-slate-50/50 p-8 rounded-3xl border border-slate-100 font-medium">
              {analysis}
            </div>
          </div>
        </div>
      )}

      {/* Image Lab - Powered by Gemini 2.5 Flash Image */}
      <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-8 border-b border-slate-50 bg-slate-50/30 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl"><ImageIcon size={24} /></div>
            <div>
              <h3 className="text-2xl font-black text-slate-800 tracking-tight">Image Lab <span className="text-indigo-500 font-medium ml-2 text-sm bg-indigo-50 px-2 py-0.5 rounded-md">PROMPT EDIT</span></h3>
              <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Edição de fotos operacionais via comandos de voz/texto</p>
            </div>
          </div>
          {(sourceImage || editedImage) && (
            <button onClick={resetImageLab} className="text-slate-400 hover:text-red-500 flex items-center gap-2 text-xs font-bold transition-colors">
              <RefreshCw size={14} /> RECOMECAR
            </button>
          )}
        </div>

        <div className="p-8 space-y-8">
          {!sourceImage ? (
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="border-4 border-dashed border-slate-100 rounded-[2rem] p-20 flex flex-col items-center gap-4 cursor-pointer hover:border-indigo-200 hover:bg-indigo-50/30 transition-all group"
            >
              <div className="p-6 bg-slate-50 text-slate-400 rounded-full group-hover:bg-indigo-100 group-hover:text-indigo-600 transition-all">
                <Upload size={48} />
              </div>
              <div className="text-center">
                <p className="text-xl font-black text-slate-700">Suba uma imagem para editar</p>
                <p className="text-sm text-slate-400 font-medium mt-1">Fotos de pátio, dashboards ou documentos</p>
              </div>
              <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
              <div className="space-y-4">
                <p className="text-xs font-black text-slate-400 uppercase tracking-widest px-1">Original</p>
                <div className="rounded-3xl overflow-hidden border-2 border-slate-100 shadow-inner relative group">
                  <img src={sourceImage} alt="Source" className="w-full h-auto object-cover max-h-[400px]" />
                  <button onClick={() => setSourceImage(null)} className="absolute top-4 right-4 bg-black/50 backdrop-blur-md text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                    <X size={16} />
                  </button>
                </div>
              </div>

              <div className="space-y-6">
                <p className="text-xs font-black text-slate-400 uppercase tracking-widest px-1">Comandos de Edição IA</p>
                <div className="bg-slate-50 p-6 rounded-[2rem] border border-slate-100 space-y-4 shadow-sm">
                  <textarea 
                    placeholder="Ex: 'Adicione um filtro retro', 'Melhore a iluminação', 'Remova o fundo e deixe branco'..." 
                    className="w-full bg-white border border-slate-200 rounded-2xl px-5 py-4 min-h-[120px] outline-none focus:ring-4 focus:ring-indigo-100 transition-all font-medium text-slate-700 resize-none shadow-inner"
                    value={editPrompt}
                    onChange={(e) => setEditPrompt(e.target.value)}
                  />
                  <button 
                    onClick={handleImageEdit}
                    disabled={imageLoading || !editPrompt}
                    className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-black flex items-center justify-center gap-3 hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-200 active:scale-[0.98] disabled:opacity-50"
                  >
                    {imageLoading ? <Loader2 className="animate-spin" size={20} /> : <Wand2 size={20} />}
                    {imageLoading ? "IA ESTÁ TRABALHANDO..." : "APLICAR TRANSFORMAÇÃO"}
                  </button>
                </div>

                {editedImage && (
                  <div className="pt-6 space-y-4 animate-in zoom-in-95 duration-500">
                    <p className="text-xs font-black text-emerald-500 uppercase tracking-widest px-1 flex items-center gap-2">
                      <Zap size={14} fill="currentColor" /> Resultado Final
                    </p>
                    <div className="rounded-3xl overflow-hidden border-4 border-white shadow-2xl">
                      <img src={editedImage} alt="Result" className="w-full h-auto" />
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AIAnalyst;
