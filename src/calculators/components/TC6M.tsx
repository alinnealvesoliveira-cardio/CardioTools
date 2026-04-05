import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Play, Square, RotateCcw, Info, AlertCircle, BookOpen, Heart, Activity, User, Save, CheckCircle2 } from 'lucide-react';
import { getCIFClassification } from '../../utils/cif';

import { usePatient } from '../../context/PatientContext';
import { useAuth } from '../../context/AuthContext';
import { logActivity } from '../../lib/supabase';
import { MedicationAlert } from '../../components/shared/MedicationAlert';

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, Cell } from 'recharts';

export const TC6M: React.FC = () => {
  const { medications, patientInfo, updatePatientInfo, updateTestResults } = usePatient();
  const { user } = useAuth();
  const [time, setTime] = useState(360);
  const [isActive, setIsActive] = useState(false);
  const [distance, setDistance] = useState<string>('');
  const [preHR, setPreHR] = useState<string>('');
  const [postHR, setPostHR] = useState<string>('');
  const [isSaved, setIsSaved] = useState(false);
  
  // Borg tracking at 0, 3, 6 minutes
  const [borgData, setBorgData] = useState({
    min0: { dyspnea: 0, fatigue: 0 },
    min3: { dyspnea: 0, fatigue: 0 },
    min6: { dyspnea: 0, fatigue: 0 }
  });

  useEffect(() => {
    setIsSaved(false);
  }, [distance, borgData, preHR, postHR]);

  useEffect(() => {
    let interval: any;
    if (isActive && time > 0) {
      interval = setInterval(() => setTime(t => t - 1), 1000);
    } else {
      setIsActive(false);
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isActive, time]);

  const formatTime = (s: number) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`;

  const calculatePredictedBritto = () => {
    const a = parseFloat(patientInfo.age);
    const h = parseFloat(patientInfo.height);
    const w = parseFloat(patientInfo.weight);
    if (!a || !h || !w) return null;

    const imc = w / ((h/100) * (h/100));
    const sexVal = patientInfo.sex === 'male' ? 1 : 0;
    // Britto et al. (2013) - Equação Quadrática (Tabela 3)
    return 890.46 - (6.11 * a) + (0.0345 * a * a) + (48.87 * sexVal) - (4.87 * imc);
  };

  const calculateVO2 = (dist: number) => {
    const vo2 = (0.03 * dist) + 3.98;
    const mets = vo2 / 3.5;
    return { vo2, mets };
  };

  const predictedBritto = calculatePredictedBritto();
  const observedDistance = parseFloat(distance);
  
  // Usar Britto 2013 como referência principal para CIF conforme exemplo clínico
  const cif = predictedBritto && observedDistance ? getCIFClassification(observedDistance, predictedBritto) : null;

  const getInterpretation = (): InterpretationResult[] => {
    const dist = parseFloat(distance);
    if (!dist) return [
      { title: "Capacidade Aeróbica (Cahalin 1996)", label: "Aguardando", color: "slate", description: "Insira a distância percorrida." }
    ];
    
    const { vo2, mets } = calculateVO2(dist);

    const aerobic: InterpretationResult = {
      title: "Análise Metabólica (Cahalin 1996)",
      label: `${vo2.toFixed(1)} mL/kg/min (${mets.toFixed(1)} METs)`,
      color: mets < 5 ? "red" : "green",
      description: mets < 5 
        ? "Capacidade aeróbica < 5 METs: Associada a pior prognóstico a médio prazo em pacientes com IC." 
        : "Capacidade aeróbica ≥ 5 METs: Indica melhor reserva funcional."
    };

    const llnBritto = predictedBritto ? predictedBritto - (49.31 * 1.645) : null;
    
    const functionalCapacity: InterpretationResult = llnBritto ? {
      title: "Capacidade Funcional (Britto 2013)",
      label: dist < llnBritto ? "Abaixo do LIN" : "Dentro da Normalidade",
      color: dist < llnBritto ? "red" : "green",
      description: dist < llnBritto
        ? `Distância abaixo do Limite Inferior da Normalidade (${llnBritto.toFixed(1)}m). Indica redução da capacidade funcional comparada a saudáveis.`
        : `Distância dentro dos valores esperados (LIN: ${llnBritto.toFixed(1)}m).`
    } : {
      title: "Capacidade Funcional (Britto 2013)",
      label: "Aguardando",
      color: "slate",
      description: "Insira idade, altura e peso no Cadastro para calcular o predito."
    };

    const prognosis: InterpretationResult = {
      title: "Análise Prognóstica (IC)",
      label: dist < 350 ? "Risco Elevado" : "Risco Moderado",
      color: dist < 350 ? "red" : "yellow",
      description: dist < 350
        ? "Distância < 350m: Ponto de corte crítico associado a maior mortalidade na Insuficiência Cardíaca."
        : "Distância ≥ 350m: Embora possa estar reduzida, situa-se acima do limiar de mortalidade iminente."
    };

    // Automatic Interpretation of Effort Signature
    const fatigueDiff = borgData.min6.fatigue - borgData.min0.fatigue;
    const dyspneaDiff = borgData.min6.dyspnea - borgData.min0.dyspnea;
    
    let effortSignature: InterpretationResult | null = null;
    if (fatigueDiff > 0 || dyspneaDiff > 0) {
      const isMuscular = fatigueDiff > dyspneaDiff;
      effortSignature = {
        title: "Assinatura do Esforço",
        label: isMuscular ? "Limitação Periférica" : "Limitação Cardiopulmonar",
        color: "blue",
        description: isMuscular 
          ? `Fadiga muscular (${fatigueDiff}) > Dispneia (${dyspneaDiff}). Sugere-se foco em fortalecimento muscular e endurance periférica.`
          : `Dispneia (${dyspneaDiff}) ≥ Fadiga muscular (${fatigueDiff}). Sugere-se foco em condicionamento aeróbico e controle ventilatório.`
      };
    }

    const baseResults = [aerobic, functionalCapacity, prognosis];
    return effortSignature ? [...baseResults, effortSignature] : baseResults;
  };

  const results = getInterpretation();

  const handleSave = async () => {
    if (!observedDistance) return;
    
    const fatigueDiff = borgData.min6.fatigue - borgData.min0.fatigue;
    const dyspneaDiff = borgData.min6.dyspnea - borgData.min0.dyspnea;
    const limitingFactor = fatigueDiff > dyspneaDiff ? 'Muscular Periférica' : 'Cardiopulmonar';

    updateTestResults({
      tc6m: {
        distance: observedDistance,
        predicted: predictedBritto || 0,
        efficiency: predictedBritto ? (observedDistance / predictedBritto) * 100 : 0,
        fatigability: {
          limitingFactor,
          dyspneaDelta: dyspneaDiff,
          fatigueDelta: fatigueDiff
        },
        hr: {
          pre: parseInt(preHR) || 0,
          post: parseInt(postHR) || 0
        }
      }
    });

    if (user) {
      await logActivity(user.id, 'Finalizou Teste TC6M');
    }
    
    setIsSaved(true);
  };

  const colorClasses = {
    green: 'bg-vitality-lime/10 text-vitality-lime border-vitality-lime/20',
    yellow: 'bg-amber-50 text-amber-700 border-amber-200',
    red: 'bg-vitality-risk/10 text-vitality-risk border-vitality-risk/20',
    slate: 'bg-slate-50 text-slate-700 border-slate-200',
    blue: 'bg-blue-50 text-blue-700 border-blue-200',
    orange: 'bg-orange-50 text-orange-700 border-orange-200',
    emerald: 'bg-vitality-lime/10 text-vitality-lime border-vitality-lime/20'
  };

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-8 pb-24">
      <header className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold text-vitality-graphite tracking-tight">Caminhada de 6 Minutos (TC6M)</h1>
          <p className="text-slate-500 text-sm">Padrão-ouro para avaliação da capacidade funcional submáxima.</p>
        </div>
        <button
          onClick={handleSave}
          disabled={!observedDistance || isSaved}
          className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg ${
            isSaved 
              ? 'bg-emerald-500 text-white' 
              : 'bg-vitality-graphite text-white hover:opacity-90'
          }`}
        >
          {isSaved ? (
            <>
              <CheckCircle2 className="w-5 h-5" />
              Resultado Salvo
            </>
          ) : (
            <>
              <Save className="w-5 h-5" />
              Salvar Resultado
            </>
          )}
        </button>
      </header>

      <MedicationAlert type="betablockers" active={medications.betablockers} />
      <MedicationAlert type="digitalis" active={medications.digitalis} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          {/* Main Timer & Distance */}
          <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100 space-y-8">
            <div className="flex flex-col items-center justify-center space-y-4">
              <div className="text-8xl font-mono font-bold text-vitality-lime tabular-nums">
                {formatTime(time)}
              </div>
              <div className="flex gap-4">
                <button
                  onClick={() => setIsActive(!isActive)}
                  className={`px-8 py-4 rounded-2xl font-bold flex items-center gap-2 shadow-lg transition-all ${
                    isActive ? 'bg-vitality-risk text-white' : 'bg-vitality-lime text-slate-900'
                  }`}
                >
                  {isActive ? <Square className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current" />}
                  {isActive ? 'Parar' : 'Iniciar'}
                </button>
                <button
                  onClick={() => { setIsActive(false); setTime(360); }}
                  className="p-4 rounded-2xl bg-slate-100 text-slate-600 border border-slate-200"
                >
                  <RotateCcw className="w-6 h-6" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-8 border-t border-slate-100">
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-slate-400">
                  <User className="w-4 h-4" />
                  <span className="text-xs font-bold uppercase">Dados do Paciente</span>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase">Idade</label>
                    <input
                      type="number"
                      value={Number.isNaN(parseInt(patientInfo.age)) ? '' : patientInfo.age}
                      onChange={(e) => updatePatientInfo({ age: e.target.value })}
                      placeholder="Anos"
                      className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase">Sexo</label>
                    <select
                      value={patientInfo.sex}
                      onChange={(e) => updatePatientInfo({ sex: e.target.value as 'male' | 'female' })}
                      className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold"
                    >
                      <option value="male">Masc</option>
                      <option value="female">Fem</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase">Altura (cm)</label>
                    <input
                      type="number"
                      value={Number.isNaN(parseFloat(patientInfo.height)) ? '' : patientInfo.height}
                      onChange={(e) => updatePatientInfo({ height: e.target.value })}
                      placeholder="Ex: 170"
                      className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase">Peso (kg)</label>
                    <input
                      type="number"
                      value={Number.isNaN(parseFloat(patientInfo.weight)) ? '' : patientInfo.weight}
                      onChange={(e) => updatePatientInfo({ weight: e.target.value })}
                      placeholder="Ex: 70"
                      className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400 uppercase">Distância Percorrida (metros)</label>
                  <input
                    type="number"
                    value={distance}
                    onChange={(e) => setDistance(e.target.value)}
                    placeholder="Ex: 450"
                    className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-2xl font-bold text-slate-800 focus:border-vitality-lime outline-none transition-all"
                  />
                </div>
                <div className="space-y-4 pt-4 border-t border-slate-100">
                  <div className="flex items-center gap-2 text-slate-400">
                    <Activity className="w-4 h-4" />
                    <span className="text-xs font-bold uppercase">Assinatura do Esforço (Borg 0-10)</span>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    {([0, 3, 6] as const).map((min) => (
                      <div key={min} className="space-y-3 p-3 bg-slate-50 rounded-2xl border border-slate-100">
                        <div className="text-[10px] font-black text-slate-400 uppercase text-center">{min} MIN</div>
                        <div className="space-y-2">
                          <div className="space-y-1">
                            <label className="text-[9px] font-bold text-slate-500 uppercase">Dispneia</label>
                            <input
                              type="number"
                              min="0"
                              max="10"
                              value={Number.isNaN(borgData[`min${min}` as keyof typeof borgData].dyspnea) ? '' : borgData[`min${min}` as keyof typeof borgData].dyspnea}
                              onChange={(e) => setBorgData(prev => ({
                                ...prev,
                                [`min${min}`]: { ...prev[`min${min}` as keyof typeof borgData], dyspnea: Number(e.target.value) }
                              }))}
                              className="w-full p-2 bg-white border border-slate-200 rounded-xl text-sm font-bold text-blue-600 focus:border-blue-500 outline-none"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[9px] font-bold text-slate-500 uppercase">Fadiga</label>
                            <input
                              type="number"
                              min="0"
                              max="10"
                              value={Number.isNaN(borgData[`min${min}` as keyof typeof borgData].fatigue) ? '' : borgData[`min${min}` as keyof typeof borgData].fatigue}
                              onChange={(e) => setBorgData(prev => ({
                                ...prev,
                                [`min${min}`]: { ...prev[`min${min}` as keyof typeof borgData], fatigue: Number(e.target.value) }
                              }))}
                              className="w-full p-2 bg-white border border-slate-200 rounded-xl text-sm font-bold text-vitality-lime focus:border-vitality-lime outline-none"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Effort Signature Chart */}
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-slate-800 font-bold">
                  <Activity className="w-5 h-5 text-vitality-lime" />
                  Assinatura do Esforço
                </div>
              </div>
              <div className="h-[200px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={[
                      { min: '0 min', dispneia: borgData.min0.dyspnea, fadiga: borgData.min0.fatigue },
                      { min: '3 min', dispneia: borgData.min3.dyspnea, fadiga: borgData.min3.fatigue },
                      { min: '6 min', dispneia: borgData.min6.dyspnea, fadiga: borgData.min6.fatigue },
                    ]}
                    margin={{ top: 5, right: 20, left: -20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="min" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 600, fill: '#94a3b8' }} />
                    <YAxis domain={[0, 10]} axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 600, fill: '#94a3b8' }} />
                    <Tooltip 
                      contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                      labelStyle={{ fontWeight: 800, color: '#1e293b', marginBottom: '4px' }}
                    />
                    <Legend iconType="circle" wrapperStyle={{ fontSize: 10, fontWeight: 700, paddingTop: 10 }} />
                    <Line type="monotone" dataKey="dispneia" stroke="#34495E" strokeWidth={4} dot={{ r: 6, fill: '#34495E', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 8 }} name="Dispneia" />
                    <Line type="monotone" dataKey="fadiga" stroke="#A2D149" strokeWidth={4} dot={{ r: 6, fill: '#A2D149', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 8 }} name="Fadiga" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Efficiency Chart */}
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-slate-800 font-bold">
                  <Activity className="w-5 h-5 text-vitality-lime" />
                  Eficiência Funcional
                </div>
                {predictedBritto && observedDistance > 0 && (
                  <div className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${
                    (observedDistance / predictedBritto) * 100 > 80 ? 'bg-vitality-lime/20 text-vitality-lime' :
                    (observedDistance / predictedBritto) * 100 >= 50 ? 'bg-amber-100 text-amber-700' :
                    'bg-vitality-risk/20 text-vitality-risk'
                  }`}>
                    {((observedDistance / predictedBritto) * 100).toFixed(1)}%
                  </div>
                )}
              </div>
              <div className="h-[200px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={[
                      { name: 'Previsto', valor: predictedBritto || 0, fill: '#f1f5f9' },
                      { name: 'Realizado', valor: observedDistance || 0, fill: (observedDistance / (predictedBritto || 1)) * 100 > 80 ? '#A2D149' : (observedDistance / (predictedBritto || 1)) * 100 >= 50 ? '#f59e0b' : '#D35400' }
                    ]}
                    margin={{ top: 5, right: 20, left: -20, bottom: 5 }}
                  >
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 600, fill: '#94a3b8' }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 600, fill: '#94a3b8' }} />
                    <Tooltip 
                      cursor={{ fill: '#f8fafc' }}
                      contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                    />
                    <Bar dataKey="valor" radius={[10, 10, 0, 0]} barSize={40}>
                      {
                        [0, 1].map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={index === 0 ? '#e2e8f0' : (observedDistance / (predictedBritto || 1)) * 100 > 80 ? '#A2D149' : (observedDistance / (predictedBritto || 1)) * 100 >= 50 ? '#f59e0b' : '#D35400'} />
                        ))
                      }
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Vitals Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-vitality-risk/10 rounded-xl text-vitality-risk">
                  <Heart className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase">Frequência Cardíaca (bpm)</p>
                  <p className="text-sm text-slate-600">Resposta cronotrópica ao esforço.</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">FC Pré-Teste</label>
                  <input
                    type="number"
                    value={preHR}
                    onChange={(e) => setPreHR(e.target.value)}
                    placeholder="Repouso"
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">FC Pós-Teste</label>
                  <input
                    type="number"
                    value={postHR}
                    onChange={(e) => setPostHR(e.target.value)}
                    placeholder="Pico"
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold"
                  />
                </div>
              </div>
            </div>
            <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm space-y-2">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-vitality-lime/10 rounded-lg text-vitality-lime">
                  <Activity className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase">Meta Clínica (MCID)</p>
                  <p className="text-sm font-bold text-vitality-lime">
                    {observedDistance ? `> ${(observedDistance + 30).toFixed(0)} m` : '--'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="sticky top-24 space-y-6">
            <div className="grid grid-cols-1 gap-2">
              <div className="p-2 bg-slate-50/50 rounded-lg border border-slate-100">
                <div className="text-[9px] text-slate-500 font-bold uppercase tracking-wider mb-0.5">Predito (Britto 2013)</div>
                <div className="text-sm font-bold text-slate-700">{predictedBritto ? `${predictedBritto.toFixed(1)} m` : '--'}</div>
              </div>
            </div>

            <div className="space-y-4">
              {results.map((res, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className={`rounded-2xl p-6 border-2 shadow-lg ${
                    res.title?.includes("Metabólica") ? 'border-4 transform scale-105 ring-4 ring-vitality-lime/20' : ''
                  } ${
                    res.color === 'red' ? 'bg-vitality-risk/10 border-vitality-risk/20 text-vitality-risk' :
                    res.color === 'yellow' ? 'bg-amber-50 border-amber-200 text-amber-700' :
                    res.color === 'green' ? 'bg-vitality-lime/10 border-vitality-lime/20 text-vitality-lime' :
                    'bg-slate-50 border-slate-200 text-slate-700'
                  }`}
                >
                  <div className="text-[10px] font-bold uppercase tracking-wider opacity-70 mb-1">
                    {res.title?.includes("Metabólica") ? "Capacidade Aeróbica (Cahalin 1996)" : res.title}
                  </div>
                  <div className={`${res.title?.includes("Metabólica") ? 'text-2xl' : 'text-xl'} font-bold mb-1`}>{res.label}</div>
                  {res.description && <p className="text-xs opacity-90 leading-relaxed">{res.description}</p>}
                </motion.div>
              ))}
            </div>

            {cif && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className={`rounded-3xl p-8 border-4 shadow-2xl transform scale-105 transition-all ${colorClasses[cif.color as keyof typeof colorClasses] || colorClasses.slate}`}
              >
                <div className="text-xs font-black uppercase tracking-[0.2em] opacity-60 mb-3 text-center">Comprometimento Funcional (CIF/OMS)</div>
                <div className="flex justify-between items-center mb-4 border-b border-current pb-4 opacity-80">
                  <div className="text-2xl font-black">Qualificador {cif.severity}</div>
                  <div className="text-sm font-black">{((observedDistance / (predictedBritto || 1)) * 100).toFixed(1)}% do predito</div>
                </div>
                <div className="text-2xl font-black mb-2 text-center leading-tight">CIF/OMS</div>
                <p className="text-sm font-medium opacity-80 text-center">Deficiência: {cif.deficiencyRange}</p>
                <p className="text-[10px] mt-4 italic opacity-70 text-center">Referência: Britto 2013 (Predito)</p>
              </motion.div>
            )}

            {cif && (
              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 space-y-2">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                  <Info className="w-3 h-3" />
                  Cálculo do Percentual
                </div>
                <div className="text-xs text-slate-600 font-mono bg-white p-2 rounded-lg border border-slate-100 text-center">
                  % Predito = (Obs / Esp) × 100
                </div>
                <p className="text-[10px] text-slate-500 italic leading-tight">
                  O percentual do predito é calculado pela razão entre o valor observado e o valor esperado por equações de referência.
                </p>
              </div>
            )}

            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 space-y-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-vitality-lime font-bold text-sm">
                  <Info className="w-4 h-4" />
                  Pérolas Clínicas
                </div>
                <ul className="text-xs text-slate-600 space-y-1 list-disc pl-4">
                  <li>Corredor de 30 metros é o ideal.</li>
                  <li>O paciente pode parar e descansar, mas o tempo não para.</li>
                  <li>Use frases de incentivo padronizadas a cada minuto.</li>
                  <li>Distância &lt; 300m é um forte marcador de baixa reserva aeróbica (Cahalin 1996).</li>
                </ul>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-vitality-risk font-bold text-sm">
                  <AlertCircle className="w-4 h-4" />
                  Critérios de Interrupção
                </div>
                <ul className="text-xs text-slate-600 space-y-1 list-disc pl-4">
                  <li>Dor torácica ou dispneia intolerável.</li>
                  <li>Cãibras nas pernas ou tontura.</li>
                  <li>Palidez ou sudorese fria.</li>
                </ul>
              </div>
            </div>

            <div className="text-[10px] text-slate-400 flex flex-col gap-1 italic">
              <div className="flex gap-2">
                <BookOpen className="w-3 h-3 flex-shrink-0" />
                ATS Statement on Six-Minute Walk Test. Am J Respir Crit Care Med. 2002.
              </div>
              <div className="flex gap-2">
                <BookOpen className="w-3 h-3 flex-shrink-0" />
                Cahalin LP, et al. Chest. 1996 (https://doi.org/10.1378/chest.110.2.325).
              </div>
              <div className="flex gap-2">
                <BookOpen className="w-3 h-3 flex-shrink-0" />
                Britto RR, et al. Braz J Phys Ther. 2013 (https://doi.org/10.1590/S1413-35552012005000122).
              </div>
              <div className="flex gap-2">
                <BookOpen className="w-3 h-3 flex-shrink-0" />
                Furlanetto KC, et al. Arch Phys Med Rehabil. 2022 (https://doi.org/10.1016/j.apmr.2021.08.009).
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

interface InterpretationResult {
  title: string;
  label: string;
  color: string;
  description?: string;
}
