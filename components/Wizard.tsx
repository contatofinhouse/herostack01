import React, { useState, useRef, useEffect } from 'react';
import { PlanType, ServicePlan, FormData } from '../types';
import { Button, Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle, Input, Label, Badge } from './ui/DesignSystem';
import { Check, Send, ChevronLeft, Upload, Info, AlertCircle, Sparkles, FileText, ArrowRight } from 'lucide-react';
import { motion as motionOriginal, AnimatePresence } from 'framer-motion';
import { supabase } from '../lib/supabaseClient';

const motion = motionOriginal as any;

const plans: ServicePlan[] = [
  {
    id: PlanType.LANDING,
    title: "Landing Page Pro",
    price: "R$ 49,90/mês",
    description: "Ideal para capturar leads e vender produtos únicos. Design de alta conversão.",
    features: ["Criação Grátis", "Hospedagem Inclusa", "Até 5 seções", "Formulário de Contato", "Suporte WhatsApp"]
  },
  {
    id: PlanType.CMS,
    title: "Site Institucional + CMS",
    price: "R$ 89,90/mês",
    description: "Gerencie seu blog e conteúdo sem tocar em código. Painel administrativo incluso.",
    features: ["Criação Grátis", "Hospedagem Premium", "Páginas Ilimitadas", "CMS Integrado", "Blog"]
  },
  {
    id: PlanType.SAAS,
    title: "SaaS & App Web",
    price: "Sob Consulta",
    description: "Seu software como serviço. Sistema de login, pagamentos e dashboard prontos.",
    features: ["Autenticação", "Pagamentos", "Dashboard", "Banco de Dados", "Consultoria Técnica"]
  },
  {
    id: PlanType.AUTOMATION,
    title: "Automação & n8n",
    price: "Sob Consulta",
    description: "Integrações complexas e fluxos de trabalho automatizados para sua empresa.",
    features: ["Servidor n8n", "Webhooks Customizados", "Integração WhatsApp", "CRM Sync", "Bot IA"]
  }
];

const fontOptions = [
  { id: 'Inter', name: 'Inter', family: 'sans-serif', desc: 'Moderna, limpa e padrão da indústria tech.', usedBy: 'Notion, Vercel, Stripe' },
  { id: 'Open Sans', name: 'Open Sans', family: 'sans-serif', desc: 'Amigável, neutra e extremamente legível.', usedBy: 'Google, IKEA, WordPress' },
  { id: 'Montserrat', name: 'Montserrat', family: 'sans-serif', desc: 'Geométrica, sofisticada e impactante.', usedBy: 'Marcas de Luxo, Startups Urbanas' },
  { id: 'Merriweather', name: 'Merriweather', family: 'serif', desc: 'Clássica, confiável e ótima para leitura.', usedBy: 'Harvard, Medium, Washington Post' },
  { id: 'Space Grotesk', name: 'Space Grotesk', family: 'monospace', desc: 'Excêntrica, tecnológica e futurista.', usedBy: 'Projetos Web3, Design Studios' },
];

const industryOptions = [
  "Advocacia / Jurídico",
  "Saúde / Odontologia / Estética",
  "Mercado Financeiro",
  "Indústria",
  "Consultoria / Coaching",
  "E-commerce / Loja Virtual",
  "Tecnologia / SaaS / Startup",
  "Restaurante / Delivery",
  "Construção / Arquitetura",
  "Educação / Cursos",
  "Outros"
];

interface WizardProps {
  onCancel: () => void;
  initialPlan?: PlanType | null;
}

const Wizard: React.FC<WizardProps> = ({ onCancel, initialPlan }) => {
  const [step, setStep] = useState(initialPlan ? 2 : 1);
  const [formData, setFormData] = useState<FormData>({
    selectedPlan: initialPlan || null,
    brandColors: { primary: '#000000', secondary: '#3b82f6' },
    typography: 'Inter',
    businessName: '',
    businessDescription: '',
    email: '',
    phone: '',
    industry: '',
    logoFile: null,
    contentFile: null,
    instagram: '',
    facebook: '',
    linkedin: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [customIndustry, setCustomIndustry] = useState('');
  const [selectedIndustrySelect, setSelectedIndustrySelect] = useState('');
  const [fileName, setFileName] = useState('');
  const [contentFileName, setContentFileName] = useState('');

  // Ref for auto-scrolling to the next button
  const nextButtonRef = useRef<HTMLDivElement>(null);

  // Scroll to top whenever step changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [step]);

  const handleNext = () => setStep(prev => prev + 1);
  const handleBack = () => {
    setStep(prev => prev - 1);
  };

  const updateForm = (key: keyof FormData, value: any) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  const handlePlanSelect = (planId: PlanType) => {
    updateForm('selectedPlan', planId);
    // Smooth scroll to the next button after a short delay to allow state update/rendering
    setTimeout(() => {
      if (nextButtonRef.current) {
        nextButtonRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 100);
  };

  const handleIndustryChange = (val: string) => {
    setSelectedIndustrySelect(val);
    if (val !== 'Outros') {
      updateForm('industry', val);
      setCustomIndustry('');
    } else {
      updateForm('industry', '');
    }
  };

  const handleCustomIndustryChange = (val: string) => {
    setCustomIndustry(val);
    updateForm('industry', val);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const files = Array.from(e.target.files);
      setFileName(`${files.length} arquivo(s) selecionado(s)`);
      updateForm('logoFile', files);
    }
  };

  const handleContentFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setContentFileName(file.name);
      updateForm('contentFile', file);
    }
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, ''); // Remove non-digits
    if (value.length > 11) value = value.slice(0, 11); // Limit to 11 digits

    // Apply mask (XX) XXXXX-XXXX
    let formatted = value;
    if (value.length > 2) {
      formatted = `(${value.slice(0, 2)}) ${value.slice(2)}`;
    }
    if (value.length > 7) {
      formatted = `(${value.slice(0, 2)}) ${value.slice(2, 7)}-${value.slice(7)}`;
    }

    updateForm('phone', formatted);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      let logoUrlsString = null;
      let contentUrl = null;

      // 1. Upload Logo Files if exist
      if (formData.logoFile && formData.logoFile.length > 0) {
        const uploadPromises = formData.logoFile.map(async (file) => {
          const fileExt = file.name.split('.').pop();
          const fileName = `logo-${Date.now()}-${Math.random()}.${fileExt}`;
          const filePath = `${fileName}`;

          const { error: uploadError } = await supabase.storage
            .from('logos')
            .upload(filePath, file);

          if (uploadError) {
            console.error('Logo upload error:', uploadError);
            // Continue even if one fails, or throw? Let's throw for now
            throw new Error(`Falha no upload de imagem: ${uploadError.message}`);
          }

          const { data: { publicUrl } } = supabase.storage
            .from('logos')
            .getPublicUrl(filePath);

          return publicUrl;
        });

        const urls = await Promise.all(uploadPromises);
        logoUrlsString = urls.join(',');
      }

      // 2. Upload Content File if exists
      if (formData.contentFile) {
        const file = formData.contentFile;
        const fileExt = file.name.split('.').pop();
        const fileName = `doc-${Date.now()}-${Math.random()}.${fileExt}`;

        const { error: docError } = await supabase.storage
          .from('documents')
          .upload(fileName, file);

        if (docError) {
          console.error('Doc upload error:', docError);
          // Warning but maybe not block? Let's block to be safe.
          throw new Error(`Falha no upload do documento: ${docError.message}`);
        }

        const { data: { publicUrl } } = supabase.storage
          .from('documents')
          .getPublicUrl(fileName);

        contentUrl = publicUrl;
      }

      // 3. Insert Lead Data
      const { error: insertError } = await supabase
        .from('leads')
        .insert({
          business_name: formData.businessName,
          business_description: formData.businessDescription,
          industry: formData.industry,
          email: formData.email,
          phone: formData.phone,
          selected_plan: formData.selectedPlan,
          brand_primary_color: formData.brandColors.primary,
          brand_secondary_color: formData.brandColors.secondary,
          typography: formData.typography,
          logo_url: logoUrlsString,
          content_url: contentUrl,
          instagram: formData.instagram,
          facebook: formData.facebook,
          linkedin: formData.linkedin
        });

      if (insertError) {
        throw new Error('Erro ao salvar dados: ' + insertError.message);
      }

      setStep(5);
    } catch (err: any) {
      console.error(err);
      setSubmitError(err.message || "Ocorreu um erro ao enviar. Tente novamente.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedFontData = fontOptions.find(f => f.id === formData.typography) || fontOptions[0];

  return (
    <div className="min-h-screen bg-secondary/30 py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center relative z-20">
      <div className="w-full max-w-4xl">
        <div className="mb-8 flex items-center justify-between">
          <Button variant="ghost" onClick={onCancel} className="gap-2">
            <ChevronLeft className="w-4 h-4" /> Cancelar
          </Button>
          <div className="flex gap-2">
            {[1, 2, 3, 4].map(i => (
              <div
                key={i}
                className={`h-2 w-12 rounded-full transition-all duration-300 ${i <= step ? 'bg-primary' : 'bg-muted-foreground/20'}`}
              />
            ))}
          </div>
        </div>

        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <div className="text-center mb-10">
                <h2 className="text-3xl font-bold">Escolha seu plano de assinatura</h2>
                <p className="text-muted-foreground mt-2">Sem custo de setup. Cancele quando quiser.</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {plans.map(plan => (
                  <Card
                    key={plan.id}
                    className={`cursor-pointer transition-all hover:border-primary hover:shadow-md ${formData.selectedPlan === plan.id ? 'border-primary ring-2 ring-primary/20 bg-primary/5' : ''}`}
                    onClick={() => handlePlanSelect(plan.id)}
                  >
                    <CardHeader>
                      <CardTitle className="flex justify-between items-start">
                        {plan.title}
                        <Badge variant="secondary">{plan.price}</Badge>
                      </CardTitle>
                      <CardDescription>{plan.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {plan.features.map((feature, idx) => (
                          <li key={idx} className="flex items-center text-sm">
                            <Check className="w-4 h-4 mr-2 text-green-500" />
                            {feature}
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                ))}
              </div>
              <div className="mt-8 flex justify-end" ref={nextButtonRef}>
                <Button onClick={handleNext} disabled={!formData.selectedPlan} size="lg">
                  Próximo Passo: Design
                </Button>
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="max-w-3xl mx-auto"
            >
              <Card>
                <CardHeader>
                  <CardTitle>Identidade Visual</CardTitle>
                  <CardDescription>Defina as cores e o estilo tipográfico da sua marca.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Cor Primária</Label>
                      <div className="flex gap-2">
                        <Input
                          type="color"
                          className="w-12 h-10 p-1"
                          value={formData.brandColors.primary}
                          onChange={(e) => setFormData(prev => ({ ...prev, brandColors: { ...prev.brandColors, primary: e.target.value } }))}
                        />
                        <Input
                          value={formData.brandColors.primary}
                          onChange={(e) => setFormData(prev => ({ ...prev, brandColors: { ...prev.brandColors, primary: e.target.value } }))}
                          className="font-mono uppercase"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Cor Secundária</Label>
                      <div className="flex gap-2">
                        <Input
                          type="color"
                          className="w-12 h-10 p-1"
                          value={formData.brandColors.secondary}
                          onChange={(e) => setFormData(prev => ({ ...prev, brandColors: { ...prev.brandColors, secondary: e.target.value } }))}
                        />
                        <Input
                          value={formData.brandColors.secondary}
                          onChange={(e) => setFormData(prev => ({ ...prev, brandColors: { ...prev.brandColors, secondary: e.target.value } }))}
                          className="font-mono uppercase"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Estilo de Fonte</Label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                      {fontOptions.map((font) => (
                        <div
                          key={font.id}
                          className={`border rounded-lg p-3 text-center cursor-pointer hover:bg-muted transition-all ${formData.typography === font.id ? 'border-primary bg-primary/5 ring-1 ring-primary' : ''}`}
                          onClick={() => updateForm('typography', font.id)}
                        >
                          <span
                            className="text-2xl block mb-1"
                            style={{ fontFamily: font.name === 'Space Grotesk' ? '"Space Grotesk", monospace' : font.name }}
                          >
                            Ag
                          </span>
                          <p className="text-[10px] sm:text-xs font-medium text-muted-foreground truncate">{font.name}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2 mt-6">
                    <Label>Preview Rápido</Label>
                    <div
                      className="rounded-lg p-6 border shadow-sm transition-colors duration-300 relative overflow-hidden bg-white text-slate-900"
                      style={{
                        fontFamily: selectedFontData.name === 'Space Grotesk' ? '"Space Grotesk", monospace' : selectedFontData.name
                      }}
                    >
                      <div className="absolute top-0 right-0 p-4 w-full md:w-1/2 text-right pointer-events-none opacity-20 md:opacity-100">
                        <p className="text-xs font-bold uppercase tracking-wider mb-1 text-slate-800">Sobre esta fonte</p>
                        <p className="text-xs text-slate-500 mb-2">{selectedFontData.desc}</p>
                        <p className="text-xs font-bold uppercase tracking-wider mb-1 text-slate-800">Usada por</p>
                        <p className="text-xs text-slate-500">{selectedFontData.usedBy}</p>
                      </div>

                      {/* Use Secondary Color for a Badge to show contrast/combination */}
                      <div className="mb-4">
                        <span
                          className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider inline-block shadow-sm"
                          style={{
                            backgroundColor: formData.brandColors.secondary,
                            color: '#fff', // Ideally calculate contrast, but white works for most dark secondary colors. If user picks white secondary, it blends.
                            border: '1px solid rgba(0,0,0,0.1)'
                          }}
                        >
                          Novidade
                        </span>
                      </div>

                      <h3 style={{ color: formData.brandColors.primary }} className="text-3xl font-bold mb-3 max-w-sm">Sua Marca Incrível</h3>
                      <p className="text-slate-600 text-sm max-w-md leading-relaxed mb-6">
                        Este é um exemplo de como seu conteúdo ficará. A tipografia <strong>{selectedFontData.name}</strong> transmite a personalidade certa para o seu negócio.
                      </p>

                      <div className="flex flex-wrap gap-3">
                        <button
                          className="px-6 py-2.5 rounded text-white text-sm font-medium transition-transform active:scale-95 shadow-lg"
                          style={{ backgroundColor: formData.brandColors.primary }}
                        >
                          Saiba Mais
                        </button>
                        {/* Secondary Action to show Secondary Color Usage */}
                        <button
                          className="px-6 py-2.5 rounded text-sm font-medium transition-transform active:scale-95 border-2 flex items-center gap-2"
                          style={{
                            borderColor: formData.brandColors.secondary,
                            color: formData.brandColors.secondary,
                            backgroundColor: 'transparent'
                          }}
                        >
                          Contato <ArrowRight className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>

                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button variant="outline" onClick={handleBack}>Voltar</Button>
                  <Button onClick={handleNext}>Próximo: Conteúdo</Button>
                </CardFooter>
              </Card>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="max-w-2xl mx-auto"
            >
              <Card>
                <CardHeader>
                  <CardTitle>Sobre o Negócio</CardTitle>
                  <CardDescription>Conte-nos mais para prepararmos a estrutura inicial.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Nome da Empresa / Projeto</Label>
                    <Input
                      placeholder="Ex: TechSolutions Ltda"
                      value={formData.businessName}
                      onChange={(e) => updateForm('businessName', e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Setor de Atuação</Label>
                    <select
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      value={selectedIndustrySelect}
                      onChange={(e) => handleIndustryChange(e.target.value)}
                    >
                      <option value="" disabled>Selecione uma categoria...</option>
                      {industryOptions.map((opt) => (
                        <option key={opt} value={opt}>{opt}</option>
                      ))}
                    </select>

                    {selectedIndustrySelect === 'Outros' && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="pt-2"
                      >
                        <Input
                          placeholder="Digite seu setor de atuação..."
                          value={customIndustry}
                          onChange={(e) => handleCustomIndustryChange(e.target.value)}
                          autoFocus
                        />
                      </motion.div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label>Descrição Curta do Negócio</Label>
                    <textarea
                      className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      placeholder="Descreva o que sua empresa faz e qual problema resolve... (Vamos propor um conteúdo e seções produzidos por IA com viés de marketing já para você revisar)"
                      value={formData.businessDescription}
                      onChange={(e) => updateForm('businessDescription', e.target.value)}
                    />
                  </div>

                  {/* Social Media Section */}
                  <div className="space-y-4 pt-4 border-t">
                    <Label>Redes Sociais <Badge variant="outline" className="text-xs font-normal text-muted-foreground">Opcional</Badge></Label>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label className="text-xs text-muted-foreground">Instagram</Label>
                        <Input
                          placeholder="@seu.perfil"
                          value={formData.instagram}
                          onChange={(e) => updateForm('instagram', e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-xs text-muted-foreground">Facebook</Label>
                        <Input
                          placeholder="facebook.com/pagina"
                          value={formData.facebook}
                          onChange={(e) => updateForm('facebook', e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-xs text-muted-foreground">LinkedIn</Label>
                        <Input
                          placeholder="linkedin.com/company/..."
                          value={formData.linkedin}
                          onChange={(e) => updateForm('linkedin', e.target.value)}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Image Upload Section */}
                  <div className="space-y-2 pt-2 border-t mt-4">
                    <Label className="flex items-center gap-2">
                      Logotipo e Imagens do Site <Badge variant="outline" className="text-xs font-normal text-muted-foreground">Opcional</Badge>
                    </Label>

                    <div className="bg-blue-50 dark:bg-blue-900/10 p-3 rounded-md text-xs text-blue-700 dark:text-blue-300 flex gap-2 items-start border border-blue-100 dark:border-blue-800 mb-2">
                      <Sparkles className="w-4 h-4 mt-0.5 shrink-0" />
                      <p>Caso não tenha imagens, não se preocupe! <strong>Vamos criar todos os criativos e banners usando Inteligência Artificial</strong> para sua aprovação.</p>
                    </div>

                    <div className="flex items-center gap-4 p-4 bg-secondary/30 rounded-lg border-dashed border-2 border-muted hover:border-primary/50 transition-colors cursor-pointer relative">
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        onChange={handleFileChange}
                      />
                      <div className="bg-background p-2 rounded-full shadow-sm">
                        <Upload className="w-6 h-6 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">{fileName || 'Clique para selecionar imagens'}</p>
                        <p className="text-xs text-muted-foreground">Logotipo, fotos de produtos ou referências (JPG, PNG)</p>
                      </div>
                    </div>
                  </div>

                  {/* Content Upload Section */}
                  <div className="space-y-2 pt-2 mt-4">
                    <Label className="flex items-center gap-2">
                      Conteúdo do Site (Word/PDF) <Badge variant="outline" className="text-xs font-normal text-muted-foreground">Opcional</Badge>
                    </Label>

                    <div className="flex items-center gap-4 p-4 bg-secondary/30 rounded-lg border-dashed border-2 border-muted hover:border-primary/50 transition-colors cursor-pointer relative">
                      <input
                        type="file"
                        accept=".doc,.docx,.pdf,.txt"
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        onChange={handleContentFileChange}
                      />
                      <div className="bg-background p-2 rounded-full shadow-sm">
                        <FileText className="w-6 h-6 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">{contentFileName || 'Clique para anexar arquivo de texto'}</p>
                        <p className="text-xs text-muted-foreground">Caso não tenha, criaremos o conteúdo via IA.</p>
                      </div>
                    </div>
                  </div>

                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button variant="outline" onClick={handleBack}>Voltar</Button>
                  <Button onClick={handleNext} disabled={!formData.businessName || !formData.industry}>Próximo: Finalizar</Button>
                </CardFooter>
              </Card>
            </motion.div>
          )}

          {step === 4 && (
            <motion.div
              key="step4"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="max-w-xl mx-auto"
            >
              <Card>
                <CardHeader>
                  <CardTitle>Vamos Iniciar o Desenvolvimento</CardTitle>
                  <CardDescription>Confirme seus dados para recebermos o briefing.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-4 bg-muted rounded-lg text-sm space-y-2 mb-6">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Plano Selecionado:</span>
                      <span className="font-medium">{plans.find(p => p.id === formData.selectedPlan)?.title}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Custo de Setup:</span>
                      <span className="font-medium text-green-600">GRÁTIS</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Assinatura Mensal:</span>
                      <span className="font-medium text-foreground">{plans.find(p => p.id === formData.selectedPlan)?.price}</span>
                    </div>
                  </div>

                  <div className="flex gap-3 p-3 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded-md text-xs items-start border border-blue-100 dark:border-blue-800">
                    <Info className="w-4 h-4 shrink-0 mt-0.5" />
                    <p><strong>Fique tranquilo:</strong> A cobrança da assinatura mensal inicia somente <strong>após</strong> a aprovação da prévia do site e configuração final do domínio.</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>E-mail Profissional</Label>
                      <Input
                        type="email"
                        placeholder="voce@empresa.com"
                        value={formData.email}
                        onChange={(e) => updateForm('email', e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Celular / WhatsApp</Label>
                      <Input
                        type="tel"
                        placeholder="(11) 99999-9999"
                        value={formData.phone}
                        onChange={handlePhoneChange}
                        maxLength={15}
                        required
                      />
                    </div>
                  </div>

                  {submitError && (
                    <div className="flex gap-2 text-destructive text-sm bg-destructive/10 p-3 rounded mt-2">
                      <AlertCircle className="w-4 h-4 mt-0.5" />
                      <p>{submitError}</p>
                    </div>
                  )}

                  <Button className="w-full mt-4" size="lg" onClick={handleSubmit} disabled={isSubmitting || !formData.email || !formData.phone}>
                    {isSubmitting ? (
                      <span className="flex items-center gap-2">
                        <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></span>
                        Salvando e Enviando...
                      </span>
                    ) : (
                      <span className="flex items-center gap-2">
                        <Send className="w-4 h-4" /> Enviar Solicitação
                      </span>
                    )}
                  </Button>
                  <p className="text-xs text-center text-muted-foreground mt-4">
                    Ao clicar, você concorda que entraremos em contato via WhatsApp/E-mail para alinhar os detalhes e ativar sua assinatura.
                  </p>
                </CardContent>
                <CardFooter>
                  <Button variant="ghost" onClick={handleBack} className="w-full">Voltar</Button>
                </CardFooter>
              </Card>
            </motion.div>
          )}

          {step === 5 && (
            <motion.div
              key="step5"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="text-center max-w-lg mx-auto py-10"
            >
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Check className="w-10 h-10 text-green-600" />
              </div>
              <h2 className="text-3xl font-bold mb-4">Solicitação Recebida!</h2>
              <p className="text-muted-foreground text-lg mb-8">
                Nossa equipe já está analisando o projeto da <strong>{formData.businessName}</strong>.
                <br /><br />
                Em breve você receberá uma mensagem no WhatsApp <strong>{formData.phone}</strong> para confirmar os detalhes e colocar seu site no ar.
              </p>
              <Button onClick={onCancel} variant="outline">Voltar para Home</Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Wizard;